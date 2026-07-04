import { NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import { imageSize } from "image-size";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

const MAX_BYTES = 15 * 1024 * 1024; // ~15MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
const ALLOWED_MIME_PREFIXES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

function sanitizeBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return clean || "photo";
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data with a file." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Please choose a photo to upload." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That photo is over 15MB. Please choose a smaller photo." },
      { status: 413 }
    );
  }

  const originalName = file.name || "photo.jpg";
  const ext = (originalName.split(".").pop() ?? "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  const mimeOk = ALLOWED_MIME_PREFIXES.some((m) => mime === m);
  // iPhones sometimes send an empty type for HEIC; fall back to extension.
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  if (!extOk || !(mimeOk || mime === "")) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, or HEIC photos are supported." },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isHeic = ext === "heic" || ext === "heif" || mime.includes("hei");

  await mkdir(UPLOAD_DIR, { recursive: true });

  const stamp = Date.now();
  const base = sanitizeBaseName(originalName);
  const finalExt = isHeic ? "jpg" : ext === "jpeg" ? "jpg" : ext;
  const fileName = `${stamp}-${base}.${finalExt}`;
  const finalPath = path.join(UPLOAD_DIR, fileName);

  let finalBuffer = buffer;

  if (isHeic) {
    // Convert HEIC -> JPEG via macOS sips.
    const tmpIn = path.join(os.tmpdir(), `gal-${stamp}.heic`);
    const tmpOut = path.join(os.tmpdir(), `gal-${stamp}.jpg`);
    try {
      await writeFile(tmpIn, buffer);
      await execFileAsync("sips", ["-s", "format", "jpeg", tmpIn, "--out", tmpOut]);
      const { readFile } = await import("fs/promises");
      finalBuffer = await readFile(tmpOut);
    } catch {
      return NextResponse.json(
        {
          error:
            "Couldn't convert this HEIC photo. Please try again, or set your iPhone camera to 'Most Compatible' (JPEG).",
        },
        { status: 422 }
      );
    } finally {
      await unlink(tmpIn).catch(() => {});
      await unlink(tmpOut).catch(() => {});
    }
  }

  // Measure dimensions (respecting EXIF orientation when present).
  let width: number;
  let height: number;
  try {
    const dims = imageSize(finalBuffer);
    if (!dims.width || !dims.height) throw new Error("no dimensions");
    const rotated = typeof dims.orientation === "number" && dims.orientation >= 5;
    width = rotated ? dims.height : dims.width;
    height = rotated ? dims.width : dims.height;
  } catch {
    return NextResponse.json(
      { error: "That file doesn't look like a valid image." },
      { status: 415 }
    );
  }

  await writeFile(finalPath, finalBuffer);

  const src = `/uploads/gallery/${fileName}`;

  try {
    const [, item] = await prisma.$transaction([
      prisma.galleryItem.updateMany({ data: { position: { increment: 1 } } }),
      prisma.galleryItem.create({
        data: { src, caption, width, height, position: 1 },
      }),
    ]);
    return NextResponse.json({ item }, { status: 200 });
  } catch (err) {
    // Roll back the file if the DB write failed.
    await unlink(finalPath).catch(() => {});
    console.error("Gallery upload failed:", err);
    return NextResponse.json(
      { error: "Something went wrong saving the photo. Please try again." },
      { status: 500 }
    );
  }
}

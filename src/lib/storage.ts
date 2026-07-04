import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

// Dual-mode upload storage: Vercel Blob in production (token present),
// local filesystem under public/uploads/ in development.
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function saveUpload(
  folder: "gallery" | "blog",
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (useBlob) {
    const blob = await put(`${folder}/${fileName}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}

export async function deleteUpload(src: string): Promise<void> {
  if (/^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(src)) {
    await del(src).catch(() => {});
    return;
  }
  if (src.startsWith("/uploads/")) {
    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    const resolved = path.resolve(path.join(process.cwd(), "public", src));
    if (resolved.startsWith(uploadsRoot + path.sep)) {
      await unlink(resolved).catch(() => {});
    }
  }
  // Anything else (e.g. /images/gallery/*) is curated content — never deleted.
}

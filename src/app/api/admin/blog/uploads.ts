import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export function sanitizeFileName(name: string): string {
  const base = path.basename(name);
  const ext = path.extname(base);
  const stem = base
    .slice(0, base.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${stem || "image"}${ext.toLowerCase()}`;
}

/** Save an uploaded image to public/uploads/blog and return its public path. */
export async function saveBlogImage(file: File): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", "blog");
  await mkdir(dir, { recursive: true });

  const fallbackExt = ALLOWED_IMAGE_TYPES[file.type] ?? "";
  const safeName = sanitizeFileName(file.name || `image${fallbackExt}`);
  const fileName = `${Date.now()}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, fileName), bytes);
  return `/uploads/blog/${fileName}`;
}

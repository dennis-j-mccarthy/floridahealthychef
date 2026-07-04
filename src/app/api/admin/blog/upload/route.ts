import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  saveBlogImage,
} from "../uploads";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart form data." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "No image file provided." },
      { status: 400 }
    );
  }
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    return NextResponse.json(
      { ok: false, error: "Image must be a JPEG, PNG, GIF, or WebP file." },
      { status: 400 }
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Image is too large (max 10 MB)." },
      { status: 400 }
    );
  }

  const publicPath = await saveBlogImage(file);
  return NextResponse.json({ ok: true, path: publicPath });
}

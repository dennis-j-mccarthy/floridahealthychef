import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Issues short-lived tokens so the browser can upload photos directly to
// Vercel Blob — this bypasses the ~4.5MB serverless request-body limit.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isAdminRequest())) {
          throw new Error("Unauthorized");
        }
        return {
          // HEIC is excluded on purpose: browsers other than Safari can't
          // display it, so HEIC falls back to the server route (which
          // converts locally, or asks for JPEG in production).
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // Row creation happens via POST /api/admin/gallery from the client.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}

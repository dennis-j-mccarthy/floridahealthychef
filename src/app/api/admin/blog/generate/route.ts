import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import {
  ClaudeGenerationError,
  generateArticle,
  type ImageInput,
} from "@/lib/claude";
import { slugify } from "@/app/admin/blog/blocks";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  saveBlogImage,
} from "../uploads";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_IMAGE = "/images/blog/whats-a-personal-chef.jpg";

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "untitled-article";
  let candidate = root;
  for (let i = 2; ; i++) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${root}-${i}`;
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY is not set in .env.local" },
      { status: 400 }
    );
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

  const title = String(form.get("title") ?? "").trim();
  const bullets = [
    form.get("bullet1"),
    form.get("bullet2"),
    form.get("bullet3"),
    form.get("bullet4"),
  ].map((b) => String(b ?? "").trim());

  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Article title is required." },
      { status: 400 }
    );
  }
  if (bullets.some((b) => !b)) {
    return NextResponse.json(
      { ok: false, error: "All 4 bullet points are required." },
      { status: 400 }
    );
  }

  // Optional hero image
  let imageInput: ImageInput | undefined;
  let imageFile: File | undefined;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
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
    imageFile = file;
    imageInput = {
      mediaType: file.type as ImageInput["mediaType"],
      base64Data: Buffer.from(await file.arrayBuffer()).toString("base64"),
    };
  }

  try {
    // No uploaded photo? Let Claude pick the best-fit hero from the
    // captioned gallery so every article gets a distinct, relevant image.
    let galleryChoices: { index: number; caption: string; src: string }[] = [];
    if (!imageFile) {
      const items = await prisma.galleryItem.findMany({
        where: { caption: { not: "" } },
        orderBy: { position: "asc" },
        select: { src: true, caption: true },
      });
      galleryChoices = items.map((g, i) => ({
        index: i,
        caption: g.caption,
        src: g.src,
      }));
    }

    const article = await generateArticle(
      title,
      bullets,
      imageInput,
      galleryChoices.length
        ? galleryChoices.map(({ index, caption }) => ({ index, caption }))
        : undefined
    );

    const pickedSrc =
      article.imageIndex !== undefined
        ? galleryChoices[article.imageIndex]?.src
        : undefined;
    const imagePath = imageFile
      ? await saveBlogImage(imageFile)
      : pickedSrc ?? DEFAULT_IMAGE;
    const slug = await uniqueSlug(slugify(title));

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        category: article.category,
        excerpt: article.excerpt,
        image: imagePath,
        body: JSON.stringify(article.body),
        published: false, // draft — review before publishing
      },
    });

    return NextResponse.json({ ok: true, id: post.id, post });
  } catch (error) {
    if (error instanceof ClaudeGenerationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    console.error("Article generation failed:", error);
    return NextResponse.json(
      { ok: false, error: "Article generation failed unexpectedly." },
      { status: 500 }
    );
  }
}

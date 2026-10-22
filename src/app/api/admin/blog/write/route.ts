import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { ClaudeGenerationError, normalizeTone, writeFullPost } from "@/lib/claude";
import { getTone } from "@/lib/blogSettings";
import { slugify } from "@/app/admin/blog/blocks";

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

// Write a full draft from a chosen title, in the configured tone, and save
// it as an unpublished BlogPost for review in the editor.
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY is not set in .env.local" },
      { status: 400 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const title = String(data.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ ok: false, error: "A title is required." }, { status: 400 });
  }
  const tone = data.tone !== undefined ? normalizeTone(data.tone) : await getTone();

  try {
    // Let Claude pick the best-fit hero from the captioned gallery.
    const items = await prisma.galleryItem.findMany({
      where: { caption: { not: "" } },
      orderBy: { position: "asc" },
      select: { src: true, caption: true },
    });
    const galleryChoices = items.map((g, i) => ({
      index: i,
      caption: g.caption,
      src: g.src,
    }));

    const article = await writeFullPost(
      tone,
      title,
      galleryChoices.length
        ? galleryChoices.map(({ index, caption }) => ({ index, caption }))
        : undefined,
    );

    const pickedSrc =
      article.imageIndex !== undefined
        ? galleryChoices[article.imageIndex]?.src
        : undefined;
    const slug = await uniqueSlug(slugify(title));

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        category: article.category,
        excerpt: article.excerpt,
        image: pickedSrc ?? DEFAULT_IMAGE,
        body: JSON.stringify(article.body),
        published: false, // draft — review before publishing
      },
    });

    return NextResponse.json({ ok: true, id: post.id, post });
  } catch (error) {
    if (error instanceof ClaudeGenerationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error("Article write failed:", error);
    return NextResponse.json(
      { ok: false, error: "Article write failed unexpectedly." },
      { status: 500 },
    );
  }
}

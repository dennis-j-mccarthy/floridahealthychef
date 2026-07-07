import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { blocksToText } from "@/app/admin/blog/blocks";
import {
  ClaudeGenerationError,
  generatePromoKit,
  normalizePromoKit,
  type PromoKitContent,
} from "@/lib/claude";
import type { BlogBlock } from "@/data/blog";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://floridahealthychef.vercel.app";

async function findPost(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await findPost(id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  const kit = await prisma.promoKit.findUnique({ where: { postId: post.id } });
  if (!kit) {
    return NextResponse.json({ ok: true, kit: null });
  }

  let content: PromoKitContent | null;
  try {
    // Normalize old single-variant kits to the current arrays-of-variants
    // shape (variants without an image fall back to the post's hero image).
    content = normalizePromoKit(JSON.parse(kit.content), post.image);
  } catch {
    content = null;
  }
  if (!content) {
    return NextResponse.json({ ok: true, kit: null });
  }

  return NextResponse.json({
    ok: true,
    kit: { content, updatedAt: kit.updatedAt.toISOString() },
  });
}

export async function POST(_request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await findPost(id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  let bodyText = "";
  try {
    const blocks = JSON.parse(post.body) as BlogBlock[];
    bodyText = Array.isArray(blocks) ? blocksToText(blocks) : "";
  } catch {
    bodyText = "";
  }
  if (!bodyText.trim()) {
    return NextResponse.json(
      { ok: false, error: "The article has no body text to promote." },
      { status: 400 }
    );
  }

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  // Captioned photo pool Claude picks from: index 0 is the article's hero
  // image, then the gallery photos in position order.
  const gallery = await prisma.galleryItem.findMany({
    orderBy: { position: "asc" },
  });
  const captionedGallery = gallery.filter((g) => g.caption.trim() !== "");
  const heroSrc = post.image;
  const imageSrcs = [heroSrc, ...captionedGallery.map((g) => g.src)];
  const images = [
    { index: 0, caption: `Article hero image — ${post.title}` },
    ...captionedGallery.map((g, i) => ({ index: i + 1, caption: g.caption })),
  ];

  let raw: Awaited<ReturnType<typeof generatePromoKit>>;
  try {
    raw = await generatePromoKit({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      bodyText,
      articleUrl,
      images,
    });
  } catch (error) {
    if (error instanceof ClaudeGenerationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    throw error;
  }

  // Map each variant's imageIndex to its actual src; anything out of range
  // or invalid clamps to the hero image.
  const resolveImage = (imageIndex: number): string =>
    Number.isInteger(imageIndex) &&
    imageIndex >= 0 &&
    imageIndex < imageSrcs.length
      ? imageSrcs[imageIndex]
      : heroSrc;

  const content: PromoKitContent = {
    instagram: raw.instagram.map(({ caption, hashtags, imageIndex }) => ({
      caption,
      hashtags,
      image: resolveImage(imageIndex),
    })),
    reels: raw.reels.map(({ caption, hashtags, videoIdea, imageIndex }) => ({
      caption,
      hashtags,
      videoIdea,
      image: resolveImage(imageIndex),
    })),
    facebook: raw.facebook.map(({ post: fbPost, imageIndex }) => ({
      post: fbPost,
      image: resolveImage(imageIndex),
    })),
    x: raw.x.map(({ post: xPost, imageIndex }) => ({
      post: xPost,
      image: resolveImage(imageIndex),
    })),
    tiktok: raw.tiktok.map(({ caption, hashtags, videoIdea, imageIndex }) => ({
      caption,
      hashtags,
      videoIdea,
      image: resolveImage(imageIndex),
    })),
    email: raw.email,
  };

  const saved = await prisma.promoKit.upsert({
    where: { postId: post.id },
    create: { postId: post.id, content: JSON.stringify(content) },
    update: { content: JSON.stringify(content) },
  });

  return NextResponse.json({
    ok: true,
    kit: { content, updatedAt: saved.updatedAt.toISOString() },
  });
}

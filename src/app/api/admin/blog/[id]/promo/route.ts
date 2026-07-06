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
    // Normalize old single-variant kits to the current arrays-of-variants shape.
    content = normalizePromoKit(JSON.parse(kit.content));
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

  let content: PromoKitContent;
  try {
    content = await generatePromoKit({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      bodyText,
      articleUrl,
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

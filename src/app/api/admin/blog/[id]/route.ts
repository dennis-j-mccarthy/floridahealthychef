import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { validateBody } from "@/app/admin/blog/blocks";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function findPost(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await findPost(id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const update: {
    title?: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    image?: string;
    published?: boolean;
    body?: string;
  } = {};

  if (data.title !== undefined) {
    const title = String(data.title).trim();
    if (!title) {
      return NextResponse.json(
        { ok: false, error: "Title cannot be empty." },
        { status: 400 }
      );
    }
    update.title = title;
  }
  if (data.slug !== undefined) {
    const slug = String(data.slug).trim();
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Slug cannot be empty." },
        { status: 400 }
      );
    }
    if (slug !== post.slug) {
      const clash = await prisma.blogPost.findUnique({ where: { slug } });
      if (clash) {
        return NextResponse.json(
          { ok: false, error: `A post with slug "${slug}" already exists.` },
          { status: 409 }
        );
      }
    }
    update.slug = slug;
  }
  if (data.category !== undefined) update.category = String(data.category).trim();
  if (data.excerpt !== undefined) update.excerpt = String(data.excerpt).trim();
  if (data.image !== undefined) update.image = String(data.image).trim();
  if (data.published !== undefined) update.published = Boolean(data.published);
  if (data.body !== undefined) {
    const body = validateBody(data.body);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Body must be an array of h2/p/ul blocks." },
        { status: 400 }
      );
    }
    update.body = JSON.stringify(body);
  }

  const updated = await prisma.blogPost.update({
    where: { id: post.id },
    data: update,
  });

  return NextResponse.json({ ok: true, post: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await findPost(id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id: post.id } });
  return NextResponse.json({ ok: true });
}

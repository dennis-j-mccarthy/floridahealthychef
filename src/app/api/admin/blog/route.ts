import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { validateBody } from "@/app/admin/blog/blocks";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, posts });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
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

  const title = String(data.title ?? "").trim();
  const slug = String(data.slug ?? "").trim();
  const category = String(data.category ?? "").trim();
  const excerpt = String(data.excerpt ?? "").trim();
  const image = String(data.image ?? "").trim();
  const published = Boolean(data.published);
  const body = validateBody(data.body);

  if (!title || !slug || !category) {
    return NextResponse.json(
      { ok: false, error: "Title, slug, and category are required." },
      { status: 400 }
    );
  }
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Body must be an array of h2/p/ul blocks." },
      { status: 400 }
    );
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `A post with slug "${slug}" already exists.` },
      { status: 409 }
    );
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      category,
      excerpt,
      image: image || "/images/blog/whats-a-personal-chef.jpg",
      body: JSON.stringify(body),
      published,
    },
  });

  return NextResponse.json({ ok: true, post }, { status: 201 });
}

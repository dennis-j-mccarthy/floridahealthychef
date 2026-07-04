import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function parseId(params: Params["params"]): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = await parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { caption?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "moveToTop") {
    if (item.position === 1) {
      return NextResponse.json({ item });
    }
    const [, updated] = await prisma.$transaction([
      prisma.galleryItem.updateMany({
        where: { position: { lt: item.position } },
        data: { position: { increment: 1 } },
      }),
      prisma.galleryItem.update({
        where: { id },
        data: { position: 1 },
      }),
    ]);
    return NextResponse.json({ item: updated });
  }

  if (typeof body.caption === "string") {
    const updated = await prisma.galleryItem.update({
      where: { id },
      data: { caption: body.caption.trim() },
    });
    return NextResponse.json({ item: updated });
  }

  return NextResponse.json(
    { error: "Provide a caption string or {\"action\":\"moveToTop\"}." },
    { status: 400 }
  );
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = await parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.galleryItem.delete({ where: { id } }),
    prisma.galleryItem.updateMany({
      where: { position: { gt: item.position } },
      data: { position: { decrement: 1 } },
    }),
  ]);

  // Only remove files we created under public/uploads/gallery — never touch
  // the original curated set in public/images/gallery.
  if (item.src.startsWith("/uploads/gallery/")) {
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", "gallery");
    const filePath = path.resolve(
      path.join(process.cwd(), "public", ...item.src.split("/").filter(Boolean))
    );
    if (filePath.startsWith(uploadsRoot + path.sep)) {
      await unlink(filePath).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}

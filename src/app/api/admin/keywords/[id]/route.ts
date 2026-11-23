import { NextResponse } from "next/server";
import { body, guard } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// PATCH { status?, priority?, note? }   DELETE
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await ctx.params;
  const b = await body<{ status?: string; priority?: number; note?: string | null }>(req);
  if (!b) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const data: { status?: string; priority?: number; note?: string | null } = {};
  if (b.status && ["idea", "target", "dropped"].includes(b.status)) data.status = b.status;
  if (b.priority !== undefined) data.priority = Math.max(0, Math.min(100, Math.round(Number(b.priority)) || 0));
  if (b.note !== undefined) data.note = b.note ? String(b.note).slice(0, 200) : null;
  try {
    return NextResponse.json({ keyword: await prisma.keyword.update({ where: { id }, data }) });
  } catch {
    return NextResponse.json({ error: "Keyword not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await ctx.params;
  await prisma.keyword.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

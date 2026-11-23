import { NextResponse } from "next/server";
import { guard } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await ctx.params;
  await prisma.spendEntry.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

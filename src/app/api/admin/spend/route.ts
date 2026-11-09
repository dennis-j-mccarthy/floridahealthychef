import { NextResponse } from "next/server";
import { body, guard } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const CHANNELS = ["google", "meta"];

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({ entries: await prisma.spendEntry.findMany({ orderBy: { periodStart: "desc" }, take: 200 }) });
}

// POST { channel, periodStart: "YYYY-MM-DD", amount (dollars), results?, note? }
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = await body<{ channel?: string; periodStart?: string; amount?: number | string; results?: number | string | null; note?: string }>(req);
  if (!b || !CHANNELS.includes(String(b.channel))) return NextResponse.json({ error: "Pick a channel." }, { status: 400 });
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.periodStart)) ? new Date(`${b.periodStart}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime())) return NextResponse.json({ error: "Pick the start date." }, { status: 400 });
  const cents = Math.round(Number(b.amount) * 100);
  if (!Number.isFinite(cents) || cents < 0 || cents > 10_000_000) return NextResponse.json({ error: "Enter the amount in dollars." }, { status: 400 });
  const results = b.results === null || b.results === undefined || b.results === "" ? null : Math.max(0, Math.round(Number(b.results)) || 0);
  const entry = await prisma.spendEntry.create({
    data: { channel: String(b.channel), periodStart: date, amountCents: cents, results, note: b.note ? String(b.note).slice(0, 200) : null },
  });
  return NextResponse.json({ entry });
}

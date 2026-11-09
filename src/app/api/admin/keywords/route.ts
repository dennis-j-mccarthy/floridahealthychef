import { NextResponse } from "next/server";
import { body, guard } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";
import { keywordId, type KeywordKind } from "@/lib/keywords";

export const runtime = "nodejs";

const KINDS: KeywordKind[] = ["problem", "service", "question"];

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const keywords = await prisma.keyword.findMany({ orderBy: [{ priority: "desc" }, { phrase: "asc" }] });
  return NextResponse.json({ keywords });
}

// POST { phrase, kind?, priority?, source?, note? } → { keyword }   (409 if it exists)
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = await body<{ phrase?: string; kind?: string; priority?: number; source?: string; note?: string }>(req);
  const phrase = String(b?.phrase ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (!phrase) return NextResponse.json({ error: "Type a keyword or phrase." }, { status: 400 });
  const kind = KINDS.includes(b?.kind as KeywordKind) ? (b!.kind as KeywordKind) : "service";
  const priority = Math.max(0, Math.min(100, Math.round(Number(b?.priority ?? 50)) || 50));
  const id = keywordId(phrase);
  if (!id) return NextResponse.json({ error: "That phrase has no letters or numbers." }, { status: 400 });
  const exists = await prisma.keyword.findFirst({ where: { OR: [{ id }, { phrase }] } });
  if (exists) return NextResponse.json({ error: "Already on the list.", keyword: exists }, { status: 409 });
  const keyword = await prisma.keyword.create({
    data: { id, phrase, kind, priority, source: b?.source === "claude" ? "claude" : "manual", note: b?.note?.slice(0, 200) || null },
  });
  return NextResponse.json({ keyword });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/*
  Public, first-party conversion log for the Paid search dashboard.
  POST { kind, path?, source?, campaign?, gclid? }
    contact_click   a click on any link to /contact (the consultation page)
    contact_submit  the contact form sent successfully
    signup          a newsletter signup succeeded
    call_click      a tap on a tel: link (none on the site today)
  Never blocks a visitor: before migration 20261109120000_growth_search is
  applied the insert fails and is ignored.
*/
const KINDS = ["contact_click", "contact_submit", "signup", "call_click"];
const s = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!b || !KINDS.includes(String(b.kind))) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await prisma.conversionEvent.create({
      data: { kind: String(b.kind), path: s(b.path, 200), source: s(b.source, 80), campaign: s(b.campaign, 120), gclid: s(b.gclid, 200) },
    });
  } catch {
    /* never block a visitor on logging */
  }
  return NextResponse.json({ ok: true });
}

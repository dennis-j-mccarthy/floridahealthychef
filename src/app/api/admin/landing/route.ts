import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { body, guard } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";
import { writeLanding, type LandingDraft } from "@/lib/landing";
import { keywordId } from "@/lib/keywords";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const pages = await prisma.landingPage.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ pages });
}

// POST { keyword, full? } → writes a DRAFT (never published) and links it to the keyword.
// full: the complete page (eyebrow, value prop, benefits, steps, CTA).
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  const b = await body<{ keyword?: string; full?: boolean }>(req);
  const keyword = String(b?.keyword ?? "").trim().slice(0, 120);
  if (!keyword) return NextResponse.json({ error: "Pick a keyword." }, { status: 400 });
  let draft: LandingDraft;
  try {
    draft = await writeLanding(keyword, b?.full !== false);
  } catch {
    return NextResponse.json({ error: "Couldn't write the page. Try again." }, { status: 502 });
  }
  let slug = draft.slug;
  for (let n = 2; await prisma.landingPage.findUnique({ where: { slug } }); n++) slug = `${draft.slug}-${n}`;
  const page = await prisma.landingPage.create({
    data: {
      slug,
      keyword,
      title: draft.title,
      metaDescription: draft.metaDescription,
      h1: draft.h1,
      intro: draft.intro,
      body: draft.body,
      faq: draft.faq as unknown as Prisma.InputJsonValue,
      heroAlt: null,
      ...(draft.sections ? { sections: draft.sections as unknown as Prisma.InputJsonValue } : {}),
      published: false,
    },
  });
  await prisma.keyword.updateMany({ where: { id: keywordId(keyword) }, data: { landingSlug: slug, status: "target" } });
  return NextResponse.json({ page, imageIdea: draft.imageIdea });
}

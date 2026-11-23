import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { growthReady } from "@/lib/growthDb";
import { Explain, NotReady } from "@/components/growth/Explain";
import type { Faq, LandingSections } from "@/lib/landing";
import { LandingClient } from "./LandingClient";

export const metadata: Metadata = { title: "Landing pages", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ keyword?: string }> };

export default async function LandingAdmin(props: Props) {
  if (!(await isAdminRequest())) redirect("/admin/login");
  const { keyword } = await props.searchParams;
  const ready = await growthReady();
  const [pages, keywords, photos] = await Promise.all([
    ready ? prisma.landingPage.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []) : Promise.resolve([]),
    ready
      ? prisma.keyword.findMany({ where: { status: { not: "dropped" } }, orderBy: { priority: "desc" } }).catch(() => [])
      : Promise.resolve([]),
    prisma.galleryItem.findMany({ orderBy: { position: "asc" }, select: { src: true, caption: true } }).catch(() => []),
  ]);
  return (
    <section className="tl-page">
      <div className="tl-eyebrow">Growth</div>
      <h1>Landing pages</h1>
      <Explain>
        A landing page is a page built for one search, like “personal chef Naples FL”. When someone searches that, or clicks an ad
        for it, they land on a page about exactly what they want, written in your voice, with a button to book the free 20-minute
        consultation and a place to join the newsletter. Claude writes the first draft; you read it, change anything that
        doesn&rsquo;t sound like you, pick a photo from your Gallery, and press Publish. Drafts are private until published: visitors
        get “page not found”, and only you see them, with a Draft banner.
      </Explain>
      {!ready ? (
        <NotReady what="Landing pages" />
      ) : (
        <LandingClient
          initialPages={pages.map((p) => ({
            ...p,
            faq: (Array.isArray(p.faq) ? p.faq : []) as unknown as Faq[],
            sections: (p.sections ?? null) as unknown as LandingSections | null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }))}
          keywords={keywords.map((k) => ({ phrase: k.phrase, kind: k.kind, priority: k.priority, landingSlug: k.landingSlug }))}
          photos={photos}
          preselect={keyword ?? ""}
        />
      )}
    </section>
  );
}

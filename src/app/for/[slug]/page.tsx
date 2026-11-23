import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import NewsletterForm from "@/components/NewsletterForm";
import { markdownBlocks, type Faq, type LandingSections } from "@/lib/landing";
import { BUSINESS_ID, CREDENTIALS, PERSON_ID, SERVICE_AREA, absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

// Landing pages for keywords (Growth → Landing pages in the studio).
// Published pages are public and in the sitemap. Drafts 404 for visitors and
// show only to a signed-in admin, with a banner and noindex. Before the
// Growth tables exist every slug 404s.
export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const page = await prisma.landingPage.findUnique({ where: { slug } }).catch(() => null);
  if (!page) return null;
  if (page.published) return { page, preview: false };
  return (await isAdminRequest()) ? { page, preview: true } : null;
}

export async function generateMetadata(props: RouteProps): Promise<Metadata> {
  const { slug } = await props.params;
  const hit = await load(slug);
  if (!hit) return { title: "Page not found", robots: { index: false, follow: false } };
  const { page, preview } = hit;
  const meta = pageMetadata({
    title: page.title,
    absoluteTitle: true,
    description: page.metaDescription || page.intro.slice(0, 155),
    path: `/for/${page.slug}`,
    image: page.heroImage ? { url: page.heroImage, alt: page.heroAlt || page.h1 } : undefined,
  });
  return preview ? { ...meta, robots: { index: false, follow: false } } : meta;
}

const CTA_BUTTON = "inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-normal text-white transition-colors hover:bg-primary-dark";

function ConsultButton({ label }: { label: string }) {
  return (
    <Link href="/contact" className={CTA_BUTTON}>
      {label} <span aria-hidden="true">→</span>
    </Link>
  );
}

function Body({ md }: { md: string }) {
  return (
    <div>
      {markdownBlocks(md).map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="mt-6 space-y-3 pl-1">
            {b.items.map((item, j) => (
              <li key={j} className="flex gap-3 text-base font-light leading-relaxed text-[#5f5f5f]">
                <span className="mt-[3px] text-primary" aria-hidden="true">✦</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        ) : b.type === "p" ? (
          <p key={i} className="mt-6 text-lg font-light leading-[30px] text-[#5f5f5f]" dangerouslySetInnerHTML={{ __html: b.html }} />
        ) : (
          <h2 key={i} className="mt-12 font-[family-name:var(--font-josefin-sans)] text-[26px] font-light leading-[30px] text-dark" dangerouslySetInnerHTML={{ __html: b.html }} />
        ),
      )}
    </div>
  );
}

export default async function LandingPageRoute(props: RouteProps) {
  const { slug } = await props.params;
  const hit = await load(slug);
  if (!hit) notFound();
  const { page, preview } = hit;
  const faq = (Array.isArray(page.faq) ? page.faq : []) as unknown as Faq[];
  const s = (page.sections ?? null) as unknown as LandingSections | null;
  const cta = s?.ctaButton || "Book a free consultation";
  const url = absoluteUrl(`/for/${page.slug}`);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": url,
      url,
      name: page.title,
      description: page.metaDescription,
      about: page.keyword,
      author: { "@id": PERSON_ID },
      publisher: { "@id": BUSINESS_ID },
    },
    ...(faq.length
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }]
      : []),
  ];

  return (
    <>
      {!preview && schema.map((x, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(x)} />)}

      {/* HERO */}
      <header className="bg-gradient-to-br from-blush/20 via-light to-primary/10 pt-36 pb-16 md:pt-44 md:pb-20">
        {preview && (
          <div role="status" className="mx-auto mb-8 max-w-[1200px] px-6">
            <p className="rounded-xl border border-sun/40 bg-sun-soft px-4 py-3 text-sm text-dark">
              <b>Draft preview.</b> Visitors get “page not found” until this page is published in the studio (Growth → Landing pages). Search engines are told not to index it.
            </p>
          </div>
        )}
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="font-[family-name:var(--font-great-vibes)] text-2xl text-olive">{s?.eyebrow || "Beautiful Foods by Beth"}</p>
            <h1 className="mt-4 text-4xl font-light leading-tight text-dark md:text-6xl">{page.h1}</h1>
            {(s?.valueProp || page.intro) && (
              <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-gray">{s?.valueProp || page.intro}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ConsultButton label={cta} />
              <span className="text-sm font-light text-gray">Complimentary · 20 minutes</span>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Service area">
              {SERVICE_AREA.map((town) => (
                <li key={town} className="rounded-full bg-white px-4 py-1.5 text-xs font-light text-dark">{town}</li>
              ))}
            </ul>
          </div>
          {page.heroImage && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_4px_48px_0_rgba(0,0,0,0.08)]">
              <Image src={page.heroImage} alt={page.heroAlt || ""} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </div>
      </header>

      {/* WHAT CLIENTS GET */}
      {s && s.benefits.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            {s.valueProp && page.intro && <p className="mx-auto max-w-3xl text-center text-lg font-light leading-relaxed text-gray">{page.intro}</p>}
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {s.benefits.map((b, i) => (
                <div key={i} className="rounded-2xl bg-light p-8">
                  <span className="text-sm font-light text-olive">0{i + 1}</span>
                  <h3 className="mt-2 text-2xl font-light text-dark">{b.title}</h3>
                  <p className="mt-3 text-base font-light leading-relaxed text-gray">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MID CTA */}
      <section className="bg-olive py-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-6 px-6 text-center">
          <p className="text-2xl font-light text-white">{s?.ctaHeadline || "Start with a free 20-minute consultation"}</p>
          <Link href="/contact" className="rounded-full bg-white px-7 py-3 text-base font-normal text-dark transition-colors hover:bg-light">
            {cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      {s && s.steps.length > 0 && (
        <section className="bg-light py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="font-[family-name:var(--font-great-vibes)] text-2xl text-olive">How it works</p>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {s.steps.map((st, i) => (
                <li key={i} className="rounded-2xl bg-white p-8">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-sage text-white">{i + 1}</span>
                  <h3 className="mt-4 text-xl font-light text-dark">{st.title}</h3>
                  <p className="mt-2 text-base font-light leading-relaxed text-gray">{st.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10"><ConsultButton label={cta} /></div>
          </div>
        </section>
      )}

      {/* THE ARTICLE + FAQ + ABOUT BETH */}
      <article className="bg-white py-20">
        <div className="mx-auto max-w-[780px] px-6">
          {!s && page.intro && <p className="text-xl font-light leading-relaxed text-dark">{page.intro}</p>}
          <Body md={page.body} />

          {faq.length > 0 && (
            <section className="mt-16" aria-label="Questions">
              <h2 className="font-[family-name:var(--font-josefin-sans)] text-[26px] font-light text-dark">Questions people ask</h2>
              <div className="mt-6 divide-y divide-light-2 border-y border-light-2">
                {faq.map((f, i) => (
                  <details key={i} open={i === 0} className="py-4">
                    <summary className="cursor-pointer text-lg font-normal text-dark">{f.q}</summary>
                    <p className="mt-3 text-base font-light leading-relaxed text-[#5f5f5f]">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <aside className="mt-16 flex flex-col gap-6 rounded-2xl bg-light p-8 sm:flex-row sm:items-center">
            <Image src="/images/about/beth-chef-coat.png" alt="Beth McCarthy" width={120} height={160} className="h-40 w-auto flex-none rounded-xl object-cover" />
            <div>
              <p className="text-xl font-light text-dark">Beth McCarthy</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {CREDENTIALS.map((c) => (
                  <li key={c} className="rounded-full bg-white px-3 py-1 text-xs font-light text-dark">{c}</li>
                ))}
              </ul>
              <Link href="/about" className="mt-3 inline-block text-sm font-light text-primary hover:text-primary-dark">More about Beth →</Link>
            </div>
          </aside>
        </div>
      </article>

      {/* NEWSLETTER */}
      <section className="bg-light py-16">
        <div className="mx-auto max-w-[780px] px-6 text-center">
          <p className="font-[family-name:var(--font-great-vibes)] text-2xl text-olive">From my kitchen</p>
          <p className="mt-2 text-lg font-light text-gray">Recipes and wellness notes from Beth, by email. Unsubscribe anytime.</p>
          <div className="mx-auto mt-6 max-w-lg">
            <NewsletterForm source="landing" />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white pt-16 pb-32">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-light text-dark md:text-4xl">{s?.ctaHeadline || "Start with a free 20-minute consultation"}</h2>
          <p className="max-w-xl text-base font-light text-gray">Beth cooks in clients&rsquo; homes across {SERVICE_AREA.slice(0, -1).join(", ")} and {SERVICE_AREA.at(-1)}.</p>
          <ConsultButton label={cta} />
        </div>
      </section>

      {/* STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-light-2 bg-white/95 backdrop-blur" role="region" aria-label="Book a consultation">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
          <span className="hidden text-sm font-light text-gray sm:inline">Beautiful Foods by Beth · Southwest Florida</span>
          <Link href="/contact" className="ml-auto rounded-full bg-primary px-6 py-2.5 text-sm font-normal text-white hover:bg-primary-dark">
            {cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}

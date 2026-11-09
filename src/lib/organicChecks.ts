import { prisma } from "@/lib/db";
import { growthReady } from "@/lib/growthDb";
import { isSearchConsoleConfigured } from "@/lib/searchConsole";
import { SITE_URL } from "@/lib/seo";

/*
  Growth → Search → Organic. Live checks, run when the tab loads. SERVER ONLY.

  The checks fetch THIS deployment (the origin the studio is open on), not
  SITE_URL: floridahealthychef.com still serves the old Webflow site. A page
  that cannot be fetched is reported as "couldn't check", never as missing.
  That includes a protected Vercel preview: it redirects to Vercel's login
  page, which a plain fetch follows and reads as an empty sitemap.

  The Rich Results Test has no public API, so each page gets a link to run
  it by hand. Items that need a human are manual ticks stored in
  StudioSetting "organic_checklist".
*/

export interface PageCheck {
  path: string;
  checked: boolean;
  status: number | null;
  title: boolean;
  description: boolean;
  canonical: boolean;
  openGraph: boolean;
  schemaTypes: string[];
  missingSchema: string[];
  error?: string;
}

export interface SiteCheck {
  id: string;
  label: string;
  ok: boolean | null;
  detail: string;
}

const BASE_PAGES: { path: string; expect: string[] }[] = [
  { path: "/", expect: ["LocalBusiness", "Person"] },
  { path: "/services", expect: [] },
  { path: "/about", expect: [] },
  { path: "/contact", expect: [] },
  { path: "/blog", expect: [] },
  { path: "/recipes", expect: [] },
];

function typesIn(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]) as { "@type"?: string | string[] };
      const t = j["@type"];
      if (Array.isArray(t)) out.push(...t);
      else if (t) out.push(t);
    } catch {
      out.push("(invalid JSON)");
    }
  }
  return out;
}

const PROTECTED =
  "Couldn't check: this preview is behind Vercel's login. Open the studio on floridahealthychef.vercel.app to check.";

export async function runOrganicChecks(origin: string): Promise<{ site: SiteCheck[]; pages: PageCheck[]; landing: number; origin: string }> {
  // redirect: "manual" so a protected preview shows up as a redirect (or 401)
  // instead of silently becoming Vercel's login page.
  const get = async (path: string) => {
    const res = await fetch(origin + path, {
      cache: "no-store",
      redirect: "manual",
      headers: { "user-agent": "FloridaHealthyChefStudioCheck/1.0" },
    });
    const text = res.status === 200 ? await res.text() : "";
    const isProtected =
      res.status === 401 ||
      (res.status >= 300 && res.status < 400 && /vercel\.com\/(login|sso)|_vercel_sso/.test(res.headers.get("location") ?? "")) ||
      /Vercel Authentication/.test(text.slice(0, 4000));
    return { status: isProtected ? 401 : res.status, text: isProtected ? "" : text, isProtected };
  };
  const site: SiteCheck[] = [];

  try {
    const sm = await get("/sitemap.xml");
    const count = (sm.text.match(/<loc>/g) || []).length;
    site.push(
      sm.status === 200
        ? { id: "sitemap", label: "Sitemap is published", ok: count > 0, detail: `/sitemap.xml lists ${count} pages.` }
        : { id: "sitemap", label: "Sitemap is published", ok: null, detail: sm.isProtected ? PROTECTED : `Couldn't check: the site answered ${sm.status}.` },
    );
  } catch {
    site.push({ id: "sitemap", label: "Sitemap is published", ok: null, detail: "Couldn't check: the sitemap could not be fetched." });
  }
  try {
    const rb = await get("/robots.txt");
    site.push(
      rb.status === 200
        ? { id: "robots", label: "robots.txt points to the sitemap", ok: /sitemap:/i.test(rb.text), detail: "Admin pages are kept out of search; public pages are open." }
        : { id: "robots", label: "robots.txt points to the sitemap", ok: null, detail: rb.isProtected ? PROTECTED : `Couldn't check: the site answered ${rb.status}.` },
    );
  } catch {
    site.push({ id: "robots", label: "robots.txt points to the sitemap", ok: null, detail: "Couldn't check: robots.txt could not be fetched." });
  }
  site.push({
    id: "domain",
    label: "floridahealthychef.com points at this site",
    ok: null,
    detail: `Canonical links and the sitemap name ${SITE_URL}, which still serves the old Webflow site. Move the domain to Vercel before verifying Search Console.`,
  });
  site.push({
    id: "gsc",
    label: "Search Console verified and connected",
    ok: isSearchConsoleConfigured() ? true : null,
    detail: isSearchConsoleConfigured()
      ? "Connected. Submit the sitemap once in Search Console → Sitemaps."
      : "Not connected yet. Verify floridahealthychef.com in Search Console, submit the sitemap, then add the service account (see Data sources).",
  });

  const pages = [...BASE_PAGES];
  const post = await prisma.blogPost
    .findFirst({ where: { published: true }, orderBy: { createdAt: "desc" }, select: { slug: true } })
    .catch(() => null);
  if (post) pages.push({ path: `/blog/${post.slug}`, expect: [] });

  const results: PageCheck[] = [];
  for (const p of pages) {
    try {
      const { status, text, isProtected } = await get(p.path);
      if (status !== 200) {
        results.push({ path: p.path, checked: false, status, title: false, description: false, canonical: false, openGraph: false, schemaTypes: [], missingSchema: [], error: isProtected ? "behind Vercel's login" : undefined });
        continue;
      }
      const end = text.indexOf("</head>");
      const head = text.slice(0, end > 0 ? end : 40000);
      const schemaTypes = typesIn(text);
      results.push({
        path: p.path,
        checked: true,
        status,
        title: /<title>[^<]{10,}<\/title>/.test(head),
        description: /<meta name="description" content="[^"]{30,}"/.test(head),
        canonical: /<link rel="canonical"/.test(head),
        openGraph: /property="og:title"/.test(head) && /property="og:image"/.test(head),
        schemaTypes,
        missingSchema: p.expect.filter((t) => !schemaTypes.includes(t)),
      });
    } catch (e) {
      results.push({ path: p.path, checked: false, status: null, title: false, description: false, canonical: false, openGraph: false, schemaTypes: [], missingSchema: [], error: (e as Error).message });
    }
  }

  let landing = 0;
  if (await growthReady()) landing = await prisma.landingPage.count({ where: { published: true } }).catch(() => 0);
  return { site, pages: results, landing, origin };
}

/* Manual items (ticks saved in StudioSetting "organic_checklist"). */
export const ORGANIC_MANUAL: { group: string; items: { id: string; text: string }[] }[] = [
  {
    group: "Foundation",
    items: [
      { id: "domain-moved", text: "floridahealthychef.com moved from Webflow to this site on Vercel, with the old Webflow page addresses redirected to their new ones." },
      { id: "gsc-verified", text: "floridahealthychef.com verified in Google Search Console (Domain property, a DNS record wherever the domain is registered)." },
      { id: "gsc-sitemap", text: "Sitemap submitted in Search Console → Sitemaps: https://floridahealthychef.com/sitemap.xml" },
      { id: "rich-results", text: "Home page, one blog article and one landing page run through the Rich Results Test with no errors." },
      { id: "gbp", text: "Google Business Profile set up as a service-area business (no public address), website field set to https://floridahealthychef.com" },
      { id: "same-details", text: "Business name and service area written the same way everywhere: Beautiful Foods by Beth, serving Naples, Bonita Springs, Estero, Fort Myers and Punta Gorda." },
      { id: "internal-links", text: "Each blog article links to the matching service or landing page, and each landing page links to related articles." },
    ],
  },
  {
    group: "Listings and links",
    items: [
      { id: "yelp", text: "Yelp business page under Personal Chefs and Caterers" },
      { id: "apple-bing", text: "Apple Business Connect and Bing Places" },
      { id: "nextdoor", text: "Nextdoor business page for the Naples and Bonita Springs neighborhoods" },
      { id: "press", text: "Ask the publications already shown on the home page (the media row) to link to the site from their articles" },
      { id: "partners", text: "Swap links with local businesses Beth already works with: farms, markets, yoga studios, event venues." },
      { id: "instagram-link", text: "Instagram bio (@beautifulfoodsbybeth) links to the site" },
    ],
  },
  {
    group: "Answer engines (AI search tools)",
    items: [
      { id: "aeo-faq", text: "Every landing page has 4 to 6 plain questions with short, direct answers (the generator does this)." },
      { id: "aeo-questions", text: "Each question keyword on the Keywords tab has a page or an FAQ entry that answers it in the first two sentences." },
      { id: "aeo-cost", text: "The price range on /services is stated in plain words a search tool can quote." },
    ],
  },
  {
    group: "Beth's voice and pace",
    items: [
      { id: "voice-review", text: "Beth reads and edits every AI draft before it publishes. Her words, her kitchen." },
      { id: "no-claims", text: "No health outcomes promised on landing pages or ads (no “lowers blood pressure”, “cures”, weight-loss numbers)." },
      { id: "pace", text: "Publish at least two blog articles a month, every month." },
    ],
  },
];

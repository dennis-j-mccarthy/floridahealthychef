import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { growthReady } from "@/lib/growthDb";
import { COMPETE_TODO, type Competitor } from "@/lib/competitors";
import { getSetting } from "@/lib/studioSettings";
import { isSearchConsoleConfigured, searchConsoleSnapshot } from "@/lib/searchConsole";
import { isKeywordPlannerConfigured, keywordVolumes, missingKeywordPlannerEnv } from "@/lib/keywordPlanner";
import { ORGANIC_MANUAL, runOrganicChecks } from "@/lib/organicChecks";
import { SITE_URL } from "@/lib/seo";
import type { KeywordRow } from "@/lib/keywords";
import { Card, Explain, NotReady, Status } from "@/components/growth/Explain";
import { Tabs } from "@/components/growth/Tabs";
import { TickList } from "@/components/growth/TickList";
import { KeywordTool } from "@/components/growth/KeywordTool";
import { PaidPanel, type Counts } from "@/components/growth/PaidPanel";
import { CompetitorsEditor } from "@/components/growth/CompetitorsEditor";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TABS = [
  { id: "competitors", label: "Competitors" },
  { id: "keywords", label: "Keywords" },
  { id: "organic", label: "Organic search" },
  { id: "paid", label: "Paid search" },
  { id: "sources", label: "Data sources" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function SearchPage(props: Props) {
  if (!(await isAdminRequest())) redirect("/admin/login");
  const { tab: raw } = await props.searchParams;
  const tab = TABS.some((t) => t.id === raw) ? raw! : "competitors";
  const ready = await growthReady();

  return (
    <section className="tl-page">
      <div className="tl-eyebrow">Growth</div>
      <h1>Search</h1>
      <p className="tl-lede">How people find Beautiful Foods by Beth on Google, who they find instead, and what to do about it.</p>
      <Tabs base="/admin/search" tabs={TABS} active={tab} />
      {tab === "competitors" && <Competitors ready={ready} />}
      {tab === "keywords" && <Keywords ready={ready} />}
      {tab === "organic" && <Organic />}
      {tab === "paid" && <Paid ready={ready} />}
      {tab === "sources" && <Sources />}
    </section>
  );
}

/* ───────── Competitors ───────── */
async function Competitors({ ready }: { ready: boolean }) {
  const [list, ticks] = await Promise.all([getSetting<Competitor[]>("competitors", []), getSetting<Record<string, boolean>>("competitor_todo", {})]);
  return (
    <div className="space-y-6">
      <Explain>
        These are the other personal chefs and small caterers someone in Naples, Bonita Springs, Estero, Fort Myers or Punta Gorda
        might find instead of you. The list starts empty: add the ones you actually come across, with a note on what they offer. Each
        stays marked “Check” until someone has looked at their site. Below the list is the to-do list for getting ahead of them on
        Google, for free and with ads.
      </Explain>
      {!ready && <NotReady what="The competitor list" />}
      <Card title="Personal chefs and caterers nearby">
        <CompetitorsEditor initial={list} />
      </Card>
      <Card title="To-do: competing on Google">
        <TickList settingKey="competitor_todo" groups={COMPETE_TODO} initial={ticks} />
      </Card>
    </div>
  );
}

/* ───────── Keywords ───────── */
async function Keywords({ ready }: { ready: boolean }) {
  const rows: KeywordRow[] = ready
    ? ((await prisma.keyword.findMany({ orderBy: [{ priority: "desc" }, { phrase: "asc" }] }).catch(() => [])) as KeywordRow[])
    : [];
  const gsc = await searchConsoleSnapshot("query");
  const impressions = gsc.connected && gsc.rows.length ? Object.fromEntries(gsc.rows.map((r) => [r.key.toLowerCase(), r.impressions])) : null;
  let volumes: Record<string, number> | null = null;
  let volumeError: string | null = null;
  if (isKeywordPlannerConfigured() && rows.length) {
    try {
      const v = await keywordVolumes(rows.filter((r) => r.status === "target").map((r) => r.phrase));
      volumes = Object.fromEntries(v.filter((x) => x.avgMonthlySearches !== null).map((x) => [x.phrase.toLowerCase(), x.avgMonthlySearches!]));
    } catch (e) {
      volumeError = (e as Error).message;
    }
  }
  return (
    <div className="space-y-6">
      <Explain>
        Keywords are the words people type into Google. The valuable ones name what you do and where, like “personal chef Naples
        FL”, or a need, like “weekly healthy meal prep chef Naples”, because that person is ready to hire someone and has not picked
        anyone yet. Use this page to find new phrases, mark the ones to target, and turn each into a landing page or a blog article.
        In the word cloud, bigger means more important.
      </Explain>
      {!ready && <NotReady what="The keyword list" />}
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span>Search Console: {gsc.connected ? (gsc.error ? `error: ${gsc.error}` : "connected") : "not connected yet"}</span>
        <span>· Keyword Planner volumes: {isKeywordPlannerConfigured() ? (volumeError ? `error: ${volumeError}` : "connected") : "not connected yet"}</span>
        <Link href="/admin/search?tab=sources" className="font-bold text-accent-strong">Set up →</Link>
      </div>
      {ready && <KeywordTool initial={rows} impressions={impressions} volumes={volumes} />}
    </div>
  );
}

/* ───────── Organic ───────── */
async function Organic() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const [checks, ticks, posts] = await Promise.all([
    runOrganicChecks(origin),
    getSetting<Record<string, boolean>>("organic_checklist", {}),
    prisma.blogPost.findMany({ where: { published: true }, select: { createdAt: true } }).catch(() => []),
  ]);
  const since = (days: number) => posts.filter((p) => p.createdAt.getTime() > Date.now() - days * 86400000).length;
  const auto = new Map(checks.site.map((c) => [c.id, c.ok]));
  const groups = ORGANIC_MANUAL.map((g) => ({
    group: g.group,
    items: g.items.map((i) => ({ ...i, auto: i.id === "gsc-verified" && auto.get("gsc") ? true : undefined })),
  }));
  const cell = (checked: boolean, v: boolean) => (!checked ? <span className="text-xs text-muted">—</span> : v ? "✓" : <span className="font-bold text-berry">missing</span>);
  return (
    <div className="space-y-6">
      <Explain>
        Organic search means showing up on Google without paying. Google first needs to trust the site: the technical basics below,
        the same business details everywhere, and links from other local sites. Then it rewards steady, genuine articles in your
        voice. The top section checks this website automatically each time you open this page. The rest are ticks you make as each
        step is done.
      </Explain>

      <Card title="Checked automatically, just now">
        <ul className="space-y-2 text-sm text-ink">
          {checks.site.map((c) => (
            <li key={c.id}>
              <Status ok={c.ok}>{c.label}</Status>
              <p className="ml-1 mt-0.5 text-xs text-muted">{c.detail}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr><th className="py-2">Page</th><th>Title</th><th>Description</th><th>Canonical</th><th>Share tags</th><th>Structured data</th><th>Rich Results Test</th></tr>
            </thead>
            <tbody>
              {checks.pages.map((p) => (
                <tr key={p.path} className="border-t border-line align-top">
                  <td className="py-2 font-bold [overflow-wrap:anywhere]">
                    {p.path}
                    {!p.checked && <span className="block text-xs font-normal text-muted">Couldn&rsquo;t check{p.error ? `: ${p.error}` : p.status ? ` (answered ${p.status})` : ""}</span>}
                  </td>
                  {[p.title, p.description, p.canonical, p.openGraph].map((v, i) => (
                    <td key={i}>{cell(p.checked, v)}</td>
                  ))}
                  <td className="text-xs">
                    {p.checked ? (p.schemaTypes.length ? p.schemaTypes.join(", ") : "none") : "—"}
                    {p.missingSchema.length > 0 && <span className="block font-bold text-berry">missing {p.missingSchema.join(", ")}</span>}
                  </td>
                  <td>
                    <a className="text-xs font-bold text-accent-strong" target="_blank" rel="noreferrer" href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL + p.path)}`}>
                      Run test ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Checked against {checks.origin}. Google offers no automatic Rich Results Test, so use the links to run it (they test
          {" "}{SITE_URL}, which reflects this site only once the domain points here). Published landing pages: {checks.landing}.
        </p>
      </Card>

      <Card title="Publishing pace">
        <p className="text-sm text-ink">
          Blog articles published: <b>{since(30)}</b> in the last 30 days, <b>{since(90)}</b> in the last 90. Target: at least two a month,
          every month.
        </p>
      </Card>

      <Card title="Checklist">
        <TickList settingKey="organic_checklist" groups={groups} initial={ticks} />
      </Card>
    </div>
  );
}

/* ───────── Paid ───────── */
async function Paid({ ready }: { ready: boolean }) {
  const [entries, google, meta] = await Promise.all([
    ready ? prisma.spendEntry.findMany({ orderBy: { periodStart: "desc" }, take: 200 }).catch(() => []) : Promise.resolve([]),
    getSetting<{ monthlyCents?: number } | null>("budget_google", null),
    getSetting<{ monthlyCents?: number } | null>("budget_meta", null),
  ]);
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const d30 = new Date(Date.now() - 30 * 86400000);
  async function counts(since: Date): Promise<Counts> {
    const base: Counts = { contact_click: 0, contact_submit: 0, signup: 0, call_click: 0 };
    if (!ready) return base;
    const rows = await prisma.conversionEvent.groupBy({ by: ["kind"], where: { createdAt: { gte: since } }, _count: { _all: true } }).catch(() => []);
    for (const r of rows) if (r.kind in base) base[r.kind as keyof Counts] = r._count._all;
    return base;
  }
  const [month, last30] = await Promise.all([counts(monthStart), counts(d30)]);
  return (
    <div className="space-y-6">
      <Explain>
        Paid search means small Google ads that appear above the free results. Free results take months to build, so a small test
        of ads can show sooner which phrases bring real consultation requests. This page sets a monthly target, records what was
        spent, and shows what each consultation request cost. Requests are counted automatically when someone sends the contact
        form; clicks to the contact page and newsletter signups are counted too.
      </Explain>
      {!ready && <NotReady what="The spend log and conversion counts" />}

      <Card title="Ads, carefully">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink">
          <li>Before spending anything, make sure contact form sends are being counted here (Data sources tab), and connect them to Google Ads.</li>
          <li>Start one small Search campaign covering Naples and Bonita Springs, with two ad groups: personal chef service, and intimate dinner party catering.</li>
          <li>Send each ad group to its matching landing page (Growth → Landing pages), never the home page.</li>
          <li>Ad wording describes the food, the ingredients and the convenience. Never promise a health result; Google Ads rejects health claims.</li>
          <li>After 30 days, compare cost per request below. Keep the phrases that brought requests, write blog articles around them, and pause the rest.</li>
        </ol>
      </Card>

      {ready && (
        <PaidPanel
          initialEntries={entries.map((e) => ({ ...e, periodStart: e.periodStart.toISOString() }))}
          budgets={{ google: google?.monthlyCents ?? null, meta: meta?.monthlyCents ?? null }}
          month={month}
          last30={last30}
        />
      )}
    </div>
  );
}

/* ───────── Data sources ───────── */
async function Sources() {
  const gsc = isSearchConsoleConfigured();
  const kp = isKeywordPlannerConfigured();
  const adsTag = !!process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const ready = await growthReady();
  return (
    <div className="space-y-6">
      <Explain>
        These are the outside services that feed real numbers into this page. Each one needs to be connected once by Dennis. Until
        then the panels say “not connected yet” and never guess.
      </Explain>
      <Card title="Google Search Console: what people searched before they found the site">
        <Status ok={gsc ? true : null}>{gsc ? "Connected" : "Not connected yet"}</Status>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>Move floridahealthychef.com from Webflow to this site first; it still serves the old Webflow pages.</li>
          <li>Verify floridahealthychef.com in Search Console as a Domain property (a DNS record), and submit {SITE_URL}/sitemap.xml.</li>
          <li>In Google Cloud, create a service account with a JSON key and enable the Search Console API.</li>
          <li>In Search Console → Settings → Users and permissions, add the service account&rsquo;s email.</li>
          <li>In Vercel, set <code>GSC_SERVICE_ACCOUNT_JSON</code> and <code>GSC_SITE_URL</code> = <code>sc-domain:floridahealthychef.com</code>, then redeploy.</li>
        </ol>
      </Card>
      <Card title="Google Ads Keyword Planner: how many people search each phrase">
        <Status ok={kp ? true : null}>{kp ? "Connected" : `Not connected yet (missing ${missingKeywordPlannerEnv().join(", ")})`}</Status>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>Create a Google Ads account for Beautiful Foods by Beth (it can sit at $0).</li>
          <li>Apply for an API developer token in Google Ads → Tools → API Center. Google approves it, which can take days.</li>
          <li>Create an OAuth client in Google Cloud and a refresh token for the account that owns Google Ads.</li>
          <li>Set the GOOGLE_ADS_* variables in Vercel (listed in src/lib/keywordPlanner.ts), then redeploy.</li>
        </ol>
      </Card>
      <Card title="Conversion tracking: consultation requests and signups">
        <ul className="space-y-2 text-sm text-ink">
          <li>
            <Status ok={ready ? true : null}>
              {ready
                ? "Contact form sends, clicks to the contact page and newsletter signups are logged from every public page."
                : "The tracking code is on every public page, but nothing is stored until migration 20261109120000_growth_search is applied."}
            </Status>
          </li>
          <li>
            <Status ok={adsTag ? true : null}>
              {adsTag
                ? "Also reported to Google Ads."
                : "To report them to Google Ads too, set NEXT_PUBLIC_GOOGLE_ADS_ID and NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL (used for contact form sends) from the conversion action in Google Ads. NEXT_PUBLIC_GOOGLE_ADS_CALL_LABEL is only needed if a phone link is added to the site."}
            </Status>
          </li>
          <li className="text-xs text-muted">The site has no online booking calendar and shows no phone number, so the contact form send is the conversion that counts.</li>
        </ul>
      </Card>
      <Card title="Local listings">
        <p className="text-sm text-ink">
          There is no separate Local page here, because the site shows no street address: Beth cooks in clients&rsquo; homes, so a
          Google Business Profile would be a service-area business with no public address. The steps for setting one up are on the
          Competitors to-do list.
        </p>
      </Card>
    </div>
  );
}

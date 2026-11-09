import Anthropic from "@anthropic-ai/sdk";
import { essenceSystemBlock } from "@/lib/brandContext";
import { getTone } from "@/lib/blogSettings";
import { SERVICE_AREA } from "@/lib/seo";

/*
  Landing pages for keywords (Growth → Landing pages). SERVER ONLY.

  Claude writes a draft in Beth's voice, reading the Essence page and the
  saved tone like the caption generator does. Drafts are unpublished and
  noindex until someone presses Publish. Clients, testimonials, prices and
  health results are never invented: the prompt forbids it, and the page
  shows no testimonials at all (the ones on /about make health claims that
  Google Ads rejects).
*/

export interface Faq {
  q: string;
  a: string;
}

export interface LandingSections {
  /** Short line above the headline, e.g. "Personal chef · Naples" */
  eyebrow: string;
  /** One or two sentences: why Beth, why now */
  valueProp: string;
  /** Three things clients get (experience, never health outcomes) */
  benefits: { title: string; text: string }[];
  /** How working with Beth goes, three steps */
  steps: { title: string; text: string }[];
  ctaHeadline: string;
  ctaButton: string;
}

export interface LandingDraft {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  body: string;
  faq: Faq[];
  imageIdea: string;
  sections: LandingSections | null;
}

const TOWNS = new RegExp(`\\b(${[...SERVICE_AREA, "bonita", "fl", "florida", "swfl", "near me"].join("|")})\\b`, "gi");

export function landingSlug(keyword: string): string {
  return (
    keyword
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "page"
  );
}

const STOP = new Set(["and", "the", "for", "a", "an", "of", "to", "in", "with", "near", "me", "fl"]);

/** True when the headline carries the searcher's own words. */
export function headlineMatches(h1: string, keyword: string): boolean {
  const words = keyword.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
  const h = h1.toLowerCase();
  const hits = words.filter((w) => h.includes(w)).length;
  return words.length === 0 || hits / words.length >= 0.6;
}

function titleCase(s: string): string {
  return s.replace(/\b([a-z])([a-z]*)/g, (_, a: string, b: string) =>
    ["and", "or", "for", "of", "the", "a", "in", "vs"].includes(a + b) ? a + b : a.toUpperCase() + b,
  );
}

const ROLE =
  "You are Beth McCarthy, Southwest Florida's Certified Natural Chef (Beautiful Foods by Beth, floridahealthychef.com), writing a website landing page. " +
  `You cook in clients' own homes across ${SERVICE_AREA.join(", ")}. What the site offers: weekly personal chef service (a home consultation about goals, ` +
  "fresh organic and locally sourced ingredients, meals cooked in the client's kitchen; the site states it typically runs $350 to $550 with groceries billed separately), " +
  "intimate catering for up to 20 guests (paleo, gluten-free and more), and speaking and tasting events. The first step is always a complimentary 20-minute consultation, booked through the contact page.";

const HONESTY =
  "Honesty rules: never invent clients, stories, testimonials, reviews, awards, numbers of clients, prices other than the range above, dates or claims. " +
  "Never promise a health outcome (no weight loss, blood pressure, medication, cure or disease claims; Google Ads rejects them). Describe food, ingredients, convenience and how it feels to be cared for. " +
  "Warm, personal, first person. No diet-culture language.";

const PAIR = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["title", "text"],
    properties: { title: { type: "string" }, text: { type: "string" } },
  },
} as const;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "metaDescription", "eyebrow", "h1", "valueProp", "intro", "benefits", "steps", "body", "faq", "ctaHeadline", "ctaButton", "imageIdea"],
  properties: {
    title: { type: "string", description: "Page title under 60 characters, includes the service and the town when the keyword names one." },
    metaDescription: { type: "string", description: "Under 155 characters." },
    eyebrow: { type: "string", description: "3 to 6 words, e.g. 'Personal chef · Naples'." },
    h1: { type: "string", description: "Headline using the searcher's own words, under 70 characters." },
    valueProp: { type: "string", description: "1 to 2 sentences: what Beth offers this person and why it is different." },
    intro: { type: "string", description: "2 to 3 sentences that meet the reader where they are." },
    benefits: { ...PAIR, description: "Exactly 3: what clients get (experience and convenience, never health outcomes)." },
    steps: { ...PAIR, description: "Exactly 3: the free 20-minute consultation, the cooking, enjoying the meals or the event." },
    body: { type: "string", description: "Markdown, 350 to 550 words, 2 or 3 '## ' subheads, paragraphs and '- ' lists only. No headings above ##, no links." },
    faq: {
      type: "array",
      description: "4 to 6 questions people ask, each answered in 2 to 4 sentences an AI search tool could quote directly.",
      items: { type: "object", additionalProperties: false, required: ["q", "a"], properties: { q: { type: "string" }, a: { type: "string" } } },
    },
    ctaHeadline: { type: "string", description: "Short invitation to book the free consultation, under 60 characters." },
    ctaButton: { type: "string", description: "2 to 4 words, e.g. 'Book a free consultation'." },
    imageIdea: { type: "string", description: "One line describing the kind of photo from Beth's gallery that would suit the hero (a dish, fresh produce, a table set for guests)." },
  },
} as const;

type Raw = {
  title?: string; metaDescription?: string; eyebrow?: string; h1?: string; valueProp?: string; intro?: string;
  benefits?: unknown; steps?: unknown; body?: string; faq?: unknown; ctaHeadline?: string; ctaButton?: string; imageIdea?: string;
};

/** Write a draft. `full` keeps the complete-page sections; text-only drops them. */
export async function writeLanding(keyword: string, full: boolean): Promise<LandingDraft> {
  const [tone, brief] = await Promise.all([getTone(), essenceSystemBlock(null)]);
  const system = [ROLE, `Voice: ${tone.voice}`, `Audience: ${tone.audience}`, HONESTY, brief].join("\n\n");
  const response = await new Anthropic().messages.create({
    model: "claude-sonnet-5",
    max_tokens: 8000,
    system,
    messages: [
      {
        role: "user",
        content:
          `Write a landing page for people who search Google for: "${keyword}".\n` +
          `The headline (h1) must use the searcher's own words from "${keyword}" so they know at a glance they are in the right place.\n` +
          "Every call to action invites them to book the complimentary 20-minute consultation.",
      },
    ],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  });
  const block = response.content.find((b) => b.type === "text");
  const j = JSON.parse(block && "text" in block ? block.text : "{}") as Raw;
  if (!j.title || !j.body || !j.h1) throw new Error("The draft came back incomplete.");

  const pairs = (v: unknown) =>
    (Array.isArray(v) ? v : [])
      .filter((x): x is { title: string; text: string } => !!x && typeof x === "object" && "title" in x && "text" in x)
      .slice(0, 3)
      .map((x) => ({ title: String(x.title).slice(0, 80), text: String(x.text).slice(0, 300) }));
  const faq = (Array.isArray(j.faq) ? j.faq : [])
    .filter((f): f is Faq => !!f && typeof f === "object" && "q" in f && "a" in f)
    .slice(0, 8)
    .map((f) => ({ q: String(f.q), a: String(f.a) }));
  let h1 = String(j.h1).slice(0, 140);
  if (!headlineMatches(h1, keyword)) h1 = titleCase(keyword);

  return {
    slug: landingSlug(keyword),
    title: String(j.title).slice(0, 90),
    metaDescription: String(j.metaDescription ?? "").slice(0, 170),
    h1,
    intro: String(j.intro ?? "").slice(0, 600),
    body: String(j.body),
    faq,
    imageIdea: String(j.imageIdea ?? "").slice(0, 300),
    sections: full
      ? {
          eyebrow: String(j.eyebrow ?? "").slice(0, 80) || titleCase(keyword.replace(TOWNS, "").trim() || keyword),
          valueProp: String(j.valueProp ?? "").slice(0, 400),
          benefits: pairs(j.benefits),
          steps: pairs(j.steps),
          ctaHeadline: String(j.ctaHeadline ?? "").slice(0, 90) || "Start with a free 20-minute consultation",
          ctaButton: String(j.ctaButton ?? "").slice(0, 40) || "Book a free consultation",
        }
      : null,
  };
}

/* ───────── Markdown (the small subset the generator writes) ───────── */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");

export type MdBlock = { type: "h2" | "h3" | "p"; html: string } | { type: "ul"; items: string[] };

/** ## / ### headings, "- " lists, **bold**, *italic* and paragraphs. Everything is escaped first. */
export function markdownBlocks(md: string): MdBlock[] {
  const out: MdBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (para.length) out.push({ type: "p", html: inline(para.join(" ")) });
    if (list.length) out.push({ type: "ul", items: list.map(inline) });
    para = [];
    list = [];
  };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) { flush(); out.push({ type: h[1].length === 3 ? "h3" : "h2", html: inline(h[2]) }); continue; }
    const li = /^[-*]\s+(.*)$/.exec(line);
    if (li) { if (para.length) { out.push({ type: "p", html: inline(para.join(" ")) }); para = []; } list.push(li[1]); continue; }
    if (list.length) { out.push({ type: "ul", items: list.map(inline) }); list = []; }
    para.push(line);
  }
  flush();
  return out;
}

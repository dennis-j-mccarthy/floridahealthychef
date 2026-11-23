/*
  Keywords for Growth → Search. Client-safe (no Prisma).

  `priority` (0–100) is OUR judgement of how valuable a phrase is to Beth,
  not a search volume. Until Search Console or Keyword Planner is
  connected, the word cloud is sized by this score and says so.

  SEED_KEYWORDS is inserted by migration 20261109120000_growth_search
  (ON CONFLICT DO NOTHING). Seeds cover only what floridahealthychef.com
  itself sells, in the five towns it names: personal chef service, intimate
  catering (up to 20 guests; paleo and gluten-free stated on /services),
  speaking and tasting events, and the cost questions the blog already
  answers. Yoga, Awakening Joy and coaching link out to
  joyfulwellnesswithbeth.com, so they are not seeded here.
*/

export type KeywordKind = "problem" | "service" | "question";
export type KeywordStatus = "idea" | "target" | "dropped";

export interface KeywordRow {
  id: string;
  phrase: string;
  kind: KeywordKind;
  priority: number;
  status: KeywordStatus;
  source: string;
  note: string | null;
  landingSlug: string | null;
}

export const KIND_LABEL: Record<KeywordKind, string> = {
  problem: "Need people search for",
  service: "Service and town",
  question: "Question",
};

export function keywordId(phrase: string): string {
  return phrase
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type Seed = { phrase: string; kind: KeywordKind; priority: number; status?: KeywordStatus; note?: string };

export const SEED_KEYWORDS: Seed[] = [
  // Service and town: the five communities the site names
  { phrase: "personal chef Naples FL", kind: "service", priority: 90, status: "target" },
  { phrase: "personal chef Bonita Springs", kind: "service", priority: 84, status: "target" },
  { phrase: "personal chef Estero FL", kind: "service", priority: 74 },
  { phrase: "personal chef Fort Myers", kind: "service", priority: 80 },
  { phrase: "personal chef Punta Gorda", kind: "service", priority: 62 },
  { phrase: "healthy personal chef Southwest Florida", kind: "service", priority: 70 },
  { phrase: "intimate dinner party catering Naples", kind: "service", priority: 76, status: "target" },
  { phrase: "small event caterer Bonita Springs", kind: "service", priority: 64 },
  { phrase: "cooking demonstration speaker Naples", kind: "service", priority: 48, note: "Speaking & tasting events (/services#speaking)" },
  // Needs: what someone types before they have picked a chef
  { phrase: "weekly healthy meal prep chef Naples", kind: "problem", priority: 86, status: "target" },
  { phrase: "gluten-free personal chef Naples", kind: "problem", priority: 78 },
  { phrase: "paleo meal prep Naples FL", kind: "problem", priority: 66 },
  { phrase: "organic home-cooked meals Naples", kind: "problem", priority: 72 },
  { phrase: "too busy to cook healthy meals", kind: "problem", priority: 60 },
  { phrase: "private chef for a small dinner party Florida", kind: "problem", priority: 58 },
  // Questions (the blog already answers some of these)
  { phrase: "how much does a personal chef cost in Naples", kind: "question", priority: 80 },
  { phrase: "are personal chefs worth it", kind: "question", priority: 64 },
  { phrase: "what does a personal chef do", kind: "question", priority: 56 },
  { phrase: "personal chef vs meal delivery service", kind: "question", priority: 54 },
];

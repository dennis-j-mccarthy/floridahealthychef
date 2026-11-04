/*
  Content pillars — the brand messages every post carries one of.

  Pillars are ROWS (`Pillar` table), edited on /admin/essence. This module
  is the client-safe half: the type, Beth's code DEFAULTS (also the
  no-row fallback), the tag palette and the prompt helpers. It imports
  nothing server-side, so client components may use it.

  Reading pillars:
    server   src/lib/pillarStore.ts  → loadPillars() / findPillar()
    browser  GET /api/admin/pillars

  Rows only store the `id` (BlogPost.pillarId), so renaming a pillar
  never touches them.
*/

/** A pillar id is its slug (e.g. "fresh-local"); it's whatever the editor saved. */
export type PillarId = string;

export interface Pillar {
  id: PillarId;
  name: string;
  /** One line: the brand message this pillar carries. */
  message: string;
  /** Angle prompts — starting points for a title or a caption. */
  angles: string[];
  /** Default hashtags (Instagram mainly; the others get at most 2–3). */
  hashtags: string[];
  /** Target share of the content mix, in percent (null = unset). */
  target: number | null;
  sortOrder: number;
  active: boolean;
}

export const BRAND_ESSENCE = {
  line: "Beautiful food. Joyful health.",
  purpose:
    "Show Southwest Florida that eating well is a pleasure, not a punishment — chef-made, seasonal, genuinely delicious food that happens to be good for you.",
  promise:
    "Beth cooks it, teaches it and makes it beautiful — so healthy eating fits your real life instead of fighting it.",
  doList: [
    "Lead with flavor and beauty, then the health",
    "Seasonal and local — name the ingredient, the market, the season",
    "Warm, personal, first-person — Beth's voice, Beth's kitchen",
    "Practical: things a home cook can actually do tonight",
    "Celebrate clients and their tables",
  ],
  dontList: [
    "Diet-culture language (guilt, 'cheating', 'burning it off')",
    "Clinical nutrition jargon",
    "Fads and miracle-ingredient claims",
    "Preachiness about what people eat",
    "Stock-photo food that isn't Beth's",
  ],
} as const;

/** The no-row default pillars — Beth's four. */
export const DEFAULT_PILLARS: Pillar[] = [
  {
    id: "fresh-local",
    name: "Fresh & Local",
    message: "Southwest Florida's seasons on the plate — what's good right now and how to use it.",
    angles: [
      "One ingredient in season this month and three ways to use it",
      "A farmers-market find and what Beth made with it",
      "Florida produce people overlook, and why it deserves the plate",
      "How a dish changes through the seasons",
      "The local source behind a favorite ingredient",
    ],
    hashtags: ["#FloridaHealthyChef", "#EatLocal", "#SWFL", "#SeasonalEating"],
    target: 25,
    sortOrder: 0,
    active: true,
  },
  {
    id: "healthy-joy",
    name: "Healthy, Never Joyless",
    message: "Food that's good for you and genuinely delicious — health through pleasure, not restriction.",
    angles: [
      "A comfort-food favorite, rebuilt to love you back",
      "Why flavor-first is the only sustainable 'diet'",
      "One swap that changes the nutrition without changing the joy",
      "What 'healthy' actually means in Beth's kitchen",
      "The dish a skeptical client ended up asking for weekly",
    ],
    hashtags: ["#HealthyEating", "#FloridaHealthyChef", "#RealFood", "#JoyfulWellness"],
    target: 25,
    sortOrder: 1,
    active: true,
  },
  {
    id: "behind-the-apron",
    name: "Behind the Apron",
    message: "Beth's kitchen, process and story — the person behind the plates.",
    angles: [
      "How a weekly menu actually comes together",
      "A technique Beth uses constantly, taught simply",
      "A kitchen mistake and what it taught her",
      "Why she became a personal chef",
      "A day of cooking for clients, start to finish",
    ],
    hashtags: ["#PersonalChef", "#FloridaHealthyChef", "#BehindTheApron", "#ChefLife"],
    target: 25,
    sortOrder: 2,
    active: true,
  },
  {
    id: "client-table",
    name: "The Client's Table",
    message: "Real clients, real weeks of food — what having a personal chef actually changes.",
    angles: [
      "A week of menus for a real client (with their permission), and why each dish",
      "The problem a client came with and how the food solved it",
      "What the first consultation looks like",
      "A client's favorite dish and its story",
      "Who a personal chef is actually for — it's not who people think",
    ],
    hashtags: ["#FloridaHealthyChef", "#PersonalChef", "#MealPrep", "#SWFL"],
    target: 25,
    sortOrder: 3,
    active: true,
  },
];

/** Slug rule for a pillar id: lowercase letters, digits, dashes; 2–40 chars. */
export function slugifyPillarId(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isValidPillarId(v: unknown): v is string {
  return typeof v === "string" && /^[a-z0-9][a-z0-9-]{1,39}$/.test(v);
}

/** A pillar id off the wire: the string when it looks like one, else null. */
export function cleanPillarId(v: unknown): string | null {
  return isValidPillarId(v) ? v : null;
}

/** Find a pillar in a list — tolerates unknown / legacy ids. */
export function pillarIn(list: Pillar[], id: string | null | undefined): Pillar | null {
  if (!id) return null;
  return list.find((p) => p.id === id) ?? null;
}

/** Tailwind classes for the small pillar tag — one tint per slot, cycling. */
export const PILLAR_TAG_PALETTE: string[] = [
  "bg-green-light text-forest",
  "bg-mint text-sage",
  "bg-light-2 text-olive-dark",
  "bg-light text-primary-dark",
];

export function pillarTagCls(index: number): string {
  return PILLAR_TAG_PALETTE[((index % PILLAR_TAG_PALETTE.length) + PILLAR_TAG_PALETTE.length) % PILLAR_TAG_PALETTE.length];
}

/** The tag classes for an id within a list (its slot in display order). */
export function pillarTagClsFor(list: Pillar[], id: string | null | undefined): string {
  const i = list.findIndex((p) => p.id === id);
  return pillarTagCls(i < 0 ? 0 : i);
}

/* ───────── prompt helpers (server routes) ───────── */

/** One pillar as a labelled block — the message plus its angle prompts. */
export function pillarPrompt(p: Pillar): string {
  return [
    `PILLAR: ${p.name}`,
    `MESSAGE IT CARRIES: ${p.message}`,
    `ANGLES TO DRAW FROM:`,
    ...p.angles.map((a) => `- ${a}`),
    `DEFAULT HASHTAGS: ${p.hashtags.join(" ")}`,
  ].join("\n");
}

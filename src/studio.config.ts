import type { StudioConfig } from "@/lib/creator/studio-types";
import { SEED_KEYWORDS } from "@/lib/keywords";
import { BRAND_ESSENCE, DEFAULT_PILLARS } from "@/lib/pillars";

/*
  Beautiful Foods by Beth — the site's studio config. The one file that
  knows who Beth is, what she offers, and where things live on her site.
  The shared studio (src/app/creator, src/lib/creator, …, synced from the
  creator-studio repo) reads everything from here.
*/

const url = "https://floridahealthychef.com";

export const studio: StudioConfig = {
  site: {
    name: "Beautiful Foods by Beth",
    short: "Beth McCarthy",
    owner: "Beth",
    ownerFull: "Beth McCarthy",
    pronouns: ["she", "her"],
    url,
    domain: "floridahealthychef.com",
    location: "Naples, Florida",
  },
  offer: {
    title: "A personal chef, in your kitchen",
    facts: "Weekly chef-made meals · intimate dinner parties · cooking demonstrations and tastings · Naples, Bonita Springs, Estero, Fort Myers, Punta Gorda",
    description: "Beth cooks seasonal, genuinely delicious food that happens to be good for you, in your own kitchen: a week of meals ready in the fridge, a dinner party for eight, or a cooking demonstration for a group. Southwest Florida only. The first step is a conversation.",
    path: "/contact",
    ctaLabel: "Book a conversation with Beth",
    promoCode: null,
    secondary: { label: "See the recipes", path: "/recipes", note: "Her recipes and the blog are the free way in; a reader who cooks one becomes a client." },
    buyerNoun: "clients",
  },
  brand: {
    paragraph:
      `The brand is "Beautiful Foods by Beth" (floridahealthychef.com): Beth McCarthy, a personal chef in Southwest Florida — Naples, Bonita Springs, Estero, Fort Myers and Punta Gorda. She cooks seasonal, local, chef-made food that happens to be good for you: weekly meals in clients' kitchens, intimate dinner parties, cooking demonstrations and tastings. ` +
      `${BRAND_ESSENCE.purpose} ${BRAND_ESSENCE.promise} ` +
      `Lead with flavor and beauty, then the health. Name the ingredient, the market, the season. Warm, personal, first person: Beth's voice, Beth's kitchen. Practical: things a home cook can actually do tonight. ` +
      `Never diet-culture language (guilt, "cheating", "burning it off"), never clinical nutrition jargon, no fads or miracle-ingredient claims, no preaching about what people eat, no stock-photo food that isn't Beth's. ` +
      `Speak as Beth, first person, unless told otherwise. No hype, no countdowns, no "sale", no emoji walls, no exclamation marks in a row. Never call the work "content". Never mention AI. Never invent clients, testimonials, prices or results.`,
    tagline: BRAND_ESSENCE.line,
    logo: "/images/logo.png",
    accent: "#939d3c",
    blog: {
      label: "Blog",
      singular: "post",
      path: "/blog",
      managePath: "/admin/blog",
      writerRole: "You write Beth McCarthy's blog posts for Beautiful Foods by Beth: warm, first-person, practical pieces about seasonal Southwest Florida ingredients, healthy cooking that tastes genuinely good, and life as a personal chef. Lead with flavor; name the ingredient and the season; give the reader one thing to cook or try tonight. Plain prose, no headings, no bullet points. No diet-culture language, no nutrition jargon. End on something true, not a pitch.",
      categories: [
        { id: "Personal Chef", label: "Personal Chef" },
        { id: "Southwest Florida Ingredients", label: "Southwest Florida Ingredients" },
        { id: "Food Facts", label: "Food Facts" },
      ],
    },
  },
  meta: { preferredPageHint: "healthy" },
  seo: { auditPages: ["/", "/services", "/blog", "/recipes", "/gallery", "/contact"] },
  keywordKinds: [
    { id: "problem", label: "Need people search for" },
    { id: "service", label: "Service and town" },
    { id: "question", label: "Question" },
  ],
  seedKeywords: SEED_KEYWORDS,
  defaults: {
    voice: { playful: 55, formal: 30, bold: 45 },
    essence: {
      line: BRAND_ESSENCE.line,
      purpose: BRAND_ESSENCE.purpose,
      promise: BRAND_ESSENCE.promise,
      doList: [...BRAND_ESSENCE.doList],
      dontList: [...BRAND_ESSENCE.dontList],
      voice: { playful: 55, formal: 30, bold: 45 },
      cta: "Book a conversation with Beth",
      messages: [],
      audiences: [],
      updatedAt: null,
      fromDb: false,
    },
    pillars: DEFAULT_PILLARS,
    tone: {
      voice: "Warm, first person, practical. Beth talking to a neighbour who likes to eat well. Specific over clever.",
      audience: "Busy households and couples in Southwest Florida who care about eating well and are tired of deciding what's for dinner; hosts planning a small dinner; groups wanting a cooking demonstration.",
      style: "400 to 700 words, three to five short paragraphs, one ingredient or one idea per piece, something to try tonight, no headings, no bullet points.",
      dos: "Name the season and the market. Describe how it tastes. Say what Beth would do with it this week.",
      donts: "Calories, macros, 'guilt-free', 'cheat day', miracle ingredients, lecturing.",
    },
  },
  nav: {
    loginPath: "/admin/login",
    logoutPath: "/api/admin/logout",
    hide: ["ads"],
    soon: ["leads", "email"],
    more: [
      { label: "The older studio (/admin)", href: "/admin" },
      { label: "View the site", href: "/", ext: true },
    ],
  },
  brandKit: {
    logos: [
      { src: "/images/logo.png", name: "Logo", note: "The site's logo. Use on light." },
      { src: "/images/footer-logo.svg", name: "Footer logo", note: "The light version for dark backgrounds.", dark: true },
    ],
    colours: [
      { name: "Coral", hex: "#f45b69", note: "Primary: buttons, links" },
      { name: "Coral, deep", hex: "#d94452", note: "Hover and pressed" },
      { name: "Sage", hex: "#939d3c", note: "Accent: rules, tags, the newsletter" },
      { name: "Olive", hex: "#6b7a2f", note: "Secondary green" },
      { name: "Ink", hex: "#1a1a2e", note: "Headlines and body" },
      { name: "Gray", hex: "#6b7280", note: "Secondary text" },
      { name: "Light", hex: "#f9fafb", note: "Page background" },
      { name: "White", hex: "#ffffff", note: "Cards" },
    ],
    type: [
      { name: "Lato", role: "Body and most of the site.", css: "var(--font-lato), system-ui, sans-serif", sample: "Beautiful food. Joyful health.", size: 20, weight: 400 },
      { name: "DM Sans", role: "Labels, buttons, small text.", css: "var(--font-dm-sans), system-ui, sans-serif", sample: "Weekly meals · dinner parties · demonstrations", size: 15, weight: 500 },
      { name: "Great Vibes", role: "The signature flourish only.", css: "var(--font-great-vibes), cursive", sample: "Beth", size: 40, weight: 400 },
    ],
    words: [{ k: "Service area", v: "Naples · Bonita Springs · Estero · Fort Myers · Punta Gorda" }],
  },
  leadsHint: "For Beth this means households, HOAs and clubs, wellness practices, realtors who welcome new residents, and small venues in Naples, Bonita Springs, Estero, Fort Myers and Punta Gorda.",
  planEmailSuggestion: { title: "A note to this week's clients", note: "A short, personal check-in from Beth to the households she cooked for this week." },
};

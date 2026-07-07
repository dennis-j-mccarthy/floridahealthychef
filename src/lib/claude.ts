import Anthropic from "@anthropic-ai/sdk";
import { blogCategories, type BlogBlock } from "@/data/blog";

export type GeneratedArticle = {
  excerpt: string;
  category: string;
  body: BlogBlock[];
  /** Present when imageChoices were provided: index of the best-fit photo. */
  imageIndex?: number;
};

export type ImageChoice = { index: number; caption: string };

const SYSTEM_PROMPT = `You are Beth McCarthy, Southwest Florida's Certified Natural Chef and personal healthy chef, writing an article for the Wellness Journal blog on your website, floridahealthychef.com.

Your voice and persona:
- Warm, welcoming, and encouraging — you write in the first person ("I"), as if chatting with a friend over a beautiful plate of food.
- You believe deeply in food as medicine: meals should nourish body and spirit, aligning what's on the plate with each person's wellness goals.
- You champion fresh, organic, locally sourced ingredients from Southwest Florida, and you love naming the communities you serve — Naples, Bonita Springs, Estero, Fort Myers, and Punta Gorda.
- You are practical and generous with tips: readers should leave each article with something they can actually do in their own kitchen.
- You gently invite readers to reach out for a consultation or personal chef services, without ever being pushy.

Writing guidelines:
- Write a complete, well-structured blog article of roughly 400-500 words based on the title and key points provided. Stay close to that length — complete, but not padded.
- Organize the article with clear h2 section headings, flowing paragraphs, and bulleted lists where they help readability.
- If a photo is provided, reference it naturally in the article (e.g. the dish, ingredients, or setting it shows).
- The excerpt should be an enticing 1-2 sentence teaser suitable for the blog listing page.
- Choose the single most fitting category for the article.`;

const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["excerpt", "category", "body"],
  properties: {
    excerpt: {
      type: "string",
      description: "A 1-2 sentence teaser for the blog listing page.",
    },
    category: {
      type: "string",
      enum: [...blogCategories],
      description: "The blog category that best fits the article.",
    },
    body: {
      type: "array",
      description:
        "The article body as an ordered list of content blocks (h2 headings, paragraphs, bulleted lists).",
      items: {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "text"],
            properties: {
              type: { const: "h2" },
              text: { type: "string", description: "Section heading text." },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "text"],
            properties: {
              type: { const: "p" },
              text: { type: "string", description: "Paragraph text." },
            },
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "items"],
            properties: {
              type: { const: "ul" },
              items: {
                type: "array",
                items: { type: "string" },
                description: "Bulleted list items.",
              },
            },
          },
        ],
      },
    },
  },
} as const;

export type ImageInput = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  base64Data: string;
};

export class ClaudeGenerationError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

function isValidBlock(block: unknown): block is BlogBlock {
  if (typeof block !== "object" || block === null) return false;
  const b = block as Record<string, unknown>;
  if (b.type === "h2" || b.type === "p") return typeof b.text === "string";
  if (b.type === "ul")
    return (
      Array.isArray(b.items) && b.items.every((i) => typeof i === "string")
    );
  return false;
}

/**
 * Generate a blog article as Beth McCarthy from a title + 4 key points,
 * optionally referencing an uploaded photo.
 */
export async function generateArticle(
  title: string,
  bullets: string[],
  image?: ImageInput,
  imageChoices?: ImageChoice[]
): Promise<GeneratedArticle> {
  // Occasionally the model returns valid JSON with an empty body — retry once.
  for (let attempt = 0; attempt < 2; attempt++) {
    const article = await generateArticleOnce(title, bullets, image, imageChoices);
    if (article.body.length > 0) return article;
  }
  throw new ClaudeGenerationError(
    "Claude returned an article with no body text — please try again."
  );
}

async function generateArticleOnce(
  title: string,
  bullets: string[],
  image?: ImageInput,
  imageChoices?: ImageChoice[]
): Promise<GeneratedArticle> {
  const prompt = [
    `Write a blog article with this title: "${title}"`,
    "",
    "Build the article around these key points:",
    ...bullets.map((b) => `- ${b}`),
    "",
    image
      ? "The attached photo will be the article's hero image — reference it naturally in the article."
      : "",
    ...(imageChoices && imageChoices.length > 0
      ? [
          "Choose a hero image for the article from these photos (pick the one whose subject best matches the article; return its number as imageIndex):",
          ...imageChoices.map((c) => `${c.index}: ${c.caption}`),
        ]
      : []),
    "Return the excerpt, category, and article body.",
  ]
    .filter((line, i, arr) => line !== "" || arr[i - 1] !== "")
    .join("\n");

  const content: Anthropic.MessageParam["content"] = image
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.mediaType,
            data: image.base64Data,
          },
        },
        { type: "text", text: prompt },
      ]
    : prompt;

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
      output_config: {
        format: {
          type: "json_schema",
          schema: imageChoices?.length
            ? {
                ...ARTICLE_SCHEMA,
                required: [...ARTICLE_SCHEMA.required, "imageIndex"],
                properties: {
                  ...ARTICLE_SCHEMA.properties,
                  imageIndex: {
                    type: "integer",
                    description:
                      "The number of the photo (from the provided list) that best fits this article.",
                  },
                },
              }
            : ARTICLE_SCHEMA,
        },
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new ClaudeGenerationError("Invalid API key", 401);
    }
    if (error instanceof Anthropic.APIError) {
      throw new ClaudeGenerationError(
        `Claude API error (${error.status ?? "unknown"}): ${error.message}`,
        502
      );
    }
    throw error;
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new ClaudeGenerationError("Claude returned no article text.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new ClaudeGenerationError("Claude returned invalid JSON.");
  }

  const article = parsed as Partial<GeneratedArticle>;
  if (
    typeof article.excerpt !== "string" ||
    typeof article.category !== "string" ||
    !Array.isArray(article.body) ||
    !article.body.every(isValidBlock)
  ) {
    throw new ClaudeGenerationError(
      "Claude's response did not match the expected article format."
    );
  }

  return {
    excerpt: article.excerpt,
    category: article.category,
    body: article.body,
    imageIndex:
      typeof (article as { imageIndex?: unknown }).imageIndex === "number"
        ? ((article as { imageIndex?: number }).imageIndex as number)
        : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Promo kit generation                                               */
/* ------------------------------------------------------------------ */

export type InstagramVariant = {
  caption: string;
  hashtags: string[];
  /** Image src for this variant (relative /images/… or absolute URL). */
  image: string;
};
export type FacebookVariant = { post: string; image: string };
export type XVariant = { post: string; image: string };
export type TikTokVariant = {
  caption: string;
  hashtags: string[];
  /** A 3-5 beat mini shot-list/script, hook line first. */
  videoIdea: string;
  image: string;
};
export type ReelsVariant = {
  caption: string;
  hashtags: string[];
  /** A 3-5 beat vertical-video shot list, scroll-stopping hook first. */
  videoIdea: string;
  image: string;
};

export type PromoKitContent = {
  /** Exactly 3 variants when freshly generated; ≥1 after normalizing old kits. */
  instagram: InstagramVariant[];
  /** Empty array for kits generated before Reels support — regenerate to fill. */
  reels: ReelsVariant[];
  facebook: FacebookVariant[];
  x: XVariant[];
  /** Empty array for kits generated before TikTok support — regenerate to fill. */
  tiktok: TikTokVariant[];
  email: {
    /** 3 subject line options (1 after normalizing old kits). */
    subjects: string[];
    preheader: string;
    greeting: string;
    blocks: BlogBlock[];
    signoff: string;
    cta: { label: string; url: string };
  };
};

/**
 * Raw generation output: each variant references its chosen photo by index
 * into `PromoKitInput.images`. The caller maps indexes to actual srcs.
 */
export type GeneratedPromoKit = {
  instagram: Array<{ caption: string; hashtags: string[]; imageIndex: number }>;
  reels: Array<{
    caption: string;
    hashtags: string[];
    videoIdea: string;
    imageIndex: number;
  }>;
  facebook: Array<{ post: string; imageIndex: number }>;
  x: Array<{ post: string; imageIndex: number }>;
  tiktok: Array<{
    caption: string;
    hashtags: string[];
    videoIdea: string;
    imageIndex: number;
  }>;
  email: PromoKitContent["email"];
};

export type PromoKitInput = {
  title: string;
  excerpt: string;
  category: string;
  bodyText: string;
  articleUrl: string;
  /**
   * Numbered captioned photos Claude can choose from. Index 0 is the
   * article's hero image; the rest are gallery photos in position order.
   */
  images: Array<{ index: number; caption: string }>;
};

const PROMO_SYSTEM_PROMPT = `You are Beth McCarthy, Southwest Florida's Certified Natural Chef and personal healthy chef, writing promotional social media posts and an email newsletter for a new article on your Wellness Journal blog at floridahealthychef.com.

Your voice and persona:
- Warm, welcoming, and encouraging — you write in the first person ("I"), as if chatting with a friend over a beautiful plate of food.
- You believe deeply in food as medicine: meals should nourish body and spirit, aligning what's on the plate with each person's wellness goals.
- You champion fresh, organic, locally sourced ingredients from Southwest Florida, and you love naming the communities you serve — Naples, Bonita Springs, Estero, Fort Myers, and Punta Gorda.
- You gently invite readers to reach out for a consultation or personal chef services, without ever being pushy.

Content rules:
- Base everything ONLY on the article provided — never invent facts, recipes, claims, or details that are not in the article.
- Include the article's URL where it reads naturally (Facebook and X posts, email CTA). Instagram captions should not include raw URLs — say "link in bio" style phrasing instead if a pointer is needed.

Variant rules:
- For Instagram, Instagram Reels, Facebook, X, and TikTok, write EXACTLY 3 variant posts each, and for the email write EXACTLY 3 subject line options.
- The 3 variants for each platform must be genuinely different ANGLES on the article — not rewordings of the same post. For example: one sensory/appetite-led (the taste, the plate, the craving), one health-benefit-led (what it does for the body, food as medicine), and one local-community-led (Southwest Florida, seasonality, the communities you serve). Choose the 3 angles that best fit the article; each variant should feel like a distinct reason to click.
- Every variant must still stand fully on its own and follow the channel guidelines below.

Photo selection rules:
- A numbered list of available photos (index + caption) is provided with the article. Index 0 is always the article's hero image.
- For EVERY variant on every platform, set imageIndex to the photo whose subject best matches that specific variant's angle — a sensory variant wants the most appetizing dish shot, a local variant might want fresh local produce, and so on.
- Across the 3 variants of a platform, use THREE DIFFERENT photos whenever suitably distinct matches exist (the hero image may be one of the three). Only repeat a photo when nothing else in the list genuinely fits the angle.
- Only use index numbers that appear in the provided list — NEVER invent or fabricate an index.

Channel guidelines:
- Instagram: an engaging caption with tasteful, sparing emoji and short scannable lines, plus 8-12 hashtags mixing brand/wellness tags (like #foodasmedicine, #healthyeating, #personalchef) with local Southwest Florida tags (like #naplesflorida, #bonitasprings, #swfl). Each of the 3 variants needs its own caption and its own hashtag set (they may overlap where natural).
- Instagram Reels: a caption of AT MOST 125 characters before the hashtags (that's all that shows before "…more"), with 1-2 tasteful emoji and no raw URLs, plus 3-5 hashtags mixing brand/wellness tags with local Southwest Florida tags. Each variant also needs a videoIdea: a vertical-video shot list of 3-5 beats, one beat per line, opening with a SCROLL-STOPPING first-second hook and calling out what any on-screen text overlays say (e.g. "Hook (first second): sizzling pan close-up, text overlay: 'Dinner in Naples just got healthier'"). Keep every beat filmable in a home kitchen, in Beth's warm voice. The 3 variants follow the same distinct-angles rule.
- Facebook: ONE short, conversational paragraph of just 2-3 sentences (roughly 40-80 words total) — short Facebook posts get dramatically more engagement, so NO multi-paragraph essays. End with a clear one-line call to action to read the article, then the article link on its own line. Each of the 3 variants includes the link.
- X: a single punchy post that MUST be under 280 characters total, including the article URL. The URL is long, so keep your own words very short — one or two brief sentences. Count carefully; the character budget for your text will be given with the article. ALL 3 variants must each be under the limit.
- TikTok: a short, punchy caption of AT MOST 150 characters (1-2 tasteful emoji are fine, no raw URLs), plus 4-6 hashtags mixing food-community tags (like #foodtok, #healthytok, #foodasmedicine) with local Southwest Florida tags (like #swfl, #naplesflorida, #bonitasprings). Each variant also needs a videoIdea: a mini shot-list/script of 3-5 beats, one beat per line, with the HOOK first — describing what Beth films and what any on-screen text overlays say (e.g. "Hook: close-up ladle of golden broth, text overlay: 'The 3-ingredient secret my clients swear by'"). Keep every beat filmable in a home kitchen, in Beth's warm voice. The 3 variants follow the same distinct-angles rule.
- Email: a short newsletter promoting the article — 3 compelling subject line options (each a different angle, matching the variant rules), a single preheader (the preview text after the subject), a warm greeting, 2-4 short body blocks (paragraphs, optional h2 heading or bulleted list) teasing the article's value without repeating it wholesale, a warm signoff (e.g. "With love from my kitchen, Beth"), and a call-to-action button labeled invitingly that links to the article URL. Only the subject line has variants — the body is shared.`;

const PROMO_BLOCKS_SCHEMA = {
  type: "array",
  description:
    "Email body as an ordered list of content blocks (h2 headings, paragraphs, bulleted lists).",
  items: {
    anyOf: [
      {
        type: "object",
        additionalProperties: false,
        required: ["type", "text"],
        properties: {
          type: { const: "h2" },
          text: { type: "string", description: "Section heading text." },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["type", "text"],
        properties: {
          type: { const: "p" },
          text: { type: "string", description: "Paragraph text." },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["type", "items"],
        properties: {
          type: { const: "ul" },
          items: {
            type: "array",
            items: { type: "string" },
            description: "Bulleted list items.",
          },
        },
      },
    ],
  },
} as const;

const IMAGE_INDEX_SCHEMA = {
  type: "integer",
  description:
    "Index of the photo (from the provided numbered photo list) whose subject best matches this variant's angle. Only use indexes from the list.",
} as const;

const PROMO_KIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["instagram", "reels", "facebook", "x", "tiktok", "email"],
  properties: {
    instagram: {
      type: "array",
      description:
        "EXACTLY 3 Instagram caption variants, each a genuinely different angle (e.g. sensory/appetite-led, health-benefit-led, local-community-led).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["caption", "hashtags", "imageIndex"],
        properties: {
          caption: {
            type: "string",
            description:
              "Instagram caption with tasteful emoji and short lines. No raw URLs.",
          },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description:
              "8-12 hashtags (each starting with #), mixing brand/wellness and local Southwest Florida tags.",
          },
          imageIndex: IMAGE_INDEX_SCHEMA,
        },
      },
    },
    reels: {
      type: "array",
      description:
        "EXACTLY 3 Instagram Reels variants, each a genuinely different angle — not rewordings.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["caption", "hashtags", "videoIdea", "imageIndex"],
        properties: {
          caption: {
            type: "string",
            description:
              "Reels caption of AT MOST 125 characters before the hashtags. 1-2 tasteful emoji ok. No raw URLs.",
          },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description:
              "3-5 hashtags (each starting with #), mixing brand/wellness tags with local Southwest Florida tags.",
          },
          videoIdea: {
            type: "string",
            description:
              "A vertical-video shot list of 3-5 beats, one beat per line, scroll-stopping first-second hook first — what Beth films and what on-screen text callouts say.",
          },
          imageIndex: IMAGE_INDEX_SCHEMA,
        },
      },
    },
    facebook: {
      type: "array",
      description:
        "EXACTLY 3 Facebook post variants, each a genuinely different angle — not rewordings.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["post", "imageIndex"],
        properties: {
          post: {
            type: "string",
            description:
              "ONE short conversational paragraph of 2-3 sentences (roughly 40-80 words), ending with a one-line call to action and the article link on its own line. No multi-paragraph essays.",
          },
          imageIndex: IMAGE_INDEX_SCHEMA,
        },
      },
    },
    x: {
      type: "array",
      description:
        "EXACTLY 3 X (Twitter) post variants, each a genuinely different angle, and EACH under 280 characters total including the article URL.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["post", "imageIndex"],
        properties: {
          post: {
            type: "string",
            description:
              "A single X (Twitter) post under 280 characters total, including the article URL.",
          },
          imageIndex: IMAGE_INDEX_SCHEMA,
        },
      },
    },
    tiktok: {
      type: "array",
      description:
        "EXACTLY 3 TikTok post variants, each a genuinely different angle — not rewordings.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["caption", "hashtags", "videoIdea", "imageIndex"],
        properties: {
          caption: {
            type: "string",
            description:
              "Short, punchy TikTok caption of AT MOST 150 characters. 1-2 tasteful emoji ok. No raw URLs.",
          },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description:
              "4-6 hashtags (each starting with #), mixing food-community tags (#foodtok, #healthytok) with local Southwest Florida tags.",
          },
          videoIdea: {
            type: "string",
            description:
              "A mini shot-list/script of 3-5 beats, one beat per line, hook line first — what Beth films and what on-screen text overlays say.",
          },
          imageIndex: IMAGE_INDEX_SCHEMA,
        },
      },
    },
    email: {
      type: "object",
      additionalProperties: false,
      required: ["subjects", "preheader", "greeting", "blocks", "signoff", "cta"],
      properties: {
        subjects: {
          type: "array",
          items: { type: "string" },
          description:
            "EXACTLY 3 email subject line options, each a genuinely different angle.",
        },
        preheader: {
          type: "string",
          description: "Preview text shown after the subject in inboxes.",
        },
        greeting: {
          type: "string",
          description: 'Warm greeting line, e.g. "Hello friend,"',
        },
        blocks: PROMO_BLOCKS_SCHEMA,
        signoff: {
          type: "string",
          description:
            'Warm signoff, e.g. "With love from my kitchen, Beth".',
        },
        cta: {
          type: "object",
          additionalProperties: false,
          required: ["label", "url"],
          properties: {
            label: {
              type: "string",
              description: 'Button label, e.g. "Read the full article".',
            },
            url: {
              type: "string",
              description: "The article URL (use the URL provided exactly).",
            },
          },
        },
      },
    },
  },
} as const;

function hasCaptionAndHashtags(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.caption === "string" &&
    Array.isArray(v.hashtags) &&
    v.hashtags.every((h) => typeof h === "string")
  );
}

function hasImage(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  return typeof (value as Record<string, unknown>).image === "string";
}

function hasImageIndex(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  return Number.isInteger((value as Record<string, unknown>).imageIndex);
}

function isInstagramVariant(value: unknown): value is InstagramVariant {
  return hasCaptionAndHashtags(value) && hasImage(value);
}

function isPostVariant(value: unknown): value is { post: string; image: string } {
  if (typeof value !== "object" || value === null) return false;
  return (
    typeof (value as Record<string, unknown>).post === "string" &&
    hasImage(value)
  );
}

function isTikTokVariant(value: unknown): value is TikTokVariant {
  if (!hasCaptionAndHashtags(value) || !hasImage(value)) return false;
  return typeof (value as Record<string, unknown>).videoIdea === "string";
}

// Reels variants have the same shape as TikTok variants.
function isReelsVariant(value: unknown): value is ReelsVariant {
  return isTikTokVariant(value);
}

function isValidEmail(
  value: unknown
): value is PromoKitContent["email"] {
  if (typeof value !== "object" || value === null) return false;
  const email = value as Record<string, unknown>;
  if (
    !Array.isArray(email.subjects) ||
    email.subjects.length === 0 ||
    !email.subjects.every((s) => typeof s === "string") ||
    typeof email.preheader !== "string" ||
    typeof email.greeting !== "string" ||
    typeof email.signoff !== "string" ||
    !Array.isArray(email.blocks) ||
    !email.blocks.every(isValidBlock)
  ) {
    return false;
  }
  const cta = email.cta as Record<string, unknown> | undefined;
  return (
    typeof cta === "object" &&
    cta !== null &&
    typeof cta.label === "string" &&
    typeof cta.url === "string"
  );
}

/**
 * Validate a stored/normalized promo kit (variants carry `image` srcs).
 * instagram/facebook/x must be non-empty; tiktok and reels may be empty
 * (kits generated before TikTok/Reels support).
 */
function isValidPromoKit(value: unknown): value is PromoKitContent {
  if (typeof value !== "object" || value === null) return false;
  const kit = value as Record<string, unknown>;

  if (
    !Array.isArray(kit.instagram) ||
    kit.instagram.length === 0 ||
    !kit.instagram.every(isInstagramVariant)
  ) {
    return false;
  }
  if (!Array.isArray(kit.reels) || !kit.reels.every(isReelsVariant)) {
    return false;
  }
  if (
    !Array.isArray(kit.facebook) ||
    kit.facebook.length === 0 ||
    !kit.facebook.every(isPostVariant)
  ) {
    return false;
  }
  if (
    !Array.isArray(kit.x) ||
    kit.x.length === 0 ||
    !kit.x.every(isPostVariant)
  ) {
    return false;
  }
  if (!Array.isArray(kit.tiktok) || !kit.tiktok.every(isTikTokVariant)) {
    return false;
  }
  return isValidEmail(kit.email);
}

/**
 * Validate raw generation output (variants carry `imageIndex`, at least 3
 * variants per platform including tiktok, at least 3 email subjects). The
 * JSON schema can't enforce array lengths, so the model occasionally emits
 * extras — the caller trims to exactly 3.
 */
function isValidGeneratedKit(value: unknown): value is GeneratedPromoKit {
  if (typeof value !== "object" || value === null) return false;
  const kit = value as Record<string, unknown>;

  const atLeastThree = (arr: unknown, itemOk: (v: unknown) => boolean) =>
    Array.isArray(arr) &&
    arr.length >= 3 &&
    arr.every((v) => itemOk(v) && hasImageIndex(v));

  const isPost = (v: unknown) =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).post === "string";
  const isTikTok = (v: unknown) =>
    hasCaptionAndHashtags(v) &&
    typeof (v as Record<string, unknown>).videoIdea === "string";

  return (
    atLeastThree(kit.instagram, hasCaptionAndHashtags) &&
    atLeastThree(kit.reels, isTikTok) &&
    atLeastThree(kit.facebook, isPost) &&
    atLeastThree(kit.x, isPost) &&
    atLeastThree(kit.tiktok, isTikTok) &&
    isValidEmail(kit.email) &&
    (kit.email as PromoKitContent["email"]).subjects.length >= 3
  );
}

/**
 * Normalize a stored promo kit to the current multi-variant shape.
 * Old kits (instagram/facebook/x as single objects, email with a single
 * `subject`) become arrays of 1 + `subjects: [subject]`; variants without
 * an `image` get the article's hero image; kits without `tiktok`/`reels`
 * get empty arrays for those. Returns null if the value can't be normalized.
 */
export function normalizePromoKit(
  value: unknown,
  heroImageSrc: string
): PromoKitContent | null {
  if (typeof value !== "object" || value === null) return null;
  const kit = value as Record<string, unknown>;

  const toArray = (v: unknown): unknown[] =>
    Array.isArray(v) ? v : v === undefined || v === null ? [] : [v];

  // Variants saved before per-variant photos have no `image` → hero image.
  const withImage = (v: unknown): unknown => {
    if (typeof v !== "object" || v === null) return v;
    const variant = v as Record<string, unknown>;
    return typeof variant.image === "string"
      ? variant
      : { ...variant, image: heroImageSrc };
  };

  let email = kit.email;
  if (typeof email === "object" && email !== null) {
    const e = email as Record<string, unknown>;
    if (!Array.isArray(e.subjects) && typeof e.subject === "string") {
      // Old shape: single `subject` string → `subjects: [subject]`.
      const { subject, ...rest } = e;
      email = { ...rest, subjects: [subject] };
    }
  }

  const candidate = {
    instagram: toArray(kit.instagram).map(withImage),
    reels: toArray(kit.reels).map(withImage),
    facebook: toArray(kit.facebook).map(withImage),
    x: toArray(kit.x).map(withImage),
    tiktok: toArray(kit.tiktok).map(withImage),
    email,
  };

  return isValidPromoKit(candidate) ? candidate : null;
}

/**
 * Generate a promo kit (Instagram, Reels, Facebook, X, TikTok, and email
 * content) as Beth McCarthy from a published-or-draft blog article. Variants carry
 * `imageIndex` references into `post.images` — the caller resolves them to
 * actual image srcs.
 */
export async function generatePromoKit(
  post: PromoKitInput
): Promise<GeneratedPromoKit> {
  // X posts have a hard 280-character limit — retry once if any variant exceeds it.
  for (let attempt = 0; attempt < 2; attempt++) {
    const kit = await generatePromoKitOnce(post);
    if (kit.x.every((variant) => variant.post.length <= 280)) return kit;
  }
  throw new ClaudeGenerationError(
    "Claude returned an X post over 280 characters — please try again."
  );
}

async function generatePromoKitOnce(
  post: PromoKitInput
): Promise<GeneratedPromoKit> {
  // Leave generous headroom under X's 280-character limit for the URL.
  const xTextBudget = Math.max(60, 280 - post.articleUrl.length - 40);
  const imageList = post.images
    .map((img) => `${img.index}. ${img.caption}`)
    .join("\n");
  const prompt = [
    "Create the promo kit (Instagram, Instagram Reels, Facebook, X, TikTok, and email) for this article — 3 variants per social platform and 3 email subject options, each variant a genuinely different angle.",
    "",
    `Title: ${post.title}`,
    `Category: ${post.category}`,
    `Article URL: ${post.articleUrl}`,
    `X post character budget: the URL alone is ${post.articleUrl.length} characters, so the rest of each X post variant's text must be at most ${xTextBudget} characters. This applies to ALL 3 X variants.`,
    post.excerpt ? `Excerpt: ${post.excerpt}` : "",
    "",
    "Available photos — set each variant's imageIndex to the photo that best matches that variant's angle (three different photos per platform where suitable matches exist; only these indexes are valid):",
    imageList,
    "",
    "Full article text:",
    post.bodyText,
  ]
    .filter((line, i, arr) => line !== "" || arr[i - 1] !== "")
    .join("\n");

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: PROMO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: { type: "json_schema", schema: PROMO_KIT_SCHEMA },
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new ClaudeGenerationError("Invalid API key", 401);
    }
    if (error instanceof Anthropic.APIError) {
      throw new ClaudeGenerationError(
        `Claude API error (${error.status ?? "unknown"}): ${error.message}`,
        502
      );
    }
    throw error;
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new ClaudeGenerationError("Claude returned no promo kit text.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new ClaudeGenerationError("Claude returned invalid JSON.");
  }

  if (!isValidGeneratedKit(parsed)) {
    throw new ClaudeGenerationError(
      "Claude's response did not match the expected promo kit format (3 variants per platform)."
    );
  }

  // Trim any extra variants/subjects to exactly 3 (schema can't cap lengths).
  return {
    instagram: parsed.instagram.slice(0, 3),
    reels: parsed.reels.slice(0, 3),
    facebook: parsed.facebook.slice(0, 3),
    x: parsed.x.slice(0, 3),
    tiktok: parsed.tiktok.slice(0, 3),
    email: { ...parsed.email, subjects: parsed.email.subjects.slice(0, 3) },
  };
}

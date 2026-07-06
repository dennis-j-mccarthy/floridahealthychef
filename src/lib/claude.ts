import Anthropic from "@anthropic-ai/sdk";
import { blogCategories, type BlogBlock } from "@/data/blog";

export type GeneratedArticle = {
  excerpt: string;
  category: string;
  body: BlogBlock[];
};

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
  image?: ImageInput
): Promise<GeneratedArticle> {
  // Occasionally the model returns valid JSON with an empty body — retry once.
  for (let attempt = 0; attempt < 2; attempt++) {
    const article = await generateArticleOnce(title, bullets, image);
    if (article.body.length > 0) return article;
  }
  throw new ClaudeGenerationError(
    "Claude returned an article with no body text — please try again."
  );
}

async function generateArticleOnce(
  title: string,
  bullets: string[],
  image?: ImageInput
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
      output_config: { format: { type: "json_schema", schema: ARTICLE_SCHEMA } },
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
  };
}

/* ------------------------------------------------------------------ */
/* Promo kit generation                                               */
/* ------------------------------------------------------------------ */

export type InstagramVariant = { caption: string; hashtags: string[] };
export type FacebookVariant = { post: string };
export type XVariant = { post: string };

export type PromoKitContent = {
  /** Exactly 3 variants when freshly generated; ≥1 after normalizing old kits. */
  instagram: InstagramVariant[];
  facebook: FacebookVariant[];
  x: XVariant[];
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

export type PromoKitInput = {
  title: string;
  excerpt: string;
  category: string;
  bodyText: string;
  articleUrl: string;
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
- For Instagram, Facebook, and X, write EXACTLY 3 variant posts each, and for the email write EXACTLY 3 subject line options.
- The 3 variants for each platform must be genuinely different ANGLES on the article — not rewordings of the same post. For example: one sensory/appetite-led (the taste, the plate, the craving), one health-benefit-led (what it does for the body, food as medicine), and one local-community-led (Southwest Florida, seasonality, the communities you serve). Choose the 3 angles that best fit the article; each variant should feel like a distinct reason to click.
- Every variant must still stand fully on its own and follow the channel guidelines below.

Channel guidelines:
- Instagram: an engaging caption with tasteful, sparing emoji and short scannable lines, plus 8-12 hashtags mixing brand/wellness tags (like #foodasmedicine, #healthyeating, #personalchef) with local Southwest Florida tags (like #naplesflorida, #bonitasprings, #swfl). Each of the 3 variants needs its own caption and its own hashtag set (they may overlap where natural).
- Facebook: a friendly, slightly longer post of 2-3 short paragraphs that ends with a clear call to action to read the article, including the article link. Each of the 3 variants includes the link.
- X: a single punchy post that MUST be under 280 characters total, including the article URL. The URL is long, so keep your own words very short — one or two brief sentences. Count carefully; the character budget for your text will be given with the article. ALL 3 variants must each be under the limit.
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

const PROMO_KIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["instagram", "facebook", "x", "email"],
  properties: {
    instagram: {
      type: "array",
      description:
        "EXACTLY 3 Instagram caption variants, each a genuinely different angle (e.g. sensory/appetite-led, health-benefit-led, local-community-led).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["caption", "hashtags"],
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
        required: ["post"],
        properties: {
          post: {
            type: "string",
            description:
              "Facebook post of 2-3 short paragraphs ending with a call to action that includes the article link.",
          },
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
        required: ["post"],
        properties: {
          post: {
            type: "string",
            description:
              "A single X (Twitter) post under 280 characters total, including the article URL.",
          },
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

function isInstagramVariant(value: unknown): value is InstagramVariant {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.caption === "string" &&
    Array.isArray(v.hashtags) &&
    v.hashtags.every((h) => typeof h === "string")
  );
}

function isPostVariant(value: unknown): value is { post: string } {
  if (typeof value !== "object" || value === null) return false;
  return typeof (value as Record<string, unknown>).post === "string";
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
 * Validate a promo kit. `exactVariants` (used at generation time) requires
 * every variant array — and the email subjects — to have exactly that many
 * entries; when omitted, any non-empty arrays are accepted (normalized old
 * kits have 1 of each).
 */
function isValidPromoKit(
  value: unknown,
  exactVariants?: number
): value is PromoKitContent {
  if (typeof value !== "object" || value === null) return false;
  const kit = value as Record<string, unknown>;

  const lengthOk = (arr: unknown[]) =>
    exactVariants === undefined
      ? arr.length > 0
      : arr.length === exactVariants;

  if (
    !Array.isArray(kit.instagram) ||
    !lengthOk(kit.instagram) ||
    !kit.instagram.every(isInstagramVariant)
  ) {
    return false;
  }
  if (
    !Array.isArray(kit.facebook) ||
    !lengthOk(kit.facebook) ||
    !kit.facebook.every(isPostVariant)
  ) {
    return false;
  }
  if (!Array.isArray(kit.x) || !lengthOk(kit.x) || !kit.x.every(isPostVariant)) {
    return false;
  }
  if (!isValidEmail(kit.email)) return false;
  if (
    exactVariants !== undefined &&
    (kit.email as PromoKitContent["email"]).subjects.length !== exactVariants
  ) {
    return false;
  }
  return true;
}

/**
 * Normalize a stored promo kit to the current multi-variant shape.
 * Old kits (instagram/facebook/x as single objects, email with a single
 * `subject`) become arrays of 1 + `subjects: [subject]`, so they keep
 * rendering. Returns null if the value can't be normalized.
 */
export function normalizePromoKit(value: unknown): PromoKitContent | null {
  if (typeof value !== "object" || value === null) return null;
  const kit = value as Record<string, unknown>;

  const toArray = (v: unknown): unknown[] =>
    Array.isArray(v) ? v : v === undefined || v === null ? [] : [v];

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
    instagram: toArray(kit.instagram),
    facebook: toArray(kit.facebook),
    x: toArray(kit.x),
    email,
  };

  return isValidPromoKit(candidate) ? candidate : null;
}

/**
 * Generate a promo kit (Instagram, Facebook, X, and email content) as
 * Beth McCarthy from a published-or-draft blog article.
 */
export async function generatePromoKit(
  post: PromoKitInput
): Promise<PromoKitContent> {
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
): Promise<PromoKitContent> {
  // Leave generous headroom under X's 280-character limit for the URL.
  const xTextBudget = Math.max(60, 280 - post.articleUrl.length - 40);
  const prompt = [
    "Create the promo kit (Instagram, Facebook, X, and email) for this article — 3 variants per social platform and 3 email subject options, each variant a genuinely different angle.",
    "",
    `Title: ${post.title}`,
    `Category: ${post.category}`,
    `Article URL: ${post.articleUrl}`,
    `X post character budget: the URL alone is ${post.articleUrl.length} characters, so the rest of each X post variant's text must be at most ${xTextBudget} characters. This applies to ALL 3 X variants.`,
    post.excerpt ? `Excerpt: ${post.excerpt}` : "",
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

  if (!isValidPromoKit(parsed, 3)) {
    throw new ClaudeGenerationError(
      "Claude's response did not match the expected promo kit format (3 variants per platform)."
    );
  }

  return parsed;
}

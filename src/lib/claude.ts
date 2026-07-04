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
- Write a complete, well-structured blog article of roughly 500-800 words based on the title and key points provided.
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

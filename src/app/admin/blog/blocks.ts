import type { BlogBlock } from "@/data/blog";

/**
 * Serialize BlogBlock[] to the plain-text editor format:
 *   "## " lines  -> h2 blocks
 *   "- " lines   -> aggregated into ul blocks
 *   other text   -> p blocks, separated by blank lines
 */
export function blocksToText(blocks: BlogBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `## ${block.text}`;
        case "p":
          return block.text;
        case "ul":
          return block.items.map((item) => `- ${item}`).join("\n");
      }
    })
    .join("\n\n");
}

/** Parse the plain-text editor format back into BlogBlock[]. */
export function textToBlocks(text: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "ul", items: listItems });
      listItems = [];
    }
  };
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: "p", text: paragraphLines.join(" ") });
      paragraphLines = [];
    }
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.trim() === "") {
      flushList();
      flushParagraph();
    } else if (line.startsWith("## ")) {
      flushList();
      flushParagraph();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
    } else {
      flushList();
      paragraphLines.push(line.trim());
    }
  }
  flushList();
  flushParagraph();
  return blocks;
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

/** Validate an unknown value as a BlogBlock[] (used by the admin API). */
export function validateBody(body: unknown): BlogBlock[] | null {
  if (!Array.isArray(body)) return null;
  if (!body.every(isValidBlock)) return null;
  return body;
}

/** Generate a URL-friendly slug from a title. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

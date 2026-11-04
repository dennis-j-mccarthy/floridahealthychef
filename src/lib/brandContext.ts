import { cleanTone, tonePrompt, type BlogTone } from "@/lib/blogTone";
import { getBrandEssence, type BrandEssenceRecord, type VoiceSliders } from "@/lib/essenceStore";
import { pillarIn, pillarPrompt, type Pillar } from "@/lib/pillars";
import { loadPillars } from "@/lib/pillarStore";

/*
  ONE brand context for every generator (titles, articles, social).
  SERVER ONLY. Ported from built-with-ai; the brand facts are Beth's.

    const ctx = await loadBrandContext({ pillarId });
    system extra: brandBrief(ctx)   — appended to claude.ts system prompts
*/

export interface BrandContext {
  essence: BrandEssenceRecord;
  voice: VoiceSliders;
  tone: BlogTone | null;
  pillar: Pillar | null;
  pillars: Pillar[];
}

export async function loadBrandContext(
  opts: { pillarId?: string | null; toneFallback?: unknown } = {},
): Promise<BrandContext> {
  const [essence, pillars] = await Promise.all([getBrandEssence(), loadPillars()]);
  let tone = essence.tone;
  if (!tone && opts.toneFallback && typeof opts.toneFallback === "object") {
    const t = cleanTone(opts.toneFallback);
    if (t.voice || t.audience || t.style || t.dos || t.donts) tone = t;
  }
  return { essence, voice: essence.voice, tone, pillar: pillarIn(pillars, opts.pillarId), pillars };
}

function lean(v: number, low: string, high: string): string {
  const d = v - 50;
  if (Math.abs(d) < 8) return `balanced between ${low} and ${high}`;
  const strength = Math.abs(d) >= 35 ? "strongly" : Math.abs(d) >= 18 ? "clearly" : "slightly";
  return `${strength} ${d > 0 ? high : low} (${v}/100)`;
}

/** The three sliders as prose the model can act on. */
export function voicePrompt(v: VoiceSliders): string {
  return [
    `- Playful ↔ Serious: ${lean(v.playful, "serious", "playful")}`,
    `- Formal ↔ Casual: ${lean(v.formal, "casual", "formal")}`,
    `- Bold ↔ Gentle: ${lean(v.bold, "gentle", "bold")}`,
  ].join("\n");
}

export function essenceBlock(e: BrandEssenceRecord): string {
  return [
    `BRAND LINE: ${e.line}`,
    `PURPOSE: ${e.purpose}`,
    `PROMISE: ${e.promise}`,
    `DO: ${e.doList.join("; ")}`,
    `DON'T: ${e.dontList.join("; ")}`,
  ].join("\n");
}

/**
 * The brand brief appended to claude.ts's tone system prompt: essence,
 * voice dials, the tone brief saved on the Essence page, and either the
 * chosen pillar or the full pillar list.
 */
export function brandBrief(ctx: BrandContext): string {
  const parts: string[] = [
    `BRAND ESSENCE:\n${essenceBlock(ctx.essence)}`,
    `VOICE DIALS:\n${voicePrompt(ctx.voice)}`,
  ];
  if (ctx.tone) parts.push(`TONE BRIEF (from the Essence page):\n${tonePrompt(ctx.tone)}`);
  if (ctx.pillar) {
    parts.push(
      `CONTENT PILLAR — carry this message (naturally, never as a slogan):\n${pillarPrompt(ctx.pillar)}`,
    );
  } else if (ctx.pillars.length) {
    parts.push(
      `CONTENT PILLARS (draw on any; each piece should land one):\n${ctx.pillars.map((p) => `- ${p.name}: ${p.message}`).join("\n")}`,
    );
  }
  return parts.join("\n\n");
}

/** One call for routes: the brief for a pillar id (or the full list). */
export async function essenceSystemBlock(pillarId?: string | null): Promise<string> {
  return brandBrief(await loadBrandContext({ pillarId }));
}

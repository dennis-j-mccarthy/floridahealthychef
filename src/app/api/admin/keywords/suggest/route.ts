import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { body, guard } from "@/lib/adminGuard";
import { prisma } from "@/lib/db";
import { essenceSystemBlock } from "@/lib/brandContext";
import { SERVICE_AREA } from "@/lib/seo";

export const runtime = "nodejs";
export const maxDuration = 120;

/*
  POST { focus? } → { suggestions: [{ phrase, kind, priority, why }] }
  New search phrases that would bring the right clients to Beth. Not saved;
  the panel adds the ones you pick. Priority is Claude's judgement (0–100),
  never a search volume. Same AI pattern as /api/admin/social/captions.
*/

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["suggestions"],
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phrase", "kind", "priority", "why"],
        properties: {
          phrase: { type: "string" },
          kind: { type: "string", enum: ["problem", "service", "question"] },
          priority: { type: "integer", description: "0 to 100, our judgement of value, not search volume" },
          why: { type: "string", description: "One short sentence" },
        },
      },
    },
  },
} as const;

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  const b = (await body<{ focus?: string }>(req)) ?? {};
  const existing = (await prisma.keyword.findMany({ select: { phrase: true } })).map((k) => k.phrase);
  const system = [
    "You are a local search planner for Beautiful Foods by Beth (floridahealthychef.com): Beth McCarthy, Certified Natural Chef, cooks in clients' homes across " +
      `${SERVICE_AREA.join(", ")} in Southwest Florida. The site sells weekly personal chef service, intimate catering for up to 20 guests (paleo, gluten-free and more), and speaking and tasting events. ` +
      "Yoga, Awakening Joy and coaching live on a different website, so never suggest them.",
    "Never phrase a suggestion as a health claim or cure. Plain words people actually type.",
    await essenceSystemBlock(null),
  ].join("\n\n");
  const prompt = [
    "Suggest 24 search phrases that would bring the right clients to Beth. Mix: needs people type before they have picked a chef (busy families who want healthy home-cooked meals, dietary needs, hosting a small dinner party), service + town phrases for the five towns, and questions people ask about hiring a personal chef.",
    b.focus ? `Focus on: ${String(b.focus).slice(0, 200)}` : "",
    `Skip these, already listed: ${existing.join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    const response = await new Anthropic().messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    const block = response.content.find((x) => x.type === "text");
    const parsed = JSON.parse(block && "text" in block ? block.text : "{}") as { suggestions?: { phrase: string; kind: string; priority: number; why?: string }[] };
    const lower = new Set(existing.map((p) => p.toLowerCase()));
    const suggestions = (parsed.suggestions ?? [])
      .filter((s) => s.phrase && !lower.has(s.phrase.toLowerCase()))
      .map((s) => ({
        phrase: String(s.phrase).slice(0, 120),
        kind: ["problem", "service", "question"].includes(s.kind) ? s.kind : "service",
        priority: Math.max(0, Math.min(100, Math.round(Number(s.priority)) || 50)),
        why: String(s.why ?? "").slice(0, 200),
      }));
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "Couldn't get suggestions. Try again." }, { status: 502 });
  }
}

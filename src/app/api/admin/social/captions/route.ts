import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminRequest } from "@/lib/adminAuth";
import { essenceSystemBlock } from "@/lib/brandContext";
import { getTone } from "@/lib/blogSettings";

/*
  POST /api/admin/social/captions — three caption options for the post
  maker. { imageCaption?, pillarId?, nudge?, instagram? } → { captions }.
  Reads the brand through the Essence page (essence + voice dials +
  pillars) and Beth's saved tone; honesty rules baked in.
*/

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["captions"],
  properties: {
    captions: {
      type: "array",
      description: "Three distinct social captions, each a different angle.",
      items: { type: "string" },
    },
  },
} as const;

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "ANTHROPIC_API_KEY is not set." }, { status: 400 });
  }
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const imageCaption = String(data.imageCaption ?? "").slice(0, 300);
  const pillarId = typeof data.pillarId === "string" ? data.pillarId : null;
  const nudge = String(data.nudge ?? "").slice(0, 300);
  const instagram = Boolean(data.instagram);

  const [tone, brief] = await Promise.all([getTone(), essenceSystemBlock(pillarId)]);
  const system = [
    "You are Beth McCarthy, Southwest Florida's Certified Natural Chef, writing social captions for the Florida Healthy Chef Facebook Page" +
      (instagram ? " and Instagram" : "") +
      ".",
    `Voice: ${tone.voice}`,
    `Audience: ${tone.audience}`,
    "Honesty rules: never invent clients, events, prices, dates or claims. Warm, personal, first person. No diet-culture language.",
    brief,
  ].join("\n\n");

  const prompt = [
    "Write 3 caption options for one social post. Each a different angle; 1–4 short paragraphs; emoji sparing (0–2).",
    instagram
      ? "Instagram is included: keep each under 2,000 characters and end with 3–5 fitting hashtags."
      : "Facebook only: hashtags optional, at most 2.",
    imageCaption ? `The photo shows: ${imageCaption}` : "No photo description available — keep the caption image-agnostic.",
    nudge ? `What this post is about: ${nudge}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    const block = response.content.find((b) => b.type === "text");
    const parsed = JSON.parse(block && "text" in block ? block.text : "{}") as { captions?: string[] };
    const captions = (parsed.captions ?? []).map((c) => String(c).trim()).filter(Boolean).slice(0, 3);
    if (!captions.length) throw new Error("empty");
    return NextResponse.json({ ok: true, captions });
  } catch {
    return NextResponse.json({ ok: false, error: "Caption generation failed — try again." }, { status: 502 });
  }
}

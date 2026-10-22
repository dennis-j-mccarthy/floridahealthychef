import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { ClaudeGenerationError, generateTitleIdeas, normalizeTone } from "@/lib/claude";
import { getTone } from "@/lib/blogSettings";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MIN_COUNT = 1;
const MAX_COUNT = 10;

// Generate a batch of blog title ideas in the configured (or request-supplied) tone.
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY is not set in .env.local" },
      { status: 400 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // Use the tone from the request (so unsaved edits apply); fall back to the stored tone.
  const tone = data.tone !== undefined ? normalizeTone(data.tone) : await getTone();
  const topic = typeof data.topic === "string" ? data.topic : undefined;
  const rawCount = Number(data.count);
  const count = Number.isFinite(rawCount)
    ? Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.floor(rawCount)))
    : 5;

  try {
    const titles = await generateTitleIdeas(tone, count, topic);
    return NextResponse.json({ ok: true, titles });
  } catch (error) {
    if (error instanceof ClaudeGenerationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error("Title generation failed:", error);
    return NextResponse.json(
      { ok: false, error: "Title generation failed unexpectedly." },
      { status: 500 },
    );
  }
}

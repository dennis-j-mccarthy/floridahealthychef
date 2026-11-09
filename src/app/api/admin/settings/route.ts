import { NextResponse } from "next/server";
import { body, guard } from "@/lib/adminGuard";
import { getSetting, isSettingKey, setSetting } from "@/lib/studioSettings";

export const runtime = "nodejs";

// GET ?key=…  → { value }      PUT { key, value } → { ok }
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const key = new URL(req.url).searchParams.get("key");
  if (!isSettingKey(key)) return NextResponse.json({ error: "Unknown setting." }, { status: 400 });
  return NextResponse.json({ value: await getSetting(key, null) });
}

export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = await body<{ key?: unknown; value?: unknown }>(req);
  if (!b || !isSettingKey(b.key)) return NextResponse.json({ error: "Unknown setting." }, { status: 400 });
  if (JSON.stringify(b.value ?? null).length > 20000) return NextResponse.json({ error: "Too large." }, { status: 413 });
  await setSetting(b.key, b.value ?? null);
  return NextResponse.json({ ok: true });
}

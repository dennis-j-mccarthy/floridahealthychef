import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getConnection, isConnected, hasInstagram, instagramUserId } from "@/lib/meta/store";
import { publishPagePost, publishInstagramPost, MetaError } from "@/lib/meta/graph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Instagram publishing polls the media container for a few seconds, on top
// of the Facebook call — give the function generous headroom.
export const maxDuration = 300;

const CAPTION_MAX = 5000;
// Instagram's hard caption limit — checked pre-flight so nothing posts if it's exceeded.
const IG_CAPTION_MAX = 2200;

type ChannelResult =
  | { ok: true; id: string; scheduled: boolean; scheduledAt: string | null }
  | { ok: false; error: string };

// The real thing: publish or schedule a post on Beth's Facebook Page — and,
// when selected and a linked Instagram Business account exists, publish the
// same photo + caption to Instagram — straight from the app.
export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const caption = String(data.caption ?? "").trim();
  const imageUrlRaw = String(data.imageUrl ?? "").trim();
  const imageUrl = imageUrlRaw || undefined;
  const scheduledRaw = String(data.scheduledAt ?? "").trim();
  const scheduledAt = scheduledRaw || undefined;
  // Facebook is the default channel; Instagram is opt-in.
  const toFacebook = data.facebook === undefined ? true : Boolean(data.facebook);
  const toInstagram = Boolean(data.instagram);

  if (!caption) {
    return NextResponse.json({ ok: false, error: "Write a caption." }, { status: 400 });
  }
  if (caption.length > CAPTION_MAX) {
    return NextResponse.json(
      { ok: false, error: `Caption is too long (max ${CAPTION_MAX} characters).` },
      { status: 400 },
    );
  }
  if (imageUrl && !/^https:\/\//i.test(imageUrl)) {
    return NextResponse.json(
      { ok: false, error: "Image URL must be a public https:// address." },
      { status: 400 },
    );
  }
  if (!toFacebook && !toInstagram) {
    return NextResponse.json(
      { ok: false, error: "Choose at least one channel (Facebook or Instagram)." },
      { status: 400 },
    );
  }

  const conn = await getConnection();
  if (!isConnected(conn)) {
    return NextResponse.json(
      { ok: false, error: "Facebook isn't connected yet. Connect it first." },
      { status: 409 },
    );
  }

  if (toInstagram) {
    if (!hasInstagram(conn)) {
      return NextResponse.json(
        { ok: false, error: "No Instagram Business account is linked to this Page." },
        { status: 409 },
      );
    }
    if (!imageUrl) {
      return NextResponse.json(
        { ok: false, error: "Instagram posts require a public image URL." },
        { status: 400 },
      );
    }
    if (scheduledAt) {
      return NextResponse.json(
        { ok: false, error: "Instagram can only publish now — scheduling is Facebook-only." },
        { status: 400 },
      );
    }
    if (caption.length > IG_CAPTION_MAX) {
      return NextResponse.json(
        { ok: false, error: `Instagram caption is too long (max ${IG_CAPTION_MAX} characters).` },
        { status: 400 },
      );
    }
  }

  const results: { facebook?: ChannelResult; instagram?: ChannelResult } = {};

  if (toFacebook) {
    try {
      const r = await publishPagePost({
        pageId: conn.pageId!,
        pageToken: conn.pageToken!,
        message: caption,
        imageUrl,
        scheduledAt,
      });
      results.facebook = {
        ok: true,
        id: r.id,
        scheduled: r.scheduled,
        scheduledAt: r.scheduledAt ?? null,
      };
    } catch (e: unknown) {
      const msg = e instanceof MetaError || e instanceof Error ? e.message : "Post failed.";
      results.facebook = { ok: false, error: msg };
    }
  }

  if (toInstagram) {
    try {
      const r = await publishInstagramPost({
        igUserId: instagramUserId(conn)!,
        pageToken: conn.pageToken!,
        imageUrl: imageUrl!,
        caption,
      });
      results.instagram = { ok: true, id: r.id, scheduled: false, scheduledAt: null };
    } catch (e: unknown) {
      const msg = e instanceof MetaError || e instanceof Error ? e.message : "Post failed.";
      results.instagram = { ok: false, error: msg };
    }
  }

  // Overall ok only if every attempted channel succeeded. Per-channel
  // results let the UI avoid a retry that would double-post the one that
  // already worked.
  const attempted = Object.values(results);
  const ok = attempted.length > 0 && attempted.every((r) => r.ok);
  return NextResponse.json(
    { ok, page: conn.pageName, instagram: conn.igUsername, results },
    { status: ok ? 200 : 502 },
  );
}

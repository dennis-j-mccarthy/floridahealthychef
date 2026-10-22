import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { isMetaConfigured } from "@/lib/meta/config";
import { getConnection, isConnected, hasInstagram } from "@/lib/meta/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lightweight status for the admin Social page. Never returns tokens.
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const configured = isMetaConfigured();
  const conn = await getConnection();
  return NextResponse.json({
    ok: true,
    configured,
    connected: isConnected(conn),
    instagramEnabled: hasInstagram(conn),
    source: conn?.source ?? null,
    page: conn?.pageName ?? null,
    instagram: conn?.igUsername ?? null,
    fbUser: conn?.fbUserName ?? null,
    tokenExpiresAt: conn?.tokenExpiresAt ?? null,
    connectedAt: conn?.connectedAt ?? null,
  });
}

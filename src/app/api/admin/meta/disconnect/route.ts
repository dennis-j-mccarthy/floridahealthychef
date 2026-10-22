import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { clearConnection } from "@/lib/meta/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Forget the stored tokens. (Beth can also remove the app from
// facebook.com/settings → Business Integrations.)
export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  await clearConnection();
  return NextResponse.json({ ok: true });
}

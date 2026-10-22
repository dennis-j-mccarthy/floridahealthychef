import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getTone, saveTone } from "@/lib/blogSettings";

export const dynamic = "force-dynamic";

// Read the current tone settings (falls back to Beth's default voice).
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const tone = await getTone();
  return NextResponse.json({ ok: true, tone });
}

// Save the tone settings.
export async function PUT(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const tone = await saveTone(data);
  return NextResponse.json({ ok: true, tone });
}

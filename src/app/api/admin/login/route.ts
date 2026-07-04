import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkCredentials,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!checkCredentials(email, password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return res;
}

import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { GROWTH_MISSING_MESSAGE, growthReady } from "@/lib/growthDb";

/** 401 when not signed in as admin, 503 when the Growth tables are missing; null when OK. */
export async function guard(opts: { db?: boolean } = { db: true }): Promise<NextResponse | null> {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (opts.db !== false && !(await growthReady())) {
    return NextResponse.json({ error: GROWTH_MISSING_MESSAGE }, { status: 503 });
  }
  return null;
}

export async function body<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

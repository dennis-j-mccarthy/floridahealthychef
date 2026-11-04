import { isAdminRequest } from "@/lib/adminAuth";

/*
  Compatibility shim for API routes ported from built-with-ai, which gate
  with a passcode. FHC's admin uses the signed session cookie instead, so
  the "passcode" check is simply: is this an authenticated admin?
*/

export async function passcodeError(
  _req: Request,
  _body?: { passcode?: unknown } | null,
): Promise<Response | null> {
  if (await isAdminRequest()) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/** Parse a JSON body, tolerating an empty one (GET-like POSTs). */
export async function readJson<T extends object>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text.trim()) return {} as T;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

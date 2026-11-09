import { createSign } from "crypto";

/*
  Google Search Console connector. SERVER ONLY. Same env names as Fluid
  Pathways.

  Setup (Dennis):
    1. Verify floridahealthychef.com in Search Console (Domain property, a
       DNS record). Do this after the domain points at this app.
    2. In Google Cloud, create a service account and a JSON key, and enable
       the "Google Search Console API".
    3. In Search Console → Settings → Users and permissions, add the service
       account's email as a user (Restricted is enough).
    4. In Vercel, set GSC_SERVICE_ACCOUNT_JSON (the whole JSON key, or the
       same base64-encoded) and GSC_SITE_URL ("sc-domain:floridahealthychef.com").

  Until both are set, isSearchConsoleConfigured() is false and the panels say
  "Not connected yet". Nothing is estimated in its place.
*/

type ServiceAccount = { client_email: string; private_key: string };

function readAccount(): ServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const j = JSON.parse(text) as ServiceAccount;
    return j.client_email && j.private_key ? j : null;
  } catch {
    return null;
  }
}

export function isSearchConsoleConfigured(): boolean {
  return !!readAccount() && !!process.env.GSC_SITE_URL;
}

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

/** Service-account JWT (RS256) signed with Node's crypto, exchanged for an access token. */
async function accessToken(acc: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: acc.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${b64url(signer.sign(acc.private_key))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const d = (await res.json()) as { access_token?: string; error_description?: string };
  if (!d.access_token) throw new Error(d.error_description || "Search Console sign-in failed");
  return d.access_token;
}

export interface GscRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/** Top queries (or pages) for the last `days` days. Throws when not configured. */
export async function searchAnalytics(dimension: "query" | "page", days = 28, rowLimit = 100): Promise<GscRow[]> {
  const acc = readAccount();
  const site = process.env.GSC_SITE_URL;
  if (!acc || !site) throw new Error("Search Console is not connected.");
  const token = await accessToken(acc);
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ startDate: day(start), endDate: day(end), dimensions: [dimension], rowLimit }),
    next: { revalidate: 3600 },
  });
  const d = (await res.json()) as {
    rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(d.error?.message || `Search Console error ${res.status}`);
  return (d.rows ?? []).map((r) => ({ key: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}

/** Best-effort read for panels: rows, or an explanation of why there are none. */
export async function searchConsoleSnapshot(dimension: "query" | "page"): Promise<{ connected: boolean; rows: GscRow[]; error: string | null }> {
  if (!isSearchConsoleConfigured()) return { connected: false, rows: [], error: null };
  try {
    return { connected: true, rows: await searchAnalytics(dimension), error: null };
  } catch (e) {
    return { connected: true, rows: [], error: (e as Error).message };
  }
}

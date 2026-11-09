/*
  Google Ads Keyword Planner connector (search volume). SERVER ONLY.
  Ported from Fluid Pathways; same env names.

  UNTESTED until credentials exist: the request shape follows Google Ads API
  KeywordPlanIdeaService.GenerateKeywordHistoricalMetrics.

  Setup (Dennis):
    1. Create a Google Ads account for Beautiful Foods by Beth (it can sit at $0 spend).
    2. Apply for a developer token (Google Ads → Tools → API Center). Google
       has to approve it; Basic access is enough.
    3. Create an OAuth client in Google Cloud and get a refresh token for the
       Google account that owns the Ads account.
    4. In Vercel set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID,
       GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN,
       GOOGLE_ADS_CUSTOMER_ID (digits only), and optionally
       GOOGLE_ADS_LOGIN_CUSTOMER_ID (manager account), GOOGLE_ADS_API_VERSION
       (default v19) and GOOGLE_ADS_GEO_TARGET (default
       geoTargetConstants/2840, the United States; set it to the Naples or
       Florida constant from Google's geo target list).

  Until then the panels say "Not connected yet" and show no volumes.
*/

const REQUIRED = [
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
] as const;

export function isKeywordPlannerConfigured(): boolean {
  return REQUIRED.every((k) => !!process.env[k]);
}

export function missingKeywordPlannerEnv(): string[] {
  return REQUIRED.filter((k) => !process.env[k]);
}

async function accessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    }),
  });
  const d = (await res.json()) as { access_token?: string; error_description?: string };
  if (!d.access_token) throw new Error(d.error_description || "Google Ads sign-in failed");
  return d.access_token;
}

export interface VolumeRow {
  phrase: string;
  avgMonthlySearches: number | null;
  competition: string | null;
  lowBidMicros: number | null;
  highBidMicros: number | null;
}

/** Monthly search volume for up to ~50 phrases. Throws when not configured. */
export async function keywordVolumes(phrases: string[]): Promise<VolumeRow[]> {
  if (!isKeywordPlannerConfigured()) throw new Error("Keyword Planner is not connected.");
  const version = process.env.GOOGLE_ADS_API_VERSION || "v19";
  const customer = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/\D/g, "");
  const headers: Record<string, string> = {
    authorization: `Bearer ${await accessToken()}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    "content-type": "application/json",
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers["login-customer-id"] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/\D/g, "");
  }
  const res = await fetch(`https://googleads.googleapis.com/${version}/customers/${customer}:generateKeywordHistoricalMetrics`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      keywords: phrases.slice(0, 50),
      language: "languageConstants/1000",
      geoTargetConstants: [process.env.GOOGLE_ADS_GEO_TARGET || "geoTargetConstants/2840"],
      keywordPlanNetwork: "GOOGLE_SEARCH",
    }),
  });
  const d = (await res.json()) as {
    results?: { text: string; keywordMetrics?: { avgMonthlySearches?: string; competition?: string; lowTopOfPageBidMicros?: string; highTopOfPageBidMicros?: string } }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(d.error?.message || `Google Ads error ${res.status}`);
  return (d.results ?? []).map((r) => ({
    phrase: r.text,
    avgMonthlySearches: r.keywordMetrics?.avgMonthlySearches ? Number(r.keywordMetrics.avgMonthlySearches) : null,
    competition: r.keywordMetrics?.competition ?? null,
    lowBidMicros: r.keywordMetrics?.lowTopOfPageBidMicros ? Number(r.keywordMetrics.lowTopOfPageBidMicros) : null,
    highBidMicros: r.keywordMetrics?.highTopOfPageBidMicros ? Number(r.keywordMetrics.highTopOfPageBidMicros) : null,
  }));
}

import { prisma } from "@/lib/db";

/*
  Are the Growth tables there yet? SERVER ONLY.

  The tables come from migration 20261109120000_growth_search. Until someone
  applies it, every query on Keyword / LandingPage / ConversionEvent /
  SpendEntry / StudioSetting throws "table does not exist" (Prisma P2021).
  Growth pages call growthReady() and show a notice instead of crashing; the
  admin APIs answer 503 with GROWTH_MISSING_MESSAGE; /api/track and the
  sitemap swallow the error. Cached per server instance once true.
*/

export const GROWTH_MIGRATION = "20261109120000_growth_search";
export const GROWTH_MISSING_MESSAGE = `The Growth tables are not created yet. Apply migration ${GROWTH_MIGRATION} (npx prisma migrate deploy).`;

let ready = false;

export async function growthReady(): Promise<boolean> {
  if (ready) return true;
  try {
    const rows = await prisma.$queryRaw<{ t: string | null }[]>`SELECT to_regclass('"StudioSetting"')::text AS t`;
    ready = !!rows[0]?.t;
  } catch {
    ready = false;
  }
  return ready;
}

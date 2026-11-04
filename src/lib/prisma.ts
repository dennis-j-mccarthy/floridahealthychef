// Compatibility shim for modules ported from built-with-ai, which import
// { prisma, isDatabaseConfigured } from "@/lib/prisma". FHC always has a
// database (Neon), so the flag is constant.
export { prisma } from "@/lib/db";
export const isDatabaseConfigured = () => true;
export const DB_MISSING_MESSAGE = "Database not configured.";

/**
 * Persistence for the single blog tone-settings row (`BlogSettings`
 * singleton, id = "default"). Missing row or unavailable DB falls back to
 * Beth's default tone, so generation always has a sane voice.
 */

import { prisma } from "@/lib/db";
import { DEFAULT_TONE, normalizeTone, type BlogTone } from "@/lib/claude";

const ID = "default";

/** Load the saved tone, or Beth's default when nothing is stored yet. */
export async function getTone(): Promise<BlogTone> {
  try {
    const row = await prisma.blogSettings.findUnique({ where: { id: ID } });
    if (!row) return DEFAULT_TONE;
    return normalizeTone(row);
  } catch {
    return DEFAULT_TONE;
  }
}

/** Save the tone (normalized + field-clamped). Returns what was stored. */
export async function saveTone(input: unknown): Promise<BlogTone> {
  const tone = normalizeTone(input);
  await prisma.blogSettings.upsert({
    where: { id: ID },
    create: { id: ID, ...tone },
    update: { ...tone },
  });
  return tone;
}

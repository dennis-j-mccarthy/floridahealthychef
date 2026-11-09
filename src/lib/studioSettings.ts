import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { growthReady } from "@/lib/growthDb";

/*
  StudioSetting key/value rows for the Growth pages. SERVER ONLY.

  Keys in use:
    budget_google       { monthlyCents }        Google Ads monthly target
    budget_meta         { monthlyCents }        Meta ads monthly target
    competitors         Competitor[]            entered by hand (Competitors tab)
    competitor_todo     { [id]: true }          ticks on the Competitors to-do list
    organic_checklist   { [id]: true }          manual ticks on the Organic checklist
*/

export const SETTING_KEYS = ["budget_google", "budget_meta", "competitors", "competitor_todo", "organic_checklist"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export function isSettingKey(v: unknown): v is SettingKey {
  return typeof v === "string" && (SETTING_KEYS as readonly string[]).includes(v);
}

export async function getSetting<T>(key: SettingKey, fallback: T): Promise<T> {
  if (!(await growthReady())) return fallback;
  try {
    const row = await prisma.studioSetting.findUnique({ where: { key } });
    return row ? (row.value as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: SettingKey, value: unknown): Promise<void> {
  const v = value as Prisma.InputJsonValue;
  await prisma.studioSetting.upsert({ where: { key }, create: { key, value: v }, update: { value: v } });
}

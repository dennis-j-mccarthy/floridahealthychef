import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jwb-admin-session";
const SESSION_DAYS = 7;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) return false;
  const a = Buffer.from(`${email.toLowerCase()}\n${password}`);
  const b = Buffer.from(`${expectedEmail.toLowerCase()}\n${expectedPassword}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [scope, expires, mac] = parts;
  const payload = `${scope}.${expires}`;
  const expected = sign(payload);
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  return scope === "admin" && Number(expires) > Date.now();
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

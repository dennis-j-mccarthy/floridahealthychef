"use client";

import { useEffect } from "react";

/*
  Compatibility shim for components ported from built-with-ai, which carry
  an admin passcode on their API calls. FHC's admin is cookie-authenticated
  (signed session from /admin/login), so:

    useAdminPasscode()  always "unlocked" — the server is the real gate
    adminFetch()        same-origin fetch; the session cookie rides along
    PasscodeForm        a 401 means the session expired → back to login
*/

export const PASS_KEY = "fhc-admin-session"; // unused; kept for signature parity

export function useAdminPasscode() {
  return {
    passcode: "session",
    hydrated: true,
    setPasscode: (_v: string) => {},
    clearPasscode: () => {},
  };
}

export function adminHeaders(_passcode: string): Record<string, string> {
  return {};
}

export async function adminFetch<T = Record<string, unknown>>(
  _passcode: string,
  url: string,
  init?: { method?: string; body?: Record<string, unknown> },
): Promise<T> {
  const method = init?.method || "GET";
  const res = await fetch(url, {
    method,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    const err = new Error(data.error || `Failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

export function isAuthError(e: unknown): boolean {
  return !!e && typeof e === "object" && (e as { status?: number }).status === 401;
}

export function PasscodeForm(_props: { prompt: string; msg?: string; onUnlock: (v: string) => void }) {
  useEffect(() => {
    window.location.href = "/admin/login";
  }, []);
  return <p className="text-sm text-muted">Session expired — heading to sign-in…</p>;
}

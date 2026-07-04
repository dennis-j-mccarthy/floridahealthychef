"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-light px-6 pt-44 pb-20">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Joyful Wellness with Beth"
            width={160}
            height={160}
            className="h-20 w-auto"
          />
        </div>
        <h1 className="mt-4 text-center text-3xl text-dark">Admin</h1>
        <p className="mt-2 text-center text-sm font-light text-gray">
          Sign in to view newsletter signups and messages.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-label="Email address"
            className="w-full rounded-lg border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-lg border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-2 disabled:opacity-60"
          >
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-4 text-center text-xs text-primary" role="alert">
            Incorrect email or password.
          </p>
        )}
      </div>
    </section>
  );
}

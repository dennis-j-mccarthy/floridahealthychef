"use client";

import { useState } from "react";

type NewsletterFormProps = {
  /** Classes for the <form> element (layout). */
  className?: string;
  /** Classes for the email <input>. */
  inputClassName?: string;
  /** Classes for the submit <button>. */
  buttonClassName?: string;
  /** Submit button label. */
  buttonText?: string;
  /** Classes for the success message. */
  successClassName?: string;
  /** Where this form lives (recorded with each signup). */
  source?: string;
};

export default function NewsletterForm({
  className = "flex gap-3",
  inputClassName = "flex-1 rounded-lg border border-gray-light/30 bg-white px-5 py-3 text-sm text-dark placeholder-gray-light focus:border-green focus:outline-none",
  buttonClassName = "rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60",
  buttonText = "Subscribe",
  successClassName = "py-3 text-sm font-medium text-olive",
  source = "website",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className={successClassName} role="status">
        Thanks — you&apos;re on the list!
      </p>
    );
  }

  return (
    <div>
      <form className={className} onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          aria-label="Email address"
          className={inputClassName}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={buttonClassName}
        >
          {status === "loading" ? "Subscribing…" : buttonText}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-primary" role="alert">
          Something went wrong — please check your email address and try again.
        </p>
      )}
    </div>
  );
}

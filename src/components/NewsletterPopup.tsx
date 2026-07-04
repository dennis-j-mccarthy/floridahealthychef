"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import NewsletterForm from "./NewsletterForm";

const SESSION_KEY = "jwb-newsletter-popup-shown";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // sessionStorage unavailable — still show the popup this once
      }
      setOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60 px-6"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close newsletter popup"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray transition-colors hover:bg-light-2 hover:text-dark"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <Image
          src="/images/logo.png"
          alt="JWB - Joyful Wellness with Beth"
          width={120}
          height={120}
          className="mx-auto h-20 w-auto"
        />
        <h2 className="mt-4 text-4xl font-normal text-dark">Joyful Wellness</h2>
        <p className="mx-auto mt-3 max-w-xs text-sm font-light leading-relaxed text-gray">
          Feed your Inbox with Nourishing Recipes &amp; Self-Care Tips for a
          Beautiful You!
        </p>
        <div className="mt-6">
          <NewsletterForm
            source="popup"
            className="flex flex-col gap-3"
            inputClassName="w-full rounded-lg border border-light-2 bg-light px-5 py-3 text-sm text-dark placeholder-gray-light focus:border-primary focus:outline-none"
            buttonClassName="w-full rounded-lg bg-olive px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
            buttonText="JOIN THE COMMUNITY"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { PromoKitContent } from "@/lib/claude";
import type { BlogBlock } from "@/data/blog";

const SAGE = "#939d3c";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a self-contained, inline-styled HTML email (absolute URLs only). */
function buildEmailHtml(
  kit: PromoKitContent,
  heroImageUrl: string,
  articleTitle: string
): string {
  const email = kit.email;
  const blocksHtml = email.blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `<h2 style="margin: 28px 0 12px; font-size: 20px; line-height: 1.3; color: #1a1a2e; font-weight: 600;">${escapeHtml(block.text)}</h2>`;
        case "p":
          return `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(block.text)}</p>`;
        case "ul":
          return `<ul style="margin: 0 0 16px; padding-left: 24px;">${block.items
            .map(
              (item) =>
                `<li style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(item)}</li>`
            )
            .join("")}</ul>`;
      }
    })
    .join("\n");

  const heroHtml = heroImageUrl
    ? `<img src="${escapeHtml(heroImageUrl)}" alt="${escapeHtml(articleTitle)}" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border-radius: 12px; margin: 0 0 24px;" />\n`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(email.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(email.preheader)}</div>
<div style="max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">
${heroHtml}<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(email.greeting)}</p>
${blocksHtml}
<div style="margin: 28px 0; text-align: center;">
<a href="${escapeHtml(email.cta.url)}" style="display: inline-block; padding: 14px 32px; background-color: ${SAGE}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">${escapeHtml(email.cta.label)}</a>
</div>
<p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">${escapeHtml(email.signoff)}</p>
</div>
</body>
</html>`;
}

function buildEmailPlainText(kit: PromoKitContent): string {
  const email = kit.email;
  const blockText = email.blocks
    .map((block: BlogBlock) => {
      switch (block.type) {
        case "h2":
          return block.text.toUpperCase();
        case "p":
          return block.text;
        case "ul":
          return block.items.map((item) => `- ${item}`).join("\n");
      }
    })
    .join("\n\n");

  return [
    `Subject: ${email.subject}`,
    "",
    email.greeting,
    "",
    blockText,
    "",
    `${email.cta.label}: ${email.cta.url}`,
    "",
    email.signoff,
  ].join("\n");
}

function instagramCopyText(kit: PromoKitContent): string {
  return `${kit.instagram.caption}\n\n${kit.instagram.hashtags.join(" ")}`;
}

const cardClass = "rounded-2xl bg-white p-6 shadow-sm sm:p-8";
const textAreaClass =
  "mt-3 w-full rounded-xl border border-light-2 bg-light px-4 py-3 text-sm font-light leading-relaxed text-dark focus:outline-none";

export default function PromoKitView({
  postId,
  articleTitle,
  articleUrl,
  heroImageUrl,
  initialKit,
}: {
  postId: number;
  articleTitle: string;
  articleUrl: string;
  heroImageUrl: string;
  initialKit: PromoKitContent | null;
}) {
  const [kit, setKit] = useState<PromoKitContent | null>(initialKit);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  async function copyToClipboard(key: string, text: string) {
    setError("");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopiedKey(""), 2000);
    } catch {
      setError("Could not copy to the clipboard — please copy manually.");
    }
  }

  async function generate(isRegenerate: boolean) {
    if (
      isRegenerate &&
      !window.confirm(
        "Regenerate the promo kit? The current social posts and email will be replaced."
      )
    ) {
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/blog/${postId}/promo`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Promo kit generation failed.");
        return;
      }
      setKit(data.kit.content);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function CopyButton({ id, text, label }: { id: string; text: string; label?: string }) {
    return (
      <button
        onClick={() => copyToClipboard(id, text)}
        className="rounded-lg bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-olive-dark"
      >
        {copiedKey === id ? "Copied!" : label ?? "Copy text"}
      </button>
    );
  }

  function HeroThumbnail() {
    if (!heroImageUrl) return null;
    return (
      <div className="mt-3 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl}
          alt={articleTitle}
          className="aspect-[16/9] w-40 rounded-xl object-cover"
        />
        <a
          href={heroImageUrl}
          download
          className="text-sm font-medium text-olive underline transition-colors hover:text-olive-dark"
        >
          Download image
        </a>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className={`mt-8 ${cardClass}`}>
        <p className="text-base font-light text-gray">
          Turn this article into ready-to-post social content and a promo
          email — Instagram, Facebook, X, and a newsletter, all in Beth&apos;s
          voice, using the article&apos;s hero image.
        </p>
        {heroImageUrl && (
          <div className="relative mt-5 aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImageUrl}
              alt={articleTitle}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {error && (
          <p className="mt-5 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}
        <button
          onClick={() => generate(false)}
          disabled={generating}
          className="mt-6 w-full rounded-lg bg-sage px-6 py-4 text-base font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60 sm:w-auto"
        >
          {generating
            ? "Generating… this can take 1-2 minutes"
            : "✨ Generate social posts + email"}
        </button>
      </div>
    );
  }

  const emailHtml = buildEmailHtml(kit, heroImageUrl, articleTitle);
  const emailPlainText = buildEmailPlainText(kit);

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      {/* Instagram */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">Instagram</h2>
        <HeroThumbnail />
        <textarea
          readOnly
          value={kit.instagram.caption}
          rows={6}
          className={textAreaClass}
        />
        <p className="mt-3 rounded-xl bg-light px-4 py-3 text-sm font-light leading-relaxed text-olive">
          {kit.instagram.hashtags.join(" ")}
        </p>
        <div className="mt-4">
          <CopyButton id="instagram" text={instagramCopyText(kit)} />
        </div>
      </div>

      {/* Facebook */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">Facebook</h2>
        <HeroThumbnail />
        <textarea
          readOnly
          value={kit.facebook.post}
          rows={8}
          className={textAreaClass}
        />
        <div className="mt-4">
          <CopyButton id="facebook" text={kit.facebook.post} />
        </div>
      </div>

      {/* X */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">X</h2>
        <HeroThumbnail />
        <textarea
          readOnly
          value={kit.x.post}
          rows={4}
          className={textAreaClass}
        />
        <p className="mt-1 text-xs font-light text-gray">
          {kit.x.post.length} / 280 characters
        </p>
        <div className="mt-4">
          <CopyButton id="x" text={kit.x.post} />
        </div>
      </div>

      {/* Email */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">Email</h2>

        <div className="mt-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-dark">Subject</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                value={kit.email.subject}
                className="w-full rounded-xl border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark focus:outline-none"
              />
              <CopyButton id="subject" text={kit.email.subject} label="Copy" />
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-dark">
              Preheader
            </span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                value={kit.email.preheader}
                className="w-full rounded-xl border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark focus:outline-none"
              />
              <CopyButton id="preheader" text={kit.email.preheader} label="Copy" />
            </div>
          </div>
        </div>

        {/* Rendered preview */}
        <div className="mt-6 rounded-xl border border-light-2 p-4 sm:p-6">
          {heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt={articleTitle}
              className="mb-5 aspect-[16/9] w-full rounded-xl object-cover"
            />
          )}
          <p className="text-base font-light leading-relaxed text-dark">
            {kit.email.greeting}
          </p>
          {kit.email.blocks.map((block, i) => {
            switch (block.type) {
              case "h2":
                return (
                  <h3 key={i} className="mt-5 text-lg font-medium text-dark">
                    {block.text}
                  </h3>
                );
              case "p":
                return (
                  <p
                    key={i}
                    className="mt-4 text-base font-light leading-relaxed text-dark"
                  >
                    {block.text}
                  </p>
                );
              case "ul":
                return (
                  <ul
                    key={i}
                    className="mt-4 list-disc space-y-2 pl-6 text-base font-light leading-relaxed text-dark"
                  >
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
            }
          })}
          <div className="mt-6 text-center">
            <a
              href={articleUrl}
              target="_blank"
              className="inline-block rounded-lg bg-sage px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-olive-dark"
            >
              {kit.email.cta.label}
            </a>
          </div>
          <p className="mt-6 text-base font-light leading-relaxed text-dark">
            {kit.email.signoff}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <CopyButton id="email-html" text={emailHtml} label="Copy email HTML" />
          <CopyButton
            id="email-text"
            text={emailPlainText}
            label="Copy plain text"
          />
        </div>
      </div>

      {/* Regenerate */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => generate(true)}
          disabled={generating}
          className="w-full rounded-lg bg-white px-6 py-3.5 text-base font-medium text-olive ring-1 ring-olive/40 transition-colors hover:bg-olive/10 disabled:opacity-60 sm:w-auto"
        >
          {generating
            ? "Regenerating… this can take 1-2 minutes"
            : "↻ Regenerate"}
        </button>
      </div>
    </div>
  );
}

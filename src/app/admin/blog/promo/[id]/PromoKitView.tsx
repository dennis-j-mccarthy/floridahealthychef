"use client";
/* eslint-disable @next/next/no-img-element -- plain <img> is used inside the
   social-post mockups so they render pixel-exact without next/image wrappers */

import { useEffect, useRef, useState } from "react";
import type { InstagramVariant, PromoKitContent } from "@/lib/claude";
import type { BlogBlock } from "@/data/blog";

const SAGE = "#939d3c";
const LINK_BLUE = "#1877f2";

const BRAND_NAME = "Beautiful Foods by Beth";
const IG_HANDLE = "joyfulwellnesswithbeth";
const X_HANDLE = "@joyfulwellnessfl";
const LOGO_SRC = "/images/logo.png";

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
  subject: string,
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
<title>${escapeHtml(subject)}</title>
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

function buildEmailPlainText(kit: PromoKitContent, subject: string): string {
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
    `Subject: ${subject}`,
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

function instagramCopyText(variant: InstagramVariant): string {
  return `${variant.caption}\n\n${variant.hashtags.join(" ")}`;
}

/** Render post text with any URLs styled in link-blue. */
function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <span key={i} style={{ color: LINK_BLUE }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Inline SVG icons (stroke style)                                    */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.4 4.6a5.5 5.5 0 0 0-7.8 0L12 5.2l-.6-.6a5.5 5.5 0 1 0-7.8 7.8l.6.6L12 20.8l7.8-7.8.6-.6a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BookmarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function EllipsisIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function ThumbsUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ShareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="15 5 21 11 15 17" />
      <path d="M21 11H9a6 6 0 0 0-6 6v2" />
    </svg>
  );
}

function RepostIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function UploadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function VerifiedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="#1d9bf0" className={className} aria-hidden="true">
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Platform mockups                                                   */
/* ------------------------------------------------------------------ */

function Avatar({ size }: { size: number }) {
  return (
    <img
      src={LOGO_SRC}
      alt={BRAND_NAME}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-gray-200 bg-white object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function InstagramPreview({
  variant,
  heroImageUrl,
}: {
  variant: InstagramVariant;
  heroImageUrl: string;
}) {
  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-lg border border-gray-200 bg-white font-sans text-[#262626] shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Avatar size={36} />
        <span className="text-sm font-semibold lowercase">{IG_HANDLE}</span>
        <EllipsisIcon className="ml-auto h-5 w-5 text-[#262626]" />
      </div>
      {/* Hero image, square */}
      {heroImageUrl && (
        <img
          src={heroImageUrl}
          alt=""
          className="aspect-square w-full object-cover"
        />
      )}
      {/* Icon row */}
      <div className="flex items-center gap-4 px-3 pt-3">
        <HeartIcon className="h-6 w-6" />
        <CommentIcon className="h-6 w-6" />
        <SendIcon className="h-6 w-6" />
        <BookmarkIcon className="ml-auto h-6 w-6" />
      </div>
      {/* Likes */}
      <p className="px-3 pt-2 text-sm font-semibold">128 likes</p>
      {/* Caption */}
      <div className="px-3 pt-1 text-sm leading-snug">
        <span className="whitespace-pre-line">
          <span className="font-semibold lowercase">{IG_HANDLE}</span>{" "}
          {variant.caption}
        </span>
        <p className="mt-1" style={{ color: LINK_BLUE }}>
          {variant.hashtags.join(" ")}
        </p>
      </div>
      <p className="px-3 pt-1.5 text-sm text-gray-400">View all 12 comments</p>
      <p className="px-3 pb-3 pt-1 text-[10px] uppercase tracking-wide text-gray-400">
        2 hours ago
      </p>
    </div>
  );
}

function FacebookPreview({
  post,
  heroImageUrl,
}: {
  post: string;
  heroImageUrl: string;
}) {
  return (
    <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white font-sans text-[#050505] shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3">
        <Avatar size={40} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight">
            {BRAND_NAME}
          </p>
          <p className="flex items-center gap-1 text-[13px] leading-tight text-gray-500">
            2h · <GlobeIcon className="h-3 w-3" />
          </p>
        </div>
        <EllipsisIcon className="ml-auto h-5 w-5 text-gray-500" />
      </div>
      {/* Post text */}
      <p className="whitespace-pre-line px-4 py-3 text-[15px] leading-normal">
        <TextWithLinks text={post} />
      </p>
      {/* Hero image edge-to-edge */}
      {heroImageUrl && (
        <img src={heroImageUrl} alt="" className="w-full object-cover" />
      )}
      {/* Divider + actions */}
      <div className="mx-4 border-t border-gray-200" />
      <div className="flex items-center justify-around px-4 py-1.5 text-gray-500">
        <span className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium">
          <ThumbsUpIcon className="h-5 w-5" /> Like
        </span>
        <span className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium">
          <CommentIcon className="h-5 w-5" /> Comment
        </span>
        <span className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium">
          <ShareIcon className="h-5 w-5" /> Share
        </span>
      </div>
    </div>
  );
}

function XPreview({
  post,
  heroImageUrl,
}: {
  post: string;
  heroImageUrl: string;
}) {
  return (
    <div className="w-full max-w-[500px] rounded-xl border border-gray-200 bg-white p-4 font-sans text-[#0f1419] shadow-sm">
      <div className="flex gap-3">
        <Avatar size={40} />
        <div className="min-w-0 flex-1">
          {/* Header */}
          <p className="flex flex-wrap items-center gap-1 text-[15px] leading-tight">
            <span className="font-bold">{BRAND_NAME}</span>
            <VerifiedIcon className="h-[18px] w-[18px]" />
            <span className="text-gray-500">{X_HANDLE} · 2h</span>
          </p>
          {/* Tweet text */}
          <p className="mt-0.5 whitespace-pre-line text-[15px] leading-normal">
            <TextWithLinks text={post} />
          </p>
          {/* Hero image */}
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt=""
              className="mt-3 aspect-[16/9] w-full rounded-2xl border border-gray-200 object-cover"
            />
          )}
          {/* Icon row */}
          <div className="mt-3 flex items-center justify-between pr-6 text-[13px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <CommentIcon className="h-[18px] w-[18px]" /> 4
            </span>
            <span className="flex items-center gap-1.5">
              <RepostIcon className="h-[18px] w-[18px]" /> 11
            </span>
            <span className="flex items-center gap-1.5">
              <HeartIcon className="h-[18px] w-[18px]" /> 52
            </span>
            <span className="flex items-center gap-1.5">
              <ChartIcon className="h-[18px] w-[18px]" /> 2.1K
            </span>
            <span className="flex items-center gap-1.5">
              <UploadIcon className="h-[18px] w-[18px]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main view                                                          */
/* ------------------------------------------------------------------ */

const cardClass = "rounded-2xl bg-white p-6 shadow-sm sm:p-8";

type PlatformKey = "instagram" | "facebook" | "x" | "email";

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
  const [selected, setSelected] = useState<Record<PlatformKey, number>>({
    instagram: 0,
    facebook: 0,
    x: 0,
    email: 0,
  });
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
      setSelected({ instagram: 0, facebook: 0, x: 0, email: 0 });
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

  function OptionTabs({
    platform,
    count,
  }: {
    platform: PlatformKey;
    count: number;
  }) {
    if (count <= 1) return null;
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            onClick={() => setSelected((prev) => ({ ...prev, [platform]: i }))}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeIndex(platform, count) === i
                ? "bg-sage text-white"
                : "bg-light text-gray hover:bg-light-2"
            }`}
          >
            Option {i + 1}
          </button>
        ))}
      </div>
    );
  }

  function activeIndex(platform: PlatformKey, count: number): number {
    return Math.min(selected[platform], Math.max(count - 1, 0));
  }

  function DownloadImageLink() {
    if (!heroImageUrl) return null;
    return (
      <a
        href={heroImageUrl}
        download
        className="text-sm font-medium text-olive underline transition-colors hover:text-olive-dark"
      >
        Download image
      </a>
    );
  }

  if (!kit) {
    return (
      <div className={`mt-8 ${cardClass}`}>
        <p className="text-base font-light text-gray">
          Turn this article into ready-to-post social content and a promo
          email — Instagram, Facebook, X, and a newsletter, all in Beth&apos;s
          voice, using the article&apos;s hero image. You&apos;ll get three
          variant options per platform, each with a different angle.
        </p>
        {heroImageUrl && (
          <div className="relative mt-5 aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl">
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

  const igIndex = activeIndex("instagram", kit.instagram.length);
  const fbIndex = activeIndex("facebook", kit.facebook.length);
  const xIndex = activeIndex("x", kit.x.length);
  const emailIndex = activeIndex("email", kit.email.subjects.length);

  const igVariant = kit.instagram[igIndex];
  const fbVariant = kit.facebook[fbIndex];
  const xVariant = kit.x[xIndex];
  const emailSubject = kit.email.subjects[emailIndex];

  const emailHtml = buildEmailHtml(kit, emailSubject, heroImageUrl, articleTitle);
  const emailPlainText = buildEmailPlainText(kit, emailSubject);

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
        <OptionTabs platform="instagram" count={kit.instagram.length} />
        <div className="mt-5">
          <InstagramPreview variant={igVariant} heroImageUrl={heroImageUrl} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <CopyButton
            id={`instagram-${igIndex}`}
            text={instagramCopyText(igVariant)}
          />
          <DownloadImageLink />
        </div>
      </div>

      {/* Facebook */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">Facebook</h2>
        <OptionTabs platform="facebook" count={kit.facebook.length} />
        <div className="mt-5">
          <FacebookPreview post={fbVariant.post} heroImageUrl={heroImageUrl} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <CopyButton id={`facebook-${fbIndex}`} text={fbVariant.post} />
          <DownloadImageLink />
        </div>
      </div>

      {/* X */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">X</h2>
        <OptionTabs platform="x" count={kit.x.length} />
        <div className="mt-5">
          <XPreview post={xVariant.post} heroImageUrl={heroImageUrl} />
        </div>
        <p className="mt-2 text-xs font-light text-gray">
          {xVariant.post.length} / 280 characters
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <CopyButton id={`x-${xIndex}`} text={xVariant.post} />
          <DownloadImageLink />
        </div>
      </div>

      {/* Email */}
      <div className={cardClass}>
        <h2 className="text-xl font-medium text-dark">Email</h2>

        <div className="mt-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-dark">Subject</span>
            <OptionTabs platform="email" count={kit.email.subjects.length} />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                value={emailSubject}
                className="w-full rounded-xl border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark focus:outline-none"
              />
              <CopyButton id={`subject-${emailIndex}`} text={emailSubject} label="Copy" />
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
          <CopyButton
            id={`email-html-${emailIndex}`}
            text={emailHtml}
            label="Copy email HTML"
          />
          <CopyButton
            id={`email-text-${emailIndex}`}
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

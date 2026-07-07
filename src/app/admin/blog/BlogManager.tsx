"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type AdminPost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  published: boolean;
  starred: boolean;
  newsletteredAt: string | null;
  updatedAt: string;
  body: string; // JSON blocks
};

type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function parseBlocks(body: string): BodyBlock[] {
  try {
    const parsed = JSON.parse(body);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ArticlePreview({ post }: { post: AdminPost }) {
  const blocks = parseBlocks(post.body);
  return (
    <div className="mt-4 border-t border-light-2 pt-4">
      <div className="relative mb-4 aspect-[2/1] w-full max-w-md overflow-hidden rounded-xl">
        <Image src={post.image} alt="" fill sizes="448px" className="object-cover" />
      </div>
      {blocks.length === 0 ? (
        <p className="text-sm font-light italic text-gray">
          This article has no body content yet.
        </p>
      ) : (
        <div className="max-w-2xl space-y-3">
          {blocks.map((b, i) =>
            b.type === "h2" ? (
              <h3
                key={i}
                className="pt-2 text-[1em] font-semibold text-dark"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {b.text}
              </h3>
            ) : b.type === "ul" ? (
              <ul key={i} className="list-disc space-y-1 pl-5 text-sm font-light text-gray">
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i} className="text-sm font-light leading-relaxed text-gray">
                {b.text}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
}

/* Small inline icon set (stroke style, currentColor) */
const icons = {
  star: (filled: boolean) => (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.5c.16-.4.88-.4 1.04 0l2.1 5.06 5.46.44c.44.03.62.58.28.86l-4.16 3.56 1.27 5.33c.1.43-.36.77-.74.54L12 16.44l-4.68 2.85c-.38.23-.85-.11-.74-.54l1.27-5.33-4.16-3.56c-.34-.29-.16-.83.28-.86l5.46-.44 2.05-5.06Z"
      />
    </svg>
  ),
  pencil: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.86 4.49 1.65-1.65a1.88 1.88 0 1 1 2.65 2.65L7.5 19.14l-4.5 1.36 1.36-4.5L16.86 4.49Zm0 0 2.65 2.65"
      />
    </svg>
  ),
  megaphone: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.34 15.84a24 24 0 0 1-5.1-.4A2.25 2.25 0 0 1 3.5 13.2v-2.4a2.25 2.25 0 0 1 1.74-2.24 24 24 0 0 1 15.1-4.2c.34.02.66.2.85.5.55.87.86 3.6.86 7.14s-.31 6.27-.86 7.14a1.1 1.1 0 0 1-.85.5 24 24 0 0 1-5.55-.7m-4.45-2.1 1.02 4.6a1.13 1.13 0 0 1-2.2.48l-1.28-5.48m2.46.4c-.83-.06-1.65-.2-2.46-.4"
      />
    </svg>
  ),
  eye: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.04 12.32a1.01 1.01 0 0 1 0-.64C3.42 7.51 7.36 4.5 12 4.5s8.57 3 9.96 7.18c.07.21.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5s-8.57-3-9.96-7.18Z"
      />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17-1.06 13.83A2.25 2.25 0 0 1 15.92 21.7H8.08a2.25 2.25 0 0 1-2.25-2.08L4.77 5.79m14.46 0a48 48 0 0 0-3.48-.4m-12 .57c.34-.06.68-.12 1.02-.17m0 0a48 48 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a52 52 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a49 49 0 0 0-7.5 0"
      />
    </svg>
  ),
  paperPlane: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12 3.27 3.13c6.55 1.9 12.7 4.9 18.23 8.87a48.6 48.6 0 0 1-18.23 8.87L6 12Zm0 0h7.5"
      />
    </svg>
  ),
  chevron: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  globe: (filled: boolean) => (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="9" />
      <path
        stroke={filled ? "white" : "currentColor"}
        strokeLinecap="round"
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 0 1 0 18M12 3a15.3 15.3 0 0 0 0 18"
      />
    </svg>
  ),
};

export default function BlogManager({
  initialPosts,
}: {
  initialPosts: AdminPost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null); // one accordion at a time
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const starredCount = posts.filter((p) => p.starred).length;

  async function patchPost(post: AdminPost, patch: Partial<AdminPost>) {
    setBusyId(post.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not update the article.");
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, ...patch, updatedAt: data.post.updatedAt }
            : p
        )
      );
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function markNewsletterSent() {
    if (
      !window.confirm(
        `Mark the ${starredCount} starred article${starredCount === 1 ? "" : "s"} as featured in the newsletter? They'll be unstarred.`
      )
    ) {
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/newsletter-sent", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not update the starred articles.");
        return;
      }
      const now = new Date().toISOString();
      setPosts((prev) =>
        prev.map((p) =>
          p.starred ? { ...p, starred: false, newsletteredAt: now } : p
        )
      );
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function deletePost(post: AdminPost) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(post.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not delete the article.");
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50";

  return (
    <div className="mt-8">
      {error && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      {/* Newsletter queue bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-light text-gray">
          <span className="text-amber-500">{icons.star(starredCount > 0)}</span>
          {starredCount === 0
            ? "Star articles to queue them for the next newsletter."
            : `${starredCount} article${starredCount === 1 ? "" : "s"} starred for the next newsletter.`}
        </p>
        {starredCount > 0 && (
          <button
            onClick={markNewsletterSent}
            disabled={sending}
            className="flex items-center gap-2 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
          >
            {icons.paperPlane}
            {sending ? "Updating…" : "Newsletter sent — mark as used"}
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-light text-gray">
            No articles yet — create one or generate a draft with Claude.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div
                className="flex cursor-pointer items-start gap-4"
                role="button"
                aria-expanded={openId === post.id}
                onClick={() =>
                  setOpenId((cur) => (cur === post.id ? null : post.id))
                }
              >
                {/* Expand/collapse control */}
                <span
                  aria-hidden="true"
                  className={`mt-5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-light text-gray transition-transform duration-200 ${
                    openId === post.id ? "rotate-180" : ""
                  }`}
                >
                  {icons.chevron}
                </span>

                {/* Thumbnail */}
                <div className="relative h-16 w-20 flex-none overflow-hidden rounded-lg bg-light-2">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[1rem] font-medium text-dark">
                      {post.title}
                    </h2>
                    {!post.published && (
                      <span className="rounded-full bg-gray/10 px-2 py-0.5 text-[11px] text-gray">
                        Draft
                      </span>
                    )}
                    {post.newsletteredAt && (
                      <span
                        className="rounded-full bg-sage/15 px-2 py-0.5 text-[11px] text-olive"
                        title={`Featured in the newsletter on ${formatDay(post.newsletteredAt)}`}
                      >
                        In newsletter {formatDay(post.newsletteredAt)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-light text-gray">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      {post.category}
                    </span>
                    <span>Updated {formatDate(post.updatedAt)}</span>
                  </p>
                </div>

                {/* Star + action icons */}
                <div
                  className="flex flex-none items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => patchPost(post, { starred: !post.starred })}
                    disabled={busyId === post.id}
                    aria-label={
                      post.starred
                        ? "Remove from next newsletter"
                        : "Star for next newsletter"
                    }
                    title={
                      post.starred
                        ? "Queued for next newsletter — click to unstar"
                        : "Star for next newsletter"
                    }
                    className={`${iconBtn} ${
                      post.starred
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-gray-light hover:bg-light hover:text-amber-500"
                    }`}
                  >
                    {icons.star(post.starred)}
                  </button>
                  <button
                    onClick={() =>
                      patchPost(post, { published: !post.published })
                    }
                    disabled={busyId === post.id}
                    aria-label={
                      post.published
                        ? "Published — click to unpublish"
                        : "Draft — click to publish"
                    }
                    title={
                      post.published
                        ? "Published — click to unpublish"
                        : "Draft — click to publish"
                    }
                    className={`${iconBtn} ${
                      post.published
                        ? "text-olive hover:bg-olive/10"
                        : "text-gray-light hover:bg-light hover:text-olive"
                    }`}
                  >
                    {icons.globe(post.published)}
                  </button>
                  <Link
                    href={`/admin/blog/edit/${post.id}`}
                    aria-label="Edit article"
                    title="Edit"
                    className={`${iconBtn} text-olive hover:bg-olive/10`}
                  >
                    {icons.pencil}
                  </Link>
                  <Link
                    href={`/admin/blog/promo/${post.id}`}
                    aria-label="Promo kit"
                    title="Promo kit"
                    className={`${iconBtn} text-sage hover:bg-sage/10`}
                  >
                    {icons.megaphone}
                  </Link>
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      aria-label="View on site"
                      title="View on site"
                      className={`${iconBtn} text-gray hover:bg-light`}
                    >
                      {icons.eye}
                    </Link>
                  )}
                  <button
                    onClick={() => deletePost(post)}
                    disabled={busyId === post.id}
                    aria-label="Delete article"
                    title="Delete"
                    className={`${iconBtn} text-primary hover:bg-primary/10`}
                  >
                    {icons.trash}
                  </button>
                </div>
              </div>

              {openId === post.id && <ArticlePreview post={post} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

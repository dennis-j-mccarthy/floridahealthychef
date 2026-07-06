"use client";

import { useState } from "react";
import Link from "next/link";

type AdminPost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  updatedAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BlogManager({
  initialPosts,
}: {
  initialPosts: AdminPost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function togglePublished(post: AdminPost) {
    setBusyId(post.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not update the article.");
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, published: !post.published, updatedAt: data.post.updatedAt }
            : p
        )
      );
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function deletePost(post: AdminPost) {
    if (
      !window.confirm(
        `Delete "${post.title}"? This cannot be undone.`
      )
    ) {
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

  return (
    <div className="mt-8">
      {error && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-light text-gray">
            No articles yet — create one or generate a draft with Claude.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-medium text-dark">
                      {post.title}
                    </h2>
                    {!post.published && (
                      <span className="rounded-full bg-gray/10 px-3 py-0.5 text-xs text-gray">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-light text-gray">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                      {post.category}
                    </span>
                    <span className="ml-3">
                      Updated {formatDate(post.updatedAt)}
                    </span>
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-light text-gray">
                  <input
                    type="checkbox"
                    checked={post.published}
                    disabled={busyId === post.id}
                    onChange={() => togglePublished(post)}
                    className="h-5 w-5 accent-olive"
                  />
                  Published
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/admin/blog/edit/${post.id}`}
                  className="rounded-lg bg-olive px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-olive-dark"
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/blog/promo/${post.id}`}
                  className="rounded-lg bg-sage px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-olive-dark"
                >
                  Promo
                </Link>
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="rounded-lg bg-light-2 px-5 py-2.5 text-center text-sm font-medium text-dark transition-colors hover:bg-primary/10"
                  >
                    View
                  </Link>
                )}
                <button
                  onClick={() => deletePost(post)}
                  disabled={busyId === post.id}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

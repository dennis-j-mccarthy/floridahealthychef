"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type BlogListPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
};

export default function BlogList({ posts }: { posts: BlogListPost[] }) {
  const [active, setActive] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  const filtered =
    active === "All"
      ? posts
      : posts.filter((post) => post.category === active);

  return (
    <div className="mx-auto max-w-4xl px-6">
      {/* Category Filter */}
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-primary text-white"
                : "bg-light-2 text-dark hover:bg-primary/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Posts */}
      <div className="space-y-12">
        {filtered.map((post) => (
          <article
            key={post.slug}
            className="group overflow-hidden rounded-2xl bg-light transition-shadow hover:shadow-md"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="grid md:grid-cols-[2fr_3fr]"
            >
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-light text-primary">
                  {post.category}
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-dark transition-colors group-hover:text-olive">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm font-light leading-relaxed text-gray">
                  {post.excerpt}
                </p>
                <div className="mt-4">
                  <span className="text-sm font-light text-primary">
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-sm font-light text-gray">
          No articles in this category yet. Check back soon!
        </p>
      )}
    </div>
  );
}

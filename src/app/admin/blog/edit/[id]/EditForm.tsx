"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogCategories } from "@/data/blog";
import { slugify, textToBlocks } from "../../blocks";

export type EditablePost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image: string;
  published: boolean;
  bodyText: string;
};

const CUSTOM_CATEGORY = "__custom__";

const inputClass =
  "w-full rounded-xl border border-light-2 bg-white px-4 py-3 text-base font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-dark";

export default function EditForm({
  initial,
  categories,
}: {
  initial: EditablePost | null;
  categories: string[];
}) {
  const router = useRouter();
  const allCategories = Array.from(
    new Set([...blogCategories, ...categories])
  );

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const initialIsKnownCategory =
    !initial || allCategories.includes(initial.category);
  const [category, setCategory] = useState(
    initial && initialIsKnownCategory
      ? initial.category
      : initial
        ? CUSTOM_CATEGORY
        : allCategories[0] ?? CUSTOM_CATEGORY
  );
  const [customCategory, setCustomCategory] = useState(
    initial && !initialIsKnownCategory ? initial.category : ""
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [bodyText, setBodyText] = useState(initial?.bodyText ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Image upload failed.");
        return;
      }
      setImage(data.path);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSave() {
    setError("");
    const finalCategory =
      category === CUSTOM_CATEGORY ? customCategory.trim() : category;
    if (!title.trim()) return setError("Title is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (!finalCategory) return setError("Category is required.");

    const blocks = textToBlocks(bodyText);
    if (blocks.length === 0) {
      return setError("The article body cannot be empty.");
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category: finalCategory,
        excerpt: excerpt.trim(),
        image,
        published,
        body: blocks,
      };
      const res = await fetch(
        initial ? `/api/admin/blog/${initial.id}` : "/api/admin/blog",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save the article.");
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Five Superfoods Growing in Southwest Florida"
            className={`mt-2 ${inputClass}`}
          />
        </div>

        {/* Slug */}
        <div>
          <label className={labelClass} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="five-superfoods-growing-in-southwest-florida"
            className={`mt-2 ${inputClass} font-mono text-sm`}
          />
          <p className="mt-1 text-xs font-light text-gray">
            The article&apos;s URL: /blog/{slug || "…"}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`mt-2 ${inputClass}`}
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value={CUSTOM_CATEGORY}>Other (type your own)…</option>
          </select>
          {category === CUSTOM_CATEGORY && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="New category name"
              className={`mt-3 ${inputClass}`}
            />
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className={labelClass} htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="A short teaser shown on the blog listing page…"
            className={`mt-2 ${inputClass}`}
          />
        </div>

        {/* Hero image */}
        <div>
          <span className={labelClass}>Hero Image</span>
          {image && (
            <div className="relative mt-3 aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl">
              <Image src={image} alt="Hero preview" fill className="object-cover" />
            </div>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => onFileChange(e.target.files?.[0])}
              className="text-sm font-light text-gray file:mr-4 file:rounded-lg file:border-0 file:bg-olive file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-olive-dark"
            />
            {uploading && (
              <span className="text-sm font-light text-gray">Uploading…</span>
            )}
          </div>
          <p className="mt-1 text-xs font-light text-gray">
            {image
              ? `Current: ${image} — upload a new file to replace it.`
              : "Upload a JPEG, PNG, GIF, or WebP (max 10 MB)."}
          </p>
        </div>

        {/* Body */}
        <div>
          <label className={labelClass} htmlFor="body">
            Article Body
          </label>
          <p className="mt-1 text-xs font-light text-gray">
            Start a line with <code className="rounded bg-light px-1">## </code>{" "}
            for a section heading, <code className="rounded bg-light px-1">- </code>{" "}
            for a bullet point, and separate paragraphs with a blank line.
          </p>
          <textarea
            id="body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={20}
            placeholder={
              "An opening paragraph…\n\n## A Section Heading\n\nAnother paragraph…\n\n- First bullet point\n- Second bullet point"
            }
            className={`mt-3 ${inputClass} font-mono text-sm leading-relaxed`}
          />
        </div>

        {/* Published */}
        <label className="flex cursor-pointer items-center gap-3 text-base font-light text-dark">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-5 w-5 accent-olive"
          />
          Published (visible on the public blog)
        </label>

        {error && (
          <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onSave}
            disabled={saving || uploading}
            className="w-full rounded-lg bg-olive px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving…" : initial ? "Save Changes" : "Create Article"}
          </button>
          <button
            onClick={() => router.push("/admin/blog")}
            disabled={saving}
            className="w-full rounded-lg bg-light-2 px-6 py-3.5 text-base font-medium text-dark transition-colors hover:bg-primary/10 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

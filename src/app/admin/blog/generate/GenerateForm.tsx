"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-light-2 bg-white px-4 py-3 text-base font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-dark";

const BULLET_PLACEHOLDERS = [
  "e.g. Why seasonal produce tastes better and costs less",
  "e.g. Three vegetables at their peak right now in SWFL",
  "e.g. A simple weeknight way to prepare them",
  "e.g. How a personal chef takes the work off your plate",
];

export default function GenerateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bullets, setBullets] = useState(["", "", "", ""]);
  const [preview, setPreview] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function setBullet(index: number, value: string) {
    setBullets((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  function onFileChange(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onGenerate() {
    setError("");
    if (!title.trim()) return setError("Article title is required.");
    if (bullets.some((b) => !b.trim())) {
      return setError("Please fill in all four bullet points.");
    }

    setGenerating(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      bullets.forEach((b, i) => form.append(`bullet${i + 1}`, b.trim()));
      const file = fileRef.current?.files?.[0];
      if (file) form.append("image", file);

      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Article generation failed.");
        return;
      }
      // Draft saved — send the admin to the editor to review and publish.
      router.push(`/admin/blog/edit/${data.id}?created=1`);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className={labelClass} htmlFor="gen-title">
            Article Title
          </label>
          <input
            id="gen-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Eating with the Seasons in Southwest Florida"
            className={`mt-2 ${inputClass}`}
          />
        </div>

        {/* Bullets */}
        <div>
          <span className={labelClass}>Four Key Points</span>
          <p className="mt-1 text-xs font-light text-gray">
            Claude will build the article around these four ideas.
          </p>
          <div className="mt-3 space-y-3">
            {bullets.map((bullet, i) => (
              <input
                key={i}
                type="text"
                value={bullet}
                onChange={(e) => setBullet(i, e.target.value)}
                placeholder={BULLET_PLACEHOLDERS[i]}
                className={inputClass}
                aria-label={`Key point ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Optional image */}
        <div>
          <span className={labelClass}>Photo (optional)</span>
          <p className="mt-1 text-xs font-light text-gray">
            Upload a photo and Claude will reference it in the article. It
            also becomes the article&apos;s hero image.
          </p>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Photo preview"
              className="mt-3 aspect-[16/9] w-full max-w-md rounded-xl object-cover"
            />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => onFileChange(e.target.files?.[0])}
            className="mt-3 text-sm font-light text-gray file:mr-4 file:rounded-lg file:border-0 file:bg-olive file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-olive-dark"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        <button
          onClick={onGenerate}
          disabled={generating}
          className="w-full rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
        >
          {generating ? "Generating… this can take a minute" : "✨ Generate Draft"}
        </button>
      </div>
    </div>
  );
}

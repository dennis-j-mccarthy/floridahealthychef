"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tone = {
  voice: string;
  audience: string;
  style: string;
  dos: string;
  donts: string;
};

const inputClass =
  "w-full rounded-xl border border-light-2 bg-white px-4 py-3 text-base font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-dark";

const TONE_FIELDS: { key: keyof Tone; label: string; hint: string; rows: number }[] = [
  { key: "voice", label: "Voice", hint: "The personality and tone of the writing.", rows: 2 },
  { key: "audience", label: "Audience", hint: "Who you're writing for.", rows: 2 },
  { key: "style", label: "Style", hint: "Structure, pacing, and what to emphasize.", rows: 2 },
  { key: "dos", label: "Do's", hint: "One guideline per line.", rows: 3 },
  { key: "donts", label: "Don'ts", hint: "One guideline per line.", rows: 2 },
];

export default function IdeasForm({ initialTone }: { initialTone: Tone }) {
  const router = useRouter();
  const [tone, setTone] = useState<Tone>(initialTone);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);

  const [savingTone, setSavingTone] = useState(false);
  const [toneSaved, setToneSaved] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [writingTitle, setWritingTitle] = useState<string | null>(null);

  function setToneField(key: keyof Tone, value: string) {
    setTone((prev) => ({ ...prev, [key]: value }));
    setToneSaved(false);
  }

  async function saveTone() {
    setSavingTone(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/tone", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tone),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not save the tone.");
        return;
      }
      setTone(data.tone as Tone);
      setToneSaved(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSavingTone(false);
    }
  }

  async function generateTitles() {
    setGenerating(true);
    setError("");
    setTitles([]);
    try {
      const res = await fetch("/api/admin/blog/titles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tone, topic: topic.trim() || undefined, count }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Title generation failed.");
        return;
      }
      setTitles(data.titles as string[]);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function writePost(title: string) {
    setWritingTitle(title);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/write", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tone, title }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not write the article.");
        setWritingTitle(null);
        return;
      }
      // Draft saved — send the admin to the editor to review and publish.
      router.push(`/admin/blog/edit/${data.id}?created=1`);
    } catch {
      setError("Could not reach the server. Please try again.");
      setWritingTitle(null);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Tone panel */}
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-dark">Tone</h2>
            <p className="text-xs font-light text-gray">
              Shapes the voice of every title and draft below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {toneSaved && (
              <span className="text-xs font-medium text-olive">Saved ✓</span>
            )}
            <button
              onClick={saveTone}
              disabled={savingTone}
              className="rounded-lg border border-light-2 px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-light disabled:opacity-60"
            >
              {savingTone ? "Saving…" : "Save tone"}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {TONE_FIELDS.map((f) => (
            <div key={f.key}>
              <label className={labelClass} htmlFor={`tone-${f.key}`}>
                {f.label}
              </label>
              <p className="mt-0.5 text-xs font-light text-gray">{f.hint}</p>
              <textarea
                id={`tone-${f.key}`}
                rows={f.rows}
                value={tone[f.key]}
                onChange={(e) => setToneField(f.key, e.target.value)}
                className={`mt-2 resize-y ${inputClass}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Title generator */}
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-dark">Brainstorm titles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={labelClass} htmlFor="ideas-topic">
              Topic or theme (optional)
            </label>
            <input
              id="ideas-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. anti-inflammatory meals for the summer heat"
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <span className={labelClass}>How many</span>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                className="h-11 w-11 rounded-lg border border-light-2 text-lg text-dark transition-colors hover:bg-light"
                aria-label="Fewer titles"
              >
                −
              </button>
              <span className="w-8 text-center text-base font-medium text-dark">
                {count}
              </span>
              <button
                type="button"
                onClick={() => setCount((c) => Math.min(10, c + 1))}
                className="h-11 w-11 rounded-lg border border-light-2 text-lg text-dark transition-colors hover:bg-light"
                aria-label="More titles"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={generateTitles}
          disabled={generating}
          className="mt-5 w-full rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
        >
          {generating ? "Thinking…" : "✨ Generate titles"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        {titles.length > 0 && (
          <ul className="mt-6 space-y-3">
            {titles.map((title) => (
              <li
                key={title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-light px-4 py-3"
              >
                <span className="text-sm font-medium text-dark">{title}</span>
                <button
                  onClick={() => writePost(title)}
                  disabled={writingTitle !== null}
                  className="shrink-0 rounded-lg bg-olive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
                >
                  {writingTitle === title ? "Writing…" : "Write this →"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

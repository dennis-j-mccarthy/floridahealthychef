"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, isAuthError, PasscodeForm, useAdminPasscode } from "@/components/PasscodeGate";
import { PillarsEditor } from "@/components/PillarsEditor";
import type { BlogTone } from "@/lib/blogTone";

/*
  /creator/essence — the Throughline "Essence" page for Built with AI.

    · the one line, big at the top
    · purpose + promise
    · Do / Don't as editable chips
    · three voice sliders (Playful ↔ Serious, Formal ↔ Casual, Bold ↔ Gentle)
    · the tone brief (moved here from the blog generator)
    · the pillars — full CRUD (PillarsEditor.tsx → /api/admin/pillars)

  Every generator reads this through src/lib/brandContext.ts, so a change
  here changes the next title, post, caption, social draft and newsletter.
  Saves are debounced PUTs to /api/admin/essence; without a database the
  page shows the code defaults read-only.
*/

type Voice = { playful: number; formal: number; bold: number };
type Essence = {
  line: string;
  purpose: string;
  promise: string;
  doList: string[];
  dontList: string[];
  voice: Voice;
  tone: BlogTone | null;
  updatedAt: string | null;
  fromDb: boolean;
};

const EMPTY_TONE: BlogTone = { voice: "", audience: "", style: "", dos: "", donts: "" };

const PRESETS: { name: string; tone: BlogTone }[] = [
  {
    name: "Plain & bold",
    tone: {
      voice: "Confident, plain-spoken, a little bold. Short sentences welcome.",
      audience: "Small-business owners who aren't technical.",
      style: "~350–500 words, 2–3 subheads, one clear argument.",
      dos: "Concrete examples; talk owner-to-owner.",
      donts: "No hype words (revolutionary, game-changing, unlock, elevate); no jargon.",
    },
  },
  {
    name: "Warm & friendly",
    tone: {
      voice: "Warm, encouraging, conversational — like a helpful friend.",
      audience: "Local customers and first-time visitors.",
      style: "~400 words, short paragraphs, welcoming open and close.",
      dos: "Second person ('you'); reassuring, practical takeaways.",
      donts: "No pressure or salesy pushiness; no fear tactics.",
    },
  },
  {
    name: "Expert & precise",
    tone: {
      voice: "Authoritative and precise, but readable.",
      audience: "Prospects comparing options and doing their homework.",
      style: "~500–650 words, clear subheads, a specific claim per section.",
      dos: "Back claims with concrete detail; define terms simply.",
      donts: "No fluff; no vague superlatives.",
    },
  },
];

const FIELD =
  "w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-60";
const LABEL = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted";
const CARD = "rounded-2xl border-2 border-line bg-surface p-5";

/* ── editable chip list ── */
function ChipList({
  items,
  onChange,
  tone,
  placeholder,
  disabled,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  tone: "do" | "dont";
  placeholder: string;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState("");
  const cls =
    tone === "do"
      ? "border-sea/40 bg-sea-soft/50 text-sea"
      : "border-berry/40 bg-berry-soft/60 text-berry";
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <li key={`${i}:${it}`} className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-semibold ${cls}`}>
            <span>{it}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label={`Remove "${it}"`}
                className="opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted">Nothing yet.</li>}
      </ul>
      {!disabled && (
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input
            className={`${FIELD} py-2 text-sm`}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label={tone === "do" ? "Add a Do" : "Add a Don't"}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-xl border-2 border-line px-4 text-sm font-bold text-ink hover:border-accent disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}

/* ── one voice slider with end labels (Throughline .vz) ── */
function VoiceSlider({
  label,
  low,
  high,
  value,
  onChange,
  disabled,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const lowOn = value < 50;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
        <span className="font-mono text-xs text-muted">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full accent-accent"
        aria-label={`${low} to ${high}`}
      />
      <div className="mt-1 flex justify-between text-xs">
        <span className={lowOn ? "font-bold text-ink" : "text-muted"}>{low}</span>
        <span className={!lowOn ? "font-bold text-ink" : "text-muted"}>{high}</span>
      </div>
    </div>
  );
}

export function EssenceEditor() {
  const { passcode, hydrated, setPasscode, clearPasscode } = useAdminPasscode();
  const [ess, setEss] = useState<Essence | null>(null);
  const [db, setDb] = useState<boolean | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState<"" | "saving" | "saved" | "error">("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<Essence>>({});

  const onAuthError = useCallback(() => {
    clearPasscode();
    setMsg("Wrong passcode.");
  }, [clearPasscode]);

  useEffect(() => {
    if (!passcode) return;
    let cancelled = false;
    adminFetch<{ essence: Essence; db: boolean }>(passcode, "/api/admin/essence")
      .then((d) => {
        if (cancelled) return;
        setEss(d.essence);
        setDb(!!d.db);
      })
      .catch((e) => {
        if (cancelled) return;
        if (isAuthError(e)) return onAuthError();
        setMsg((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [passcode, onAuthError]);

  /** Optimistic local update + debounced server save of only the touched fields. */
  const patch = useCallback(
    (p: Partial<Essence>) => {
      setEss((cur) => (cur ? { ...cur, ...p, voice: { ...cur.voice, ...(p.voice ?? {}) } } : cur));
      if (!db) return;
      pending.current = { ...pending.current, ...p, ...(p.voice ? { voice: { ...(pending.current.voice ?? {}), ...p.voice } as Voice } : {}) };
      setSaving("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const body = pending.current;
        pending.current = {};
        try {
          const d = await adminFetch<{ essence: Essence }>(passcode, "/api/admin/essence", {
            method: "PUT",
            body: body as Record<string, unknown>,
          });
          // Keep server-normalised values (trimming, clamps) only for untouched fields.
          setEss((cur) => (cur ? { ...d.essence, ...cur, updatedAt: d.essence.updatedAt, fromDb: true } : d.essence));
          setSaving("saved");
          setTimeout(() => setSaving((s) => (s === "saved" ? "" : s)), 1500);
        } catch (e) {
          if (isAuthError(e)) return onAuthError();
          setSaving("error");
          setMsg((e as Error).message);
        }
      }, 700);
    },
    [db, passcode, onAuthError],
  );

  // Voice slider patches need the whole voice object so the server merge is simple.
  const setVoice = (k: keyof Voice, v: number) => {
    if (!ess) return;
    patch({ voice: { ...ess.voice, [k]: v } });
  };
  const tone: BlogTone = { ...EMPTY_TONE, ...(ess?.tone ?? {}) };
  const setTone = (p: Partial<BlogTone>) => patch({ tone: { ...tone, ...p } });

  if (!hydrated) return null;
  if (!passcode) {
    return <PasscodeForm prompt="Enter the admin passcode to open the Essence." msg={msg} onUnlock={setPasscode} />;
  }
  if (!ess) {
    return <p className="text-center text-muted">{msg || "Loading the essence…"}</p>;
  }

  const ro = db === false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* status strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          {ro ? (
            <>No database connected — showing the code defaults, read-only.</>
          ) : ess.fromDb ? (
            <>Saved to the database{ess.updatedAt ? ` · last change ${new Date(ess.updatedAt).toLocaleString()}` : ""}.</>
          ) : (
            <>Not saved yet — these are the code defaults. Edit anything to create the row.</>
          )}
        </span>
        <span className={`font-mono ${saving === "error" ? "text-berry" : saving === "saved" ? "text-sea" : ""}`}>
          {saving === "saving" ? "Saving…" : saving === "saved" ? "✓ Saved" : saving === "error" ? "Save failed" : ""}
        </span>
      </div>
      {msg && <p className="text-sm font-semibold text-berry">{msg}</p>}

      {/* the line */}
      <section className={`${CARD} border-accent/40 bg-accent-soft/30`}>
        <label className={LABEL}>The line</label>
        <input
          className="w-full bg-transparent text-3xl font-semibold tracking-tight text-ink placeholder:text-muted/40 focus:outline-none sm:text-4xl"
          value={ess.line}
          onChange={(e) => patch({ line: e.target.value })}
          placeholder="One sentence the whole brand stands on"
          disabled={ro}
          aria-label="Brand line"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Purpose</label>
            <textarea
              className={`${FIELD} min-h-[110px] resize-y text-sm`}
              value={ess.purpose}
              onChange={(e) => patch({ purpose: e.target.value })}
              placeholder="Why this exists"
              disabled={ro}
            />
          </div>
          <div>
            <label className={LABEL}>Promise</label>
            <textarea
              className={`${FIELD} min-h-[110px] resize-y text-sm`}
              value={ess.promise}
              onChange={(e) => patch({ promise: e.target.value })}
              placeholder="What every customer gets"
              disabled={ro}
            />
          </div>
        </div>
      </section>

      {/* do / don't */}
      <section className={CARD}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Do</h2>
            <p className="mb-3 text-sm text-muted">What the voice leans into.</p>
            <ChipList items={ess.doList} onChange={(v) => patch({ doList: v })} tone="do" placeholder="Add a do…" disabled={ro} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Don&rsquo;t</h2>
            <p className="mb-3 text-sm text-muted">What it never does.</p>
            <ChipList items={ess.dontList} onChange={(v) => patch({ dontList: v })} tone="dont" placeholder="Add a don't…" disabled={ro} />
          </div>
        </div>
      </section>

      {/* voice sliders */}
      <section className={CARD}>
        <h2 className="text-lg font-bold text-ink">Voice</h2>
        <p className="mb-4 text-sm text-muted">Three dials every generator reads. 50 is the middle.</p>
        <div className="grid gap-6 sm:grid-cols-3">
          <VoiceSlider label="Playful ↔ Serious" low="Serious" high="Playful" value={ess.voice.playful} onChange={(v) => setVoice("playful", v)} disabled={ro} />
          <VoiceSlider label="Formal ↔ Casual" low="Casual" high="Formal" value={ess.voice.formal} onChange={(v) => setVoice("formal", v)} disabled={ro} />
          <VoiceSlider label="Bold ↔ Gentle" low="Gentle" high="Bold" value={ess.voice.bold} onChange={(v) => setVoice("bold", v)} disabled={ro} />
        </div>
      </section>

      {/* tone brief */}
      <section className={CARD}>
        <h2 className="text-lg font-bold text-ink">Tone brief</h2>
        <p className="mt-1 text-sm text-muted">
          The written brief behind every title, post, caption and newsletter. (It used to live on the blog generator.)
        </p>
        {!ro && (
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => patch({ tone: p.tone })}
                className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-bold text-ink hover:border-accent hover:text-accent-strong"
              >
                {p.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => patch({ tone: null })}
              className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-bold text-muted hover:border-berry hover:text-berry"
            >
              Clear
            </button>
          </div>
        )}
        <div className="mt-4 space-y-4">
          <div>
            <label className={LABEL}>Voice</label>
            <input className={FIELD} placeholder="e.g. confident, plain-spoken, a little bold" value={tone.voice} onChange={(e) => setTone({ voice: e.target.value })} disabled={ro} />
          </div>
          <div>
            <label className={LABEL}>Audience</label>
            <input className={FIELD} placeholder="e.g. small-business owners who aren't technical" value={tone.audience} onChange={(e) => setTone({ audience: e.target.value })} disabled={ro} />
          </div>
          <div>
            <label className={LABEL}>Style</label>
            <input className={FIELD} placeholder="e.g. ~400 words, 2–3 subheads, one clear argument" value={tone.style} onChange={(e) => setTone({ style: e.target.value })} disabled={ro} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Do</label>
              <textarea className={`${FIELD} min-h-[72px] resize-y`} placeholder="lean into…" value={tone.dos} onChange={(e) => setTone({ dos: e.target.value })} disabled={ro} />
            </div>
            <div>
              <label className={LABEL}>Don&rsquo;t</label>
              <textarea className={`${FIELD} min-h-[72px] resize-y`} placeholder="avoid…" value={tone.donts} onChange={(e) => setTone({ donts: e.target.value })} disabled={ro} />
            </div>
          </div>
        </div>
      </section>

      {/* pillars (CRUD) */}
      <section className={CARD}>
        <PillarsEditor passcode={passcode} db={db} onAuthError={onAuthError} />
      </section>
    </div>
  );
}

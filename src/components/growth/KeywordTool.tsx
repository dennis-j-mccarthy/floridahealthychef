"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KIND_LABEL, type KeywordKind, type KeywordRow } from "@/lib/keywords";

/*
  Keyword tool (Growth → Search → Keywords): tiles and a word cloud.
  Cloud size = Search Console impressions when connected, else our priority
  score (0–100). The panel says which one it is using.
*/

type Suggestion = { phrase: string; kind: KeywordKind; priority: number; why: string };

const KIND_CLS: Record<KeywordKind, string> = {
  problem: "border-accent/50 bg-accent-soft text-accent-strong",
  service: "border-sea/40 bg-sea-soft text-sea",
  question: "border-sun/40 bg-sun-soft text-sun",
};

export function KeywordTool({
  initial,
  impressions,
  volumes,
}: {
  initial: KeywordRow[];
  impressions: Record<string, number> | null;
  volumes: Record<string, number> | null;
}) {
  const [rows, setRows] = useState<KeywordRow[]>(initial);
  const [filter, setFilter] = useState<KeywordKind | "all">("all");
  const [showDropped, setShowDropped] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [kind, setKind] = useState<KeywordKind>("service");
  const [focus, setFocus] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const sizeBy = impressions ? "Search Console impressions (last 28 days)" : "our priority score (0 to 100), not search volume";
  const visible = rows.filter((r) => (filter === "all" || r.kind === filter) && (showDropped || r.status !== "dropped"));

  const weight = (r: KeywordRow) => (impressions ? impressions[r.phrase.toLowerCase()] ?? 0 : r.priority);
  const cloud = useMemo(() => {
    const live = visible.filter((r) => r.status !== "dropped");
    const ws = live.map(weight);
    const max = Math.max(1, ...ws);
    const min = ws.length ? Math.min(...ws) : 0;
    // Stable scatter (hash of the phrase) so it reads as a cloud, not a list.
    const hash = (t: string) => [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    return live
      .map((r) => ({ r, w: weight(r) }))
      .sort((a, b) => hash(a.r.phrase) - hash(b.r.phrase))
      .map(({ r, w }) => ({ r, size: 12 + Math.round(Math.pow((w - min) / Math.max(1, max - min), 1.8) * 26) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, impressions]);

  async function call<T>(url: string, method: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const d = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new Error(d.error || `Failed (${res.status})`);
    return d;
  }

  async function add(p: string, k: KeywordKind, priority = 50, source = "manual") {
    setMsg("");
    try {
      const d = await call<{ keyword: KeywordRow }>("/api/admin/keywords", "POST", { phrase: p, kind: k, priority, source });
      setRows((rs) => [d.keyword, ...rs]);
      setSuggestions((ss) => ss.filter((s) => s.phrase !== p));
      return true;
    } catch (e) {
      setMsg((e as Error).message);
      return false;
    }
  }

  async function patch(id: string, p: Partial<KeywordRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
    try {
      await call(`/api/admin/keywords/${encodeURIComponent(id)}`, "PATCH", p);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function suggest() {
    setBusy("suggest");
    setMsg("");
    try {
      const d = await call<{ suggestions: Suggestion[] }>("/api/admin/keywords/suggest", "POST", { focus });
      setSuggestions(d.suggestions);
      if (!d.suggestions.length) setMsg("No new suggestions this time. Try a different focus.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  const filters: (KeywordKind | "all")[] = ["all", "service", "problem", "question"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold ${filter === f ? "border-transparent bg-accent text-accent-ink" : "border-line text-ink"}`}
          >
            {f === "all" ? "All" : KIND_LABEL[f]}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={showDropped} onChange={(e) => setShowDropped(e.target.checked)} /> Show dropped
        </label>
      </div>

      <section className="rounded-2xl border-2 border-line bg-surface p-5">
        <h2 className="text-lg font-bold text-ink">Word cloud</h2>
        <p className="mb-4 text-sm text-muted">Bigger words matter more. Sized by {sizeBy}.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 py-2">
          {cloud.map(({ r, size }) => (
            <span
              key={r.id}
              title={`${KIND_LABEL[r.kind]} · priority ${r.priority}`}
              style={{ fontSize: size, lineHeight: 1.15 }}
              className={`font-semibold ${r.kind === "problem" ? "text-accent-strong" : r.kind === "question" ? "text-sun" : "text-sea"}`}
            >
              {r.phrase}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-line bg-surface p-5">
        <h2 className="text-lg font-bold text-ink">Find new keywords and phrases</h2>
        <p className="mb-3 text-sm text-muted">Claude suggests phrases people type, from needs to towns to questions. Add the ones that fit. Nothing is saved until you add it.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="kw-focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Optional focus, e.g. dinner parties, gluten-free, Fort Myers"
            className="w-full rounded-xl border-2 border-line bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none sm:max-w-md"
          />
          <button type="button" onClick={() => void suggest()} disabled={busy === "suggest"} className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:opacity-50">
            {busy === "suggest" ? "Thinking…" : "Suggest phrases"}
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.phrase} className="flex items-start gap-3 rounded-xl border-2 border-line bg-paper p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{s.phrase}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {KIND_LABEL[s.kind]} · priority {s.priority}
                    {s.why ? ` · ${s.why}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => void add(s.phrase, s.kind, s.priority, "claude")} className="flex-none rounded-full border-2 border-accent px-3 py-1 text-xs font-bold text-accent-strong">
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="mt-4 flex flex-col gap-2 border-t-2 border-line pt-4 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (phrase.trim()) void add(phrase.trim(), kind).then((ok) => ok && setPhrase(""));
          }}
        >
          <input
            id="kw-add"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Add your own keyword or phrase"
            className="w-full rounded-xl border-2 border-line bg-paper px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none sm:max-w-md"
          />
          <select id="kw-kind" value={kind} onChange={(e) => setKind(e.target.value as KeywordKind)} className="rounded-xl border-2 border-line bg-paper px-3 py-2.5 text-sm text-ink">
            {(["service", "problem", "question"] as KeywordKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full border-2 border-line px-5 py-2.5 text-sm font-bold text-ink">
            Add keyword
          </button>
        </form>
        {msg && <p className="mt-3 text-sm font-semibold text-berry">{msg}</p>}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">
          Keywords <span className="text-sm font-normal text-muted">({visible.length})</span>
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => (
            <li key={r.id} className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${KIND_CLS[r.kind]} ${r.status === "dropped" ? "opacity-50" : ""}`}>
              <div>
                <p className="text-base font-bold leading-snug text-ink">{r.phrase}</p>
                <p className="mt-1 text-xs">
                  {KIND_LABEL[r.kind]} · priority {r.priority}
                  {impressions && impressions[r.phrase.toLowerCase()] !== undefined ? ` · ${impressions[r.phrase.toLowerCase()]} impressions` : ""}
                  {volumes && volumes[r.phrase.toLowerCase()] !== undefined ? ` · ${volumes[r.phrase.toLowerCase()]} searches/mo` : ""}
                </p>
                {r.note && <p className="mt-1 text-xs text-muted">{r.note}</p>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void patch(r.id, { status: r.status === "target" ? "idea" : "target" })}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${r.status === "target" ? "border-transparent bg-accent text-accent-ink" : "border-line bg-paper text-ink"}`}
                >
                  {r.status === "target" ? "Targeting" : "Target this"}
                </button>
                {r.landingSlug ? (
                    <Link href={`/for/${r.landingSlug}`} target="_blank" className="rounded-full border-2 border-line bg-paper px-3 py-1 text-xs font-bold text-ink">
                      View page
                    </Link>
                  ) : (
                    <Link href={`/admin/landing?keyword=${encodeURIComponent(r.phrase)}`} className="rounded-full border-2 border-line bg-paper px-3 py-1 text-xs font-bold text-ink">
                      Make landing page
                    </Link>
                )}
                <Link href={`/admin/blog/generate?title=${encodeURIComponent(r.phrase)}`} className="rounded-full border-2 border-line bg-paper px-3 py-1 text-xs font-bold text-ink">
                  Write article
                </Link>
                <button
                  type="button"
                  onClick={() => void patch(r.id, { status: r.status === "dropped" ? "idea" : "dropped" })}
                  className="rounded-full border-2 border-line bg-paper px-3 py-1 text-xs font-bold text-muted"
                >
                  {r.status === "dropped" ? "Restore" : "Drop"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

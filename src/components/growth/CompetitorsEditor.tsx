"use client";

import { useState } from "react";
import type { Competitor } from "@/lib/competitors";

/*
  The competitor list (Growth → Search → Competitors), entered by hand and
  saved whole to StudioSetting "competitors". Starts empty on purpose: we
  only list businesses someone has actually seen. "Checked" means someone
  has looked at their site and confirmed the notes.
*/

const FIELD = "w-full rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function CompetitorsEditor({ initial }: { initial: Competitor[] }) {
  const [list, setList] = useState<Competitor[]>(Array.isArray(initial) ? initial : []);
  const [draft, setDraft] = useState({ name: "", url: "", town: "", note: "" });
  const [msg, setMsg] = useState("");

  async function save(next: Competitor[]) {
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: "competitors", value: next }),
    }).catch(() => null);
    if (!res || !res.ok) {
      const d = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
      setMsg(d.error || "Couldn't save. Try again.");
      return false;
    }
    setList(next);
    return true;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    const url = draft.url.trim() && !/^https?:\/\//i.test(draft.url.trim()) ? `https://${draft.url.trim()}` : draft.url.trim();
    const c: Competitor = { id: `${Date.now().toString(36)}`, name: name.slice(0, 120), url: url.slice(0, 300), town: draft.town.trim().slice(0, 80), note: draft.note.trim().slice(0, 600), checked: false };
    if (await save([...list, c])) setDraft({ name: "", url: "", town: "", note: "" });
  }

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-line bg-paper p-5 text-sm text-ink">
          <p className="font-bold">No competitors added yet.</p>
          <p className="mt-1 text-muted">
            Add the personal chefs and small caterers you run into: the ones clients mention, and the ones that come up when you search
            “personal chef Naples” or “personal chef Bonita Springs” on your phone in town. Nothing here is filled in for you, so every
            line is something you have actually seen.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id} className="rounded-xl border-2 border-line bg-paper p-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <b className="text-base text-ink">{c.name}</b>
                {c.town && <span className="text-xs text-muted">{c.town}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.checked ? "bg-sea-soft text-sea" : "bg-sun-soft text-sun"}`}>
                  {c.checked ? "Checked" : "Check"}
                </span>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer" className="ml-auto text-xs font-bold text-accent-strong">
                    Visit site ↗
                  </a>
                )}
              </div>
              {c.note && <p className="mt-2 text-sm text-ink">{c.note}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => void save(list.map((x) => (x.id === c.id ? { ...x, checked: !x.checked } : x)))} className="rounded-full border-2 border-line px-3 py-1 text-xs font-bold text-ink">
                  {c.checked ? "Mark as not checked" : "Mark as checked"}
                </button>
                <button type="button" onClick={() => void save(list.filter((x) => x.id !== c.id))} className="rounded-full border-2 border-line px-3 py-1 text-xs font-bold text-berry">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={(e) => void add(e)} className="grid gap-2 rounded-xl border-2 border-line bg-surface p-4 sm:grid-cols-3">
        <input aria-label="Business name" placeholder="Business name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={FIELD} />
        <input aria-label="Website" placeholder="Website (optional)" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className={FIELD} />
        <input aria-label="Town" placeholder="Town (optional)" value={draft.town} onChange={(e) => setDraft({ ...draft, town: e.target.value })} className={FIELD} />
        <textarea aria-label="Notes" placeholder="What they offer, prices if shown, what their site does well" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className={`${FIELD} min-h-[60px] sm:col-span-2`} />
        <button type="submit" disabled={!draft.name.trim()} className="self-end rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:opacity-50">
          Add competitor
        </button>
      </form>
      {msg && <p className="text-sm font-semibold text-berry">{msg}</p>}
    </div>
  );
}

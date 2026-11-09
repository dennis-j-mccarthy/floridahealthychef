"use client";

import { useState } from "react";
import type { LandingSections } from "@/lib/landing";

type Faq = { q: string; a: string };
type Page = {
  slug: string; keyword: string; title: string; metaDescription: string; h1: string; intro: string; body: string;
  faq: Faq[]; heroImage: string | null; heroAlt: string | null; published: boolean; createdAt: string; updatedAt: string;
  sections: LandingSections | null;
};
type Kw = { phrase: string; kind: string; priority: number; landingSlug: string | null };
type Photo = { src: string; caption: string };

const FIELD = "w-full rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
const LABEL = "mb-1 block text-xs font-bold uppercase tracking-wide text-muted";

export function LandingClient({ initialPages, keywords, photos, preselect }: { initialPages: Page[]; keywords: Kw[]; photos: Photo[]; preselect: string }) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [keyword, setKeyword] = useState(preselect || keywords.find((k) => !k.landingSlug)?.phrase || "");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  async function api<T>(url: string, method: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const d = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new Error(d.error || `Failed (${res.status})`);
    return d;
  }

  async function generate(full: boolean) {
    if (!keyword) return;
    setBusy(full ? "full" : "generate");
    setMsg("Writing the page… (about a minute)");
    try {
      const d = await api<{ page: Page; imageIdea?: string }>("/api/admin/landing", "POST", { keyword, full });
      const page: Page = { ...d.page, faq: (d.page.faq ?? []) as Faq[], sections: (d.page.sections ?? null) as LandingSections | null, createdAt: String(d.page.createdAt), updatedAt: String(d.page.updatedAt) };
      setPages((ps) => [page, ...ps]);
      setOpen(page.slug);
      setMsg(`Draft written.${d.imageIdea ? ` Photo idea: ${d.imageIdea}.` : ""} Pick a photo from your Gallery, preview it, change anything that doesn't sound like you, then Publish.`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  function local(slug: string, p: Partial<Page>) {
    setPages((ps) => ps.map((x) => (x.slug === slug ? { ...x, ...p } : x)));
  }

  async function save(slug: string, p: Partial<Page>) {
    setBusy(`save:${slug}`);
    setMsg("");
    try {
      await api(`/api/admin/landing/${slug}`, "PATCH", p);
      local(slug, p);
      setMsg("Saved.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  function pickPhoto(page: Page, src: string) {
    const photo = photos.find((x) => x.src === src);
    local(page.slug, { heroImage: src || null, heroAlt: src ? photo?.caption || page.heroAlt : page.heroAlt });
  }

  async function remove(slug: string) {
    setBusy(`del:${slug}`);
    try {
      await api(`/api/admin/landing/${slug}`, "DELETE");
      setPages((ps) => ps.filter((p) => p.slug !== slug));
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  const without = keywords.filter((k) => !pages.some((p) => p.keyword === k.phrase));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border-2 border-line bg-surface p-5">
        <h2 className="text-lg font-bold text-ink">Write a new landing page</h2>
        <p className="mb-3 text-sm text-muted">Pick a keyword. The most valuable ones are listed first. A page takes about a minute to write, and is saved as a draft.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select id="lp-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} className={`${FIELD} sm:max-w-lg`}>
            {keyword && !without.some((k) => k.phrase === keyword) && <option value={keyword}>{keyword}</option>}
            {without.map((k) => (
              <option key={k.phrase} value={k.phrase}>
                {k.phrase} ({k.kind}, {k.priority})
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void generate(true)} disabled={!keyword || !!busy} className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:opacity-50">
            {busy === "full" ? "Making the page…" : "✨ Make a complete landing page"}
          </button>
          <button type="button" onClick={() => void generate(false)} disabled={!keyword || !!busy} className="rounded-full border-2 border-line px-5 py-2.5 text-sm font-bold text-ink disabled:opacity-50">
            {busy === "generate" ? "Writing…" : "Text only"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          A complete page has a headline in the searcher&rsquo;s words, a photo from your Gallery, why to choose you, what clients get,
          how it works, your credentials, questions and answers, and a consultation button that stays on screen.
        </p>
        {msg && <p className="mt-3 text-sm font-semibold text-ink">{msg}</p>}
      </section>

      <ul className="space-y-3">
        {pages.length === 0 && <li className="text-sm text-muted">No landing pages yet.</li>}
        {pages.map((p) => (
          <li key={p.slug} className="rounded-2xl border-2 border-line bg-surface">
            <button type="button" onClick={() => setOpen(open === p.slug ? null : p.slug)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left" aria-expanded={open === p.slug}>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${p.published ? "bg-sea-soft text-sea" : "bg-sun-soft text-sun"}`}>{p.published ? "Published" : "Draft"}</span>
              <span className="font-bold text-ink">{p.h1}</span>
              {p.sections && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-strong">Complete page</span>}
              <span className="text-xs text-muted">/for/{p.slug} · for “{p.keyword}”</span>
            </button>
            {open === p.slug && (
              <div className="space-y-4 border-t-2 border-line p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-3">
                    <div><label className={LABEL}>Page title (shown in Google)</label><input className={FIELD} value={p.title} onChange={(e) => local(p.slug, { title: e.target.value })} /></div>
                    <div><label className={LABEL}>Description (shown under the title in Google)</label><textarea className={`${FIELD} min-h-[60px]`} value={p.metaDescription} onChange={(e) => local(p.slug, { metaDescription: e.target.value })} /></div>
                    <div><label className={LABEL}>Headline</label><input className={FIELD} value={p.h1} onChange={(e) => local(p.slug, { h1: e.target.value })} /></div>
                    <div><label className={LABEL}>Opening</label><textarea className={`${FIELD} min-h-[80px]`} value={p.intro} onChange={(e) => local(p.slug, { intro: e.target.value })} /></div>
                    {p.sections && <SectionsEditor s={p.sections} onChange={(sections) => local(p.slug, { sections })} />}
                    <div><label className={LABEL}>Body (## makes a subheading)</label><textarea className={`${FIELD} min-h-[320px] font-mono text-[13px] leading-relaxed`} value={p.body} onChange={(e) => local(p.slug, { body: e.target.value })} /></div>
                    <div>
                      <label className={LABEL}>Questions and answers</label>
                      <div className="space-y-2">
                        {p.faq.map((f, i) => (
                          <div key={i} className="rounded-xl border-2 border-line bg-paper p-2">
                            <input className={`${FIELD} mb-1 font-bold`} value={f.q} onChange={(e) => local(p.slug, { faq: p.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} />
                            <textarea className={`${FIELD} min-h-[60px]`} value={f.a} onChange={(e) => local(p.slug, { faq: p.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl border-2 border-line bg-paper">
                      {p.heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.heroImage} alt={p.heroAlt || ""} className="aspect-[3/2] w-full object-cover" />
                      ) : (
                        <div className="grid aspect-[3/2] place-items-center p-3 text-center text-xs text-muted">No image yet</div>
                      )}
                    </div>
                    <label className={LABEL} htmlFor={`photo-${p.slug}`}>Photo from your Gallery</label>
                    <select id={`photo-${p.slug}`} className={FIELD} value={p.heroImage ?? ""} onChange={(e) => pickPhoto(p, e.target.value)}>
                      <option value="">No photo</option>
                      {photos.map((ph) => (
                        <option key={ph.src} value={ph.src}>
                          {ph.caption || ph.src.split("/").pop()}
                        </option>
                      ))}
                    </select>
                    <label className={LABEL} htmlFor={`alt-${p.slug}`}>Photo description (for screen readers)</label>
                    <textarea id={`alt-${p.slug}`} className={`${FIELD} min-h-[70px]`} value={p.heroAlt ?? ""} onChange={(e) => local(p.slug, { heroAlt: e.target.value })} />
                    <p className="text-xs text-muted">Add photos on the Gallery page. Save changes to keep the photo.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t-2 border-line pt-4">
                  <button type="button" disabled={!!busy} onClick={() => void save(p.slug, { title: p.title, metaDescription: p.metaDescription, h1: p.h1, intro: p.intro, body: p.body, faq: p.faq, heroImage: p.heroImage, heroAlt: p.heroAlt, ...(p.sections ? { sections: p.sections } : {}) })} className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-ink disabled:opacity-50">
                    {busy === `save:${p.slug}` ? "Saving…" : "Save changes"}
                  </button>
                  <a href={`/for/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-full border-2 border-line px-5 py-2 text-sm font-bold text-ink">
                    {p.published ? "View page ↗" : "Preview ↗"}
                  </a>
                  <button type="button" disabled={!!busy} onClick={() => void save(p.slug, { published: !p.published })} className={`rounded-full border-2 px-5 py-2 text-sm font-bold ${p.published ? "border-line text-ink" : "border-sea bg-sea text-white"}`}>
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" disabled={!!busy} onClick={() => void remove(p.slug)} className="ml-auto rounded-full border-2 border-line px-4 py-2 text-xs font-bold text-berry">
                    Delete draft
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionsEditor({ s, onChange }: { s: LandingSections; onChange: (s: LandingSections) => void }) {
  const set = (p: Partial<LandingSections>) => onChange({ ...s, ...p });
  const pairs = (key: "benefits" | "steps", label: string) => (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="grid gap-2 md:grid-cols-3">
        {s[key].map((b, i) => (
          <div key={i} className="rounded-xl border-2 border-line bg-paper p-2">
            <input className={`${FIELD} mb-1 font-bold`} value={b.title} onChange={(e) => set({ [key]: s[key].map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
            <textarea className={`${FIELD} min-h-[80px]`} value={b.text} onChange={(e) => set({ [key]: s[key].map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-3 rounded-xl border-2 border-accent/40 bg-accent-soft/40 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-accent-strong">Complete page sections</p>
      <div><label className={LABEL}>Small line above the headline</label><input className={FIELD} value={s.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></div>
      <div><label className={LABEL}>Why choose you (under the headline)</label><textarea className={`${FIELD} min-h-[60px]`} value={s.valueProp} onChange={(e) => set({ valueProp: e.target.value })} /></div>
      {pairs("benefits", "What clients get")}
      {pairs("steps", "How it works")}
      <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
        <div><label className={LABEL}>Consultation invitation</label><input className={FIELD} value={s.ctaHeadline} onChange={(e) => set({ ctaHeadline: e.target.value })} /></div>
        <div><label className={LABEL}>Button text</label><input className={FIELD} value={s.ctaButton} onChange={(e) => set({ ctaButton: e.target.value })} /></div>
      </div>
    </div>
  );
}

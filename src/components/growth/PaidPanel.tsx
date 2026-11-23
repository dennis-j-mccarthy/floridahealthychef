"use client";

import { useState } from "react";

/*
  Paid search dashboard (Growth → Search → Paid): monthly budget targets,
  spend entered by hand (until an ads API is connected), and cost per
  consultation request from the tracked contact form sends.
*/

type Entry = { id: string; channel: string; periodStart: string; amountCents: number; results: number | null; note: string | null };
export type Counts = { contact_click: number; contact_submit: number; signup: number; call_click: number };

const CHANNEL_LABEL: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta ads (Facebook and Instagram)",
};
const CHANNELS = Object.keys(CHANNEL_LABEL);

const money = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function Bar({ spent, cap }: { spent: number; cap: number | null }) {
  const pct = cap ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  return (
    <div className="mt-2">
      <div className="h-2 overflow-hidden rounded-full bg-paper">
        <div className={`h-full ${pct >= 100 ? "bg-berry" : "bg-accent"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">{cap ? `${money(spent)} of ${money(cap)} this month (${pct}%)` : `${money(spent)} this month · no target set`}</p>
    </div>
  );
}

export function PaidPanel({
  initialEntries,
  budgets,
  month,
  last30,
}: {
  initialEntries: Entry[];
  budgets: Record<string, number | null>;
  month: Counts;
  last30: Counts;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [caps, setCaps] = useState<Record<string, string>>(
    Object.fromEntries(CHANNELS.map((c) => [c, budgets[c] ? String((budgets[c] as number) / 100) : ""])),
  );
  const [form, setForm] = useState({ channel: "google", periodStart: new Date().toISOString().slice(0, 7) + "-01", amount: "", note: "" });
  const [msg, setMsg] = useState("");

  const monthKey = new Date().toISOString().slice(0, 7);
  const spentThisMonth = (ch: string) => entries.filter((e) => e.channel === ch && e.periodStart.slice(0, 7) === monthKey).reduce((n, e) => n + e.amountCents, 0);
  const total = CHANNELS.reduce((n, c) => n + spentThisMonth(c), 0);
  const requests = month.contact_submit;
  const basis = requests > 0 ? "consultation requests (contact form sends)" : "clicks through to the contact page";
  const count = requests > 0 ? requests : month.contact_click;

  async function saveCap(ch: string) {
    setMsg("");
    const dollars = Number(caps[ch]);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: `budget_${ch}`, value: { monthlyCents: Number.isFinite(dollars) ? Math.round(dollars * 100) : 0 } }),
    }).catch(() => null);
    setMsg(res && res.ok ? "Target saved." : "Couldn't save the target.");
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/spend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, results: null }),
    });
    const d = (await res.json().catch(() => ({}))) as { entry?: Entry; error?: string };
    if (!res.ok || !d.entry) return setMsg(d.error || "Couldn't save.");
    setEntries((es) => [{ ...d.entry!, periodStart: String(d.entry!.periodStart) }, ...es]);
    setForm((f) => ({ ...f, amount: "", note: "" }));
  }

  async function remove(id: string) {
    await fetch(`/api/admin/spend/${id}`, { method: "DELETE" }).catch(() => null);
    setEntries((es) => es.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border-2 border-line bg-surface p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted">This month</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted">Ad spend</dt><dd className="text-2xl font-bold text-ink">{money(total)}</dd></div>
          <div><dt className="text-muted">Cost per request</dt><dd className="text-2xl font-bold text-ink">{count && total ? money(Math.round(total / count)) : "—"}</dd></div>
          <div><dt className="text-muted">Consultation requests</dt><dd className="text-lg font-bold text-ink">{month.contact_submit} sent · {month.contact_click} clicks to /contact</dd></div>
          <div><dt className="text-muted">Newsletter signups</dt><dd className="text-lg font-bold text-ink">{month.signup}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          Cost per request uses {basis}. Last 30 days: {last30.contact_submit} contact form sends, {last30.contact_click} clicks to /contact, {last30.signup} newsletter signups.
        </p>
      </section>

      <section className="rounded-2xl border-2 border-line bg-surface p-5">
        <h3 className="text-lg font-bold text-ink">Monthly targets</h3>
        <p className="mb-3 text-sm text-muted">The cap that actually stops spending is set inside Google Ads or Meta Ads Manager. These are the targets this page measures against.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {CHANNELS.map((ch) => (
            <div key={ch}>
              <div className="flex items-end gap-2">
                <label className="flex-1 text-sm text-ink" htmlFor={`cap-${ch}`}>
                  {CHANNEL_LABEL[ch]} ($ per month)
                  <input id={`cap-${ch}`} inputMode="decimal" value={caps[ch]} onChange={(e) => setCaps({ ...caps, [ch]: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-line bg-paper px-3 py-2 text-ink" placeholder="e.g. 200" />
                </label>
                <button type="button" onClick={() => void saveCap(ch)} className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink">Save</button>
              </div>
              <Bar spent={spentThisMonth(ch)} cap={caps[ch] ? Math.round(Number(caps[ch]) * 100) : null} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-line bg-surface p-5">
        <h3 className="text-lg font-bold text-ink">Enter ad spend</h3>
        <p className="mb-3 text-sm text-muted">Copy the total from Google Ads or Ads Manager once a week or once a month.</p>
        <form onSubmit={(e) => void addEntry(e)} className="grid gap-3 sm:grid-cols-5">
          <select id="sp-channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm text-ink sm:col-span-2" aria-label="Channel">
            {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>)}
          </select>
          <input id="sp-start" type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} className="rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm text-ink" aria-label="Period start" />
          <input id="sp-amount" inputMode="decimal" placeholder="Spend $" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm text-ink" />
          <span className="self-center text-xs text-muted">Requests come from tracking</span>
          <input id="sp-note" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="rounded-xl border-2 border-line bg-paper px-3 py-2 text-sm text-ink sm:col-span-4" />
          <button type="submit" disabled={!form.amount} className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink disabled:opacity-50">Add</button>
        </form>
        {msg && <p className="mt-3 text-sm font-semibold text-ink">{msg}</p>}
        {entries.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr><th className="py-2">From</th><th>Channel</th><th>Spend</th><th>Note</th><th /></tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="py-2">{e.periodStart.slice(0, 10)}</td>
                    <td>{CHANNEL_LABEL[e.channel] ?? e.channel}</td>
                    <td>{money(e.amountCents)}</td>
                    <td className="text-muted">{e.note ?? ""}</td>
                    <td className="text-right"><button type="button" onClick={() => void remove(e.id)} className="text-xs font-bold text-berry">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";

/*
  A checklist whose ticks save to StudioSetting (PUT /api/admin/settings).
  Items marked `auto` come from live checks and cannot be ticked by hand.
*/
type Item = { id: string; text: string; auto?: boolean | null };

export function TickList({
  settingKey,
  groups,
  initial,
}: {
  settingKey: string;
  groups: { group: string; items: Item[] }[];
  initial: Record<string, boolean>;
}) {
  const [ticks, setTicks] = useState<Record<string, boolean>>(initial || {});
  const [err, setErr] = useState("");

  async function toggle(id: string) {
    const next = { ...ticks, [id]: !ticks[id] };
    setTicks(next);
    setErr("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: settingKey, value: next }),
    }).catch(() => null);
    if (!res || !res.ok) setErr("Couldn't save that tick. Try again.");
  }

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const done = groups.reduce((n, g) => n + g.items.filter((i) => (i.auto ?? null) === true || ticks[i.id]).length, 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {done} of {total} done.
      </p>
      {err && <p className="text-sm font-semibold text-berry">{err}</p>}
      {groups.map((g) => (
        <div key={g.group}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{g.group}</h3>
          <ul className="space-y-2">
            {g.items.map((i) => {
              const auto = i.auto !== undefined && i.auto !== null;
              const on = auto ? i.auto === true : !!ticks[i.id];
              return (
                <li key={i.id}>
                  <label className={`flex items-start gap-3 rounded-xl border-2 border-line bg-paper p-3 text-sm leading-snug text-ink ${auto ? "" : "cursor-pointer"}`}>
                    <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none" checked={on} disabled={auto} onChange={() => void toggle(i.id)} />
                    <span className={on ? "text-muted line-through decoration-1" : ""}>{i.text}</span>
                    {auto && <span className="ml-auto flex-none text-[11px] font-bold text-muted">checked automatically</span>}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

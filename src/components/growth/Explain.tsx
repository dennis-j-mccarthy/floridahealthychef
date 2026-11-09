import type { ReactNode } from "react";

/** The plain-English paragraph at the top of every Growth panel, written for Beth. */
export function Explain({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 max-w-3xl rounded-2xl border-2 border-accent/30 bg-accent-soft p-5 text-[15px] leading-relaxed text-ink">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-accent-strong">What this does</span>
      {children}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border-2 border-line bg-surface p-5 ${className}`}>
      {title && <h2 className="mb-3 text-lg font-bold text-ink">{title}</h2>}
      {children}
    </section>
  );
}

export function Status({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  const cls = ok === true ? "bg-sea-soft text-sea" : ok === false ? "bg-berry-soft text-berry" : "bg-sun-soft text-sun";
  const word = ok === true ? "Done" : ok === false ? "Missing" : "To do";
  return (
    <span className="inline-flex min-w-0 items-start gap-2">
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{word}</span>
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
    </span>
  );
}

/** Shown in place of a panel that needs the Growth tables before migration 20261109120000_growth_search is applied. */
export function NotReady({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border-2 border-sun/40 bg-sun-soft p-5 text-sm text-ink">
      <p className="font-bold">{what} needs the Growth tables, which are not created yet.</p>
      <p className="mt-1">
        Apply migration <code>20261109120000_growth_search</code> to the database (<code>npx prisma migrate deploy</code>), then reload
        this page. Until then nothing here can be saved.
      </p>
    </div>
  );
}

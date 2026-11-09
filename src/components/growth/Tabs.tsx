import Link from "next/link";

/** Server-rendered tabs: ?tab=… on the same page. */
export function Tabs({ base, tabs, active }: { base: string; tabs: { id: string; label: string }[]; active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="Sections">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={`${base}?tab=${t.id}`}
          aria-current={t.id === active ? "page" : undefined}
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${
            t.id === active ? "border-accent bg-accent text-accent-ink" : "border-line text-ink hover:border-accent/60"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

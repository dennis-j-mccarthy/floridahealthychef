"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

/*
  The Throughline shell for Florida Healthy Chef's admin — the same
  Creator-page skin the other sites use (ported from built-with-ai's
  /creator): left rail with the threaded nav, sticky top bar with the
  breadcrumb, Sign out and the theme toggle, content column. Every admin
  page renders inside it, so moving between Blog, Gallery and Social
  never leaves the nav context. /admin/login renders bare.
*/

const THEME_KEY = "tl-theme";
const THEME_EVENT = "tl-theme-change";
type Theme = "light" | "dark";
function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
function subscribeTheme(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export type NavCounts = { posts: number | null; gallery: number | null };

type Node = { href: string; label: string; chip?: string | null; external?: boolean };
type Group = { label: string; nodes: Node[] };

function buildNav(counts: NavCounts): Group[] {
  return [
    {
      label: "Content",
      nodes: [
        { href: "/admin/blog", label: "Blog manager", chip: counts.posts != null ? String(counts.posts) : null },
        { href: "/admin/blog/ideas", label: "Ideas" },
        { href: "/admin/blog/generate", label: "Generate" },
        { href: "/admin/blog/promo", label: "Promo" },
      ],
    },
    {
      label: "Creative",
      nodes: [
        { href: "/admin/gallery", label: "Gallery", chip: counts.gallery != null ? String(counts.gallery) : null },
      ],
    },
    { label: "Channels", nodes: [{ href: "/admin/social", label: "Social" }] },
    {
      label: "Tools",
      nodes: [
        { href: "/admin", label: "Dashboard" },
        { href: "/blog", label: "View blog", external: true },
        { href: "/", label: "View site", external: true },
      ],
    },
  ];
}

const STAYS_IN_META: Array<[string, string]> = [
  ["Page inbox", "https://business.facebook.com/latest/inbox/all"],
  ["Ads Manager", "https://adsmanager.facebook.com/adsmanager/manage/campaigns"],
  ["Instagram", "https://www.instagram.com/"],
];

const Chev = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
const Out = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
);

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap";

export default function AdminShell({ children, counts }: { children: ReactNode; counts: NavCounts }) {
  const path = usePathname() ?? "";
  const router = useRouter();

  const nav = buildNav(counts);
  const flat = nav.flatMap((g) => g.nodes.map((n) => ({ ...n, group: g.label })));
  let activeIdx = -1;
  flat.forEach((n, i) => {
    if (n.external) return;
    if (path === n.href || path.startsWith(n.href + "/")) {
      if (activeIdx < 0 || n.href.length > flat[activeIdx].href.length) activeIdx = i;
    }
  });
  const active = activeIdx >= 0 ? flat[activeIdx] : null;
  const leaf = active?.label ?? "Admin";

  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as const);
  const toggleTheme = useCallback(() => {
    const next = readTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }, [router]);

  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === path;
  const threadRef = useRef<HTMLElement>(null);
  const [line, setLine] = useState<{ top: number; height: number; fill: number } | null>(null);

  useLayoutEffect(() => {
    const t = threadRef.current;
    if (!t) return;
    const measure = () => {
      const dots = Array.from(t.querySelectorAll<HTMLElement>(".tl-dot"));
      if (dots.length < 2 || getComputedStyle(dots[0]).display === "none") { setLine(null); return; }
      const tb = t.getBoundingClientRect();
      const c = (el: HTMLElement) => el.getBoundingClientRect().top - tb.top + t.scrollTop + el.offsetHeight / 2;
      const first = c(dots[0]);
      const last = c(dots[dots.length - 1]);
      const act = activeIdx >= 0 && dots[activeIdx] ? c(dots[activeIdx]) : first;
      setLine({ top: first, height: last - first, fill: Math.max(0, act - first) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIdx]);

  // The sign-in page stands alone — no rail, no bar.
  if (path.startsWith("/admin/login")) return <>{children}</>;

  return (
    <div className="tl" data-theme={theme === "dark" ? "dark" : undefined} suppressHydrationWarning>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==="dark")document.currentScript.parentElement.setAttribute("data-theme","dark")}catch(e){}`,
        }}
      />
      <div className="tl-app">
        <aside className={`tl-rail${open ? " is-open" : ""}`}>
          <div className="tl-brand">
            <Link href="/admin" className="tl-brand__btn" aria-label="Admin home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="" width={38} height={38} className="tl-mark" />
              <span style={{ minWidth: 0 }}>
                <span className="tl-brand__name">Florida Healthy Chef</span>
                <span className="tl-brand__ind">Beautiful Foods by Beth · floridahealthychef.com</span>
              </span>
              <svg className="tl-brand__chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
            </Link>
            <button type="button" className="tl-burger" aria-expanded={open} aria-controls="tl-thread" aria-label="Menu" onClick={() => setOpenFor(open ? null : path)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>

          <nav className="tl-thread" id="tl-thread" ref={threadRef} aria-label="Admin sections">
            {line && (
              <>
                <span className="tl-line" style={{ top: line.top, height: line.height }} aria-hidden="true" />
                <span className="tl-fill" style={{ top: line.top, height: line.fill }} aria-hidden="true" />
              </>
            )}
            {nav.map((g) => (
              <div className="tl-grp" key={g.label}>
                <div className="tl-gl">{g.label}</div>
                {g.nodes.map((n) => {
                  const i = flat.findIndex((f) => f.href === n.href);
                  const cls = i === activeIdx ? " is-active" : activeIdx > i ? " is-passed" : "";
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`tl-node${n.external ? " tl-node--ext" : cls}`}
                      aria-current={i === activeIdx ? "page" : undefined}
                      target={n.external ? "_blank" : undefined}
                      rel={n.external ? "noreferrer" : undefined}
                    >
                      <span className="tl-dot" aria-hidden="true" />
                      <span className="tl-node__label">{n.label}</span>
                      {n.chip && <span className="tl-badge">{n.chip}</span>}
                      {n.external && <span className="tl-node__out"><Out /></span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="tl-metabox">
            <div className="tl-metabox__h">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
              Stays in Meta
            </div>
            {STAYS_IN_META.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noreferrer">{label}<Out /></a>
            ))}
          </div>
        </aside>

        <div className="tl-main">
          <header className="tl-top">
            <div className="tl-crumb">
              <span className="tl-crumb__root">Florida Healthy Chef</span>
              <span className="tl-crumb__root"><Chev /></span>
              {active && (
                <>
                  <span>{active.group}</span>
                  <Chev />
                </>
              )}
              <b>{leaf}</b>
            </div>
            <div className="tl-top__sp" />
            <a href="/" className="tl-quiet tl-quiet--site" target="_blank" rel="noreferrer">View site ↗</a>
            <button type="button" className="tl-quiet" onClick={() => void signOut()} title="Sign out of the admin">Sign out</button>
            <button type="button" className="tl-icbtn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title="Theme">
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
          </header>
          <main className="tl-view">{children}</main>
        </div>
      </div>
    </div>
  );
}

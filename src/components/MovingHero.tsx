"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Full-screen slow-zoom crossfade for the /welcome alternate homepage.
// Only the larger photos are used here; the small portrait food shots live in
// the scrolling strip below the hero, where they stay sharp.
const slides = [
  { src: "/images/hero/dish1.jpeg", caption: "Joyful wellness", focus: "45% 35%", from: "scale(1.02) translate(0, 0)", to: "scale(1.14) translate(-2%, -1%)" },
  { src: "/images/services/p1030920.jpg", caption: "Rainbow carrots, beets & bok choy", focus: "50% 40%", from: "scale(1.14) translate(2%, 0)", to: "scale(1.02) translate(0, 0)" },
  { src: "/images/hero/beth-event.jpg", caption: "An evening's spread from Beth's kitchen", focus: "50% 55%", from: "scale(1.02)", to: "scale(1.15) translate(0, -2%)" },
  { src: "/images/gallery/img03.jpeg", caption: "Handmade heart ravioli", focus: "50% 60%", from: "scale(1.15) translate(-1%, 1%)", to: "scale(1.03)" },
  { src: "/images/services/img-1983.jpg", caption: "Beth in her kitchen", focus: "40% 45%", from: "scale(1.02) translate(1%, 0)", to: "scale(1.12) translate(-1%, -1%)" },
  { src: "/images/gallery/img19.jpeg", caption: "Edible-flower salad with citrus & radish", focus: "50% 50%", from: "scale(1.14)", to: "scale(1.02)" },
];

const SLIDE_MS = 7000;

export default function MovingHero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setCurrent((c) => (c + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [current, paused]);

  return (
    <section
      className="relative mt-[120px] h-[650px] overflow-hidden bg-dark"
      aria-roledescription="carousel"
      aria-label="Beth's food and kitchen"
    >
      {/* Slides */}
      {slides.map((s, i) => {
        const active = i === current;
        return (
          <div
            key={s.src}
            className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
            style={{ opacity: active ? 1 : 0 }}
            aria-hidden={!active}
          >
            <div
              // Re-keyed on each visit so the zoom restarts from the beginning
              key={active ? `on-${current}` : "off"}
              className="moving-hero-kenburns absolute inset-0"
              style={
                {
                  "--kb-from": s.from,
                  "--kb-to": s.to,
                  animationDuration: `${SLIDE_MS + 1800}ms`,
                  animationPlayState: active && !paused ? "running" : "paused",
                } as React.CSSProperties
              }
            >
              <Image
                src={s.src}
                alt={s.caption}
                fill
                priority={i < 2}
                sizes="100vw"
                quality={85}
                className="object-cover"
                style={{ objectPosition: s.focus, filter: "saturate(1.35) contrast(1.08) brightness(1.04)" }}
              />
            </div>
          </div>
        );
      })}

      {/* Legibility: a faint shade plus a frosted panel behind the copy, so the photos stay vivid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_70%_at_25%_50%,rgba(0,0,0,0.25),transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Copy */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1200px] items-center px-6 pb-8">
        <div className="max-w-[440px] rounded-2xl bg-black/30 p-7 text-white backdrop-blur-[6px] md:p-10 [text-shadow:0_1px_3px_rgba(0,0,0,0.55),0_2px_18px_rgba(0,0,0,0.35)]">
          <div className="moving-hero-rise mb-5 h-0.5 w-16 bg-sage" style={{ animationDelay: "100ms" }} />
          <p className="moving-hero-rise text-sm font-medium uppercase tracking-[0.3em] text-white/90" style={{ animationDelay: "250ms" }}>
            Southwest Florida&apos;s
          </p>
          <h1
            className="moving-hero-rise mt-3 font-[family-name:var(--font-great-vibes)] text-5xl leading-[1.05] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] md:text-7xl"
            style={{ animationDelay: "450ms" }}
          >
            Healthiest Personal Chef
          </h1>
          <p className="moving-hero-rise mt-5 text-base font-light text-white/90 md:text-lg" style={{ animationDelay: "750ms" }}>
            &ldquo;Let food be thy medicine and medicine be thy food.&rdquo;
          </p>
          <p className="moving-hero-rise mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/75" style={{ animationDelay: "850ms" }}>
            — Hippocrates, the father of medicine
          </p>
          <div className="moving-hero-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "1050ms" }}>
            <Link
              href="/recipes"
              className="bg-olive px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-olive-dark"
            >
              Discover Beautiful Foods
            </Link>
            <Link
              href="/contact"
              className="border border-white/70 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-dark"
            >
              Schedule a free consultation
            </Link>
          </div>
        </div>
      </div>

      {/* Progress bars + caption */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-[1200px] items-end justify-between gap-6 px-6 pb-3">
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.src}
                onClick={() => setCurrent(i)}
                aria-label={`Show photo ${i + 1}: ${s.caption}`}
                aria-current={i === current}
                className="group py-3"
              >
                <span className="block h-0.5 w-8 overflow-hidden bg-white/35 md:w-12">
                  <span
                    key={i === current ? `bar-${current}` : "idle"}
                    className={`block h-full bg-white ${i === current ? "moving-hero-progress" : i < current ? "w-full" : "w-0"}`}
                    style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                  />
                </span>
              </button>
            ))}
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="ml-2 text-white/80 transition-colors hover:text-white"
            >
              {paused ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              )}
            </button>
          </div>
          <p key={current} className="moving-hero-caption hidden text-right font-[family-name:var(--font-great-vibes)] text-2xl text-white/90 sm:block">
            {slides[current].caption}
          </p>
        </div>
      </div>
    </section>
  );
}

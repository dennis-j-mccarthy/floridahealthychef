"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function ParallaxHero() {
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="bg-white overflow-hidden" style={{ paddingTop: "12%", paddingBottom: "80px" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
          {/* Left: Text */}
          <div
            className="pt-8 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <div className="w-16 h-0.5 bg-olive mb-8" />
            <p className="text-sm font-medium tracking-[0.25em] uppercase text-dark">
              Southwest Florida&apos;s
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-great-vibes)] text-5xl md:text-6xl text-olive leading-tight">
              Healthiest Personal Chef
            </h1>
            <div className="w-full h-px bg-gray-light/30 mt-8 mb-8" />
            <p className="text-base font-light text-dark">
              &ldquo;Let food be thy medicine and medicine be thy food.&rdquo;
            </p>
            <p className="mt-2 text-xs font-medium tracking-[0.15em] uppercase text-olive">
              — Hippocrates, the father of medicine
            </p>
          </div>

          {/* Right: Two-column staggered image grid */}
          <div
            className="flex gap-8 transition-all duration-1000 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translate3d(0, 0, 0) scale3d(1, 1, 1)"
                : "translate3d(0, 0, 0) scale3d(0.97, 0.97, 1)",
            }}
          >
            {/* Left image column - drifts up on scroll */}
            <div className="w-1/2 flex flex-col gap-8" style={{ transform: `translateY(${scrollY * -0.06}px)` }}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                <Image src="/images/hero/chicken.jpg" alt="Healthy dish" fill className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src="/images/hero/beth-event.jpg" alt="Beth at event" fill className="object-cover" />
              </div>
            </div>
            {/* Right image column - offset down, drifts down on scroll */}
            <div className="w-1/2 flex flex-col gap-8" style={{ paddingTop: "120px", transform: `translateY(${scrollY * 0.06}px)` }}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                <Image src="/images/hero/dish1.jpeg" alt="Beautiful food" fill className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src="/images/hero/dish2.jpeg" alt="Delicious dish" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

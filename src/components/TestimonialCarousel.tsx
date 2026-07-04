"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const doodads = ["/images/doodad1.png", "/images/doodad2.png", "/images/doodad3.png"];

const testimonials = [
  {
    highlight: "You can taste the love!",
    quote:
      "Food is packed with high-quality, organic ingredients, and you can taste the love Beth puts into each dish. She has been our personal chef for over 3 years and we couldn't be happier. As a professional household with two busy schedules, having Beth prepare our meals has been a game changer.",
    name: "Family Client",
    detail: "3+ year client",
  },
  {
    highlight: "A beautiful soul",
    quote:
      "She helped to make my final season at 35 years of age a success. Beth prepared meals that kept me fueled, healthy, and performing at my best. Most importantly she made it all taste great. She is a beautiful soul who truly cares about the people she serves.",
    name: "Demar D.",
    detail: "Denver Broncos Offensive Lineman",
  },
  {
    highlight: "Part of our family",
    quote:
      "I was able to lose close to 20 pounds and eliminate the need for blood pressure medication. Beth has become part of our family. Her meals are thoughtfully prepared, delicious, and have truly transformed our health.",
    name: "Kurt N.",
    detail: "Long-term client",
  },
  {
    highlight: "Truly transformative",
    quote:
      "She accommodated our desire to eat well, while taking all of the menu planning, grocery shopping and meal prep time off. As a busy mom and realtor, I didn't have time to plan and prepare healthy meals. Beth changed everything for our family.",
    name: "Beth M.",
    detail: "Mom & Realtor",
  },
  {
    highlight: "Food for optimal health",
    quote:
      "If you find yourself in a health crisis, or better yet if you just want to feed your body what it really needs for optimal health, I would encourage you to contact Beth. She is passionate about healthy, delicious food. Once you meet her, talk to her, and taste her savory meals you'll know what I'm talking about.",
    name: "Lisa T",
    detail: "",
  },
  {
    highlight: "Joy of healthy eating",
    quote:
      "The joy of working with Beth is that she is a passionate food-as-medicine chef and educator. After culinary coaching and cooking session, she left us with recipes, detailed information on the health benefits of each meal that we made together, and pictures of what unprocessed, organic, non-GMO brands to buy at the store. After several months of working with Beth, my daughter is off of blood pressure medication, has more energy, has lost weight, and genuinely desires to eat healthy.",
    name: "Liz P.",
    detail: "Rocky Mountain Restaurant Group",
  },
  {
    highlight: "Most beautiful dishes",
    quote:
      "Beth creates the tastiest, healthiest, most beautiful dishes. The meals are well thought out and met our need to be able to feed my family nutritious meals without all the work. Beth is well versed in all types of cuisine, which means the offerings were never boring. The food tasted great, looked fantastic, and was very healthy. It was one of the smartest decisions I've made for myself and my family.",
    name: "Lisa R.",
    detail: "",
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Show 3 cards at a time on desktop, 1 on mobile
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = () => {
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section className="py-28 bg-white">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-normal text-dark">
            Client Raves
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => { prev(); setIsAutoPlaying(false); }}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-olive text-olive transition-colors hover:bg-olive hover:text-white"
              aria-label="Previous testimonial"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => { next(); setIsAutoPlaying(false); }}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-olive text-olive transition-colors hover:bg-olive hover:text-white"
              aria-label="Next testimonial"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${current * (100 / visibleCount)}%)`,
            }}
          >
            {testimonials.map((t, i) => {
              const doodad = doodads[i % 3];
              const above = i % 2 === 0;
              return (
                <div
                  key={t.name}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <div className="border border-light-2 bg-white p-10 h-full">
                    {above && (
                      <div className="mb-8 flex justify-center">
                        <Image src={doodad} alt="" width={120} height={120} className="opacity-70" />
                      </div>
                    )}
                    <h3 className="text-2xl text-dark mb-5">
                      &ldquo;{t.highlight}&rdquo;
                    </h3>
                    <p className="text-base font-light leading-relaxed text-gray">
                      {t.quote}
                    </p>
                    <p className="mt-8 text-base font-light text-olive">
                      {t.name}{t.detail ? `, ${t.detail}` : ""}
                    </p>
                    {!above && (
                      <div className="mt-8 flex justify-center">
                        <Image src={doodad} alt="" width={120} height={120} className="opacity-70" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export default function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + images.length) % images.length
      ),
    [images.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, prev, next]);

  const current = openIndex === null ? null : images[openIndex];

  return (
    <>
      {/* Masonry-style grid */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative mb-5 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`View ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {img.caption ? (
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-14 text-left text-sm font-normal text-white opacity-0 transition-opacity duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-hidden="true"
              >
                {img.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {current !== null && openIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/95"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            ×
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 md:left-6"
            aria-label="Previous image"
          >
            ‹
          </button>

          {/* Image + caption */}
          <div
            className="flex h-[80vh] w-[88vw] max-w-5xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative min-h-0 flex-1">
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="88vw"
                className="object-contain"
                priority
              />
            </div>
            {current.caption ? (
              <p className="mt-4 shrink-0 px-4 text-center text-sm font-light leading-relaxed text-white/90 md:text-base">
                {current.caption}
              </p>
            ) : null}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 md:right-6"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Counter */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-light tracking-widest text-white/80">
            {openIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}

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

// Mosaic tile shapes, repeated down the page. grid-flow-dense back-fills the
// gaps, so the pattern reads as a varied mosaic rather than rows.
const MOSAIC = [
  "col-span-2 row-span-2", // big
  "row-span-2", // tall
  "", "", "",
  "col-span-2", // wide
  "row-span-2",
  "",
  "col-span-2 row-span-2",
  "", "",
  "col-span-2",
];

function tileClass(img: GalleryImage, i: number) {
  const shape = MOSAIC[i % MOSAIC.length];
  // A landscape photo looks wrong squeezed into a tall tile; give it a wide one.
  if (img.width > img.height * 1.15 && shape === "row-span-2") return "col-span-2";
  return shape;
}

export default function GalleryLightbox({ images: allImages }: { images: GalleryImage[] }) {
  // Photos whose file will not load (e.g. an upload host that is down) are
  // dropped from both the mosaic and the lightbox instead of showing a broken tile.
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const images = allImages.filter((img) => !failed.has(img.src));
  const markFailed = useCallback(
    (src: string) => setFailed((f) => (f.has(src) ? f : new Set(f).add(src))),
    []
  );
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
      {/* Mosaic grid */}
      <div className="grid auto-rows-[160px] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:auto-rows-[200px] md:grid-cols-4 md:gap-4 lg:auto-rows-[230px]">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className={`group relative block h-full w-full cursor-pointer overflow-hidden rounded-xl bg-light-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${tileClass(img, i)}`}
            aria-label={`View ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              onError={() => markFailed(img.src)}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            {img.caption ? (
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pb-3 pt-12 text-left text-sm font-normal text-white opacity-0 transition-opacity duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
                aria-hidden="true"
              >
                <span className="line-clamp-2">{img.caption}</span>
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

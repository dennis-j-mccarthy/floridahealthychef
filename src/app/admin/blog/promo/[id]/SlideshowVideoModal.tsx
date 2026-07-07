"use client";
/* eslint-disable @next/next/no-img-element -- plain <img> thumbnails mirror the
   exact pixels the canvas renderer will draw */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseBeats,
  pickRecordingMimeType,
  PLATFORM_LABEL,
  type VideoPlatform,
} from "./videoToolUtils";

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const SLIDE_MS = 4000;
const FPS = 30;
const BRAND_LINE = "Beautiful Foods by Beth";
const BODY_FONT = '44px Outfit, "Helvetica Neue", Arial, sans-serif';
const BRAND_FONT = '28px Outfit, "Helvetica Neue", Arial, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "One of the photos could not be loaded for video rendering. Please try again."
        )
      );
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

type Phase = "setup" | "rendering" | "done";

export default function SlideshowVideoModal({
  platform,
  optionNumber,
  caption,
  videoIdea,
  activeImage,
  otherImages,
  heroImageUrl,
  onClose,
}: {
  platform: VideoPlatform;
  optionNumber: number;
  caption: string;
  videoIdea: string;
  /** Resolved image URL of the active variant — always the first slide. */
  activeImage: string;
  /** Resolved image URLs of the other variants (extra slides). */
  otherImages: string[];
  /** Article hero image, used as filler to reach at least 3 slides. */
  heroImageUrl: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [error, setError] = useState("");
  const [progressSec, setProgressSec] = useState(0);
  const [result, setResult] = useState<{ url: string; ext: string } | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  /** Slide photo list: active variant first, then the others, deduped, hero as filler. */
  const slides = useMemo(() => {
    const urls: string[] = [];
    for (const src of [activeImage, ...otherImages]) {
      if (src && !urls.includes(src)) urls.push(src);
    }
    if (urls.length < 3 && heroImageUrl && !urls.includes(heroImageUrl)) {
      urls.push(heroImageUrl);
    }
    return urls.slice(0, 4);
  }, [activeImage, otherImages, heroImageUrl]);

  /** One text per slide: beats in order; caption fills the gaps / the last slide. */
  const slideTexts = useMemo(() => {
    const beats = parseBeats(videoIdea);
    const n = slides.length;
    return Array.from({ length: n }, (_, i) => {
      if (beats.length > n && i === n - 1) return caption;
      return beats[i] ?? caption;
    });
  }, [videoIdea, caption, slides.length]);

  const totalSec = (slides.length * SLIDE_MS) / 1000;

  // Cleanup on unmount: stop rendering, recorder, and free the blob URL.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function drawFrame(
    ctx: CanvasRenderingContext2D,
    images: HTMLImageElement[],
    elapsedMs: number
  ) {
    const idx = Math.min(Math.floor(elapsedMs / SLIDE_MS), images.length - 1);
    const t = Math.min(Math.max((elapsedMs - idx * SLIDE_MS) / SLIDE_MS, 0), 1);
    const img = images[idx];

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Slow Ken Burns: alternate zoom-in / zoom-out, cover-fit, gentle sideways drift.
    const zoomIn = idx % 2 === 0;
    const zoom = zoomIn ? 1 + 0.12 * t : 1.12 - 0.12 * t;
    const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const panDir = idx % 2 === 0 ? 1 : -1;
    const maxPanX = Math.max(0, (dw - CANVAS_W) / 2);
    const maxPanY = Math.max(0, (dh - CANVAS_H) / 2);
    const drift = (t - 0.5) * 2; // -1 → 1 across the slide
    const dx = (CANVAS_W - dw) / 2 + panDir * maxPanX * 0.5 * drift;
    const dy = (CANVAS_H - dh) / 2 + maxPanY * 0.25 * drift;
    ctx.drawImage(img, dx, dy, dw, dh);

    // Dark bottom gradient for text legibility.
    const grad = ctx.createLinearGradient(0, CANVAS_H * 0.5, 0, CANVAS_H);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, CANVAS_H * 0.5, CANVAS_W, CANVAS_H * 0.5);

    // Beat / caption text, wrapped, white with shadow.
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = BODY_FONT;
    const lines = wrapText(ctx, slideTexts[idx] ?? "", CANVAS_W - 160).slice(
      0,
      6
    );
    const lineHeight = 60;
    const baseY = 1760 - (lines.length - 1) * lineHeight;
    lines.forEach((line, i) => {
      ctx.fillText(line, 80, baseY + i * lineHeight);
    });

    // Brand line bottom-left on every slide.
    ctx.font = BRAND_FONT;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(BRAND_LINE, 80, 1848);
    ctx.restore();
  }

  async function generate() {
    setError("");
    setProgressSec(0);
    setPhase("rendering");
    try {
      const images = await Promise.all(slides.map(loadImage));
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("The video canvas is not ready.");
      if (typeof canvas.captureStream !== "function") {
        throw new Error(
          "This browser cannot record from a canvas. Try Chrome, Edge, or Safari 15+."
        );
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get a drawing context.");

      const totalMs = slides.length * SLIDE_MS;
      drawFrame(ctx, images, 0);

      // captureStream throws SecurityError if a cross-origin image tainted the canvas.
      const stream = canvas.captureStream(FPS);
      const { mimeType, ext } = pickRecordingMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 8_000_000,
      });
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setError("Recording failed in this browser. Try Chrome or Edge.");
        setPhase("setup");
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });
        if (blob.size === 0) {
          setError(
            "The browser produced an empty video. Try Chrome or Edge, or check that the photos loaded."
          );
          setPhase("setup");
          return;
        }
        const url = URL.createObjectURL(blob);
        resultUrlRef.current = url;
        setResult({ url, ext });
        setPhase("done");
      };
      recorder.start(250);

      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        setProgressSec(Math.min(Math.floor(elapsed / 1000), totalSec));
        if (elapsed >= totalMs) {
          rafRef.current = null;
          if (recorder.state !== "inactive") recorder.stop();
          return;
        }
        drawFrame(ctx, images, elapsed);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setPhase("setup");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Video rendering failed in this browser. Try Chrome or Edge."
      );
    }
  }

  function startOver() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setProgressSec(0);
    setError("");
    setPhase("setup");
  }

  const filename = `beth-${platform}-option${optionNumber}.${result?.ext ?? "mp4"}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-dark/70 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Build slideshow video"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-dark">
              Build slideshow video
            </h2>
            <p className="mt-1 text-sm font-light text-gray">
              {PLATFORM_LABEL[platform]} · Option {optionNumber} · 1080×1920 ·
              about {Math.round(totalSec)} seconds
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2.5 text-gray transition-colors hover:bg-light hover:text-dark"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        {phase === "setup" && (
          <>
            <p className="mt-5 text-sm font-light leading-relaxed text-gray">
              These photos become {slides.length} slides with a slow pan and
              zoom. Your video script plays one beat per slide, and the caption
              wraps it up.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {slides.map((src, i) => (
                <div
                  key={src}
                  className="relative overflow-hidden rounded-xl bg-light"
                  style={{ aspectRatio: "9 / 16" }}
                >
                  <img
                    src={src}
                    alt={`Slide ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={generate}
              className="mt-6 w-full rounded-lg bg-sage px-6 py-4 text-base font-medium text-white transition-colors hover:bg-olive-dark sm:w-auto"
            >
              Generate video
            </button>
          </>
        )}

        {/* The render canvas stays mounted so captureStream keeps its context. */}
        <div
          className={
            phase === "rendering" ? "mt-6 flex flex-col items-center" : "hidden"
          }
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full max-w-[260px] rounded-2xl bg-black shadow-sm"
          />
          <p className="mt-4 text-sm font-medium text-dark">
            Rendering… {progressSec}s of {Math.round(totalSec)}s
          </p>
          <p className="mt-1 text-xs font-light text-gray">
            Keep this tab visible while the video records.
          </p>
        </div>

        {phase === "done" && result && (
          <div className="mt-6 flex flex-col items-center">
            <video
              src={result.url}
              controls
              playsInline
              className="w-full max-w-[260px] rounded-2xl bg-black shadow-sm"
              style={{ aspectRatio: "9 / 16" }}
            />
            <p className="mt-3 text-sm font-light text-gray">
              Silent video — add trending audio when you post it.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={result.url}
                download={filename}
                className="flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-base font-medium text-white transition-colors hover:bg-olive-dark"
              >
                <DownloadIcon className="h-5 w-5" />
                Download video
              </a>
              <button
                onClick={startOver}
                className="rounded-lg bg-white px-5 py-3 text-base font-medium text-olive ring-1 ring-olive/40 transition-colors hover:bg-olive/10"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

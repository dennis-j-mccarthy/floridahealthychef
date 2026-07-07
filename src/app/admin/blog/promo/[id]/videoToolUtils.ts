/** Shared helpers for the promo-kit video tools (slideshow builder + recorder). */

/** Split a videoIdea script into clean beats: one per line, numbering/bullets stripped. */
export function parseBeats(videoIdea: string): string[] {
  return videoIdea
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+\s*[.):]\s*|[-–—•·*]\s*)/, "").trim())
    .filter(Boolean);
}

/** Pick the best MediaRecorder container the current browser supports. */
export function pickRecordingMimeType(): {
  mimeType: string;
  ext: "mp4" | "webm";
} {
  if (
    typeof MediaRecorder !== "undefined" &&
    typeof MediaRecorder.isTypeSupported === "function"
  ) {
    if (MediaRecorder.isTypeSupported("video/mp4")) {
      return { mimeType: "video/mp4", ext: "mp4" };
    }
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      return { mimeType: "video/webm;codecs=vp9", ext: "webm" };
    }
  }
  return { mimeType: "video/webm", ext: "webm" };
}

export type VideoPlatform = "reels" | "tiktok";

export const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  reels: "Reels",
  tiktok: "TikTok",
};

/** Sweet-spot recording range in seconds, per platform. */
export const SWEET_SPOT: Record<VideoPlatform, [number, number]> = {
  reels: [15, 30],
  tiktok: [21, 34],
};

export const PLATFORM_GUIDANCE: Record<VideoPlatform, string> = {
  reels:
    "Aim for 15–30 seconds. Reels up to 90s are allowed, but 15–30s hooks best.",
  tiktok:
    "Aim for 21–34 seconds — TikTok's engagement sweet spot. Up to 3 minutes allowed.",
};

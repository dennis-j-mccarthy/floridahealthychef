/*
  Client-side conversion logging (first-party, no cookies). Posts to
  /api/track with the UTM tags and ad click id kept from the landing URL for
  this visit (sessionStorage "fhc_attr", written by ConversionTracker).
  When NEXT_PUBLIC_GOOGLE_ADS_ID and a label are set, the same conversion is
  also reported to Google Ads through gtag. Same env names as Fluid Pathways:
    NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL → contact_submit (the consultation request)
    NEXT_PUBLIC_GOOGLE_ADS_CALL_LABEL    → call_click
*/

export type ConversionKind = "contact_click" | "contact_submit" | "signup" | "call_click";

export const ATTR_KEY = "fhc_attr";
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const LABELS: Partial<Record<ConversionKind, string | undefined>> = {
  contact_submit: process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL,
  call_click: process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_LABEL,
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readAttr(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function trackConversion(kind: ConversionKind): void {
  try {
    if (location.pathname.startsWith("/admin")) return;
  } catch {
    return;
  }
  const payload = JSON.stringify({ kind, path: location.pathname, ...readAttr() });
  // text/plain keeps the beacon a "simple" request; /api/track parses req.text().
  let sent = false;
  try {
    sent = !!navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "text/plain" }));
  } catch {
    sent = false;
  }
  if (!sent) {
    try {
      void fetch("/api/track", { method: "POST", headers: { "content-type": "text/plain" }, body: payload, keepalive: true }).catch(() => {});
    } catch {
      /* never block the visitor */
    }
  }
  try {
    const label = LABELS[kind];
    if (ADS_ID && label && window.gtag) window.gtag("event", "conversion", { send_to: `${ADS_ID}/${label}` });
  } catch {
    /* never block the visitor */
  }
}

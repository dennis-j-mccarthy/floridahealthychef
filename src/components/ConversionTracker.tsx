"use client";

import { useEffect } from "react";
import { ADS_ID, ATTR_KEY, trackConversion } from "@/lib/track";

/*
  Logs clicks on links to /contact (the complimentary consultation) and on
  any tel: link, and keeps UTM tags and gclid from the landing URL for this
  visit. Form successes (contact form, newsletter) call trackConversion
  directly. Loads gtag only when NEXT_PUBLIC_GOOGLE_ADS_ID is set. Does
  nothing inside /admin.
*/
export function ConversionTracker() {
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    try {
      const q = new URLSearchParams(location.search);
      const gclid = q.get("gclid") || undefined;
      const fbclid = q.get("fbclid") || undefined;
      const source = q.get("utm_source") || (gclid ? "google_ads" : fbclid ? "facebook" : undefined);
      const campaign = q.get("utm_campaign") || undefined;
      if (source || campaign || gclid) sessionStorage.setItem(ATTR_KEY, JSON.stringify({ source, campaign, gclid }));
    } catch {
      /* private mode */
    }

    if (ADS_ID && !window.gtag) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", ADS_ID);
    }

    function onClick(e: MouseEvent) {
      if (location.pathname.startsWith("/admin")) return;
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href") || "";
      if (href.startsWith("tel:")) trackConversion("call_click");
      else if (/^\/contact(\/|\?|#|$)/.test(href) && !location.pathname.startsWith("/contact")) trackConversion("contact_click");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

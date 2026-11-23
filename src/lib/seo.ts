import type { Metadata } from "next";

/*
  Search foundations for floridahealthychef.com (ported from Fluid Pathways,
  adapted to Beth's business).

  CANONICAL ORIGIN. The domain floridahealthychef.com still points at the old
  Webflow site (checked 2026-11-09); this Next app is only on
  floridahealthychef.vercel.app. Canonicals, the sitemap and structured data
  use the real domain so nothing ever tells Google the vercel.app copy is the
  original. Until the domain is moved to Vercel, those URLs resolve to the
  Webflow pages. Change SITE_URL here if the canonical host becomes www.
*/
export const SITE_URL = "https://floridahealthychef.com";

export const SITE_NAME = "Beautiful Foods by Beth";
export const SITE_SHORT = "Florida Healthy Chef";

export const DEFAULT_DESCRIPTION =
  "Certified Natural Chef Beth McCarthy offers personal chef services, intimate catering, and wellness coaching in Naples, Bonita, Estero, Fort Myers, and Punta Gorda.";

export const DEFAULT_OG_IMAGE = {
  url: "/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Beth slicing carrots, limes and radishes beside sweet potatoes and greens on a cutting board",
};

/** The communities the site names on /contact. Beth cooks in clients' homes; there is no storefront address. */
export const SERVICE_AREA = ["Naples", "Bonita Springs", "Estero", "Fort Myers", "Punta Gorda"];

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const PERSON_ID = `${SITE_URL}/#beth-mccarthy`;

type PageMetaInput = {
  /** Page title. Runs through the root layout's "%s | Beautiful Foods by Beth" template unless absolute. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** Path beginning with "/", used for the canonical URL and og:url. */
  path: string;
  image?: { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
  publishedTime?: string;
};

/**
 * Full metadata for a public page. Next replaces nested metadata objects
 * wholesale, so every page gets a complete openGraph and twitter block here
 * rather than inheriting part of one from the layout. Relative URLs resolve
 * against `metadataBase` in the root layout.
 */
export function pageMetadata(p: PageMetaInput): Metadata {
  const image = p.image ?? DEFAULT_OG_IMAGE;
  const socialTitle = p.absoluteTitle ? p.title : `${p.title} | ${SITE_NAME}`;
  return {
    title: p.absoluteTitle ? { absolute: p.title } : p.title,
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: {
      type: p.type ?? "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: p.path,
      title: socialTitle,
      description: p.description,
      images: [image],
      ...(p.type === "article" && p.publishedTime ? { publishedTime: p.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: p.description,
      images: [image.url],
    },
  };
}

/** Absolute URL for a site path or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Serialise structured data for a <script type="application/ld+json">. */
export function jsonLd(data: unknown): { __html: string } {
  // Escape "<" so a title from the database can never close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

/**
 * The business. A service-area business: no street address, geo or phone,
 * because the site shows none (Beth cooks in clients' homes).
 */
export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    alternateName: SITE_SHORT,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    logo: absoluteUrl("/images/logo.png"),
    areaServed: SERVICE_AREA.map((name) => ({
      "@type": "City",
      name,
      containedInPlace: { "@type": "State", name: "Florida" },
    })),
    knowsAbout: [
      "Personal chef services",
      "Intimate catering",
      "Healthy cooking",
      "Food as medicine",
      "Speaking and tasting events",
    ],
    founder: { "@id": PERSON_ID },
  };
}

/** Beth, using only the credentials the About page shows. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Beth McCarthy",
    jobTitle: "Certified Natural Chef",
    url: `${SITE_URL}/about`,
    worksFor: { "@id": BUSINESS_ID },
  };
}

/** Credentials as the site states them: the title from the site description, then the /about logo row. */
export const CREDENTIALS = [
  "Certified Natural Chef",
  "Nutrition Therapy Institute",
  "IAYT Certified Yoga Therapist",
  "E-RYT 500",
  "Certified Retreat Leader",
];

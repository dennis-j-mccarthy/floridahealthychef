import type { Metadata } from "next";
import ParallaxHero from "@/components/ParallaxHero";
import HomeSections from "@/components/HomeSections";
import { DEFAULT_DESCRIPTION, businessSchema, jsonLd, pageMetadata, personSchema } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Beautiful Foods by Beth | Southwest Florida's Healthiest Personal Chef",
  absoluteTitle: true,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(businessSchema())} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(personSchema())} />
      <ParallaxHero />
      <HomeSections />
    </>
  );
}

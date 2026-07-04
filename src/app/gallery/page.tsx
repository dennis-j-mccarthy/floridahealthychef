import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import GalleryLightbox, {
  type GalleryImage,
} from "@/components/GalleryLightbox";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual gallery of beautiful, healthy dishes crafted by Certified Natural Chef Beth McCarthy.",
};

// Always read fresh from the DB so new uploads appear instantly.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { position: "asc" },
  });

  const images: GalleryImage[] = items.map((item, i) => ({
    src: item.src,
    width: item.width,
    height: item.height,
    caption: item.caption,
    alt:
      item.caption ||
      `Healthy dish by Chef Beth — gallery photo ${i + 1}`,
  }));

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-light to-blush/20 pt-44 pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-[family-name:var(--font-great-vibes)] text-xl text-olive">
            Visual Feast
          </p>
          <h1 className="mt-4 text-5xl font-light text-dark md:text-6xl">
            Gallery
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-gray">
            A glimpse into the beautiful, nourishing dishes Beth creates.
            Every plate is a work of art designed to delight both the eyes and
            the palate.
          </p>
        </div>
      </section>

      {/* Gallery Grid + Lightbox */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <GalleryLightbox images={images} />
        </div>
      </section>
    </>
  );
}

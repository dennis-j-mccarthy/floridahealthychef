import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import GalleryManager from "./GalleryManager";

export const metadata: Metadata = {
  title: "Gallery Manager",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const items = await prisma.galleryItem.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      src: true,
      caption: true,
      width: true,
      height: true,
      position: true,
    },
  });

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <a
          href="/admin"
          className="text-sm font-medium text-olive transition-colors hover:text-olive-dark"
        >
          ← Dashboard
        </a>
        <h1 className="mt-3 text-4xl text-dark">Gallery</h1>
        <p className="mt-2 text-sm font-light text-gray">
          New photos publish instantly and appear first on the public gallery.
        </p>

        <GalleryManager initialItems={items} />
      </div>
    </section>
  );
}

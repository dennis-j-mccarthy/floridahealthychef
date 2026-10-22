import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { isMetaConfigured } from "@/lib/meta/config";
import { getConnection, isConnected, hasInstagram } from "@/lib/meta/store";
import { prisma } from "@/lib/db";
import SocialClient from "./SocialClient";

export const metadata: Metadata = {
  title: "Social",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://floridahealthychef.vercel.app";

/** Make a possibly-relative image src absolute so Graph can fetch it. */
function absolute(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_URL.replace(/\/$/, "")}${src.startsWith("/") ? "" : "/"}${src}`;
}

// The Social tool: connect Beth's Facebook once, then publish/schedule
// posts to her Page (and Instagram, when linked) straight from here.
export default async function AdminSocialPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const configured = isMetaConfigured();
  const conn = await getConnection();

  // Offer the captioned gallery photos as public image choices.
  const gallery = await prisma.galleryItem.findMany({
    where: { caption: { not: "" } },
    orderBy: { position: "asc" },
    select: { src: true, caption: true },
  });
  const photos = gallery.map((g) => ({
    url: absolute(g.src),
    caption: g.caption,
  }));

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <Link
          href="/admin"
          className="text-sm font-light text-gray transition-colors hover:text-dark"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-4 text-4xl text-dark">Social</h1>
        <p className="mt-2 max-w-2xl text-sm font-light text-gray">
          Publish and schedule posts to Beth&apos;s Facebook Page
          {hasInstagram(conn) ? " and Instagram" : ""} directly from the site.
          Connect once; the app does the rest through Meta&apos;s API.
        </p>

        <SocialClient
          configured={configured}
          connected={isConnected(conn)}
          instagramEnabled={hasInstagram(conn)}
          source={conn?.source ?? null}
          page={conn?.pageName ?? null}
          instagram={conn?.igUsername ?? null}
          fbUser={conn?.fbUserName ?? null}
          tokenExpiresAt={
            conn?.tokenExpiresAt ? conn.tokenExpiresAt.toISOString() : null
          }
          photos={photos}
        />
      </div>
    </section>
  );
}

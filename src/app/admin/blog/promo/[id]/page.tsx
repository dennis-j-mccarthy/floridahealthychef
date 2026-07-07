import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { normalizePromoKit, type PromoKitContent } from "@/lib/claude";
import PromoKitView from "./PromoKitView";

export const metadata: Metadata = {
  title: "Promo Kit",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://floridahealthychef.vercel.app";

/** Prefix relative image paths (/images/…, /uploads/…) with the site URL. */
function toAbsoluteUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default async function PromoKitPage({ params }: Props) {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const post = await prisma.blogPost.findUnique({ where: { id: numericId } });
  if (!post) notFound();

  const kitRow = await prisma.promoKit.findUnique({
    where: { postId: post.id },
  });
  let initialKit: PromoKitContent | null = null;
  if (kitRow) {
    try {
      // Normalize old single-variant kits to the current arrays-of-variants
      // shape (variants without an image fall back to the post's hero image).
      initialKit = normalizePromoKit(JSON.parse(kitRow.content), post.image);
    } catch {
      initialKit = null;
    }
  }

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const heroImageUrl = toAbsoluteUrl(post.image);

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/blog"
            className="text-sm font-light text-gray transition-colors hover:text-dark"
          >
            ← Blog Articles
          </Link>
          <Link
            href={`/admin/blog/edit/${post.id}`}
            className="text-sm font-light text-gray transition-colors hover:text-dark"
          >
            Edit this article →
          </Link>
        </div>
        <h1 className="mt-4 text-4xl text-dark">Promo Kit</h1>
        <p className="mt-2 text-lg font-light text-gray">{post.title}</p>

        <PromoKitView
          postId={post.id}
          articleTitle={post.title}
          articleUrl={articleUrl}
          heroImageUrl={heroImageUrl}
          initialKit={initialKit}
        />
      </div>
    </section>
  );
}

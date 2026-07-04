import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import BlogManager from "./BlogManager";

export const metadata: Metadata = {
  title: "Blog Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      published: true,
      updatedAt: true,
    },
  });

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1000px] px-6">
        <Link
          href="/admin"
          className="text-sm font-light text-gray transition-colors hover:text-dark"
        >
          ← Dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-dark">Blog Articles</h1>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/admin/blog/generate"
              className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              ✨ Generate with Claude
            </Link>
            <Link
              href="/admin/blog/edit/new"
              className="rounded-lg bg-olive px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-olive-dark"
            >
              + New Article
            </Link>
          </div>
        </div>

        <BlogManager
          initialPosts={posts.map((p) => ({
            ...p,
            updatedAt: p.updatedAt.toISOString(),
          }))}
        />
      </div>
    </section>
  );
}

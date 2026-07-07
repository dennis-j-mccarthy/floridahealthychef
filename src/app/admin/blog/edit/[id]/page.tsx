import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { blocksToText } from "../../blocks";
import type { BlogBlock } from "@/data/blog";
import EditForm, { type EditablePost } from "./EditForm";

export const metadata: Metadata = {
  title: "Edit Article",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function EditArticlePage({ params, searchParams }: Props) {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const { id } = await params;
  const { created } = await searchParams;

  let initial: EditablePost | null = null;
  if (id !== "new") {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) notFound();
    const post = await prisma.blogPost.findUnique({
      where: { id: numericId },
    });
    if (!post) notFound();

    let bodyText = "";
    try {
      const blocks = JSON.parse(post.body) as BlogBlock[];
      bodyText = Array.isArray(blocks) ? blocksToText(blocks) : "";
    } catch {
      bodyText = "";
    }

    initial = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      image: post.image,
      published: post.published,
      bodyText,
    };
  }

  const categories = await prisma.blogPost.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <Link
          href="/admin/blog"
          className="text-sm font-light text-gray transition-colors hover:text-dark"
        >
          ← Blog Articles
        </Link>
        <h1 className="mt-4 text-4xl text-dark">
          {initial ? "Edit Article" : "New Article"}
        </h1>

        <EditForm
          initial={initial}
          categories={categories.map((c) => c.category)}
          showPromoPrompt={created === "1"}
        />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import BlogList from "./BlogList";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Wellness tips, healthy recipes, and lifestyle inspiration from Certified Natural Chef Beth McCarthy.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      category: true,
      excerpt: true,
      image: true,
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-light to-blush/20 pt-44 pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-[family-name:var(--font-great-vibes)] text-xl text-olive">
            Wellness Journal
          </p>
          <h1 className="mt-4 text-5xl font-light text-dark md:text-6xl">
            Blog
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-gray">
            Recipes, wellness tips, and inspiration for living your healthiest
            life. Subscribe to receive Beth&apos;s monthly newsletter.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="bg-white py-24">
        <BlogList posts={posts} />
      </section>

      {/* Newsletter CTA */}
      <section className="bg-light py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h3 className="text-3xl font-light text-dark">
            Never Miss a Post
          </h3>
          <p className="mt-4 text-sm font-light text-gray">
            Join 10,000+ people who receive Beth&apos;s monthly wellness newsletter
            with exclusive recipes and health tips.
          </p>
          <div className="mt-8">
            <NewsletterForm
              source="blog"
              inputClassName="flex-1 rounded-full border border-light-2 bg-white px-5 py-3 text-sm font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none"
              buttonClassName="bg-dark px-6 py-3 text-sm font-light text-white transition-colors hover:bg-dark-2 disabled:opacity-60"
            />
          </div>
        </div>
      </section>
    </>
  );
}

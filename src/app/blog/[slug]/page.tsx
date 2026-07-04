import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { BlogBlock } from "@/data/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function parseBlocks(body: string): BlogBlock[] {
  try {
    const parsed = JSON.parse(body);
    return Array.isArray(parsed) ? (parsed as BlogBlock[]) : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    select: { title: true, excerpt: true },
  });
  if (!post) return { title: "Blog" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-12 text-3xl font-normal text-dark">{block.text}</h2>;
    case "p":
      return (
        <p className="mt-6 text-base font-light leading-loose text-gray">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul className="mt-6 space-y-3 pl-1">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-base font-light leading-relaxed text-gray"
            >
              <span className="mt-[3px] text-primary" aria-hidden="true">
                ✦
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
  });
  if (!post) notFound();

  const body = parseBlocks(post.body);

  const others = await prisma.blogPost.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, category: true, image: true },
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-light to-blush/20 pt-44 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-[family-name:var(--font-great-vibes)] text-xl text-olive">
            Wellness Journal
          </p>
          <div className="mt-4">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-light text-primary">
              {post.category}
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-light text-dark md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm font-light text-gray">
            By Beth McCarthy · Personal Healthy Chef
          </p>
        </div>
      </section>

      {/* Hero Image */}
      <section className="bg-white pt-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="bg-white py-16">
        <article className="mx-auto max-w-3xl px-6">
          {body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </article>
      </section>

      {/* More from the Journal */}
      <section className="bg-light py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-normal text-dark">
            More from the Journal
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={other.image}
                    alt={other.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-light text-primary">
                    {other.category}
                  </span>
                  <h3 className="mt-3 text-base font-semibold leading-tight text-dark transition-colors group-hover:text-olive">
                    {other.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-normal">
            Ready to Taste the Difference?
          </h2>
          <p className="mt-4 text-base font-light text-white/70">
            Schedule a complimentary 20 minute consultation and discover how
            Beth can bring healthy, beautiful food to your table.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-primary px-10 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    return { title: "Product Not Found" };
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    notFound();
  }

  return (
    <section className="bg-white pt-44 pb-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <Link
          href="/store"
          className="text-sm font-light text-gray transition-colors hover:text-olive"
        >
          ← Back to Store
        </Link>

        <div className="mt-8 grid items-start gap-12 md:grid-cols-2">
          {/* Product image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-light">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Details */}
          <div>
            <p className="font-[family-name:var(--font-great-vibes)] text-xl text-olive">
              Recipe Handbook
            </p>
            <h1 className="mt-3 text-4xl font-normal text-dark md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-light text-primary">
              {product.price}
            </p>
            <p className="mt-6 text-base font-light leading-relaxed text-gray">
              {product.description}
            </p>

            <div className="mt-10">
              <Link
                href={`/contact?product=${product.slug}`}
                className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Purchase — Contact Beth
              </Link>
              <p className="mt-3 text-xs font-light text-gray-light">
                Online checkout coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

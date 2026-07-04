import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Store",
  description:
    "Shop Chef Beth McCarthy's downloadable recipe handbooks — organic, food-as-medicine recipes for every meal.",
};

export default function StorePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-light pt-44 pb-16">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <p className="font-[family-name:var(--font-great-vibes)] text-xl text-olive">
            Shop
          </p>
          <h1 className="mt-4 text-4xl font-normal text-dark md:text-5xl">
            Recipe Handbooks
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-gray">
            Bring Beth&apos;s kitchen into yours. Each handbook is a curated
            collection of organic, food-as-medicine recipes crafted to nourish
            body and soul.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className="group overflow-hidden rounded-2xl bg-light shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-light-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-semibold text-dark leading-tight">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

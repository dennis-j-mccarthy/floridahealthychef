import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { recipeCategories, recipes } from "@/data/recipes";
import { products } from "@/data/products";
import { SITE_URL } from "@/lib/seo";

// Rebuild hourly so new blog posts and published landing pages appear
// without a deploy. Every database read is caught: the sitemap is
// prerendered at build time, and the Growth tables may not exist yet.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/recipes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/store`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const posts = await prisma.blogPost
    .findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { createdAt: "desc" } })
    .catch(() => []);
  const blog: MetadataRoute.Sitemap = posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "yearly", priority: 0.6 }));

  const recipePages: MetadataRoute.Sitemap = [
    ...recipeCategories.map((c) => ({ url: `${SITE_URL}/recipes-categories/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...recipes.map((r) => ({ url: `${SITE_URL}/recipes/${r.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.4 })),
  ];

  // Landing pages appear only once published (drafts are noindex and 404 for visitors).
  const landingRows = await prisma.landingPage
    .findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
    .catch(() => []);
  const landing: MetadataRoute.Sitemap = landingRows.map((r) => ({ url: `${SITE_URL}/for/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "monthly", priority: 0.8 }));

  return [...pages, ...landing, ...blog, ...recipePages];
}

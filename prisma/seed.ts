import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { readdirSync } from "fs";
import path from "path";
import { blogPosts } from "../src/data/blog";

const prisma = new PrismaClient();

function imageDims(file: string): { width: number; height: number } {
  const out = execSync(
    `sips -g pixelWidth -g pixelHeight "${file}"`
  ).toString();
  const width = Number(/pixelWidth: (\d+)/.exec(out)?.[1] ?? 800);
  const height = Number(/pixelHeight: (\d+)/.exec(out)?.[1] ?? 600);
  return { width, height };
}

async function main() {
  // Blog posts from the scraped live-site data
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        image: post.image,
        body: JSON.stringify(post.body),
      },
    });
  }
  console.log(`Seeded ${blogPosts.length} blog posts`);

  // Gallery images in current display order (img01 ... img61)
  const galleryDir = path.join(process.cwd(), "public/images/gallery");
  const files = readdirSync(galleryDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  let position = 1;
  for (const file of files) {
    const src = `/images/gallery/${file}`;
    const existing = await prisma.galleryItem.findFirst({ where: { src } });
    if (existing) continue;
    const { width, height } = imageDims(path.join(galleryDir, file));
    await prisma.galleryItem.create({
      data: { src, width, height, position: position++ },
    });
  }
  console.log(`Seeded ${position - 1} gallery items`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

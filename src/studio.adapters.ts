import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import type { ContentPost, SitePicture, StudioAdapters } from "@/lib/creator/studio-adapters";
import { studio } from "@/studio.config";

/*
  Beautiful Foods by Beth — how the shared studio reaches this site's data.
  Content = BlogPost rows (JSON block bodies), pictures = GalleryItem rows +
  studio uploads kept in StudioSetting("studio_uploads"), uploads = Vercel
  Blob through saveUpload, subscribers = Signup rows, auth = the admin cookie.
*/

type Block = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };
const UPLOADS_KEY = "studio_uploads";
const DEFAULT_IMAGE = "/images/blog/whats-a-personal-chef.jpg";

function blocksToParagraphs(body: string): string[] {
  try {
    const blocks = JSON.parse(body) as Block[];
    return blocks.map((b) => (b.type === "ul" ? b.items.map((i) => `• ${i}`).join("\n") : b.text)).filter(Boolean);
  } catch {
    return body ? [body] : [];
  }
}
const paragraphsToBlocks = (ps: string[]): Block[] => ps.map((text) => ({ type: "p", text }));
const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const slugCache = new Map<string, string>();

function toPost(r: { id: number; slug: string; title: string; excerpt: string; image: string; body: string; published: boolean; starred: boolean; createdAt: Date; updatedAt: Date }): ContentPost {
  slugCache.set(String(r.id), r.slug);
  return { id: String(r.id), title: r.title, date: fmtDate(r.createdAt), img: r.image || null, excerpt: r.excerpt, paragraphs: blocksToParagraphs(r.body), loc: null, published: r.published, starred: r.starred, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() };
}

async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  const { slugify } = await import("@/app/admin/blog/blocks");
  const root = slugify(base) || "post";
  let slug = root;
  for (let n = 2; ; n++) {
    const hit = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!hit || hit.id === exceptId) return slug;
    slug = `${root}-${n}`;
  }
}

async function readUploads(): Promise<SitePicture[]> {
  const row = await prisma.studioSetting.findUnique({ where: { key: UPLOADS_KEY } }).catch(() => null);
  const list = Array.isArray(row?.value) ? (row!.value as Array<{ src: string; title?: string }>) : [];
  return list.map((u) => ({ src: u.src, label: u.title || "Upload", collection: "studio-uploads", title: u.title ?? null }));
}

export const adapters: StudioAdapters = {
  content: {
    async list() {
      const rows = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
      return rows.map(toPost);
    },
    async get(id) {
      const n = Number(id);
      if (!Number.isFinite(n)) return null;
      const r = await prisma.blogPost.findUnique({ where: { id: n } }).catch(() => null);
      return r ? toPost(r) : null;
    },
    async create(input) {
      const cats = studio.brand.blog.categories ?? [];
      const category = cats.some((c) => c.id === input.category) ? (input.category as string) : (cats[0]?.id ?? "Personal Chef");
      const row = await prisma.blogPost.create({
        data: { slug: await uniqueSlug(input.title), title: input.title, category, excerpt: input.excerpt, image: input.img || DEFAULT_IMAGE, body: JSON.stringify(paragraphsToBlocks(input.paragraphs)), published: input.published, pillarId: input.pillarId ?? null },
      });
      return { id: String(row.id) };
    },
    async update(id, input) {
      const n = Number(id);
      const cats = studio.brand.blog.categories ?? [];
      const category = cats.some((c) => c.id === input.category) ? (input.category as string) : undefined;
      await prisma.blogPost.update({
        where: { id: n },
        data: { title: input.title, excerpt: input.excerpt, image: input.img || DEFAULT_IMAGE, body: JSON.stringify(paragraphsToBlocks(input.paragraphs)), published: input.published, ...(category ? { category } : {}), ...(input.pillarId !== undefined ? { pillarId: input.pillarId } : {}) },
      });
    },
    async setPublished(id, published) { await prisma.blogPost.update({ where: { id: Number(id) }, data: { published } }); },
    async setStarred(id, starred) { await prisma.blogPost.update({ where: { id: Number(id) }, data: { starred } }); },
    // The public URL uses the slug; ContentPost ids are numeric, so the slug is looked up and cached per id.
    url: (id) => `${studio.site.url}/blog/${slugCache.get(id) ?? id}`,
  },
  pictures: {
    mockupPattern: null,
    absolute: (src) => absoluteUrl(src),
    normalize: (src) => src.trim(),
    async list() {
      const [gallery, uploads] = await Promise.all([
        prisma.galleryItem.findMany({ orderBy: { position: "asc" } }).catch(() => []),
        readUploads(),
      ]);
      const out: SitePicture[] = gallery.map((g) => ({ src: g.src, label: g.caption || `Gallery ${g.position}`, collection: "gallery", title: g.caption || null }));
      return out.concat(uploads);
    },
    async add(input) {
      const prev = await readUploads();
      const title = (input.title || `Upload ${prev.length + 1}`).slice(0, 120);
      const next = [...prev.map((p) => ({ src: p.src, title: p.title ?? undefined })), { src: input.url, title, generated: !!input.generated }];
      await prisma.studioSetting.upsert({ where: { key: UPLOADS_KEY }, create: { key: UPLOADS_KEY, value: next }, update: { value: next } });
      return { src: input.url, title };
    },
  },
  uploads: {
    async upload(file) {
      const { saveUpload } = await import("@/lib/storage");
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "upload.jpg";
      const name = `${Date.now()}-${safe}`;
      const url = await saveUpload("studio", name, Buffer.from(await file.arrayBuffer()), file.type || "image/jpeg");
      return { url };
    },
  },
  subscribers: {
    async count() { return prisma.signup.count().catch(() => null); },
  },
  auth: {
    async getSession() { return (await isAdminRequest()) ? { email: process.env.ADMIN_EMAIL ?? "admin" } : null; },
    logoutPath: "/api/admin/logout",
  },
};

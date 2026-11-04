import { prisma } from "@/lib/db";
import AdminShell, { type NavCounts } from "./AdminShell";
import "./creator.css";

// The admin wears the shared Throughline Creator skin (AdminShell); the
// .admin-area class keeps the admin-only typography from globals.css.
// Counts for the rail chips come fresh on every request.
export const dynamic = "force-dynamic";

async function navCounts(): Promise<NavCounts> {
  const [posts, gallery] = await Promise.all([
    prisma.blogPost.count().catch(() => null),
    prisma.galleryItem.count().catch(() => null),
  ]);
  return { posts, gallery };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const counts = await navCounts();
  return (
    <AdminShell counts={counts}>
      <div className="admin-area">{children}</div>
    </AdminShell>
  );
}

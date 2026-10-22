import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { getTone } from "@/lib/blogSettings";
import IdeasForm from "./IdeasForm";

export const metadata: Metadata = {
  title: "Title Ideas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BlogIdeasPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const tone = await getTone();

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <Link
          href="/admin/blog"
          className="text-sm font-light text-gray transition-colors hover:text-dark"
        >
          ← Blog Articles
        </Link>
        <h1 className="mt-4 text-4xl text-dark">Title Ideas with Claude</h1>
        <p className="mt-2 max-w-2xl text-sm font-light text-gray">
          Set the voice once, then brainstorm title ideas and turn any of them
          into a full draft in Beth&apos;s voice. Drafts are saved unpublished
          so you can review and edit before they go live.
        </p>

        <IdeasForm initialTone={tone} />
      </div>
    </section>
  );
}

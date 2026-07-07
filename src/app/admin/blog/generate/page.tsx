import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import GenerateForm from "./GenerateForm";

export const metadata: Metadata = {
  title: "Generate Article",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GenerateArticlePage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <Link
          href="/admin/blog"
          className="text-sm font-light text-gray transition-colors hover:text-dark"
        >
          ← Blog Articles
        </Link>
        <h1 className="mt-4 text-4xl text-dark">Generate with Claude</h1>
        <p className="mt-2 max-w-2xl text-sm font-light text-gray">
          Give Claude a title and four key points (plus an optional photo) and
          it will draft a full article in Beth&apos;s voice. Drafts are saved
          unpublished so you can review and edit before they go live.
        </p>

        <GenerateForm />
      </div>
    </section>
  );
}

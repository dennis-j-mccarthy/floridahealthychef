import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const [signups, contacts] = await Promise.all([
    prisma.signup.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-dark">Admin Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Section nav */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href="/admin/blog"
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-2xl text-dark">Blog Articles</h2>
            <p className="mt-1 text-sm font-light text-gray">
              Write, edit, and generate articles with Claude.
            </p>
          </a>
          <a
            href="/admin/gallery"
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-2xl text-dark">Gallery</h2>
            <p className="mt-1 text-sm font-light text-gray">
              Upload photos, edit captions — new photos publish instantly.
            </p>
          </a>
        </div>

        {/* Newsletter signups */}
        <div className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl text-dark">Newsletter Signups</h2>
              <p className="mt-1 text-sm font-light text-gray">
                {signups.length} subscriber{signups.length === 1 ? "" : "s"} —
                export and import into Mailchimp manually.
              </p>
            </div>
            <a
              href="/api/admin/export"
              className="rounded-lg bg-olive px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-olive-dark"
            >
              Download CSV
            </a>
          </div>
          {signups.length === 0 ? (
            <p className="mt-6 text-sm font-light text-gray">
              No signups yet — they&apos;ll appear here as visitors subscribe.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-light-2 text-xs uppercase tracking-wide text-gray">
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Source</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={s.email} className="border-b border-light-2/60">
                      <td className="py-2.5 pr-4 font-light text-dark">
                        {s.email}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                          {s.source}
                        </span>
                      </td>
                      <td className="py-2.5 font-light text-gray">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contact messages */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl text-dark">Contact Messages</h2>
          <p className="mt-1 text-sm font-light text-gray">
            {contacts.length} message{contacts.length === 1 ? "" : "s"} from
            the contact form.
          </p>
          {contacts.length === 0 ? (
            <p className="mt-6 text-sm font-light text-gray">
              No messages yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-light p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-dark">
                      {[c.firstName, c.lastName].filter(Boolean).join(" ") ||
                        c.email}
                      <span className="ml-2 font-light text-gray">
                        {c.email}
                        {c.phone ? ` · ${c.phone}` : ""}
                      </span>
                    </p>
                    <p className="text-xs font-light text-gray">
                      {formatDate(c.createdAt)}
                    </p>
                  </div>
                  {c.service && (
                    <p className="mt-2 text-xs text-olive">
                      Interested in: {c.service}
                    </p>
                  )}
                  <p className="mt-2 whitespace-pre-wrap text-sm font-light leading-relaxed text-gray">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

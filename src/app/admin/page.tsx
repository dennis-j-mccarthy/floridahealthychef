import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

const icons = {
  article: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.63c0-1.24-1-2.25-2.25-2.25h-1.5a1.13 1.13 0 0 1-1.13-1.12v-1.5c0-1.24-1-2.25-2.25-2.25H10.5m2.25 11.25h-6m6-3h-6m1.5-9H5.63c-.63 0-1.13.5-1.13 1.13v17.24c0 .63.5 1.13 1.13 1.13h12.74c.63 0 1.13-.5 1.13-1.13V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  ),
  photo: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.91 2.91M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.01v.01h-.01v-.01Zm.38 0a.38.38 0 1 1-.75 0 .38.38 0 0 1 .75 0Z"
      />
    </svg>
  ),
  star: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.5c.16-.4.88-.4 1.04 0l2.1 5.06 5.46.44c.44.03.62.58.28.86l-4.16 3.56 1.27 5.33c.1.43-.36.77-.74.54L12 16.44l-4.68 2.85c-.38.23-.85-.11-.74-.54l1.27-5.33-4.16-3.56c-.34-.29-.16-.83.28-.86l5.46-.44 2.05-5.06Z"
      />
    </svg>
  ),
  mail: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.24a2.25 2.25 0 0 1-1.07 1.92l-7.5 4.61a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.92v-.24"
      />
    </svg>
  ),
  chat: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.63 8.25h6.75m-6.75 3.75h3.75m-8.25 6.34V6.31c0-1.14.9-2.06 2.03-2.06h12.44c1.12 0 2.03.92 2.03 2.06v8.63c0 1.13-.9 2.06-2.03 2.06H8.24l-3.6 3.13a.38.38 0 0 1-.61-.3v-1.5"
      />
    </svg>
  ),
  arrow: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
    </svg>
  ),
  sparkle: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.81 15.12 9 18.75l-.81-3.63a4.5 4.5 0 0 0-3.4-3.4L1.25 11l3.54-.72a4.5 4.5 0 0 0 3.4-3.4L9 3.25l.81 3.63a4.5 4.5 0 0 0 3.4 3.4l3.54.72-3.54.72a4.5 4.5 0 0 0-3.4 3.4Zm8.44-8.62L18 8l-.25-1.5L16.25 6l1.5-.5L18 4l.25 1.5 1.5.5-1.5.5ZM19.5 21l-.38-1.88L17.25 18.75l1.87-.37L19.5 16.5l.38 1.88 1.87.37-1.87.38L19.5 21Z"
      />
    </svg>
  ),
};

export default async function AdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  const [
    publishedCount,
    draftCount,
    starredCount,
    galleryCount,
    signups,
    contacts,
  ] = await Promise.all([
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: false } }),
    prisma.blogPost.count({ where: { starred: true } }),
    prisma.galleryItem.count(),
    prisma.signup.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const stats = [
    {
      label: "Articles",
      value: publishedCount,
      hint: draftCount > 0 ? `+ ${draftCount} draft${draftCount === 1 ? "" : "s"}` : "published",
      icon: icons.article,
    },
    {
      label: "Starred for newsletter",
      value: starredCount,
      hint: starredCount === 0 ? "none queued" : "queued",
      icon: icons.star,
    },
    {
      label: "Gallery photos",
      value: galleryCount,
      hint: "live on the site",
      icon: icons.photo,
    },
    {
      label: "Subscribers",
      value: signups.length,
      hint: "newsletter signups",
      icon: icons.mail,
    },
  ];

  return (
    <section className="min-h-screen bg-light pt-44 pb-20">
      <div className="mx-auto max-w-[1000px] px-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt=""
              width={160}
              height={160}
              className="h-14 w-auto"
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-sage">
                Joyful Wellness with Beth
              </p>
              <h1 className="mt-0.5 text-dark">Admin Dashboard</h1>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sage">{s.icon}</span>
                <span className="text-2xl font-semibold text-dark [font-family:var(--font-outfit),sans-serif]">
                  {s.value}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-dark">{s.label}</p>
              <p className="text-xs font-light text-gray">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* Primary sections */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/blog"
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-sage/30"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 text-sage">
                {icons.article}
              </span>
              <span className="mt-1 text-gray-light transition-transform group-hover:translate-x-1 group-hover:text-sage">
                {icons.arrow}
              </span>
            </div>
            <h2 className="mt-4 text-dark">Blog Articles</h2>
            <p className="mt-1 text-sm font-light leading-relaxed text-gray">
              Write and edit articles, generate drafts with Claude, build
              social + email promo kits, and queue the next newsletter.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-olive">
              {icons.sparkle} Claude generator included
            </p>
          </Link>

          <Link
            href="/admin/gallery"
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-sage/30"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 text-sage">
                {icons.photo}
              </span>
              <span className="mt-1 text-gray-light transition-transform group-hover:translate-x-1 group-hover:text-sage">
                {icons.arrow}
              </span>
            </div>
            <h2 className="mt-4 text-dark">Gallery</h2>
            <p className="mt-1 text-sm font-light leading-relaxed text-gray">
              Upload photos from your phone or desktop, edit captions —
              new photos publish instantly to the top of the gallery.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-olive">
              {icons.photo} {galleryCount} photos live
            </p>
          </Link>
        </div>

        {/* Newsletter signups */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                {icons.mail}
              </span>
              <div>
                <h2 className="text-dark">Newsletter Signups</h2>
                <p className="text-xs font-light text-gray">
                  {signups.length} subscriber{signups.length === 1 ? "" : "s"} —
                  export and import into Mailchimp manually.
                </p>
              </div>
            </div>
            <a
              href="/api/admin/export"
              className="rounded-lg bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-olive-dark"
            >
              Download CSV
            </a>
          </div>
          {signups.length === 0 ? (
            <p className="mt-6 rounded-xl bg-light px-4 py-6 text-center text-sm font-light text-gray">
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
                        <span className="rounded-full bg-sage/10 px-2.5 py-0.5 text-xs text-olive">
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
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
              {icons.chat}
            </span>
            <div>
              <h2 className="text-dark">Contact Messages</h2>
              <p className="text-xs font-light text-gray">
                {contacts.length} message{contacts.length === 1 ? "" : "s"} from
                the contact form.
              </p>
            </div>
          </div>
          {contacts.length === 0 ? (
            <p className="mt-6 rounded-xl bg-light px-4 py-6 text-center text-sm font-light text-gray">
              No messages yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-xl bg-light p-5">
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

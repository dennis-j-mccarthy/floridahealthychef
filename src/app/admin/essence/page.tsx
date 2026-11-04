import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/adminAuth";
import { EssenceEditor } from "@/components/EssenceEditor";

// Strategy → Essence. Read by the title and article generators through
// src/lib/brandContext.ts; cookie-gated like the rest of the admin.
export const metadata: Metadata = { title: "Essence" };

export default async function AdminEssencePage() {
  if (!(await isAdminRequest())) redirect("/admin/login");
  return (
    <section className="tl-page">
      <div className="tl-eyebrow">Strategy</div>
      <h1>Essence</h1>
      <p className="tl-lede">
        The line, the voice and the pillars every generated title, article and caption reads from.
      </p>
      <EssenceEditor />
    </section>
  );
}

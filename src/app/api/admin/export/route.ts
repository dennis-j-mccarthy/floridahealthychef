import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const signups = await prisma.signup.findMany({
    orderBy: { createdAt: "desc" },
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv =
    [
      "Email Address,Source,Signup Date",
      ...signups.map((s) =>
        [s.email, s.source, s.createdAt.toISOString()].map(escape).join(",")
      ),
    ].join("\r\n") + "\r\n";

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-signups-${today}.csv"`,
    },
  });
}

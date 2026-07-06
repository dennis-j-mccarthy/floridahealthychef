import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// "The newsletter went out": unstar every queued article and stamp it as
// having been featured in a newsletter.
export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.blogPost.updateMany({
    where: { starred: true },
    data: { starred: false, newsletteredAt: new Date() },
  });

  return NextResponse.json({ ok: true, count: result.count });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const email = String(body.email ?? "").trim();
  const source = String(body.source ?? "website").trim() || "website";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  // Signups are captured to the database and exported as CSV from /admin
  // for manual import into the Mailchimp audience.
  await prisma.signup.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase(), source },
  });

  return NextResponse.json({ ok: true });
}

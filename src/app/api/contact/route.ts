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
  const message = String(body.message ?? "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid email address." },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json(
      { ok: false, error: "Please include a message." },
      { status: 400 }
    );
  }

  // TODO: wire up email delivery (e.g. Resend) — send the submission
  // (firstName, lastName, email, phone, service, message) to Beth's inbox.
  // Requires RESEND_API_KEY + a verified sending domain.

  // Until then, submissions are captured to .data/contacts.json and shown
  // in the /admin dashboard.
  await prisma.contactMessage.create({
    data: {
      firstName: String(body.firstName ?? "").trim(),
      lastName: String(body.lastName ?? "").trim(),
      email,
      phone: String(body.phone ?? "").trim(),
      service: String(body.service ?? "").trim(),
      message,
    },
  });

  return NextResponse.json({ ok: true });
}

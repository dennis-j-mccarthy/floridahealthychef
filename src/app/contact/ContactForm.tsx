"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const inputClass =
  "mt-2 w-full rounded-lg border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState(
    product ? `I'm interested in ${product}` : ""
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          service,
          message,
        }),
      });
      const data = await res.json();
      setStatus(res.ok && data.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 rounded-2xl bg-green-light p-8" role="status">
        <p className="text-lg font-normal text-dark">
          Thank you — your message is on its way!
        </p>
        <p className="mt-2 text-sm font-light text-gray">
          Beth will get back to you shortly to schedule your complimentary
          consultation.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-light text-gray">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            placeholder="Jane"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-light text-gray">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            placeholder="Smith"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-light text-gray">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="jane@example.com"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-light text-gray">
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="(239) 555-0123"
        />
      </div>
      <div>
        <label htmlFor="service" className="block text-sm font-light text-gray">
          Service Interest
        </label>
        <select
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="mt-2 w-full rounded-lg border border-light-2 bg-light px-4 py-3 text-sm font-light text-dark focus:border-primary focus:outline-none"
        >
          <option value="">Select a service...</option>
          <option value="personal-chef">Personal Chef</option>
          <option value="catering">Intimate Catering</option>
          <option value="coaching">Culinary Coaching</option>
          <option value="wellness">Wellness Consulting</option>
          <option value="speaking">Speaking & Events</option>
          <option value="yoga">Yoga & Wellness Programs</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-light text-gray">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
          placeholder="Tell us about your health goals and how we can help..."
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-dark px-8 py-3 text-sm font-light tracking-wide text-white transition-colors hover:bg-dark-2 disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-sm text-primary" role="alert">
          Something went wrong sending your message — please try again, or call
          Beth directly at 719-440-2815.
        </p>
      )}
    </form>
  );
}

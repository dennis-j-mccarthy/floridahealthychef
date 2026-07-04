import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Schedule a complimentary 20-minute consultation with Certified Natural Chef Beth McCarthy. Serving Naples, Bonita, Estero, Fort Myers, and Punta Gorda.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blush/20 via-light to-primary/10 pt-44 pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-[family-name:var(--font-great-vibes)] text-xl text-olive">
            Get In Touch
          </p>
          <h1 className="mt-4 text-5xl font-light text-dark md:text-6xl">
            Contact Beth
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-gray">
            Ready to transform your health through beautiful, nourishing food?
            Schedule a complimentary 20-minute consultation or send a message below.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-light text-dark">
                Send a Message
              </h2>
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-10">
              <div className="rounded-2xl bg-light p-8">
                <h3 className="text-2xl font-light text-dark">
                  Complimentary Consultation
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-gray">
                  Not sure where to start? Schedule a free 20-minute phone
                  consultation. Beth will learn about your goals, answer your
                  questions, and recommend the best path forward for your health
                  journey.
                </p>
                <div className="mt-6">
                  <span className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-light text-white">
                    20 Minutes — Complimentary
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-light p-8">
                <h3 className="text-2xl font-light text-dark">
                  Service Area
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-gray">
                  Beth serves clients throughout Southwest Florida:
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Naples",
                    "Bonita Springs",
                    "Estero",
                    "Fort Myers",
                    "Punta Gorda",
                  ].map((city) => (
                    <span
                      key={city}
                      className="rounded-full bg-white px-4 py-1.5 text-xs font-light text-dark"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-light p-8">
                <h3 className="text-2xl font-light text-dark">
                  Follow Along
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-gray">
                  Follow Beth on Instagram for daily inspiration, behind-the-scenes
                  cooking, and the latest recipes.
                </p>
                <p className="mt-4 text-sm font-light text-primary">
                  @beautifulfoodsbybeth
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

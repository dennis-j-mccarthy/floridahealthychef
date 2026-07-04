import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t border-light-2 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1222px] px-6">
        {/* CTA card — matches the live site's shadowed subscribe container */}
        <div className="grid items-center gap-10 bg-white px-8 py-14 shadow-[0_4px_48px_0_rgba(0,0,0,0.06)] md:grid-cols-2 md:px-14 md:py-20">
          {/* Left: logo + tagline */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Joyful Wellness with Beth"
              width={160}
              height={160}
              className="h-24 w-auto"
            />
            <p className="mt-4 max-w-sm text-base font-light leading-relaxed text-gray">
              Certified Natural Chef Beth McCarthy — personal chef services,
              intimate catering, and wellness coaching in Southwest Florida.
            </p>
          </div>

          {/* Right: subscribe form */}
          <div>
            <NewsletterForm
              source="footer"
              className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:bg-light-2/60"
              inputClassName="flex-1 bg-light px-6 py-5 text-base font-light text-dark placeholder-gray-light focus:outline-none"
              buttonClassName="bg-sage px-8 py-5 text-base font-light lowercase text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
              buttonText="subscribe"
              successClassName="py-5 text-base font-light text-olive"
            />
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage text-[10px] text-white">
                ✓
              </span>
              <p className="text-[17px] font-light text-dark">
                Join the 10,000+ persons that choose healthy food
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar — logo + copyright */}
        <div className="mt-14 flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <Image
            src="/images/logo.png"
            alt="Joyful Wellness with Beth"
            width={160}
            height={160}
            className="h-20 w-auto"
          />
          <p className="text-base font-light text-dark">
            Copyright &copy; Beth McCarthy, {new Date().getFullYear()}
            <a
              href="/admin"
              className="ml-3 text-xs font-light text-gray-light/60 transition-colors hover:text-gray"
              aria-label="Site admin"
            >
              admin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

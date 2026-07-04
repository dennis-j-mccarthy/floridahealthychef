"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const servicesDropdown: { href: string; label: string; external?: boolean }[] = [
  { href: "/services#personal-chef", label: "Personal Chef Services" },
  { href: "/services#catering", label: "Intimate Catering" },
  { href: "/services#speaking", label: "Speaking & Tasting Events" },
  {
    href: "https://joyfulwellnesswithbeth.com/move/",
    label: "Yoga Classes and Events",
    external: true,
  },
  {
    href: "https://joyfulwellnesswithbeth.com/awakening-joy-for-women/",
    label: "Awakening Joy for Women",
    external: true,
  },
  {
    href: "https://joyfulwellnesswithbeth.com/food-as-medicine/#coaching",
    label: "Culinary Coaching",
    external: true,
  },
  {
    href: "https://joyfulwellnesswithbeth.com/wellness-coaching/",
    label: "Healthy Lifestyle Coaching",
    external: true,
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="JWB - Joyful Wellness with Beth"
            width={160}
            height={160}
            className="h-24 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            aria-label="Home"
            className="text-dark transition-colors hover:text-olive"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10.5L12 3l9 7.5M5 9.75V21h5.25v-6h3.5v6H19V9.75"
              />
            </svg>
          </Link>
          <Link
            href="/about"
            className="text-sm font-normal text-dark transition-colors hover:text-olive"
          >
            About
          </Link>
          <Link
            href="/recipes"
            className="text-sm font-normal text-dark transition-colors hover:text-olive"
          >
            Beautiful foods
          </Link>
          <Link
            href="/gallery"
            className="text-sm font-normal text-dark transition-colors hover:text-olive"
          >
            Gallery
          </Link>

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-normal text-dark transition-colors hover:text-olive">
              Services
              <svg
                className={`h-3 w-3 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className="w-64 rounded-lg bg-white py-2 shadow-lg">
                  {servicesDropdown.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        className="block px-4 py-2 text-sm text-dark hover:bg-light-2 hover:text-olive"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-dark hover:bg-light-2 hover:text-olive"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className="text-sm font-normal text-dark transition-colors hover:text-olive"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-sm font-normal text-dark transition-colors hover:text-olive"
          >
            Contact
          </Link>
          <Link
            href="/recipes"
            className="rounded-lg bg-olive px-5 py-2.5 text-sm font-normal text-white transition-colors hover:bg-olive-dark"
          >
            Discover Beautiful Foods by Beth
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="lg:hidden flex flex-col gap-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-dark transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-dark transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-dark transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t bg-white px-6 pb-6">
          <Link href="/about" className="block py-3 text-sm text-dark" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/recipes" className="block py-3 text-sm text-dark" onClick={() => setMobileOpen(false)}>Beautiful foods</Link>
          <Link href="/gallery" className="block py-3 text-sm text-dark" onClick={() => setMobileOpen(false)}>Gallery</Link>
          <div className="py-3">
            <button
              className="flex items-center gap-1 text-sm text-dark"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              Services
              <svg className={`h-3 w-3 transition-transform ${servicesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {servicesOpen && (
              <div className="mt-2 ml-4 space-y-2">
                {servicesDropdown.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener"
                      className="block py-1 text-sm text-gray"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} className="block py-1 text-sm text-gray" onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
          <Link href="/blog" className="block py-3 text-sm text-dark" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href="/contact" className="block py-3 text-sm text-dark" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link
            href="/recipes"
            className="mt-3 inline-block rounded-lg bg-olive px-5 py-2.5 text-sm text-white transition-colors hover:bg-olive-dark"
            onClick={() => setMobileOpen(false)}
          >
            Discover Beautiful Foods by Beth
          </Link>
        </nav>
      )}
    </header>
  );
}

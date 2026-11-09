import type { Metadata } from "next";
import { Lato, DM_Sans, Great_Vibes, Corinthia, Josefin_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterPopup from "@/components/NewsletterPopup";
import { ConversionTracker } from "@/components/ConversionTracker";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const corinthia = Corinthia({
  variable: "--font-corinthia",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// metadataBase resolves every relative canonical, og:url and image URL
// against the canonical origin (see src/lib/seo.ts for why it is the real
// domain, not vercel.app). Pages set their own canonical via pageMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beautiful Foods by Beth | Southwest Florida's Healthiest Personal Chef",
    template: "%s | Beautiful Foods by Beth",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${dmSans.variable} ${greatVibes.variable} ${corinthia.variable} ${josefinSans.variable} ${outfit.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
        <NewsletterPopup />
        <ConversionTracker />
      </body>
    </html>
  );
}

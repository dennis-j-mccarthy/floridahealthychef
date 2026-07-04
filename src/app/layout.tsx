import type { Metadata } from "next";
import { Lato, DM_Sans, Great_Vibes, Corinthia, Josefin_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterPopup from "@/components/NewsletterPopup";

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

export const metadata: Metadata = {
  title: {
    default: "Beautiful Foods by Beth | Southwest Florida's Healthiest Personal Chef",
    template: "%s | Beautiful Foods by Beth",
  },
  description:
    "Certified Natural Chef Beth McCarthy offers personal chef services, intimate catering, and wellness coaching in Naples, Bonita, Estero, Fort Myers, and Punta Gorda.",
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
      </body>
    </html>
  );
}

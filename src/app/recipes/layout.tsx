import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// /recipes is a client page, so its metadata lives here.
export const metadata: Metadata = pageMetadata({
  title: "Beautiful Foods",
  description: "Organic, food-as-medicine recipes from Certified Natural Chef Beth McCarthy: breakfast, lunch, dinner, salads and more.",
  path: "/recipes",
});

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

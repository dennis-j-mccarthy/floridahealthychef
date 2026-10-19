import type { Metadata } from "next";
import MovingHero from "@/components/MovingHero";
import FoodStrip from "@/components/FoodStrip";
import HomeSections from "@/components/HomeSections";

// Alternate homepage with a moving-picture hero. Kept out of search results so
// it never competes with / while it is being tried out.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return (
    <>
      <MovingHero />
      <FoodStrip />
      <HomeSections />
    </>
  );
}

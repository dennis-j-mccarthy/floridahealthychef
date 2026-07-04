"use client";

import { useState } from "react";
import { recipeCategories, recipes } from "@/data/recipes";
import RecipeCard from "./RecipeCard";

const filters = ["All", ...recipeCategories.map((c) => c.label)] as const;

export default function RecipesPage() {
  const [active, setActive] = useState<string>("All");

  const filtered =
    active === "All" ? recipes : recipes.filter((r) => r.category === active);

  return (
    <>
      {/* Hero */}
      <section className="bg-light pt-44 pb-16">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h1 className="text-4xl font-normal text-dark md:text-5xl">
            Beautiful Foods by Beth
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-gray">
            A collection of Beth&apos;s signature recipes — each one crafted with
            organic ingredients and the food-as-medicine philosophy at heart.
          </p>
        </div>
      </section>

      {/* Filters & Recipes */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filters.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                  active === cat
                    ? "bg-primary text-white"
                    : "bg-light-2 text-dark hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Recipe Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-16 text-center text-sm font-light text-gray">
              No recipes in this category yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </>
  );
}

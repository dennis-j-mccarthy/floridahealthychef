import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRecipesByCategory,
  recipeCategories,
  type CategorySlug,
} from "@/data/recipes";
import RecipeCard from "../../recipes/RecipeCard";

export function generateStaticParams() {
  return recipeCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = recipeCategories.find((c) => c.slug === category);
  if (!cat) return { title: "Recipes" };
  return {
    title: `${cat.label} Recipes`,
    description: `Beautiful ${cat.label} foods by Beth — organic recipes crafted with the food-as-medicine philosophy at heart.`,
  };
}

export default async function RecipeCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = recipeCategories.find((c) => c.slug === category);
  if (!cat) notFound();

  const categoryRecipes = getRecipesByCategory(cat.slug as CategorySlug);

  return (
    <>
      {/* Hero */}
      <section className="bg-light pt-44 pb-16">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h1 className="text-4xl font-normal text-dark md:text-5xl">
            {cat.label}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-gray">
            Beautiful {cat.label.toLowerCase()} recipes by Beth — each one
            crafted with organic ingredients and the food-as-medicine
            philosophy at heart.
          </p>
        </div>
      </section>

      {/* Category pills & Recipes */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link
              href="/recipes"
              className="rounded-full bg-light-2 px-6 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-primary/10"
            >
              All
            </Link>
            {recipeCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/recipes-categories/${c.slug}`}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                  c.slug === cat.slug
                    ? "bg-primary text-white"
                    : "bg-light-2 text-dark hover:bg-primary/10"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categoryRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>

          {categoryRecipes.length === 0 && (
            <p className="mt-16 text-center text-sm font-light text-gray">
              No recipes in this category yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe, getRelatedRecipes, recipes } from "@/data/recipes";
import RecipeCard from "../RecipeCard";

export function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return { title: "Recipe Not Found" };
  return {
    title: recipe.title,
    description:
      recipe.intro ??
      `${recipe.title} — a Beautiful Foods by Beth recipe crafted with organic ingredients.`,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const related = getRelatedRecipes(recipe, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-light pt-44 pb-12">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <Link
            href={`/recipes-categories/${recipe.categorySlug}`}
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white"
          >
            {recipe.category}
          </Link>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-normal text-dark md:text-5xl">
            {recipe.title}
          </h1>
          {recipe.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-base font-light text-gray">
              {recipe.subtitle}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {recipe.time && (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-light text-dark shadow-sm">
                <Image
                  src="/images/icons/clock.svg"
                  alt=""
                  width={14}
                  height={14}
                />
                {recipe.time}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-light text-dark shadow-sm">
                <Image
                  src="/images/icons/portions.svg"
                  alt=""
                  width={14}
                  height={14}
                />
                {recipe.servings} Portions
              </span>
            )}
            {recipe.difficulty && (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-light text-dark shadow-sm">
                <Image
                  src="/images/icons/difficulty.svg"
                  alt=""
                  width={14}
                  height={14}
                />
                {recipe.difficulty}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Recipe Image */}
      <section className="bg-light pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-md">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {recipe.intro && (
            <p className="mx-auto mb-14 max-w-3xl text-center text-base font-light leading-relaxed text-gray">
              {recipe.intro}
            </p>
          )}

          <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
            {/* Ingredients */}
            <aside>
              <div className="rounded-2xl bg-light p-8 lg:sticky lg:top-36">
                <h2 className="text-3xl text-dark md:text-4xl">Ingredients</h2>
                <div className="mt-6 space-y-6">
                  {recipe.ingredients.map((group, gi) => (
                    <div key={gi}>
                      {group.title && (
                        <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-olive">
                          {group.title}
                        </h3>
                      )}
                      <ul className="space-y-2.5">
                        {group.items.map((item, ii) => (
                          <li
                            key={ii}
                            className="flex items-start gap-2.5 text-sm font-light leading-relaxed text-dark"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Directions */}
            <div>
              <h2 className="text-3xl text-dark md:text-4xl">Directions</h2>
              <div className="mt-6 space-y-10">
                {recipe.directions.map((group, gi) => (
                  <div key={gi}>
                    {group.title && (
                      <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wide text-olive">
                        {group.title}
                      </h3>
                    )}
                    <ol className="space-y-5">
                      {group.steps.map((step, si) => (
                        <li key={si} className="flex items-start gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                            {si + 1}
                          </span>
                          <p className="pt-1 text-base font-light leading-relaxed text-dark">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {/* Health Notes */}
              {recipe.healthNotes.length > 0 && (
                <div className="mt-12 space-y-6">
                  {recipe.healthNotes.map((note, ni) => (
                    <div
                      key={ni}
                      className="rounded-2xl border-l-4 border-green bg-green-light p-6 md:p-8"
                    >
                      <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-olive">
                        {note.title}
                      </h3>
                      <p className="mt-3 text-sm font-light leading-relaxed text-dark">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {recipe.outro && (
                <p className="mt-12 text-base font-light italic leading-relaxed text-gray">
                  {recipe.outro}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* More Beautiful Foods */}
      <section className="bg-light py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center">
            <h2 className="text-dark">More Beautiful Foods</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base font-light text-gray">
              Keep exploring Beth&apos;s signature recipes — each one crafted
              with organic ingredients and the food-as-medicine philosophy at
              heart.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <RecipeCard key={r.slug} recipe={r} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-primary px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Schedule a complimentary 20 minute consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block overflow-hidden rounded-2xl bg-light shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-dark">
          {recipe.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-dark leading-tight">
          {recipe.title}
        </h3>
        {recipe.subtitle && (
          <p className="mt-1 text-sm font-light text-gray">{recipe.subtitle}</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-light">
          {recipe.time && (
            <span className="flex items-center gap-1">
              <Image
                src="/images/icons/clock.svg"
                alt=""
                width={12}
                height={12}
              />
              {recipe.time}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Image
                src="/images/icons/portions.svg"
                alt=""
                width={12}
                height={12}
              />
              {recipe.servings}
            </span>
          )}
          {recipe.difficulty && (
            <span className="flex items-center gap-1">
              <Image
                src="/images/icons/difficulty.svg"
                alt=""
                width={12}
                height={12}
              />
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

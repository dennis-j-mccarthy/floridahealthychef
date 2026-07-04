export type Product = {
  slug: string;
  name: string;
  price: string;
  image: string;
  description: string;
};

export const products: Product[] = [
  {
    slug: "recipe-handbook-1",
    name: "Recipe Handbook #1",
    price: "$49.00 USD",
    image: "/images/store/handbook-1.png",
    description:
      "A downloadable collection of Beth's organic, food-as-medicine recipes to bring nourishing meals into your everyday kitchen.",
  },
  {
    slug: "recipe-handbook-2",
    name: "Recipe Handbook #2",
    price: "$49.00 USD",
    image: "/images/store/handbook-2.png",
    description:
      "Beth's second handbook of wholesome, organic recipes — simple, seasonal dishes designed to heal and delight.",
  },
  {
    slug: "recipe-handbook-3",
    name: "Recipe Handbook #3",
    price: "$49.00 USD",
    image: "/images/store/handbook-3.png",
    description:
      "A curated set of Beth's signature salads, mains, and sweet endings, all built on the food-as-medicine philosophy.",
  },
  {
    slug: "recipe-handbook-4",
    name: "Recipe Handbook #4",
    price: "$49.00 USD",
    image: "/images/store/handbook-4.png",
    description:
      "Fresh, vibrant recipes from Beth's kitchen that make eating organic feel effortless and beautiful.",
  },
  {
    slug: "recipe-handbook-5",
    name: "Recipe Handbook #5",
    price: "$49.00 USD",
    image: "/images/store/handbook-5.png",
    description:
      "A downloadable volume of Beth's favorite gut-friendly breakfasts, lunches, and dinners for whole-body wellness.",
  },
  {
    slug: "recipe-handbook-6",
    name: "Recipe Handbook #6",
    price: "$49.00 USD",
    image: "/images/store/handbook-6.png",
    description:
      "The latest collection of Beth's organic creations — nourishing recipes that turn every plate into a work of art.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

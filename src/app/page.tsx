import Image from "next/image";
import Link from "next/link";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import ParallaxHero from "@/components/ParallaxHero";
import NewsletterForm from "@/components/NewsletterForm";

// NOTE: the live site's fifth archive card is February (no March issue exists
// on Mailchimp), but we only have March artwork locally — so the March card is
// kept unlinked until February artwork is available.
const newsletters: {
  title: string;
  month: string;
  image: string;
  href?: string;
}[] = [
  {
    title: "LIGHTNESS OF BEING AND SPARKLERS!",
    month: "July",
    image: "/images/newsletters/jul.png",
    href: "https://mailchi.mp/970837a31378/joyful-wellness-with-beth-july-newsletter",
  },
  {
    title: "SPLENDOR, RELAXATION AND LIGHT",
    month: "June",
    image: "/images/newsletters/jun.png",
    href: "https://mailchi.mp/95f227084933/joyful-wellness-with-beth-june-newsletter",
  },
  {
    title: "THE MONTH TO BLOOM!",
    month: "May",
    image: "/images/newsletters/may.png",
    href: "https://mailchi.mp/31d7de079c70/joyful-wellness-with-beth-may-newsletter",
  },
  {
    title: "BURSTING WITH POSSIBILITY",
    month: "April",
    image: "/images/newsletters/apr.png",
    href: "https://mailchi.mp/d94c6fb49324/joyful-wellness-with-beth-april-newsletter",
  },
  { title: "RENEWAL & GROWTH", month: "March", image: "/images/newsletters/mar.png" },
];

const featuredRecipes = [
  {
    title: "Organic Blackberry Frisée Fennel Salad",
    subtitle: "with Poached Chicken",
    image: "/images/recipes/blackberry-salad.jpg",
    time: "25 Min",
    servings: "2",
    href: "/recipes/organic-blackberry-frisee-fennel-salad-with-crumbled-goat-cheese-served-with-poached-chicken",
  },
  {
    title: "Healthy Vegetarian Spring Rolls",
    subtitle: "with Swiss Chard Wrapping",
    image: "/images/recipes/spring-rolls.jpg",
    time: "30 Min",
    servings: "4",
    href: "/recipes/healthy-vegetarian-spring-rolls-with-wilted-swiss-chard-wrapping",
  },
  {
    title: "Rainbow Carrot and White Fish",
    subtitle: "over Arugula",
    image: "/images/recipes/rainbow-carrot.jpg",
    time: "35 Min",
    servings: "2",
    href: "/recipes/rainbow-carrot-and-white-fish-over-arugula",
  },
  {
    title: "Italian Mixed Green Salad",
    subtitle: "with Prosciutto-Wrapped Asparagus",
    image: "/images/recipes/italian-salad.jpg",
    time: "20 Min",
    servings: "4",
    href: "/recipes/italian-mixed-green-salad-with-prosciutto-wrapped-asparagus",
  },
  {
    title: "Kale Cherry Salad",
    subtitle: "Fresh & Vibrant",
    image: "/images/recipes/kale-cherry.jpg",
    time: "15 Min",
    servings: "2",
    href: "/recipes/kale-cherry-salad",
  },
];

const instagramImages = [
  "/images/instagram/1.jpg",
  "/images/instagram/2.jpg",
  "/images/instagram/3.jpg",
  "/images/instagram/4.jpg",
  "/images/instagram/5.jpg",
];

const mediaLogos = [
  { name: "Featured Chef - Gulf & Main", image: "/images/media/gulf-main.png" },
  { name: "SWFL Blue Zone Project Chef Ambassador", image: "/images/media/blue-zone.png" },
  { name: "Top Naples Chef - Essential Naples Magazine", image: "/images/media/essential-naples.png" },
  { name: "Featured Chef - Gulf Shore Life Magazine", image: "/images/media/gulf-shore-life.png" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <ParallaxHero />

      {/* Latest Newsletters */}
      <section className="py-16 bg-light">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-center text-3xl font-normal text-dark mb-12">
            Latest Newsletters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {newsletters.map((nl) => {
              const card = (
                <>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-sm transition-shadow group-hover:shadow-md">
                    <Image src={nl.image} alt={nl.title} fill className="object-cover" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-dark uppercase tracking-wide text-center">
                    {nl.month}: {nl.title}
                  </p>
                </>
              );
              return nl.href ? (
                <a
                  key={nl.month}
                  href={nl.href}
                  target="_blank"
                  rel="noopener"
                  className="group cursor-pointer"
                >
                  {card}
                </a>
              ) : (
                <div key={nl.month} className="group">
                  {card}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full-width Consultation CTA Bar */}
      <section className="bg-olive py-5">
        <div className="text-center">
          <Link
            href="/contact"
            className="text-base font-light text-white tracking-wide hover:text-white/80"
          >
            Schedule a complimentary 20 minute consultation
          </Link>
        </div>
      </section>

      {/* About Beth */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Left: Photo with overlapping name card */}
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/about/beth-chef-coat.png"
                  alt="Beth McCarthy"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Overlapping name card */}
              <div className="absolute -bottom-8 right-0 translate-x-8 bg-white px-10 py-6 shadow-lg">
                <p className="text-olive text-xl font-light">Beth McCarthy</p>
                <p className="text-sm font-light text-gray mt-1">Personal Healthy Chef</p>
              </div>
            </div>

            {/* Right: Text content */}
            <div className="pt-12 lg:pt-24">
              <div className="w-20 h-0.5 bg-olive mb-8" />
              <h2 className="text-4xl md:text-5xl text-dark leading-tight">
                About Beth McCarthy
              </h2>
              <p className="mt-8 text-base font-light leading-relaxed text-gray">
                As a Certified Natural Chef and graduate of the prestigious Nutrition
                Therapy Institute in Denver, I&apos;m delighted to share my love of
                nourishing food with you. I&apos;m especially passionate about &ldquo;food
                as medicine&rdquo; and how food can strengthen, protect, reverse disease,
                increase vitality, slow aging, optimize health, and create joyful
                wellness.
              </p>
              <p className="mt-4 text-base font-light leading-relaxed text-gray">
                As your Personal Chef and wellness partner, together, we&apos;ll create
                healthy new eating and lifestyle choices that nourish every aspect
                of your life!
              </p>
              <Link
                href="/about"
                className="mt-8 inline-block bg-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-2"
              >
                More about Beth
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* As Featured In */}
      <section className="py-16 bg-light">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 className="text-2xl font-normal text-dark mb-10">
            As Featured In...
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {mediaLogos.map((logo) => (
              <div key={logo.name} className="flex justify-center">
                <Image
                  src={logo.image}
                  alt={logo.name}
                  width={200}
                  height={100}
                  className="h-40 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <TestimonialCarousel />

      {/* Beautiful Foods by Beth */}
      <section className="py-20 bg-light">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-normal text-dark">
              Beautiful Foods by Beth
            </h2>
            <Link href="/recipes" className="bg-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-2">
              Browse All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {featuredRecipes.map((recipe) => (
              <Link key={recipe.title} href={recipe.href} className="group cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={recipe.image} alt={recipe.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[2]" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-dark leading-tight">
                  {recipe.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-green-light">
        <div className="mx-auto max-w-xl px-6 text-center">
          <Image
            src="/images/icons/email.svg"
            alt=""
            width={48}
            height={48}
            className="mx-auto mb-6"
          />
          <h2 className="text-3xl font-normal text-dark">
            Free recipes on your inbox
          </h2>
          <p className="mt-4 text-sm font-light text-gray">
            Subscribe to our newsletter and receive our best recipes of the week,
            right on your inbox.
          </p>
          <div className="mt-8">
            <NewsletterForm source="home" />
          </div>
          <p className="mt-6 text-xs text-gray-light">
            Join the 10,000+ persons that choose healthy food
          </p>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 className="text-3xl font-normal text-dark mb-4">
            Follow my journey on Instagram
          </h2>
          <a
            href="#"
            className="inline-block mb-12 bg-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-2"
          >
            Follow me
          </a>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {instagramImages.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={img} alt={`Instagram post ${i + 1}`} fill className="object-cover transition-transform hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

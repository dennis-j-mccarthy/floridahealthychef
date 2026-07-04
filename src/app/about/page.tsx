import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { recipes } from "@/data/recipes";

export const metadata: Metadata = {
  title: "About Beth",
  description:
    "Meet Beth McCarthy, Southwest Florida's healthiest Personal Chef. As your Personal Chef and wellness partner, together, we'll create healthy new eating and lifestyle choices that nourish every aspect of your life.",
};

const certifications = [
  { name: "Certified Retreat Leader", image: "/images/about/retreat-logo.jpg", width: 117 },
  { name: "Nutrition Therapy Institute", image: "/images/about/nti-logo.png", width: 180 },
  { name: "IAYT Certified Yoga Therapist", image: "/images/about/iayt-logo.jpg", width: 236 },
  { name: "E-RYT 500", image: "/images/about/eryt500.png", width: 104 },
  { name: "YACEP", image: "/images/about/yacep.png", width: 103 },
];

const florals = {
  pink: "/images/florals/floral-pink.png",
  rose: "/images/florals/floral-rose.png",
};

const testimonials: {
  title: string;
  paragraphs: string[];
  name: string;
  floral: keyof typeof florals;
  floralPos: "top" | "bottom";
}[] = [
  {
    title: "“You can taste the love!”",
    paragraphs: [
      "Our family starting working with Beth over three years ago and it has been one of the best decisions we have ever made. Beth is so knowledgeable and talented. She has helped us use food as medicine, creating beautiful, delicious meals that support our health goals.",
      "Having Beth create our weekly meals has taken such a burden off my shoulders. I love knowing that my family is eating healthful meals. And the best part is I don’t have to make them! The food she prepares is packed with high- quality, organic ingredients, and you can taste the love Beth puts into each dish. I never dreamed we would have a Personal Chef, but now I don’t know what we would do without her, such a blessing!",
    ],
    name: "Beth N, Busy Professional",
    floral: "pink",
    floralPos: "top",
  },
  {
    title: "“A beautiful soul”",
    paragraphs: [
      "I played 12 years in the NFL and when I went to the Broncos for my final season I was blessed to meet Beth. She helped to make my final season at 35 years of age a success. Not only was her food fresh, healthy, organic, and clean but most importantly she made it all taste great. On top of it all she is a beautiful soul who repeatedly went out of her way to make sure I had everything I wanted and needed. All of my requests were beyond met. I’m forever grateful for Chef Beth. My only regret was not having her my entire career.",
    ],
    name: "Demar D, Denver Broncos Offensive Lineman",
    floral: "rose",
    floralPos: "bottom",
  },
  {
    title: "“Part of our family”",
    paragraphs: [
      "I highly recommend Chef Beth. Utilizing her expertise, I was able to lose close to 20 pounds and eliminate the need for blood pressure medication. She has been feeding our family for several years, and we are truly grateful. The food is amazing, and we consider her part of our family. Thank you Chef Beth !",
    ],
    name: "Kurt N",
    floral: "pink",
    floralPos: "top",
  },
  {
    title: "To any person looking to improve their life",
    paragraphs: [
      "Truly...that is exactly what Beth McCarthy did for myself and for our family.  She improved our life. As a mom and full time Realtor in a very busy town, I made the leap of hiring my first personal chef service.  Beth accommodated our desire to eat well, while taking all of the menu planning, grocery shopping and meal prep time off my already overflowing schedule. From the moment of our first meeting, I was hooked on her beautiful, healthful food, made with tremendous love.",
      "I cannot recommend Beth enough to anyone in need of specific dietary and lifestyle support as she is a magician with food and wellness.",
    ],
    name: "Beth M",
    floral: "pink",
    floralPos: "bottom",
  },
  {
    title: "“Most beautiful dishes”",
    paragraphs: [
      "Beth created some of the tastiest, healthiest, freshest, and most beautiful dishes. The weekly menus were well thought out and met my goal of wanting to be able to feed my family delicious and nutritious meals without having to do any of the work. Beth is well versed in all different types of cuisine, which ensured that entree offerings were never boring or bland. The food tasted great, looked fantastic, and was very healthy. It was a quadruple win; one of the smartest decisions I ever made for myself and my family during a very busy time in my career. Thank you Beth! We appreciate you.",
    ],
    name: "Lisa R",
    floral: "rose",
    floralPos: "top",
  },
  {
    title: "“Food for optimal health”",
    paragraphs: [
      "If you find yourself in a health crisis, or better yet if you just want to feed your body what it really needs for optimal health, I would encourage you to contact Beth. She is passionate about healthy, delicious food. Once you meet her, talk to her, and taste her savory meals you’ll know what I’m talking about.",
    ],
    name: "Lisa T",
    floral: "pink",
    floralPos: "bottom",
  },
  {
    title: "“Joy of healthy eating”",
    paragraphs: [
      "The joy of working with Beth is that she is a passionate food-as-medicine chef and educator. After culinary coaching and cooking session, she left us with recipes, detailed information on the health benefits of each meal that we made together, and pictures of what unprocessed, organic, non-GMO brands to buy at the store. After several months of working with Beth, my daughter is off of blood pressure medication, has more energy, has lost weight, and genuinely desires to eat healthy. We are grateful for Beth’s knowledge and friendship, and thank her for bringing the joy of healthy cooking and eating and living to our family.",
    ],
    name: "Liz P. Rocky Mountain Restaurant Group",
    floral: "rose",
    floralPos: "top",
  },
];

// Same six recipes, in the same order, as the live about page's
// "Beautiful Foods by Beth" grid.
const featuredRecipeSlugs = [
  "organic-blackberry-frisee-fennel-salad-with-crumbled-goat-cheese-served-with-poached-chicken",
  "healthy-vegetarian-spring-rolls-with-wilted-swiss-chard-wrapping",
  "rainbow-carrot-and-white-fish-over-arugula",
  "italian-mixed-green-salad-with-prosciutto-wrapped-asparagus",
  "kale-cherry-salad",
  "refreshing-romaine-and-artichoke-salad",
];

const bodyText =
  "font-[family-name:var(--font-josefin-sans)] text-base font-light leading-[1.667] text-[#020202]";

export default function AboutPage() {
  const featuredRecipes = featuredRecipeSlugs
    .map((slug) => recipes.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <>
      {/* Hero heading */}
      <section className="bg-white pt-44">
        <div className="mx-auto max-w-[1270px] px-6 pt-10 pb-5 text-center">
          <h1 className="text-[38px] leading-[1.1] md:text-[60px]">
            <span className="block font-[family-name:var(--font-josefin-sans)] text-base font-light uppercase leading-[2] tracking-wide text-dark md:text-2xl">
              Meet Beth,
            </span>
            Southwest Florida&rsquo;s <span className="text-sage">Healthiest</span>{" "}
            Personal Chef
          </h1>
        </div>
      </section>

      {/* Photo collage with watercolor florals */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1270px] px-6">
          <div
            className="relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
            style={{ backgroundImage: "url(/images/florals/wash.png)" }}
          >
            {/* Floral accents (match the Webflow about-grid backgrounds) */}
            <Image
              src="/images/florals/floral-blue.png"
              alt=""
              width={250}
              height={260}
              className="pointer-events-none absolute top-0 left-[58%] z-0 hidden w-[250px] mix-blend-multiply md:block"
            />
            <Image
              src="/images/florals/floral-rose.png"
              alt=""
              width={300}
              height={193}
              className="pointer-events-none absolute bottom-0 left-[58%] z-0 hidden w-[300px] mix-blend-multiply md:block"
            />
            {/* Beth in chef coat — bottom-right of row 1, col 1 */}
            <div className="z-10 flex flex-col items-end self-end md:mb-14">
              <Image
                src="/images/about/beth-chef-coat.png"
                alt="Beth McCarthy in her chef coat"
                width={608}
                height={760}
                className="block w-full max-w-[595px]"
              />
            </div>
            {/* Kitchen — bottom-aligned in row 1, col 2, overlapping downward */}
            <div className="z-10 flex max-h-[680px] flex-col self-end justify-self-start md:-mb-[100px]">
              <Image
                src="/images/about/about-2.jpg"
                alt="Fresh organic ingredients in the kitchen"
                width={608}
                height={780}
                className="block h-full w-full object-cover"
              />
            </div>
            {/* Joyful Wellness food art — top-right of row 2, col 1 */}
            <div className="z-10 w-[82%] self-start md:-mt-14 md:justify-self-end">
              <Image
                src="/images/about/img-0519.jpeg"
                alt="Joyful Wellness spelled out in colorful vegetables"
                width={468}
                height={351}
                className="block w-full"
              />
            </div>
            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      {/* Meet Personal Chef Beth McCarthy */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1270px] px-6">
          <div className="mt-16 px-0 md:mt-24 md:px-8">
            <h2 className="mb-2 text-[38px] leading-[1.1] md:text-[60px]">
              Meet Personal Chef Beth McCarthy
            </h2>
            <p className={`${bodyText} mb-4`}>
              As your Personal Chef and wellness partner, together, we&rsquo;ll
              create healthy new eating and lifestyle choices that nourish every
              aspect of your life.
              <br />
              <br />
              My goal is to educate, motivate, and inspire individuals, couples,
              families, and communities to:
            </p>
            <ul className={`${bodyText} mb-4 list-disc space-y-2 pl-6`}>
              <li>
                Adopt a natural, whole-foods diet &mdash; think plant-forward,
                unrefined, fresh, in-season, organic, unprocessed,
                non-genetically modified, (non-GMO), supportive of
                regenerative/local farming sources when possible, and dedicated
                to supporting ethical farmers by buying pasture-raised,
                grass-fed meats and wild-caught, responsibly sourced seafood,
                instead of factory farmed raising methods.
              </li>
              <li>
                Engage in cooking with renewed commitment to health and deep
                nourishment
              </li>
              <li>
                Honor the kitchen as a sanctuary and joyful gathering space for
                yourself, family and friends to love, cook, and connect in
              </li>
              <li className="mb-7">
                Fall in love with your life&mdash; one healthy lifestyle choice
                and mindful bite at a time!
              </li>
            </ul>
            <p className={`${bodyText} mb-4`}>
              Whether you&rsquo;re struggling with a new or existing health
              condition requiring a change in diet and lifestyle, managing a
              hectic work schedule, family life or career without time or energy
              to shop and cook, frustrated by body image and weight issues,
              desire learning new ways cook healthier, or have a special
              celebration where you are looking for an in-home caterer or
              cooking class instructor to execute a memorable event, let me help
              educate, inspire and support your quest for living a healthy,
              vibrant life.
            </p>
            <p className="font-[family-name:var(--font-great-vibes)] text-[32px] leading-[1.25] text-sage md:text-[52px]">
              Let&rsquo;s cook up your best life today!
            </p>
          </div>
        </div>

        {/* Full-width consultation bar */}
        <div className="mt-[5%] flex items-center justify-center bg-sage text-center text-white">
          <div className="flex w-full flex-col items-center justify-center py-6">
            <Link
              href="/contact"
              className="font-[family-name:var(--font-josefin-sans)] text-base font-light underline hover:text-white/80"
            >
              Schedule a complimentary 20 minute consultation
            </Link>
          </div>
        </div>
      </section>

      {/* More About Beth */}
      <section className="relative border-b border-[gainsboro] pt-16 pb-[50px]">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[38vw] bg-mint md:block" />
        <div className="mx-auto max-w-[1270px] px-6">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="self-start md:w-[48%] md:self-center">
              <h2 className="mb-2 text-[38px] leading-[1.1] md:text-[60px]">
                More About Beth
              </h2>
              <p className={bodyText}>
                When Beth is not sharing her passion for healthy living,
                nutrition, food as medicine, creative cookery, and self-care
                through yoga, movement and mindfulness practices, she can be
                found in Italy, joyfully attending culinary classes while
                visiting her artist daughter, Maeve, who resides in the heart of
                Rome.
                <br />
                <br />
                Beth also cherishes quality time with her other three beautiful
                adult children&mdash;Savanna, Bria, and Brennan. She delights in
                cooking and entertaining for her loved ones, laughing and loving
                with her special friends, tending to her gardens in Colorado and
                Florida, creating exciting food-as-medicine recipes, practicing
                and teaching yoga and meditation, leading women&rsquo;s wellness
                retreats, hiking in the mountains of Colorado, walking the
                shorelines of Southwest Florida collecting heart-shaped
                seashells, swimming in the ocean with her beloved white golden
                retriever, Arwen, and sharing life&rsquo;s adventures with her
                partner and best friend of 35 years, Dennis.
              </p>
            </div>
            <div className="relative flex md:w-[43%] md:justify-end">
              <Image
                src="/images/about/fullsizerender.jpeg"
                alt="Beth hiking a Colorado trail with her golden retriever, Arwen"
                width={578}
                height={831}
                className="block w-full max-w-[578px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Client Raves + Credentials + Beautiful Foods (one relative section, like the live page) */}
      <section className="relative overflow-hidden bg-white pt-[50px] pb-40">
        {/* Client Raves */}
        <div className="mx-auto max-w-[1270px] px-6">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-[38px] leading-[1.1] md:text-[60px]">
              Client Raves
            </h2>
            <div className="flex gap-3 pb-4">
              <button
                id="raves-prev"
                aria-label="Previous testimonials"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white transition-transform hover:scale-105"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                id="raves-next"
                aria-label="Next testimonials"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white transition-transform hover:scale-105"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div
            id="raves-slider"
            className="-mx-6 flex snap-x snap-mandatory gap-[25px] overflow-x-auto scroll-smooth px-6 pb-6 [scrollbar-width:none]"
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="w-[88%] flex-shrink-0 snap-start bg-white px-10 py-14 shadow-[0_4px_18px_0_rgba(0,0,0,0.06)] md:w-[46%] lg:w-[31.5%] lg:min-h-[860px]"
              >
                {t.floralPos === "top" && (
                  <div className="mb-5 flex items-center justify-center">
                    <Image src={florals[t.floral]} alt="" width={150} height={112} className="w-[150px] mix-blend-multiply" />
                  </div>
                )}
                <h3 className="mb-3 font-[family-name:var(--font-josefin-sans)]! text-[22px] font-light leading-[1.2] text-dark md:text-[26px]">
                  {t.title}
                </h3>
                {t.paragraphs.map((p, i) => (
                  <p key={i} className={`${bodyText} ${i > 0 ? "mt-4" : ""}`}>
                    {p}
                  </p>
                ))}
                <div className="mt-6 font-medium leading-[1.2] text-sage">
                  {t.name}
                </div>
                {t.floralPos === "bottom" && (
                  <div className="mt-8 flex items-center justify-center">
                    <Image src={florals[t.floral]} alt="" width={150} height={112} className="w-[150px] mix-blend-multiply" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var s=document.getElementById('raves-slider');if(!s)return;var w=function(){var c=s.firstElementChild;return c?c.getBoundingClientRect().width+25:420};var p=document.getElementById('raves-prev'),n=document.getElementById('raves-next');p&&p.addEventListener('click',function(){s.scrollBy({left:-w(),behavior:'smooth'})});n&&n.addEventListener('click',function(){s.scrollBy({left:w(),behavior:'smooth'})});})();`,
            }}
          />
        </div>

        {/* Credentials & Certifications */}
        <div className="bg-white px-[5%] pt-9">
          <h2 className="text-[38px] leading-[1.1] md:text-[60px]">
            Credentials &amp; Certifications
          </h2>
          <div className="mt-2 grid grid-cols-2 items-center justify-items-center gap-8 py-8 md:grid-cols-5">
            {certifications.map((cert) => (
              <Image
                key={cert.name}
                src={cert.image}
                alt={cert.name}
                width={cert.width}
                height={120}
                className="h-auto object-contain"
                style={{ width: cert.width }}
              />
            ))}
          </div>
        </div>

        {/* Beautiful Foods by Beth */}
        <div className="mx-auto max-w-[1270px] px-6 pt-[10%]">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-[38px] leading-[1.1] md:text-[60px]">
              Beautiful Foods by Beth
            </h2>
            <Link
              href="/recipes"
              className="border border-black px-10 py-6 font-[family-name:var(--font-josefin-sans)] text-base font-light lowercase leading-none text-dark transition-colors hover:bg-dark hover:text-white"
            >
              Browse All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
            {featuredRecipes.map((recipe) => (
              <Link
                key={recipe.slug}
                href={`/recipes/${recipe.slug}`}
                className="group relative block h-full w-full bg-white shadow-[0_4px_18px_0_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute right-[1%] bottom-[1%] z-[2] rounded-full bg-[#1a1a1a]/85 p-2.5 text-[15px] font-medium lowercase leading-none tracking-[1.5px] text-mint">
                    {recipe.category}
                  </div>
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    width={600}
                    height={600}
                    className="block aspect-square w-full object-cover"
                  />
                </div>
                <div className="px-[30px] py-6">
                  <div className="mb-4 h-[2px] w-[20%] bg-[#c26bd0]" />
                  <h3 className="font-[family-name:var(--font-josefin-sans)]! text-[22px] font-light leading-[1.15] text-dark md:text-[26px]">
                    {recipe.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

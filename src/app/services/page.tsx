import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore services offered by Beth, including Personal Chef Services, catering and more!",
};

const scriptHeading =
  "font-[family-name:var(--font-great-vibes)] font-normal text-[#020202]";

function FloralTestimonial({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution: string;
}) {
  return (
    <section className="relative mt-[5%] bg-sage/12 px-[10%] py-[5%]">
      <Image
        src="/images/florals/bouquet-corner.png"
        alt=""
        width={150}
        height={70}
        className="absolute left-0 top-0 hidden w-[150px] mix-blend-multiply md:block"
      />
      <Image
        src="/images/florals/bouquet-corner.png"
        alt=""
        width={300}
        height={140}
        className="absolute bottom-0 right-0 hidden w-[300px] mix-blend-multiply md:block"
      />
      <div className="mt-6 pl-5 pr-10 font-light italic text-black">
        <div className="space-y-4 text-sm leading-relaxed">{children}</div>
        <p className="mt-6 text-sm not-italic">{attribution}</p>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      {/* Hero — script "Services" on pale sage band with floral art */}
      <div className="bg-white pt-44">
        <div className="relative flex h-[400px] w-full flex-col items-start justify-center overflow-hidden bg-sage/8 pl-[5%]">
          <Image
            src="/images/florals/bouquet-pink.png"
            alt=""
            width={400}
            height={246}
            priority
            className="absolute right-[4%] top-1/2 w-[240px] -translate-y-1/2 mix-blend-multiply md:w-[340px]"
          />
          <h1
            className={`${scriptHeading} relative text-[70px] leading-[1.1] md:text-[100px]`}
          >
            Services
          </h1>
          <p className="relative mt-2 max-w-md text-base font-light leading-[1.667] text-[#020202]">
            Explore services offered by Beth, including Personal Chef Services,
            catering and more!
          </p>
        </div>
      </div>

      {/* Personal Chef Services */}
      <section
        id="personal-chef"
        className="mt-[5%] scroll-mt-32 bg-white px-5"
      >
        <div className="mx-auto grid max-w-[1270px] grid-cols-1 gap-x-7 gap-y-8 pb-24 lg:grid-cols-[0.75fr_1.25fr] lg:px-[100px]">
          {/* Stacked photo column */}
          <div className="flex flex-col gap-2.5 lg:pr-[5%]">
            <div className="relative hidden h-[400px] w-full md:block">
              <Image
                src="/images/services/p1030920.jpg"
                alt="Chopping fresh organic vegetables on a cutting board"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-[400px] w-full md:h-[500px]">
              <Image
                src="/images/services/img-1983.jpg"
                alt="Beth in her chef whites in a client's kitchen"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden h-[400px] w-full md:block">
              <Image
                src="/images/services/img-3162.jpeg"
                alt="A week of freshly prepared meals laid out in a client's kitchen"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden h-[400px] w-full md:block">
              <Image
                src="/images/services/p1030930.jpg"
                alt="A beautifully prepared buffet spread"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="relative hidden h-[400px] w-full md:block">
              <Image
                src="/images/services/img-0519.jpeg"
                alt="Fresh carrots and vegetables beside a chef's knife"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Copy column */}
          <div className="text-base font-light leading-[1.667] text-[#020202]">
            <h2 className={`${scriptHeading} mt-5 text-[44px] md:text-[60px]`}>
              Personal Chef Services
            </h2>
            <p className="mt-4">
              <span className="font-light leading-none text-sage">
                As a Certified Natural Chef, I believe that the cure is in the
                kitchen, and that your optimal health is at the tip of your
                fork!
              </span>
              <br />I am experienced with special diets including Paleo,
              vegetarian, vegan, low-glycemic, pescatarian, anti-inflammatory,
              Keto, gluten-free, elimination and more.
            </p>
            <p className="mt-6">
              Whether you are struggling with a health condition requiring a
              change of diet and lifestyle, frustrated by body image and weight
              gain, wanting to take the stress and time out of weekly menu
              planning, grocery shopping and cooking to do what you&rsquo;d
              really love to do with yourself, your partner, family and
              friends, or wish to enhance your already healthy lifestyle, I am
              here as your partner and personal health chef.
            </p>
            <p className="mt-8 text-2xl font-light leading-[1.2]">
              How Does a Personal Wellness Chef Service Work? It&rsquo;s a
              Simple Five-Step Process!
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <p className="font-light leading-none text-sage">
                  1. We Start With Natural, Nourishing, Nutritious Foods
                </p>
                <p className="mt-4">
                  I use responsibly grown, non-genetically modified (non-GMO)
                  organic fruits, vegetables, grains and products; healthy
                  oils; and humanely cared for, pasture-raised animal proteins,
                  as well as fresh, wild caught seafood. All products chosen
                  are ones that suit the body best for digestion, assimilation,
                  healing, energy, and sustainable health. Meals are made with
                  love, creativity, and a commitment to serving your highest
                  health concerns and goals.
                </p>
              </div>
              <div>
                <p className="font-light leading-none text-sage">
                  2. We Consult on Your Wellness Goals in the Comfort of Your
                  Home
                </p>
                <p className="mt-4">
                  During your home consultation, we touch base on your goals in
                  hiring a Personal Wellness Chef, your health concerns,
                  dietary needs, food preferences and ideal meal/snack
                  schedule. After flushing out these details, we&rsquo;ll
                  schedule a day and time for your first cook date.
                </p>
              </div>
              <div>
                <p className="font-light leading-none text-sage">
                  3. You Will Approve a Menu Plan and Grocery List
                </p>
                <p className="mt-4">
                  Several days prior to your cook date, I&rsquo;ll email you a
                  thoughtfully planned out, customized menu plan and grocery
                  list. Once I receive your seal of approval, we&rsquo;ll be
                  ready to go.
                </p>
              </div>
              <div>
                <p className="font-light leading-none text-sage">
                  4. I Shop, Unpack, Wash Produce, Chop, and Cook My Heart Away
                </p>
                <p className="mt-4">
                  I&rsquo;ll shop the morning of your cook date to ensure
                  complete freshness, then arrive at your house with everything
                  needed to prepare your menu &mdash; cooking gear included,
                  depending on what you already have on hand. I&rsquo;ll unpack
                  groceries, clean fruits and vegetables, cut, chop, cook,
                  package, label, and store according to our agreed protocol.
                </p>
              </div>
              <div>
                <p className="font-light leading-none text-sage">
                  5. I Clean Up and Leave You With a Week of Beautiful
                  Nourishing Food to Enjoy
                </p>
                <p className="mt-4">
                  I will leave your kitchen as clean and spotless as I found it
                  upon arrival. You won&rsquo;t even know I was there, other
                  than the aroma of freshly prepared meals, a fridge full of
                  food, a printed copy of your menu and reheating instructions,
                  and an inspirational weekly &ldquo;Joyful Wellness&rdquo;
                  note or a delicious surprise snack or dessert.
                </p>
              </div>
            </div>

            <p className={`${scriptHeading} mt-10 text-[44px] md:text-[60px]`}>
              Pricing
            </p>
            <p className="mt-4">
              Weekly personal chef services include recipe research, customized
              menu design, weekly communication via email with clients for menu
              selections, grocery list building, travel to and from grocery
              store(s), grocery shopping, travel to and from client&rsquo;s
              home, washing and preparing produce and ingredients, cooking,
              packaging, labeling, stocking refrigerator and full clean up.
              Price typically ranges between $350 - $550. Groceries are billed
              separately.
            </p>
            <p className="mt-6">
              Let&rsquo;s create a customized wellness plan for you and your
              family today!
            </p>
            <Image
              src="/images/florals/bouquet-pink.png"
              alt=""
              width={285}
              height={175}
              className="mt-6 w-[285px] mix-blend-multiply"
            />
          </div>
        </div>
      </section>

      {/* Video — Beth McCarthy */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="aspect-video w-full">
            <iframe
              src="https://player.vimeo.com/video/386381414"
              title="Meet Beth McCarthy, Florida Healthy Chef"
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Testimonial — Mary G. */}
      <FloralTestimonial attribution="Mary G. - Naples, FL">
        <p>
          &quot;Beth McCarthy is not just a chef; she is a culinary alchemist.
          She blends and transforms healthy, organic ingredients in the most
          ingenious ways to create meals that are both a delight to the palate
          and balm for the body. Thanks to Beth, my medically restricted diet
          has transformed from a monotonous regimen into an exciting
          gastronomic journey.
        </p>
        <p>
          For those in search of a chef who understands the profound interplay
          between food, health, and taste, Beth is your answer. She listens
          carefully as you explain your dietary preferences, needs, and
          restrictions, and her meals meticulously follow. She cares deeply
          about helping her clients feel better. She is a food healer in the
          guise of a chef.&quot;
        </p>
      </FloralTestimonial>

      {/* In-Home Party and Event Catering */}
      <section id="catering" className="mt-[5%] scroll-mt-32 bg-white px-5">
        <div className="mx-auto grid max-w-[1270px] grid-cols-1 gap-x-7 gap-y-8 pb-24 lg:grid-cols-[0.75fr_1.25fr] lg:px-[100px]">
          <div className="lg:pr-[5%]">
            <div className="relative h-[400px] w-full md:h-[800px]">
              <Image
                src="/images/hero/beth-event.jpg"
                alt="Beth with a beautifully catered spread at an in-home event"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="text-base font-light leading-[1.667] text-[#020202]">
            <h2 className={`${scriptHeading} mt-5 text-[44px] md:text-[60px]`}>
              In-Home Party and Event Catering
            </h2>
            <p className="mt-4">
              Wholesome, beautiful food are at the center of every happy
              occasion.{" "}
              <span className="font-semibold">
                Let me handle the meals, so you can focus on your guests!
              </span>{" "}
              I start with organic, seasonal ingredients, then tailor each menu
              to your party&rsquo;s theme and vision&mdash;accommodating vegan,
              paleo, gluten-free, and more, for up to 20 guests. Contact me to
              start designing your custom celebration today!
            </p>
            <p className="mt-6">Boutique in-home catering is ideal for:</p>
            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li>Intimate dinner parties</li>
              <li>Bridal showers</li>
              <li>Baby showers</li>
              <li>Book club and women&rsquo;s gatherings</li>
              <li>Vacations</li>
              <li>Yoga and wellness retreats</li>
              <li>Anniversaries</li>
              <li>Corporate events</li>
              <li>Birthdays</li>
              <li>Retirement celebrations</li>
              <li>Cocktail parties, and more!</li>
            </ul>
            <p className="mt-6">
              Sit back, relax, and let us handle the food, entertainment, and
              culinary education for you and your guests!
            </p>
            <p className={`${scriptHeading} mt-8 text-[44px] md:text-[60px]`}>
              Pricing
            </p>
            <p className="mt-2">Call for a customized quote.</p>
          </div>
        </div>
      </section>

      {/* Testimonial — Julie */}
      <FloralTestimonial attribution="— Julie">
        <p>
          &quot;With family coming to spend some time with me I was eager to
          enjoy their visit without spending all of my time in the kitchen. I
          engaged Beth and I quickly learned that not only was she a Health
          Chef but she was a beautiful human being. What a delight it was to
          have the opportunity to work with her.
        </p>
        <p>
          Chef Beth was exceptionally knowledgeable and made menu selections
          seamless. She was extremely accommodating of our various diet
          restrictions, our likes and dislikes, and her attention to detail was
          spectacular.
        </p>
        <p>
          The first meal Beth created for us was overwhelming and delightful!
          Everything was colorful, nutritious, and absolutely beautiful. The
          food for each evening was prepared around a theme with organic
          ingredients, and Beth would always prepare a surprise healthy sweet
          treat for us to enjoy each evening. You could taste the love and joy
          that went into her preparation. To say the meals were delicious is an
          understatement!
        </p>
        <p>
          Engaging chef Beth was the smartest decision I made for that special
          week. My family and I were extremely appreciative of her. To gather
          my family at our table and share Beth&rsquo;s beautifully nutritious
          meals was truly a gift of love! Thank you, Beth. You are a
          treasure!&quot;
        </p>
      </FloralTestimonial>

      {/* Speaking Events: Community Education & Tasting */}
      <section id="speaking" className="mt-[5%] scroll-mt-32 bg-white px-5">
        <div className="mx-auto grid max-w-[1270px] grid-cols-1 gap-x-7 gap-y-8 pb-24 lg:grid-cols-[0.75fr_1.25fr] lg:px-[100px]">
          <div className="lg:pr-[5%]">
            <div className="relative h-[400px] w-full lg:h-[1200px]">
              <Image
                src="/images/services/p1030806.jpeg"
                alt="Beth holding fresh leafy greens"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="text-base font-light leading-[1.667] text-[#020202]">
            <h2 className={`${scriptHeading} mt-5 text-[44px] md:text-[60px]`}>
              Speaking Events: Community Education &amp; Tasting
            </h2>
            <a
              href="https://cdn.prod.website-files.com/6471447e6f065a8bf120a4f9/64d9456eada7fb402ea5c0a1_spk-taste.pdf"
              target="_blank"
              rel="noopener"
              className="mt-4 flex w-full flex-col items-center no-underline md:float-right md:ml-6 md:w-1/2"
            >
              <Image
                src="/images/services/speaking-tasting.png"
                alt="Joyful Wellness Community Speaking and Tasting Events flyer"
                width={218}
                height={282}
                className="mb-3.5 w-[218px] border border-[#dddddd]"
              />
              <span className="mb-10 text-center font-light leading-[1.2] text-sage">
                Bring speaking and tasting
                <br />
                events to your community
              </span>
            </a>
            <p className="mt-4">
              <span className="font-semibold">
                Are you ready to live your healthiest and most delicious life?
                It all begins with education!
              </span>{" "}
              Beth&rsquo;s speaking events are lively, fun, and .. very
              delicious! Each participant receives educational hand-outs,
              recipes and tastings based on the event topic.
            </p>
            <p className="mt-6">
              Some of my most popular Joyful Wellness Educational Events:
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li>How to Create Joyful Wellness in Your Kitchen and Life</li>
              <li>The Healthy Aging Diet and Lifestyle Plan</li>
              <li>Families Together in the Kitchen</li>
              <li>Eat to Beat Disease, Every Day!</li>
              <li>Power Up and Protect Your Brain Using Food as Medicine</li>
              <li>Women, Hormones, Mood and Food</li>
              <li>The Cancer-Free Kitchen and Lifestyle</li>
              <li>Food as Medicine, Every Day!</li>
              <li>
                Contemporary Diets - Keto, Paleo, Vegan, Vegetarian,
                Pescatarian, Anti-Inflammatory, Pegan, and More. What&rsquo;s
                Right for YOU?
              </li>
              <li>Weekly Meal Prep Magic Made Easy</li>
              <li>
                Global Healing Cuisine Series - Each Month, Learn How to Cook
                Delicious, Nutritious Foods From Around the World
              </li>
              <li>
                Eat This Not That - How To Become a Savvy Shopper and Eater
              </li>
              <li>The Anti-Inflammatory Diet and Lifestyle</li>
              <li>
                Eat the Color of the Rainbow, Every Day, to Keep the Doctor
                Away!
              </li>
            </ul>
            <p className="mt-6">
              Discover the transformative power of healthy eating through my
              engaging speaking engagements. I will delve into the value of
              healthy eating, showcasing foods that heal, and emphasizing how
              diet forms the foundation of a vibrant, healthy, joyful
              lifestyle.
            </p>
            <p className="mt-6">
              Each event includes a lively discussion, audience participation,
              delicious tastings, recipe hand-outs, and a drawing to take home
              one of my favorite cookbooks based on the event topic selected.
            </p>
            <p className={`${scriptHeading} mt-8 text-[40px] md:text-[55px]`}>
              Engagement Details and Pricing
            </p>
            <p className="mt-2">
              Joyful Wellness Speaking and Tasting Events can be booked as a
              three-part series, or as a single, one time event. Each event is
              approximately one hour to 75 minutes long. If you select a
              series, I will customize the series to support your community
              culture and health goals. Speaking engagement fees vary depending
              on the size of group, number of events booked, and quantity of
              food being prepared on location.
            </p>
            <p className="mt-6">
              To learn more, and to book a Joyful Wellness Community Speaking
              and Tasting Event, please contact Beth at 719-440-2815.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

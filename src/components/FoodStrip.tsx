import Image from "next/image";
import Link from "next/link";

// Slowly scrolling ribbon of Beth's plates under the /home-alt hero. The list is
// rendered twice so the -50% loop in .food-strip-track is seamless.
const photos = [
  "img28", "img20", "img40", "img27", "img25", "img39", "img48", "img13",
  "img55", "img21", "img38", "img52", "img41", "img60", "img17", "img54",
].map((n) => `/images/gallery/${n}.jpeg`);

export default function FoodStrip() {
  return (
    <section className="food-strip relative overflow-hidden bg-white py-10" aria-label="Plates from Beth's kitchen">
      <Image
        src="/images/florals/splash.png"
        alt=""
        width={400}
        height={296}
        className="pointer-events-none absolute -right-16 -top-10 w-[340px] opacity-60"
      />
      <div className="food-strip-track relative flex w-max gap-5">
        {[...photos, ...photos].map((src, i) => (
          <Link
            key={i}
            href="/gallery"
            tabIndex={i < photos.length ? 0 : -1}
            aria-hidden={i >= photos.length}
            className="relative block h-56 w-44 shrink-0 overflow-hidden rounded-lg shadow-sm transition-transform duration-500 hover:-translate-y-1 md:h-72 md:w-56"
          >
            <Image src={src} alt={i < photos.length ? "A plate from Beth's kitchen" : ""} fill sizes="224px" className="object-cover" />
          </Link>
        ))}
      </div>
    </section>
  );
}

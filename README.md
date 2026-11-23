This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Growth / search (11/09)

Ported from the Fluid Pathways studio and adapted to Beautiful Foods by Beth. In the admin shell there is a new **Growth** sidebar group.

- **`/admin/search`** has five tabs: **Competitors** (an empty list you fill in by hand, saved to `StudioSetting "competitors"`, each entry flagged "Check" until verified, plus a to-do list), **Keywords** (word cloud and tiles from the `Keyword` table, 19 seeds for personal chef, catering and cost questions in the five towns; "Suggest phrases" asks Claude and saves nothing until Add; each tile links to "Make landing page" and "Write article", which prefills `/admin/blog/generate?title=`), **Organic search** (live checks of this deployment's titles, descriptions, canonicals, share tags, JSON-LD, sitemap and robots, plus a manual checklist), **Paid search** (monthly targets for Google and Meta ads, a spend log, cost per consultation request), and **Data sources** (Search Console, Keyword Planner and conversion tracking status).
- **`/admin/landing`** has Claude (`claude-sonnet-5`, Essence and tone from the Essence page) write a landing page for a keyword. The draft has 4 to 6 FAQs, no testimonials and no health claims. You pick a hero photo from the Gallery, edit the draft and Publish. Drafts at `/for/<slug>` return 404 to visitors. A signed-in admin sees a draft banner and the page is `noindex`. Published pages join the sitemap and carry `WebPage` and `FAQPage` JSON-LD.
- **Conversion tracking.** `src/components/ConversionTracker.tsx`, mounted in the root layout, logs clicks on `/contact` links (`contact_click`) and `tel:` links (`call_click`). `ContactForm` and `NewsletterForm` log `contact_submit` and `signup` on success through `src/lib/track.ts`. Everything goes to `/api/track` and the `ConversionEvent` table. UTM tags and gclid are kept for the session. Nothing is logged inside `/admin`.
- **SEO foundations.** `src/lib/seo.ts` holds `pageMetadata`, `businessSchema` (a `LocalBusiness` that serves the five towns, with no street address because the site shows none) and `personSchema`. `metadataBase` is set in the root layout. The new `src/app/sitemap.ts` and `src/app/robots.ts` keep `/admin`, `/creator` and `/api/admin` out of search. The default share image is `public/images/og-default.jpg`.
- **Not ported:** the Local tab (Google Business Profile and reviews), because the site shows no physical address; rank checks; the Calendly webhook, because the site has no booking calendar; AI image generation, because hero images come from the Gallery instead.

**Canonical domain caveat.** `SITE_URL` in `src/lib/seo.ts` is `https://floridahealthychef.com`. On 2026-11-09 that domain still served the old Webflow site, and this app ran only on `floridahealthychef.vercel.app`. Move the domain before you verify Search Console.

**Migration `20261109120000_growth_search`.** It adds `Keyword`, `LandingPage`, `ConversionEvent`, `SpendEntry` and `StudioSetting`, and seeds the keywords with `ON CONFLICT DO NOTHING`. As of 11/09 it is **not applied anywhere**. Until it is, the Growth pages show a "tables not created yet" notice, the admin APIs answer 503, `/api/track` ignores events and `/for/*` returns 404. The build (`prisma generate && next build`) never runs migrations. Apply it by hand with `npx prisma migrate deploy`. Run `npx prisma migrate status` first: `Pillar`, `BrandEssence` and `BlogPost.pillarId` are in the schema but have no migration folder.

**Before you apply the migration.** The Prisma CLI reads `.env`, not `.env.local`, so export `DATABASE_URL` and `DATABASE_URL_UNPOOLED` (the `directUrl`) first. Run `npx prisma migrate status` before `npx prisma migrate deploy`. If it reports no migration history, the existing tables were created with `db push`, and `deploy` would replay `init` and fail. In that case, baseline the four older folders first with `npx prisma migrate resolve --applied <folder>`. If `Pillar` and `BrandEssence` are missing from production, they need their own migration.

**Verified on 11/09.** All five migration files were applied in order to a throwaway local Postgres, which was destroyed afterwards. On that database:
- The 19 keywords seeded.
- Keyword add, duplicate (409), change and delete all worked.
- The competitor list setting saved and read back.
- A spend entry saved, and the tracked events showed up in the Paid tab.
- One landing draft was written by the real AI route. It returned 404 to a visitor, and an admin saw it with the banner and noindex.
- After publishing on that database, the page returned 200 with WebPage and FAQPage data and appeared in the sitemap.
- A headless browser rendered the page and logged a click through to /contact.

The `LandingClient` editing screen was checked as server-rendered HTML only and was not clicked through.

**Env vars** (same names as Fluid Pathways, all optional): `GSC_SERVICE_ACCOUNT_JSON` and `GSC_SITE_URL` (`sc-domain:floridahealthychef.com`); `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN` and `GOOGLE_ADS_CUSTOMER_ID` (optional `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_API_VERSION`, `GOOGLE_ADS_GEO_TARGET`); `NEXT_PUBLIC_GOOGLE_ADS_ID` plus `NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL` (used for contact form sends) and `NEXT_PUBLIC_GOOGLE_ADS_CALL_LABEL`.

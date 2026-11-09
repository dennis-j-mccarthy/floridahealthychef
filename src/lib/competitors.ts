/*
  Competitors (Growth → Search → Competitors). Client-safe.

  Nothing is pre-filled: no competitor research exists for Beth's market in
  this repo, and we never invent competitor facts. Beth or Dennis add the
  personal chefs and caterers they actually run into; the list saves to
  StudioSetting "competitors". `checked` stays false until someone has
  looked at the site and confirmed the notes.
*/

export interface Competitor {
  id: string;
  name: string;
  url: string;
  town: string;
  note: string;
  checked: boolean;
}

/* The to-do list for competing on Google. Ticks save to StudioSetting "competitor_todo". */
export const COMPETE_TODO: { group: string; items: { id: string; text: string }[] }[] = [
  {
    group: "Find out who you are up against",
    items: [
      { id: "search-towns", text: "Search “personal chef Naples” and “personal chef Bonita Springs” on your phone while in each town, and add the personal chefs and caterers that come up to the list above." },
      { id: "map-pack", text: "Note who appears in the Google map listings for those searches. Those businesses have a Google Business Profile with reviews." },
      { id: "their-pages", text: "For each one, note what their website has that yours does not yet: prices, menus, a page per town, reviews." },
    ],
  },
  {
    group: "Free ways to get ahead",
    items: [
      { id: "gbp-sab", text: "Create a Google Business Profile as a service-area business (no public address): category “Personal chef”, service area Naples, Bonita Springs, Estero, Fort Myers, Punta Gorda." },
      { id: "reviews", text: "Ask every client for a Google review once the profile exists. Ask everyone the same way, and never offer anything in return; Google forbids both." },
      { id: "town-pages", text: "Make a landing page for each town (Growth → Landing pages), starting with Naples and Bonita Springs." },
      { id: "cost-answer", text: "Answer “how much does a personal chef cost” plainly on a landing page, using the range already on /services." },
    ],
  },
  {
    group: "Paid",
    items: [
      { id: "ads-later", text: "Only start ads once a landing page exists for the ad's keyword and contact form submissions are being counted (Data sources)." },
    ],
  },
];

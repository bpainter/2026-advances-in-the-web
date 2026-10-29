import type { Deck, DeckEvent } from "./schema";

/** The session's event (PRD r7, 10.3). Venue and start date wait on the speaker (open question 2). */
const event: Omit<DeckEvent, "label"> = {
  name: "FITC Web Unleashed 2026",
  city: "Toronto",
  region: "ON",
  country: "CA",
  organizer: { name: "FITC", url: "https://fitc.ca" },
};

export const deck: Deck = {
  title: "2026 advances in the web",
  event: { ...event, label: `${event.name}, ${event.city}` },
  footerLabel: "FITC Web Unleashed 2026 · Bermon Painter · Slalom",
  site: { label: "thefutureiscomposable.com", url: "https://thefutureiscomposable.com" },
  // One job title for the cover, the closing slide, the notes and the metadata (PRD r7, open question 1).
  speaker: { name: "Bermon Painter", title: "Head of DXP and Commerce", org: "Slalom", linkedin: "https://www.linkedin.com/in/bermonpainter" },
  org: { name: "Slalom", url: "https://www.slalom.com" },
  targetMinutes: 35,
};

/**
 * The footer's link to the site, tagged so the site's Vercel Analytics can attribute each visit to
 * this talk and the slide it came from. The bare `site.url` stays for structured data.
 */
export function siteHref(slideId: string): string {
  const url = new URL(deck.site.url);
  url.searchParams.set("utm_source", "2026-advances-in-the-web");
  url.searchParams.set("utm_medium", "presentation");
  url.searchParams.set("utm_campaign", "fitc-web-unleashed-2026");
  url.searchParams.set("utm_content", slideId);
  return url.toString();
}

import type { Metadata } from "next";
import type { GlassContent, Slide } from "@/content/schema";
import type { DemoSection } from "@/content/demo-schema";
import { deck, sections, slides } from "@/lib/content";
import { PRESENTER_ORIGIN } from "@/lib/frames/origins";
import og from "@/public/og/cover.json";

/**
 * Metadata and JSON-LD for the presenter's pages (PRD r7, section 10). Every route builds its
 * full metadata from these helpers, so none depends on Next's shallow merge of `openGraph`.
 * Canonical URLs, Open Graph URLs and JSON-LD ids all sit on NEXT_PUBLIC_PRESENTER_ORIGIN.
 */

export const ORIGIN = PRESENTER_ORIGIN;
export const LOCALE = "en_CA";
export const LANGUAGE = "en-CA";
/** At most this many characters in a description (PRD r7, 10.1). */
export const DESCRIPTION_MAX = 160;

/** The shared Open Graph image (PRD r7, 10.2), versioned by its input hash so social caches refresh. */
export const OG_IMAGE = {
  path: `/og/cover.jpg?v=${og.hash.slice(0, 8)}`,
  width: og.width,
  height: og.height,
  type: "image/jpeg",
  alt: `Cover slide: ${deck.title}. ${deck.event.label}. ${deck.speaker.name}, ${deck.speaker.title}, ${deck.speaker.org}.`,
} as const;
export const OG_IMAGE_URL = `${ORIGIN}${OG_IMAGE.path}`;

export const SITE_DESCRIPTION = `A tour of what browsers shipped in 2026, with live demos. ${deck.event.label}.`;

const ID = {
  talk: `${ORIGIN}/#talk`,
  speaker: `${ORIGIN}/#speaker`,
  session: `${ORIGIN}/#session`,
  slide: (id: string) => `${ORIGIN}/s/${id}#slide`,
};

export function slidePath(slide: Pick<Slide, "id">): string {
  return `/s/${slide.id}`;
}

// --------------------------------------------------------------- titles and descriptions

/**
 * The slide's own title: `${eyebrow}: ${title}` on walk pages (13 pages share each title, PRD r7
 * 3.2), the feature name on intro pages, the label elsewhere. The cover says where it was given.
 */
export function slideTitle(slide: Slide): string {
  const page = slide.page;
  if (page && (page.stage === "used-to" || page.stage === "now")) return `${page.eyebrow}: ${page.title}`;
  if (slide.layout === "glass-title") return `${deck.title} · ${deck.event.label}`;
  return slide.title;
}

/** The document and share title of `/s/<id>`. */
export function slidePageTitle(slide: Slide): string {
  const own = slideTitle(slide);
  return own.startsWith(deck.title) ? own : `${own} · ${deck.title}`;
}

/** Whole sentences up to `max` characters; a first sentence that is too long is cut at a word. */
export function clampSentences(text: string, max = DESCRIPTION_MAX): string {
  const parts = text.replace(/\s+/g, " ").trim().split(/(?<=[.?!])\s+/);
  let out = "";
  for (const p of parts) {
    const next = out ? `${out} ${p}` : p;
    if (next.length > max) break;
    out = next;
  }
  if (out) return out;
  const cut = parts[0].slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

/** The writing rules' sentence length to aim for (PRD v4, 5.2). */
const SHORT_SENTENCE = 15;
const asSentence = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);

function glassDescription(g: GlassContent): string {
  switch (g.kind) {
    case "title":
      return SITE_DESCRIPTION;
    case "grid": {
      // The lede's short sentences, then the card titles; clampSentences keeps what fits.
      const lede = g.lede ? g.lede.split(/(?<=[.?!])\s+/).filter((s) => s.split(/\s+/).length <= SHORT_SENTENCE) : [];
      return [g.display, ...lede, ...g.cards.map((c) => c.title)].filter(Boolean).map((s) => asSentence(s!)).join(" ");
    }
    case "quotes":
      return `${g.title}: ${g.quotes.map((q) => q.cite).join(" and ")}.`;
    case "statement":
      return asSentence(g.lines.join(" "));
    case "people": {
      // As many names as keep the sentence at 15 words.
      let names: string[] = [];
      for (const p of g.people) {
        const next = [...names, p.name];
        if (`${g.title}: ${next.join(", ")} and more.`.split(/\s+/).length > SHORT_SENTENCE) break;
        names = next;
      }
      return `${g.title}: ${names.join(", ")} and more.`;
    }
    case "closing":
      return `Thank you from ${deck.speaker.name}, ${deck.speaker.title}, ${deck.speaker.org}. Connect on LinkedIn.`;
  }
}

/**
 * The slide's description, 160 characters at most (PRD r7, 10.1): the section's description on
 * intro pages, the page intro on walk and single pages, the lede or card titles on glass slides.
 */
export function slideDescription(slide: Slide): string {
  const page = slide.page;
  let text: string;
  if (page) text = page.stage === "intro" ? page.description : page.intro;
  else if (slide.glass) text = glassDescription(slide.glass);
  else text = slide.body?.join(" ") ?? slide.title;
  return clampSentences(text);
}

// --------------------------------------------------------------- metadata

function shared(title: string, description: string, url?: string): Metadata {
  return {
    metadataBase: new URL(ORIGIN),
    title,
    description,
    authors: [{ name: deck.speaker.name, url: deck.speaker.linkedin }],
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: "website",
      siteName: deck.title,
      locale: LOCALE,
      ...(url ? { url } : {}),
      title,
      description,
      images: [{ url: OG_IMAGE.path, width: OG_IMAGE.width, height: OG_IMAGE.height, type: OG_IMAGE.type, alt: OG_IMAGE.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: OG_IMAGE.path, alt: OG_IMAGE.alt }],
    },
  };
}

/** The root layout's base: every page that sets nothing else (404s) shares the talk's card, with no canonical. */
export function baseMetadata(): Metadata {
  return shared(deck.title, SITE_DESCRIPTION);
}

/** `/`: the talk. */
export function siteMetadata(): Metadata {
  return shared(deck.title, SITE_DESCRIPTION, "/");
}

/** `/s/<id>`, and the slide named by `?s=` on `/present` and `/speaker`. */
export function slideMetadata(slide: Slide): Metadata {
  return shared(slidePageTitle(slide), slideDescription(slide), slidePath(slide));
}

// --------------------------------------------------------------- JSON-LD

type Node = Record<string, unknown>;
export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": Node[];
}

/** Display names for the `alsoUses` web-features ids (web-features 3.44.0). An unknown id falls back to its id. */
const FEATURE_NAMES: Record<string, string> = {
  popover: "Popover",
  "invoker-commands": "Invoker commands",
  scope: "@scope",
};
export function featureName(id: string): string {
  return FEATURE_NAMES[id] ?? id;
}
export const webStatusUrl = (id: string) => `https://webstatus.dev/features/${id}`;

/** `about`: the section's feature, then what it also uses, from its support source (PRD r7, 10.3). */
export function sectionAbout(section: DemoSection): Node[] {
  const s = section.support;
  const name = section.feature ?? section.label;
  if (!s) return [{ "@type": "Thing", name }];
  if (s.kind === "web-features")
    return [
      { "@type": "Thing", name, sameAs: webStatusUrl(s.id) },
      ...(s.alsoUses ?? []).map((id) => ({ "@type": "Thing", name: featureName(id), sameAs: webStatusUrl(id) })),
    ];
  return [{ "@type": "Thing", name }, ...s.packages.map((p) => ({ "@type": "SoftwareApplication", name: p.name, applicationCategory: "DeveloperApplication", sameAs: `https://www.npmjs.com/package/${p.npm}` }))];
}

/** `keywords`: the web-features ids and "Baseline", or the tooling package names. */
export function sectionKeywords(section: DemoSection): string[] {
  const s = section.support;
  if (!s) return [section.feature ?? section.label];
  if (s.kind === "web-features") return [s.id, ...(s.alsoUses ?? []), "Baseline"];
  return [section.feature ?? section.label, ...s.packages.map((p) => p.name)];
}

function personNode(): Node {
  return {
    "@type": "Person",
    "@id": ID.speaker,
    name: deck.speaker.name,
    jobTitle: deck.speaker.title,
    url: deck.speaker.linkedin,
    worksFor: { "@type": "Organization", name: deck.org.name, url: deck.org.url },
    sameAs: [deck.speaker.linkedin, deck.site.url],
  };
}

function eventNode(): Node {
  const e = deck.event;
  const organizer = { "@type": "Organization", name: e.organizer.name, url: e.organizer.url };
  const location: Node = {
    "@type": "Place",
    ...(e.venue ? { name: e.venue } : {}),
    address: { "@type": "PostalAddress", addressLocality: e.city, addressRegion: e.region, addressCountry: e.country },
  };
  return {
    "@type": "Event",
    "@id": ID.session,
    name: deck.title,
    description: SITE_DESCRIPTION,
    ...(e.startDate ? { startDate: e.startDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: LANGUAGE,
    image: OG_IMAGE_URL,
    url: `${ORIGIN}/`,
    location,
    organizer,
    performer: { "@id": ID.speaker },
    workPerformed: { "@id": ID.talk },
    superEvent: { "@type": "Event", name: e.name, organizer, location },
  };
}

function talkNode(withParts: boolean): Node {
  return {
    "@type": "PresentationDigitalDocument",
    "@id": ID.talk,
    name: deck.title,
    description: SITE_DESCRIPTION,
    url: `${ORIGIN}/`,
    author: { "@id": ID.speaker },
    inLanguage: LANGUAGE,
    image: OG_IMAGE_URL,
    // The PRD's `numberOfPages` belongs to Book only in schema.org; `size` is the CreativeWork property for a count.
    size: { "@type": "QuantitativeValue", value: slides.length, unitText: "slides" },
    about: sections.map((s) => sectionAbout(s)[0]),
    ...(withParts ? { hasPart: slides.map((s) => ({ "@type": "CreativeWork", "@id": ID.slide(s.id), url: `${ORIGIN}${slidePath(s)}`, name: slideTitle(s), position: s.index })) } : {}),
  };
}

/** The slide's own node (PRD r7, 10.3). Demo pages take their section's about, keywords and citations. */
function slideNode(slide: Slide): Node {
  const section = slide.demoSection;
  return {
    "@type": "CreativeWork",
    "@id": ID.slide(slide.id),
    url: `${ORIGIN}${slidePath(slide)}`,
    name: slideTitle(slide),
    description: slideDescription(slide),
    position: slide.index,
    inLanguage: LANGUAGE,
    isPartOf: { "@id": ID.talk },
    author: { "@id": ID.speaker },
    image: OG_IMAGE_URL,
    ...(section ? { about: sectionAbout(section), keywords: sectionKeywords(section) } : {}),
    ...(slide.citations.length ? { citation: slide.citations.map((c) => ({ "@type": "CreativeWork", name: c.text, url: c.url })) } : {}),
  };
}

/** `/s/<id>`: the slide, plus the talk, the speaker and the session, so each page stands alone. */
export function slideJsonLd(slide: Slide): JsonLdGraph {
  return { "@context": "https://schema.org", "@graph": [slideNode(slide), talkNode(false), personNode(), eventNode()] };
}

/** `/`: the talk with every slide as a part, the speaker and the session. */
export function talkJsonLd(): JsonLdGraph {
  return { "@context": "https://schema.org", "@graph": [talkNode(true), personNode(), eventNode()] };
}

/** JSON for an inline `<script type="application/ld+json">`; `<` is escaped so no text can close the script. */
export function jsonLdHtml(graph: JsonLdGraph): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}

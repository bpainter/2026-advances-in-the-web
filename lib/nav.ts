import type { Slide } from "@/content/schema";
import type { DemoSection } from "@/content/demo-schema";
import { sections as deckSections, slides as deckSlides } from "@/lib/content";

/**
 * The navigation drawer's list (PRD r7, 9.6), derived from the deck: the opening, each demo section
 * by feature name in four groups, and the closing. No slide number is typed; they follow the deck.
 * Group headings are text, not links. The validator checks that every demo section appears once
 * and that every target exists (`navLinks`, lib/validate/v5.ts `validateR7`).
 */

export interface NavLink {
  /** The slide the link opens: the section's first page, or the first opening or closing slide. */
  slideId: string;
  label: string;
  /** 1-based slide number, shown right-aligned. */
  number: number;
}

export interface NavGroup {
  /** Null for the opening and closing, which stand alone. */
  heading: string | null;
  links: NavLink[];
}

/** The drawer's group for a "still in motion" section (the intro chip's text). */
export const STILL_IN_MOTION = "Still in motion";

/**
 * Which "What we'll cover" card a demo section belongs to (0-based). Sections not listed belong to
 * the first card, HTML, CSS, and JavaScript. The headings themselves are read from the cards.
 */
const PART_OF: Record<string, number> = {
  "f2-caching": 1,
  "f3-package-trust": 2,
  "f4-vite-8-locally": 2,
};
const FALLBACK_PARTS = ["HTML, CSS, and JavaScript", "Frameworks and metaframeworks", "Build tools and package managers"];

function partTitles(slides: Slide[]): string[] {
  const cover = slides.find((s) => s.id === "what-we-cover");
  const cards = cover?.glass && "cards" in cover.glass ? cover.glass.cards : null;
  return FALLBACK_PARTS.map((fallback, i) => cards?.[i]?.title ?? fallback);
}

function groupOf(section: DemoSection, parts: string[]): string {
  if (section.group === "still-in-motion") return STILL_IN_MOTION;
  return parts[PART_OF[section.id] ?? 0];
}

export function navGroups(slides: Slide[] = deckSlides, sections: DemoSection[] = deckSections): NavGroup[] {
  const numberOf = new Map(slides.map((s) => [s.id, s.index]));
  const firstDemo = slides.findIndex((s) => s.layout === "demo-page");
  const lastDemo = slides.findLastIndex((s) => s.layout === "demo-page");
  const parts = partTitles(slides);
  const groups: NavGroup[] = [];
  if (slides.length > 0 && firstDemo !== 0) groups.push({ heading: null, links: [{ slideId: slides[0].id, label: "Opening", number: slides[0].index }] });
  for (const section of sections) {
    const first = section.pages[0];
    if (!first || !numberOf.has(first.id)) continue;
    const heading = groupOf(section, parts);
    const link: NavLink = { slideId: first.id, label: section.feature ?? section.label, number: numberOf.get(first.id)! };
    const last = groups[groups.length - 1];
    if (last && last.heading === heading) last.links.push(link);
    else groups.push({ heading, links: [link] });
  }
  const closing = lastDemo >= 0 ? slides[lastDemo + 1] : undefined;
  if (closing) groups.push({ heading: null, links: [{ slideId: closing.id, label: "Closing", number: closing.index }] });
  return groups;
}

/** Every link in order, for the validator. */
export function navLinks(slides: Slide[] = deckSlides, sections: DemoSection[] = deckSections): { slideId: string; label: string }[] {
  return navGroups(slides, sections).flatMap((g) => g.links.map(({ slideId, label }) => ({ slideId, label })));
}

/** The link that holds slide `id` (its section, or the opening or closing), for `aria-current`. */
export function navCurrent(id: string, slides: Slide[] = deckSlides, sections: DemoSection[] = deckSections): string | null {
  const slide = slides.find((s) => s.id === id);
  if (!slide) return null;
  const groups = navGroups(slides, sections);
  const links = groups.flatMap((g) => g.links);
  if (slide.layout === "demo-page") {
    const section = sections.find((s) => s.pages.some((p) => p.id === id));
    return section?.pages[0]?.id ?? null;
  }
  // Opening and closing slides: the nearest link at or before this slide.
  const before = links.filter((l) => l.number <= slide.index);
  return before.length ? before[before.length - 1].slideId : null;
}

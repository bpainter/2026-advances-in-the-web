import type { Slide } from "@/content/schema";
import { pageHeading, type DemoPage, type DemoSection } from "@/content/demo-schema";
import { DEMO_SECTION_END, sections } from "@/content/sections";
import { slide as o1 } from "./01-title";
import { slide as o2 } from "./02-the-mandate";
import { slide as o3 } from "./03-three-reactions";
import { slide as o4 } from "./04-two-perspectives";
import { slide as o5 } from "./05-keep-humanity";
import { slide as o6 } from "./06-open-web";
import { slide as o7 } from "./07-what-we-cover";
import { slide as c1 } from "./32-what-changed";
import { slide as c2 } from "./33-people-to-follow";

const SECTION_OF: Record<DemoSection["id"], Slide["section"]> = {};

function pageSlide(section: DemoSection, page: DemoPage): Slide {
  return {
    id: page.id,
    index: 0,
    section: SECTION_OF[section.id] ?? (section.id.startsWith("d") ? "platform-baseline" : section.id === "f2-caching" ? "frameworks" : section.id === "f3-package-trust" ? "package-managers" : "decide"),
    layout: "demo-page",
    title: pageHeading(section, page),
    page,
    demoSection: section,
    citations: section.citations,
    speakerNotes: page.intro,
    timing: { minutes: page.timing.minutes, cumulative: page.timing.cumulative ?? 0 },
    cutPriority: page.cutPriority,
    background: section.background,
  };
}

/**
 * The deck: the Claude Design opening, every page of the demo section in order (PRD Part A,
 * section 1), and the Claude Design closing. Indexes are assigned here; the closing's cumulative
 * timing continues from the last demo page.
 */
const opening = [o1, o2, o3, o4, o5, o6, o7];
const pages = sections.flatMap((s) => s.pages.map((p) => pageSlide(s, p)));
const closing = [c1, c2];

let cumulative = 0;
export const slides: Slide[] = [...opening, ...pages, ...closing].map((s, i) => {
  // The closing starts after the demo section's buffer (PRD v4, 7.4), not at its last page.
  if (s.layout !== "demo-page" && i > 0 && opening.length + pages.length === i) cumulative = Math.max(cumulative, DEMO_SECTION_END);
  cumulative = s.layout === "demo-page" ? s.timing.cumulative : cumulative + s.timing.minutes;
  return { ...s, index: i + 1, timing: { minutes: s.timing.minutes, cumulative: Math.round(cumulative * 100) / 100 } };
});

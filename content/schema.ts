import type { DemoPage, DemoSection } from "./demo-schema";
import type { BackgroundId } from "./backgrounds";

// Canonical slide schema. Field names are the contract between content (Part B) and the app (Part A).
// The first block is SLIDE_SCHEMA.md verbatim; additions from PRD Part A section 9.4 follow.

export type Section =
  | "cold-open" | "open-web" | "platform-baseline" | "platform-two-engine"
  | "platform-chrome-only" | "frameworks" | "delete" | "package-managers"
  | "decide" | "close";

export type Layout =
  | "title"          // event title slide
  | "statement"      // one full-line Lora italic statement on navy or blue field
  | "stat"           // 1-2 big numbers with a one-line qualifier
  | "comparison"     // two columns, A vs B
  | "quote"          // pull quote with attribution
  | "list"           // 3-6 short items, optional Lucide icon per item
  | "timeline"       // dated markers
  | "table"          // compact data table (brand-blue header)
  | "chart"          // one chart (usage vs satisfaction, etc.)
  | "framework-grid" // 2x2 of short labels
  | "image-led"      // full-bleed image, short headline bottom-left
  | "section"        // section divider: label + optional tier legend
  | "close"          // thank-you / contact
  | "glass-title"    // v5 native opening and closing slides (PRD v5, 4.5); see Slide.glass
  | "glass-grid"
  | "glass-quotes"
  | "glass-statement"
  | "glass-people"
  | "glass-closing"
  | "demo-page";     // one page of a demo section, schema v3 (addition); see Slide.page

export type Tier = "baseline-widely" | "baseline-newly" | "two-engine" | "one-engine" | "none";

export type Engine = "chrome" | "safari" | "firefox";

export interface SupportLabel {
  tier: Tier;
  since?: string;          // e.g. "Jan 2026 (Firefox 147)"
  missing?: Engine[];
  note?: string;           // e.g. "webstatus.dev row is stale; do not cite"
}

/** Beat of the demo flow a step belongs to (addition): "before" shows the legacy document,
 *  "after" plays an interaction in the native document, "code" highlights lines and spotlights
 *  a target. Default: "code" when `highlight` is non-empty, else "after". */
export type StepPhase = "before" | "after" | "code";

export interface CodeStep {
  id: string;              // "s1", "s2"...
  highlight: number[] | [number, number][]; // line numbers or ranges in the active file
  file?: string;           // which file in `code` is shown (default first)
  caption: string;         // one short sentence shown under the code panel
  action?: string;         // what happens in the live view at this step
  liveState?: string;      // key the live view switches to, when the live view is state-driven
  phase?: StepPhase;       // beat of the flow (addition); see StepPhase for the default
  target?: string;         // CSS selector in the demo document to spotlight at this step (addition)
}

export type CodeLang = "html" | "css" | "js" | "ts" | "tsx" | "bash" | "http" | "yaml";

export interface CodeFile {
  file: string;
  lang: CodeLang;
  source: string;
}

export type FeatureCheck =
  | { id: string; kind: "css-supports"; query: string }
  | { id: string; kind: "css-selector"; selector: string }
  | { id: string; kind: "js"; expr: string }
  | { id: string; kind: "html-attr"; element: string; attr: string };

export interface Demo {
  id: string;              // kebab, used as route /demos/[id]
  live: {
    kind: "srcdoc" | "route" | "external";   // srcdoc = composed from `code` and served at /demos/[id]
    src?: string;          // route path or external URL
    browsers: Engine[];    // where to run it on stage, in order
  };
  code: CodeFile[];        // standard CSS only, no Tailwind inside demos
  steps: CodeStep[];
  fork?: string[];         // canonical CodePen/demo URLs this was derived from
  fallback: string;        // what to show if it fails live (pre-recorded clip path or URL)
  wow: string;             // the one moment to land
  gotcha: string;          // the one caveat to say before it bites

  // Part A additions (section 9.4)
  support?: SupportLabel;  // demo-grid cells only
  requires?: FeatureCheck[];
  liveStates?: string[];
  transcript?: { line: number; delayMs?: number; typingMs?: number }[];
  viewport?: { width: number; height: number }; // default 1296 x 856
  zoom?: number;           // scale applied to the live frame; default 2. Use 1 for full-page website demos.
  legacy?: { code: CodeFile[] }; // the same component driven by the old script, served at /demos/[id]/legacy and shown during "before" steps (addition)
}

export type Field = "white" | "navy" | "blue";

/** The ways a demo slide can be shown. Hotkeys 1 (live), 2 (70/30), 3 (code), 4 (50/50). */
export type DemoView = "live" | "split" | "code" | "half";

export interface Slide {
  id: string;              // kebab, stable, used in URL /s/[id]
  index: number;           // 1-based
  section: Section;
  layout: Layout;
  title: string;           // boring, clear label; sentence case; Slalom Sans bold
  eyebrow?: string;        // tracked all-caps label, e.g. "BASELINE NEWLY · JUN 2026"
  body?: string[];         // 0-2 simple sentences max
  statement?: string;      // only for layout "statement"; full-line Lora italic
  items?: { label: string; detail?: string; icon?: string; mono?: boolean }[]; // `mono` (addition) renders detail as code
  stats?: { value: string; label: string; source?: string }[];
  quote?: { text: string; who: string; where: string; url: string };
  support?: SupportLabel;  // required on every demo-split / demo-grid cell
  demo?: Demo;             // demo-split, terminal
  demos?: Demo[];          // demo-grid (exactly 4)
  image?: { prompt: string; alt: string; model: "higgsfield/nano-banana-2"; placement: "full-bleed" | "right-half" | "background" };
  citations: { text: string; url: string }[];
  speakerNotes: string;    // 3-5 sentences
  timing: { minutes: number; cumulative: number };
  cutPriority?: number;    // 1 = cut first if running long
  background: BackgroundId; // PRD v5, 4.1: the registry file behind the slide; demo pages take their section's

  // Part A additions (section 9.4)
  stepThrough?: "steps-first" | "slide-only";
  field?: Field;
  tableRows?: { cells: string[]; header?: boolean }[];
  tableColumns?: string[];
  chart?: {
    kind: "dot" | "bar";
    xLabel: string; yLabel: string;
    points: { label: string; x: number; y: number; source?: string }[];
    axisNotes?: { label: string; y: number }[]; // labelled ticks on the y axis for points with no x value (addition)
  };
  demoView?: DemoView;     // default view for demo-split slides; default "half" (50/50); "split" is the 60/40 view
  glass?: GlassContent;    // the glass-* layouts: the slide's text as typed data (PRD v5, 4.5)
  page?: DemoPage;         // layout "demo-page": the page, from content/sections (addition)
  demoSection?: DemoSection; // layout "demo-page": the page's section, for the badge, notes and citations (addition)
}

/** A card on a glass-grid slide: a number, a Lucide icon, a portrait, a question. */
export interface GlassCard {
  num?: string;
  icon?: string;            // a Lucide icon name, e.g. "Wrench"
  title: string;
  body?: string;
  image?: { src: string; alt: string };
  question?: string;
}

/** The text of a native glass slide (PRD v5, 4.5; docs/design/demo-wrappers-spec.md 6). */
export type GlassContent =
  | { kind: "title"; eyebrow: string; lines: string[] }
  | {
      kind: "grid";
      variant: "icons" | "portraits" | "numbered";
      tone: "light" | "dark";
      /** "center": the text and cards stack as one group, centered vertically; default: each block at its own fixed position. */
      align?: "center";
      eyebrow?: string;
      title?: string;
      display?: string;
      lede?: string;
      cardsEyebrow?: string;
      cards: GlassCard[];
    }
  | { kind: "quotes"; title: string; quotes: { text: string; cite: string }[] }
  | { kind: "statement"; lines: string[] }
  | { kind: "people"; title: string; people: { initials: string; name: string; role: string }[] }
  | { kind: "closing"; eyebrow: string; name: string; role: string; link: string; url: string; caption: string };

/** The event the talk is part of (PRD r7, 10.3): the Event JSON-LD and the eyebrow read it. */
export interface DeckEvent {
  name: string;            // "FITC Web Unleashed 2026"
  /** Derived from the fields below: "FITC Web Unleashed 2026, Toronto" (the cover eyebrow). */
  label: string;
  venue?: string;          // unknown until the speaker sends it (PRD r7, open question 2)
  city: string;
  region: string;          // "ON"
  country: string;         // "CA"
  startDate?: string;      // ISO 8601 with offset; the validator warns while it is unset
  organizer: { name: string; url: string };
}

export interface Deck {
  title: string;
  event: DeckEvent;
  footerLabel: string;
  site: { label: string; url: string };   // footer link, left side
  /** One source for the cover, the closing slide, the notes and the metadata (PRD r7, 4.2 and 5.1). */
  speaker: { name: string; title: string; org: string; linkedin: string };
  org: { name: string; url: string };
  targetMinutes: number;
}

// The background registry (PRD v5, 1.4 and 4.1): one file per non-demo slide and one per demo
// section, under public/backgrounds/v5/. Files are 1920 by 1080 JPEG with grain baked in; the
// shared overlay (public/theme/grain.png) is the grain of record.

export type Hue =
  | "navy"
  | "cobalt"
  | "chartreuse"
  | "peach"
  | "pale-blue"
  | "cyan"
  | "beige"
  | "mint"
  | "periwinkle"
  | "violet"
  | "pale-grey"
  | "warm-grey"
  | "ice"
  | "lilac"
  | "blush"
  | "cream"
  | "yellow"
  | "magenta"
  | "orange"
  | "purple"
  | "lavender"
  | "coral"
  | "pink"
  | "dark-blue";

/**
 * Where text sits directly on the image (stage px), and what lies between it and the image: the
 * bare field, the walk-page chrome wash, a light glass card or a dark glass panel. `pnpm
 * backgrounds` measures each zone; `pnpm test:contrast` composites the text over its extremes.
 */
export interface TextZone {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  on: "field" | "chrome-wash" | "light-card" | "dark-panel" | "frame";
  /** Text color on this zone: ink on light, white on dark. */
  ink: "navy" | "white";
  /** A wash the layout lays over the field under this text (styles/components/slides-glass.css). */
  scrim?: { color: "navy" | "white"; alpha: number };
}

export interface Background {
  file: string;
  tone: "light" | "dark";
  /** The first hue named in table 1.4; adjacent sections never share it. */
  lead: Hue;
  hues: Hue[];
  textZone: TextZone[];
}

/** Walk and single pages: the eyebrow, title, step bar and meter band under the chrome wash. */
const WALK_BAND: TextZone = { name: "walk-page title band", x: 0, y: 0, w: 1920, h: 168, on: "chrome-wash", ink: "navy" };
/** Section intro slides: title, description, tiles and also-uses in the dark glass panel (1.6). */
const INTRO_PANEL: TextZone = { name: "intro text panel", x: 976, y: 64, w: 880, h: 952, on: "dark-panel", ink: "white" };
/** The frame slot (single pages use the full width): frame text sits on glass over this, under the frame wash. */
const FRAME_SLOT: TextZone = { name: "frame slot", x: 65, y: 177, w: 1790, h: 862, on: "frame", ink: "navy" };
const section = (file: string, lead: Hue, hues: Hue[]): Background => ({ file, tone: "light", lead, hues: [lead, ...hues], textZone: [WALK_BAND, INTRO_PANEL, FRAME_SLOT] });

export const BACKGROUNDS = {
  title: {
    file: "title.jpg",
    tone: "dark",
    lead: "navy",
    hues: ["navy", "cobalt", "magenta", "orange"],
    textZone: [
      // The cover group (PRD r7 4.3; docs/design/r7-spec.md 1): centered on y 540, two title lines
      // as line boxes. Line one ends at x 1437, so its right end gets its own zone under the wash's
      // ellipse (0.24 plus 0.22 renders 0.404 or more there; 0.40 is the floor the test composites).
      { name: "eyebrow", x: 64, y: 261, w: 560, h: 36, on: "field", ink: "white", scrim: { color: "navy", alpha: 0.24 } },
      { name: "title line 1", x: 64, y: 315, w: 1176, h: 184, on: "field", ink: "white", scrim: { color: "navy", alpha: 0.24 } },
      { name: "title line 1, glow edge", x: 1240, y: 315, w: 197, h: 184, on: "field", ink: "white", scrim: { color: "navy", alpha: 0.4 } },
      { name: "title line 2", x: 64, y: 499, w: 929, h: 184, on: "field", ink: "white", scrim: { color: "navy", alpha: 0.24 } },
      { name: "name", x: 64, y: 715, w: 900, h: 50, on: "field", ink: "white", scrim: { color: "navy", alpha: 0.24 } },
      { name: "role", x: 64, y: 769, w: 900, h: 50, on: "field", ink: "white", scrim: { color: "navy", alpha: 0.24 } },
    ],
  },
  "the-mandate": {
    file: "o2.jpg",
    tone: "light",
    lead: "chartreuse",
    hues: ["chartreuse", "yellow", "cyan", "cream"],
    textZone: [
      { name: "eyebrow", x: 64, y: 224, w: 300, h: 36, on: "field", ink: "navy" },
      { name: "display", x: 64, y: 276, w: 520, h: 144, on: "field", ink: "navy" },
      { name: "reaction eyebrow", x: 64, y: 484, w: 330, h: 36, on: "field", ink: "navy" },
      { name: "reaction cards", x: 64, y: 536, w: 1792, h: 288, on: "light-card", ink: "navy" },
    ],
  },
  "three-reactions": {
    file: "o3.jpg",
    tone: "light",
    lead: "peach",
    hues: ["peach", "lavender", "pale-blue", "cream"],
    textZone: [
      { name: "title", x: 64, y: 64, w: 600, h: 72, on: "field", ink: "navy" },
      { name: "portrait cards", x: 64, y: 168, w: 1792, h: 816, on: "light-card", ink: "navy" },
    ],
  },
  "two-perspectives": {
    file: "o4.jpg",
    tone: "dark",
    lead: "navy",
    hues: ["navy", "violet", "magenta", "cyan"],
    textZone: [{ name: "quotes panel", x: 64, y: 64, w: 1792, h: 920, on: "dark-panel", ink: "white" }],
  },
  "keep-humanity": {
    file: "o5.jpg",
    tone: "dark",
    lead: "cobalt",
    hues: ["cobalt", "violet", "magenta", "pink"],
    textZone: [{ name: "statement panel", x: 352, y: 300, w: 1216, h: 480, on: "dark-panel", ink: "white" }],
  },
  "open-web": {
    file: "o6.jpg",
    tone: "light",
    lead: "pale-blue",
    hues: ["pale-blue", "lilac", "cream", "peach"],
    textZone: [
      { name: "title and lede", x: 64, y: 64, w: 1400, h: 188, on: "field", ink: "navy" },
      { name: "cards", x: 64, y: 316, w: 1792, h: 668, on: "light-card", ink: "navy" },
    ],
  },
  "what-we-cover": {
    file: "o7.jpg",
    tone: "dark",
    lead: "navy",
    hues: ["navy", "purple", "cyan", "chartreuse", "yellow"],
    textZone: [
      { name: "eyebrow", x: 64, y: 230, w: 560, h: 36, on: "field", ink: "white" },
      { name: "title", x: 64, y: 282, w: 620, h: 72, on: "field", ink: "white" },
      { name: "cards", x: 64, y: 418, w: 1792, h: 400, on: "dark-panel", ink: "white" },
    ],
  },
  d1: section("d1.jpg", "cyan", ["cobalt", "violet", "yellow"]),
  d2: section("d2.jpg", "beige", ["peach", "coral", "lavender"]),
  d3: section("d3.jpg", "mint", ["chartreuse", "cyan"]),
  d4: section("d4.jpg", "periwinkle", ["dark-blue", "purple"]),
  d5: section("d5.jpg", "violet", ["magenta", "pink"]),
  d6: section("d6.jpg", "pale-grey", ["cyan", "pink", "yellow"]),
  m1: section("m1.jpg", "lavender", ["yellow", "cyan", "cream"]),
  m2: section("m2.jpg", "yellow", ["cream", "orange", "lilac"]),
  m3: section("m3.jpg", "pink", ["pale-blue", "peach"]),
  m4: section("m4.jpg", "cyan", ["mint", "cobalt"]),
  m5: section("m5.jpg", "coral", ["peach", "purple"]),
  f2: section("f2.jpg", "warm-grey", ["cobalt", "orange", "yellow"]),
  f3: section("f3.jpg", "ice", ["cyan", "navy", "coral"]),
  f4: section("f4.jpg", "lilac", ["periwinkle", "pink"]),
  "what-changed": {
    file: "c1.jpg",
    tone: "light",
    lead: "ice",
    hues: ["ice", "cobalt", "purple", "cyan"],
    textZone: [
      { name: "title", x: 64, y: 64, w: 760, h: 72, on: "field", ink: "navy" },
      { name: "cards", x: 64, y: 168, w: 1792, h: 816, on: "light-card", ink: "navy" },
    ],
  },
  "people-to-follow": {
    file: "c2.jpg",
    tone: "light",
    lead: "cream",
    hues: ["cream", "yellow", "coral", "orange", "purple"],
    textZone: [
      { name: "title", x: 64, y: 64, w: 620, h: 72, on: "field", ink: "navy", scrim: { color: "white", alpha: 0.5 } },
      { name: "people panel", x: 64, y: 168, w: 1792, h: 816, on: "light-card", ink: "navy" },
    ],
  },
  closing: {
    file: "closing.jpg",
    tone: "dark",
    lead: "navy",
    hues: ["navy", "cobalt", "purple", "coral", "pink"],
    textZone: [{ name: "left panel", x: 64, y: 64, w: 1072, h: 952, on: "dark-panel", ink: "white" }],
  },
} as const satisfies Record<string, Background>;

export type BackgroundId = keyof typeof BACKGROUNDS;

export const BACKGROUND_IDS = Object.keys(BACKGROUNDS) as BackgroundId[];

/** Root-relative URL of a background file. */
export function backgroundUrl(id: BackgroundId): string {
  return `/backgrounds/v5/${BACKGROUNDS[id].file}`;
}

export function isBackgroundId(id: string): id is BackgroundId {
  return Object.prototype.hasOwnProperty.call(BACKGROUNDS, id);
}

/**
 * The web fonts (docs/PRD-perf.md, P1-FONTS). `pnpm fonts` (scripts/fonts.mts) subsets the OTF and
 * TTF masters in public/fonts/ to WOFF2 under FONT_DIR. The folder is versioned and write-once:
 * the files are served immutable for a year (next.config.ts), so a new subset goes in a new
 * folder (v3), never over a file in this one. The masters stay for the F2 apps and the OG cover.
 */

/** Where the subsets live, under public/. Bump the version for any change to the files. */
export const FONT_DIR = "/fonts/v2";

export interface FontFace {
  /** The master in public/fonts/. */
  master: string;
  family: string;
  weight: number;
  style: "normal" | "italic";
}

/** Every face the presenter's stylesheets declare (styles/fonts.css, styles/glass-tokens.css). */
export const FONT_FACES: FontFace[] = [
  { master: "SlalomSans-Regular.otf", family: "Slalom Sans", weight: 400, style: "normal" },
  { master: "SlalomSans-Bold.otf", family: "Slalom Sans", weight: 700, style: "normal" },
  { master: "SlalomSans-Black.otf", family: "Slalom Sans", weight: 900, style: "normal" },
  { master: "Lora-Italic.ttf", family: "Lora", weight: 400, style: "italic" },
];

/** The WOFF2 subset of a master: "SlalomSans-Regular.otf" is "/fonts/v2/SlalomSans-Regular.latin.woff2". */
export function subsetPath(master: string): string {
  return `${FONT_DIR}/${master.replace(/\.(otf|ttf)$/i, "")}.latin.woff2`;
}

/**
 * Preloaded at HTML parse (app/layout.tsx): the two weights the first paint of every slide uses.
 * Black and Lora are declared for older layouts and no slide in the deck renders them.
 */
export const PRELOAD_FONTS = [subsetPath("SlalomSans-Regular.otf"), subsetPath("SlalomSans-Bold.otf")];

/** The frame shell preloads Regular, the portal theme's body face (lib/frames/compose.ts). */
export const FRAME_PRELOAD_FONT = subsetPath("SlalomSans-Regular.otf");

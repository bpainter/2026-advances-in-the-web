// Demo schema v4: the contract between the engine and the demo content (docs/PRD-demos-v4.md,
// section 4). `Action`, `Key`, `VIA_VOCABULARY`, `PACE`, `Frame` and `DemoCodeLang` are unchanged
// from v3. Removed from v3: `DemoSupportLabel`, `DemoTier`, free-text walk-page titles,
// `DemoPage.notes` (`open`, `bridge`) and `Step.notes`; the validator fails on any of those names.

import type { BackgroundId } from "./backgrounds";

export type Stage = "intro" | "used-to" | "now" | "single";
export type Browser = "chrome" | "edge" | "firefox" | "safari";

export interface DemoSection {
  id: string;                      // "d6-variant-picker"
  order: number;                   // 1..n in the demo section
  label: string;                   // scenario label, speaker window only: "Order actions"
  background: BackgroundId;        // PRD v5, 1.3: every page of the section shares this file
  feature?: string;                // intro title and eyebrow: "Dialog element"; required with an intro page
  scenario: string;                // one sentence, speaker window only
  support?: SupportSource;         // required with an intro page
  pages: DemoPage[];               // [intro, used-to, now] or [single]
  citations: { text: string; url: string }[];
  cautions: string[];              // 3 at most, 20 words each at most, shown on the now page's last step
}

export type SupportSource =
  | {
      kind: "web-features";
      id: string;                  // primary feature: "dialog"
      alsoUses?: string[];         // 2 at most: ["popover", "invoker-commands"]
      fallback?: { missing: Browser[]; text: string };   // "a normal select"
    }
  | {
      kind: "tooling";
      packages: { name: string; npm: string; version: string; logo: string }[];
    };

interface PageBase {
  id: string;                      // "d1-intro", "d1-used-to", "d1-now"
  stage: Stage;
  intro: string;                   // 2 or 3 sentences, 50 words at most, said on arrival
  steps: Step[];                   // step 0 is the entry state; now pages 5 steps after s0 at most (CX 2)
  /**
   * `minutes` is authored. `cumulative` is never typed in content: content/sections/index.ts
   * computes it from the minutes (the demo section starts at 5.0) and the validator checks the
   * minutes against the PRD's timing table (section 7.4).
   */
  timing: { minutes: number; cumulative?: number };
  cutPriority?: number;            // 1 = cut first
}

export interface IntroPage extends PageBase {
  stage: "intro";
  description: string;             // one sentence, 25 words at most; the since sentence is generated
  visual: {
    src: string;                   // "/intro/d1-order-actions.png"
    alt: string;
    capture: { pageId: string; stepId: string; selector?: string };
  };
}

export interface WalkPage extends PageBase {
  stage: "used-to" | "now";
  eyebrow: string;                 // equals the section's feature
  title: "How we used to do it" | "How we do it now";   // used-to, now respectively
  frame: Frame;                    // viewport 640 by 628
  files: DemoCodeFile[];           // used-to: 4 at most; now: 3 at most
}

export interface SinglePage extends PageBase {
  stage: "single";
  title: string;                   // the section label
  frame: Frame;                    // viewport 1304 by 628
  badge?: { text: string; missing?: Browser[] };   // spec 6: support chip in the title row; missing browsers struck through
  files?: DemoCodeFile[];
}

export type DemoPage = IntroPage | WalkPage | SinglePage;

/** Pages that carry a live frame (every stage but the intro slide). */
export type FramePage = WalkPage | SinglePage;

export function hasFrame(page: DemoPage): page is FramePage {
  return page.stage !== "intro";
}

/** The on-screen heading of a page: the feature name on intro slides, the title elsewhere. */
export function pageHeading(section: DemoSection, page: DemoPage): string {
  return page.stage === "intro" ? (section.feature ?? section.label) : page.title;
}

export interface Frame {
  build: "today" | "native" | "framework" | "terminal" | "static";
  route: string;                   // e.g. "/demos/01-layered-ui/today"
  viewport: { width: number; height: number };   // design size the frame is authored for
  flags?: Record<string, boolean>; // initial enhancement flags, e.g. { "enhance-css": true, "enhance-js": true }
  hooks?: string[];                // named functions the frame runtime exposes, e.g. ["reset", "slowNetwork"]
  poster?: string;                 // static image for the speaker mirror and fallback, e.g. "/posters/d1-now-s3.png"
}

export type DemoCodeLang = "html" | "css" | "js" | "ts" | "tsx" | "http" | "yaml" | "bash";

export interface DemoCodeFile {
  file: string;
  lang: DemoCodeLang;
  source: string;                  // 44 columns, 40 lines at most; generated when excerptOf is set
  excerptOf?: {
    path: string;                  // "demos/01-layered-ui/today/focus-trap.js"
    ranges: [number, number][];    // inclusive, ascending, in the 44-column formatted file
  };
}

export interface Step {
  id: string;                      // "s0", "s1", ...
  label: string;                   // short, speaker window only
  actions: Action[];
  code?: {                         // required on every used-to and now step
    file: string;
    lines: (number | [number, number])[];   // 12 lines highlighted at most (CX 4)
    off?: boolean;                 // enhancement-off steps: dim the file, "Off" chip on its tab
  };
  spotlight?: string[];
  callouts?: { target: string; text: string; side: "top" | "right" | "bottom" | "left" }[];   // now pages, 1 at most (CX 4)
  meter?: { label: string; value: string; source: string };   // used-to: last step; now: the JavaScript step (CX 4), one per page
  key?: boolean;                   // CX 3: the one step per page to emphasise; the speaker window marks its bullets
  bullets: string[];               // s0: 0 to 3; other steps: 1 to 3; 25 words each at most
  ifKeyboard?: string;             // kept: what to do by hand in hands-on mode
  proof?: string;                  // kept: the plan's proof item this step satisfies
  poster?: string;                 // kept: speaker-mirror image on framework and terminal pages
}

export type Key = "Escape" | "Tab" | "Shift+Tab" | "Enter" | "Space" | "ArrowDown" | "ArrowUp" | "Alt+ArrowLeft" | "Alt+ArrowRight";

export type Action =
  | { type: "pointer"; to: string }                              // ghost cursor glides to the element
  | { type: "click"; target: string }                            // element.click() with a ripple on the ghost cursor
  | { type: "key"; key: Key; target?: string; via: string }      // keycap caption on screen; `via` names the DOM API that produces the same effect (synthetic key events are untrusted)
  | { type: "focus"; target: string; visible?: boolean }         // element.focus({ focusVisible })
  | { type: "type"; target: string; text: string }               // character-by-character input events
  | { type: "paste"; target: string; text: string }              // value set + input event, with a "Paste" keycap
  | { type: "resize"; target: string; inlineSize: string }       // animate a container's inline size
  | { type: "toggle"; flag: string; on: boolean }                // enhancement flag: CSS layer on/off, enhancement script on/off, CSP mode
  | { type: "navigate"; url?: string; history?: "back" | "forward" }
  | { type: "network"; profile: "fast" | "slow" }
  | { type: "hook"; name: string; args?: unknown[] }             // call a named frame hook
  | { type: "terminal"; lines: [number, number] }                // reveal recorded terminal lines
  | { type: "reveal"; target: string }                           // show a hidden element in a static or single page (e.g. a fast-follow tile)
  | { type: "wait"; ms: number }                                 // skipped during instant replay
  | { type: "assert"; target: string; expect: string };          // rehearsal and test check only, e.g. ":popover-open", "focused", "value-length>400"

/** The `via` vocabulary (Part A 3.3); the validator checks the key against it. */
export const VIA_VOCABULARY = [
  "dialog.requestClose()",
  "popover.hidePopover()",
  "focus(target)",
  "el.click()",
  "form.requestSubmit()",
  "select.next()/.prev()",
  "navigation.back()",
  "navigation.forward()",
  "dispatch(keydown)",
] as const;

/** Nominal durations used by the timing calculator (Part A 3.2), in ms. */
export const PACE = { glideMs: 420, rippleMs: 260, charMs: 45, resizeMs: 700, revealMs: 250, keyLeadMs: 150, pasteMs: 300, reloadMs: 400, navigateBudgetMs: 600, hookBudgetMs: 600 } as const;

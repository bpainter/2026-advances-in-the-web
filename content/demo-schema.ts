// Demo schema v3: the contract between the engine and the demo content (SCHEMA_v3.md verbatim,
// plus Step.poster from PRD Part A section 12.3). Field names are used as written.

export type Stage = "today" | "now" | "code" | "single";

export type DemoTier = "baseline-widely" | "baseline-newly" | "two-engine" | "one-engine" | "tooling";

export interface DemoSupportLabel {
  tier: DemoTier;
  summary: string;                 // short badge text, e.g. "Widely + Newly (Dec 2025)"
  detail?: string;                 // notes only; never on screen
  missing?: ("chrome" | "safari" | "firefox" | "edge")[];
}

export interface DemoSection {
  id: string;                      // "d1-order-actions", "f2-caching"
  order: number;                   // 1..n in the demo section
  label: string;                   // "Order actions" (used in page titles)
  scenario: string;                // one sentence, speaker view only
  support?: DemoSupportLabel;      // badge on now and code pages
  pages: DemoPage[];               // three pages (today, now, code) or one page (single)
  citations: { text: string; url: string }[];
  cautions: string[];              // the plan's production cautions; spoken on the last code step
}

export interface DemoPage {
  id: string;                      // "d1-today"
  stage: Stage;
  title: string;                   // "Order actions: today"; the only text on the page besides the frame, code, badge, callouts, meter
  frame?: Frame;                   // the live visual
  files?: DemoCodeFile[];          // code pages only (and single pages that show code)
  steps: Step[];                   // step 0 is the entry state shown on arrival
  notes: { open: string; bridge: string };   // open: said on arrival before step 1; bridge: last line, leads to the next page
  timing: { minutes: number; cumulative: number };
  cutPriority?: number;            // 1 = cut first
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
  file: string;                    // "index.html", "styles.css", "app.js", "csp-header.txt", "pnpm-workspace.yaml", "terminal.sh"
  lang: DemoCodeLang;
  source: string;                  // real code; 44-character lines; line numbers referenced by steps must match
}

export interface Step {
  id: string;                      // "s0", "s1", ...
  label: string;                   // short, speaker view only: "Open the menu"
  actions: Action[];               // animated when entered by Next; replayed instantly when reached by Prev or jump
  spotlight?: string[];            // CSS selectors inside the frame to outline during this step
  code?: { file: string; lines: (number | [number, number])[] };   // code pages: lines to highlight
  callouts?: { target: string; text: string; side: "top" | "right" | "bottom" | "left" }[];   // today/now pages, <= 3 words each
  meter?: { label: string; value: string; source: string };       // today pages, e.g. "JavaScript", "212 lines", "computed from /demos/d1/today/*.js"
  notes: string;                   // what the speaker says at this step: 1-4 sentences in the plan's voice
  ifKeyboard?: string;             // what to do by hand instead, when a keyboard is available
  proof?: string;                  // the plan's "Proof to show live" item this step satisfies, verbatim
  poster?: string;                 // speaker-mirror image for this step on framework and terminal pages (Part A 12.3)
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

# PRD v4: demo section

This document tells you what to change in the demo section after the October 2026 talk. The speaker's feedback is in `docs/design/feedback-2026-10-28.md`. Those requirements are fixed, and this PRD exists to carry them out. The v3 engine stays: pages as slides, frames on their own origin, the in-frame runtime, reset and replay for Prev, hands-on mode and two-window sync. `docs/demo-engine.md` describes it. This PRD only states what changes.

Where this PRD and the design spec (`docs/design/demo-glass-spec.md`) disagree on visuals, the spec wins. On behavior, timing, contrast and data, this PRD wins.

## Decisions at a glance

| Topic | Decision |
|---|---|
| Pages per core demo | Intro slide, "How we used to do it", "How we do it now". The v3 code page is gone. |
| Split | 50/50 on both walk pages: frame left, code right, each 880 by 864 px on the 1920 by 1080 canvas. |
| Code size | 24 px monospace, 44 columns, 21 visible lines, files up to 40 lines. |
| Step caps | Intro: s0 only. Used to: s0 plus 3 steps. Now: s0 plus 6 steps, aim for 5. |
| Proofs | At most 2 proof steps, last on the now page. Other proofs become asserts on earlier steps. |
| Core demos | D1 to D5 plus D6 "Variant picker" (customizable select), last in the core set. |
| F1 | Single page, five tiles, no select teaser, 1.0 minute. |
| F2, F3 | Adopt intro, used to, now. F4 and F5 stay single pages. |
| Support data | Read from the `web-features` npm package at build time. Nothing typed by hand. |
| Notes | One intro paragraph per page, 1 to 3 bullets per step. Every page is rewritten. |
| Look | Glass surfaces from one shared, unshown theme stylesheet injected into every frame. |
| Timing | The demo section ends at 29.5, with a 1.5 minute buffer before 31.0. |

## 1. Page flow per demo

Each core demo, and F2 and F3, has three pages in this order. Next on the last step of a page goes to step 0 of the next page, as in v3.

### 1.1 Intro slide

The intro slide labels the section. It has no frame and no code.

```text
Region          x      y     w     h     Contents
--------------  -----  ----  ----  ----  ---------------------------------------
Visual card     64     64    880   952   glass card, visual image inset 24 px
Title           1008   auto  848   auto  feature name, Slalom Sans Bold 88 px
Description     1008   auto  848   auto  36 px Regular, 2 sentences (3 if not Baseline)
Support row     1008   auto  848   196   four browser tiles, 196 by 196, 21 px gap
Also uses       1008   auto  848   auto  24 px, one line, optional
```

The right column is centered vertically as a group.

- **Visual.** A still image of the native demo in its most telling state. The script `pnpm visuals` replays the named page and step in Playwright and saves a 2x PNG to `public/intro/<section-id>.png`. It is captured, never drawn by hand, so it always matches the current design.
- **Title.** The feature name in sentence case, for example "Dialog element".
- **Description.** One sentence written by the author, of 25 words at most, saying what the feature lets you do. The engine adds a second sentence from the support data (section 3.3), for example "It has been available in all four browsers since March 2022."
- **Support row.** Chrome, Edge, Firefox and Safari, in that order. Each tile shows the logo (72 px), the first supporting version (48 px bold) and the browser name (24 px). A browser without support shows its logo in grayscale at 40 percent opacity with "Not yet" in place of the version. Color is never the only signal.
- **Also uses.** When the demo's shown code needs other features, one line names them with their Baseline month, for example "This demo also uses Popover (January 2025) and Invoker commands (December 2025)." The line is generated from the data.
- **Motion.** The four tiles fade in 80 ms apart on arrival. Under reduced motion they appear at once.

F2 and F3 use the same slide with tool tiles in place of browser tiles (section 2.4).

### 1.2 How we used to do it

- Eyebrow: the feature name ("Dialog element"), 28 px Slalom Sans Bold, dark blue.
- Title: "How we used to do it", 64 px.
- Body: the today build running on the left and its code on the right, 50/50.
- Each step does three things at once: it highlights the code, outlines the matching elements and plays the interaction. This is v3 code-page linking, applied to the today build.
- The page walks HTML, CSS and JavaScript in that order. Aim for one step per language.
- The meter (for example "JavaScript, 399 lines") appears on the last step, top right of the title row.
- No callouts and no support badge. The code highlight does the callouts' job.
- Budget: 0.5 minutes for every core demo. In v3, four of the five today pages ran 0.75 minutes and had no code, so this page is shorter and shows more.

### 1.3 How we do it now

- Eyebrow: the feature name. Title: "How we do it now".
- Body: the native build on the left and its shown files on the right, 50/50.
- This page absorbs the v3 now and code pages. The v3 code page's steps are the spine. Each step highlights code and plays what that code does, so the audience sees the behavior and its cause together.
- The cautions move to the last step, shown in the speaker window only.
- Callouts are allowed, at most 2 per step, 3 words each. No support badge, because the intro slide carries support.

### 1.4 Layout and split

The speaker prefers 50/50 so the code can be read from the back of the room. Both walk pages use it.

```text
Region        x      y     w      h     Contents
------------  -----  ----  -----  ----  --------------------------------------
Eyebrow       64     48    1792   36    feature name
Title row     64     88    1792   72    title left, meter right (used to only)
Frame slot    64     176   880    864   glass card, iframe scaled inside
Code panel    976    176   880    864   glass card, tabs and code
```

- Frames are authored at a viewport of 640 by 628 CSS px and scaled by 1.375 to fill the slot. That keeps the portal at the zoom the room could read in v3.
- Single pages (F1, F4, F5) use one 1792 by 864 slot with a 1304 by 628 viewport at the same scale.
- The code panel uses 24 px monospace with a 0.6 em advance and line height 1.5. 44 columns take 634 px, so the panel needs 698 px with 32 px padding each side. After 56 px of tabs and 64 px of vertical padding, 776 px shows 21 lines.
- Files may run to 40 lines. The panel scrolls a highlighted range into view, as in v3. No step may highlight more than 20 lines.
- Tabs: up to 3 on now pages, up to 4 on used-to pages. A tab is labeled with its file name.

### 1.5 Step caps

Step 0 is the arrival state and does not count toward a cap.

| Page | Steps after s0 | Bullets per step | Notes word budget |
|---|---|---|---|
| Intro | 0 | 0 | intro paragraph only, 50 words at most |
| Used to | 3 at most | 1 or 2 | 130 words per budgeted minute (65 at 0.5) |
| Now | 6 at most, aim for 5 | 1 to 3 | 130 words per budgeted minute |
| Single | 5 at most | 1 to 3 | 130 words per budgeted minute |

The word budget counts the page intro plus every bullet. 130 words a minute is slower than normal speech on purpose: the speaker also has to point at the screen.

### 1.6 Proof items on the now page

The plan's proof items (keyboard only, enhancement off, fallback) live on the now page.

- At most 2 proof steps, placed last.
- **Keyboard only.** One step. Keycaps show on screen. The code panel highlights the HTML that makes the keys work. The step keeps `ifKeyboard` for hands-on mode.
- **Enhancement off.** One step with a `toggle` action. The code panel switches to the stylesheet that was turned off, dims all of it and shows an "Off" chip on its tab (`code.off: true`).
- **Fallback.** D3 shows its fallback with the enhancement toggle. D6 shows a Firefox capture (section 2.2).
- A proof that does not fit becomes an `assert` on an earlier step, and that step carries the `proof` text. Example: D1's "focus returns to Actions" is an assert on s3.
- The speaker window shows a "Proof" chip on proof steps.

## 2. The demo list

### 2.1 Core demos

| Id | Label (speaker only) | Feature name (title, eyebrow) | Primary web-features id | Also uses |
|---|---|---|---|---|
| D1 `d1-order-actions` | Order actions | Dialog element | `dialog` | `popover`, `invoker-commands` |
| D2 `d2-product-card` | Product card | Container queries | `container-queries` | `scope` |
| D3 `d3-support-form` | Support form | Field sizing | `field-sizing` | none |
| D4 `d4-dashboard-navigation` | Dashboard navigation | Navigation API | `navigation` | none |
| D5 `d5-rich-content` | Rich content | Trusted Types | `trusted-types` | none |
| D6 `d6-variant-picker` | Variant picker | Customizable select | `customizable-select` | none |

"Also uses" lists only features the shown code needs to work as shown. Enhancements that degrade quietly (`:open`, `position-area`) stay in the speaker notes.

### 2.2 D6 variant picker

The customizable select moves from F1 into the core set as D6, the last core demo. It sits last because it is the only core demo with two engines, which leads into F1.

- **Scenario.** A product editor in the portal. The Color field is a select with a swatch beside each name.
- **Support.** Chrome 135, Edge 135 and Safari 27 support it. Firefox does not yet. Firefox shows a normal select, and the form still posts the color. The intro slide shows Firefox as "Not yet" and the generated sentence says so (section 3.3). This meets the standing rule for the core set: progressive enhancement where support is missing.
- **Used to.** A hand-rolled combobox in `demos/11-customizable-select/today/`: a div with `role="combobox"`, a listbox, a hidden input for the form, and script for arrow keys, Home, End, type-ahead, Escape, outside click and `aria-activedescendant`. The meter counts its JavaScript.
- **Now.** `demos/11-customizable-select/native/` composes the shown files moved from `content/sections/f1-still-in-motion/files/` to `content/sections/d6-variant-picker/files/`. Suggested steps: s1 turn the opt-in on (CSS lines 1 to 4, a plain select becomes the custom one), s2 open the picker (HTML), s3 choose Moss by keyboard (`select.next()`), s4 style the picker (CSS), s5 submit and show the posted value (proof, keyboard only), s6 Firefox (proof).
- **Firefox proof.** `pnpm walk d6 --browser=firefox --capture` saves `public/posters/d6-firefox.png` from a real Firefox run. The step reveals that capture beside the live frame. In hands-on mode, `ifKeyboard` says to open the frame URL in Firefox on the laptop instead.
- **Citations and cautions.** Move the select citations from F1, including the WebKit rule to keep real text in every option. Cautions: keep text in every option; the syntax is still moving (Safari 27.2 added `::field-content`); test the Firefox fallback inside real forms.
- **F5.** Add a row for custom select and combobox libraries.

### 2.3 F1 still in motion

F1 stays a single page without the select. Remove the teaser, the Firefox poster, the `resetTeaser` hook and the two-engine badge, which applied to the teaser only. The grid has five tiles: anchor positioning, Grid Lanes, cross-document view transitions, scroll-driven animations and scoped custom element registries. Steps: s0 empty grid, s1 anchor positioning, s2 Grid Lanes and cross-document view transitions, s3 scroll-driven and registries, s4 the rule. Budget 1.0 minute. Notes that say "the five core demos" now say six.

### 2.4 F2 caching and F3 package trust

Both adopt the intro, used-to and now pattern, because the speaker found the flow change useful and two patterns in one section confuse the audience.

- **Intro slide.** Tool tiles in place of browser tiles: logo, version, name. F2 shows Next.js 16 (Cache Components). F3 shows pnpm and npm with the versions in the v3 support summary (pnpm 12.11, npm 11.15; verify both against the registry). The generated sentence uses the release date from the npm registry (section 3.4).
- **F2 used to.** The v3 today app on port 3107 (Cache Components off). Shown files are excerpts of `app/products/[id]/page.tsx` (`revalidate`, `dynamic`), `lib/inventory.ts` and `lib/catalog.ts`. s1 shows the route settings that cover the whole page. s2 loads the page and the log shows the catalog query running again because inventory made the route dynamic. s3 shows the meter, "5 freshness settings in 4 files". Budget 0.75 minutes, because the server log needs a moment to read.
- **F2 now.** The v3 now and code pages merged on the 3106 app, s0 plus 6 steps.
- **F3 used to.** The incident timeline frame stays. New shown files go in `demos/07-package-workflow/used-to/`: `.npmrc` with `ignore-scripts=true`, a CI excerpt that runs `npm ci --ignore-scripts` and then rebuilds an allowlist, and a `publish.yml` that uses a long-lived `NPM_TOKEN`. One step per file. Budget 0.5 minutes.
- **F3 now.** The v3 terminal now and code pages merged, s0 plus 6 steps. The terminal player sits in the frame slot; the policy and workflow files sit in the code panel.

F4 and F5 stay single pages. They get the glass chrome and rewritten notes.

## 3. Browser support data

### 3.1 Source

Read every browser version and date from the `web-features` npm package. Do not type them by hand.

- Add `web-features` as an exact-version dev dependency (3.44.0 at the time of writing).
- Read `data.json` from the installed package. Each feature has `status.support` (first version per browser), `status.baseline` (`"high"`, `"low"` or `false`) and `status.baseline_low_date`. The same file has `browsers.<id>.releases`, which maps each version to its release date.
- Use the desktop keys `chrome`, `edge`, `firefox` and `safari`. Show a version string as given. If it starts with "≤", show it as given and use that version's release date.
- `pnpm support` (new, `scripts/support-data.mts`) writes `content/.generated/support.json` with the package version, each section's rows, the generated sentence and the "also uses" line. The intro slide reads only this file. The script runs offline.
- `pnpm check` fails when the generated file's package version differs from the installed one. Refresh the package the week of the talk and rerun `pnpm support`.

### 3.2 Feature ids and expected values

Checked against web-features 3.44.0 on 28 October 2026. All ids exist; none needs a "verify" mark. The table is the fixture for the support-data test.

| Demo | Id | Chrome | Edge | Firefox | Safari | Baseline low date |
|---|---|---|---|---|---|---|
| D1 | `dialog` | 37 | 79 | 98 | 15.4 | 2022-03-14 |
| D1 also | `popover` | 116 | 116 | 125 | 17 | 2025-01-27 |
| D1 also | `invoker-commands` | 135 | 135 | 144 | 26.2 | 2025-12-12 |
| D2 | `container-queries` | 105 | 105 | 110 | 16 | 2023-02-14 |
| D2 also | `scope` | 143 | 143 | 146 | 26.4 | 2026-03-24 |
| D3 | `field-sizing` | 123 | 123 | 152 | 26.2 | 2026-06-16 |
| D4 | `navigation` | 102 | 102 | 147 | 26.2 | 2026-01-13 |
| D5 | `trusted-types` | 83 | 83 | 148 | 26 | 2026-02-24 |
| D6 | `customizable-select` | 135 | 135 | none | 27 | not Baseline |

### 3.3 The "available since" sentence

- **Baseline feature.** Use `baseline_low_date`, the day the last of the core browsers shipped it. Sentence: "It has been available in all four browsers since {Month YYYY}."
- **Not Baseline.** Take the release date of each listed browser's first version from `browsers.<id>.releases` and use the latest. Sentence: "It works in {browsers} since {Month YYYY}. {Missing browser} shows {fallback}." D6 reads: "It works in Chrome, Edge and Safari since September 2026. Firefox shows a normal select." The fallback text comes from the section's `support.fallback`. This is the only case where the description runs to three sentences.
- **Also uses.** Each id is named by its web-features `name` with its Baseline low month.

### 3.4 Tools and logos

- Tool release dates come from the npm registry (`npm view <package> time --json`). `pnpm support --tools` fetches them and writes them into `support.json`. It is the only step that needs a network, and it runs at authoring time, never on stage.
- Logos are local files in `public/logos/`: `chrome.svg`, `edge.svg`, `firefox.svg`, `safari.svg`, `nextjs.svg`, `pnpm.svg`, `npm.svg`. Take them from each vendor's published brand assets. No logo loads from the network.

## 4. Schema v4

`content/demo-schema.ts` becomes v4. `Action`, `Key`, `VIA_VOCABULARY`, `PACE`, `Frame` and `DemoCodeLang` are unchanged.

```ts
export type Stage = "intro" | "used-to" | "now" | "single";
export type Browser = "chrome" | "edge" | "firefox" | "safari";

export interface DemoSection {
  id: string;                      // "d6-variant-picker"
  order: number;                   // 1..n in the demo section
  label: string;                   // scenario label, speaker window only: "Order actions"
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
  steps: Step[];                   // step 0 is the entry state
  timing: { minutes: number; cumulative: number };
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
  files?: DemoCodeFile[];
}

export type DemoPage = IntroPage | WalkPage | SinglePage;

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
    lines: (number | [number, number])[];   // 20 lines highlighted at most
    off?: boolean;                 // enhancement-off steps: dim the file, "Off" chip on its tab
  };
  spotlight?: string[];
  callouts?: { target: string; text: string; side: "top" | "right" | "bottom" | "left" }[];   // now pages, 2 at most
  meter?: { label: string; value: string; source: string };   // used-to pages, last step only
  bullets: string[];               // s0: 0 to 3; other steps: 1 to 3; 25 words each at most
  ifKeyboard?: string;             // kept: what to do by hand in hands-on mode
  proof?: string;                  // kept: the plan's proof item this step satisfies
  poster?: string;                 // kept: speaker-mirror image on framework and terminal pages
}
```

Removed from v3: `DemoSupportLabel`, `DemoTier`, `DemoPage.title` on walk pages as free text, `DemoPage.notes` (`open`, `bridge`) and `Step.notes`. The validator fails on any of these names, so no v3 field survives by accident. The bridge line is gone because the next section's intro slide does that job.

## 5. Speaker notes

### 5.1 Speaker window

The layout stays: previews on the left, notes in their own scrolling column on the right, timer hidden by default. The notes column changes as follows, top to bottom.

1. **Header.** Eyebrow and title of the page, then "Step 3 of 7: Close the dialog". A "Proof" chip shows on proof steps. 20 px.
2. **Hands-on box.** In hands-on mode only, `ifKeyboard` in a box with a chartreuse border on navy. 32 px.
3. **Intro.** On step 0 only, the page `intro` at 32 px, followed by any s0 bullets.
4. **Bullets.** The current step's bullets as a list. Default 40 px, adjustable from 28 to 56 px, line height 1.35. The first bullet always says what the audience sees.
5. **Cautions.** On the now page's last step, the section's cautions under the label "Cautions", 28 px.
6. **Next.** Pinned to the bottom of the column: "Next: {next step label}", or "Next page: {eyebrow}: {title}" on a page's last step. 24 px.
7. **Reference.** One collapsed `<details>` at the end: support detail, citations, the step list that jumps, and the scripted action summary. Selectors and action summaries never show outside it, because they are noise on stage. In rehearsal mode (`d`) the action summary also shows under Next.

The column scrolls the current step into view on every step change. Acceptance: at 1440 by 900 and the default size, the header, the current bullets and the Next line are visible without scrolling on every step of the deck. The walk checks this.

### 5.2 Writing rules for notes

These come from the feedback file and apply to every intro, bullet, description, caution, eyebrow and label.

- Beginner reading level. Sentences of about 15 words, 20 at most. Common words.
- Define a term the first time it appears in a section, in plain words.
- One claim per sentence, stated once. Stop the sentence when its point lands.
- Plain verbs. No idioms, no figurative verbs, no buzzwords, no hype, no exclamation points.
- No em dashes or en dashes anywhere.
- Sentence case for headings and labels.
- The "X, not Y" pattern at most once per page, and never in a label.
- The first bullet of a step says what is on screen. The next bullets say why it matters.
- No extra description of things the audience can already see. No filler.

The validator checks what a machine can check: dashes, exclamation points, sentence and bullet length, bullet counts, word budgets and a banned-word list (start with: seamless, leverage, robust, powerful, magic, simply, just, easily, unlock, game changer, under the hood, out of the box). A writer reviews the rest.

### 5.3 Rewrite requirement

Every page's notes are rewritten in this voice: 27 pages, including the intro slides and F1, F4 and F5. The migration script (section 7.2) copies v3 text into the new fields and marks each one `TODO rewrite:`. `pnpm check` fails while any `TODO` remains. The writer works from the example below and from the facts in the v3 notes and citations. Facts and citations do not change; only the wording does.

### 5.4 Example: D1 "How we do it now"

This is the model for tone, length and structure. Actions are as in the v3 `d1-now` and `d1-code` steps named in the comments. Line numbers are from the current files; recheck them after the CSS trim in section 6.3.

```ts
{
  id: "d1-now",
  stage: "now",
  eyebrow: "Dialog element",
  title: "How we do it now",
  intro:
    "This is the same order row, built with HTML the browser understands. The menu is a popover and the confirmation is a dialog. The code on the right is all of it.",
  frame: { build: "native", route: "/demos/01-layered-ui/native",
    viewport: { width: 640, height: 628 }, flags: { "enhance-css": true }, hooks: ["reset"] },
  files: [/* index.html, enhance.css, app.js as in v3 */],
  steps: [
    { id: "s0", label: "Same row", actions: [],
      code: { file: "index.html", lines: [] },
      bullets: [] },
    { id: "s1", label: "Open the menu", actions: [/* v3 d1-code s1 */],
      code: { file: "index.html", lines: [[6, 10]] },
      spotlight: ["#actions-418", "#order-actions-418"],
      bullets: [
        "The Actions button opens the menu. Lines 6 to 10 do that.",
        "A popover is a layer that shows above the rest of the page. The popover attribute makes this menu one.",
        "A click outside the menu closes it. We wrote no script for that.",
      ] },
    { id: "s2", label: "Open the dialog", actions: [/* v3 d1-code s2 */],
      code: { file: "index.html", lines: [[11, 16], 28] },
      spotlight: ['[commandfor="cancel-418"]', "#cancel-418"],
      bullets: [
        "Cancel order opens a dialog. Focus moves to Keep order, the safe choice.",
        "The command attribute tells the button what to do. Here it opens the dialog.",
        "This dialog is modal. The rest of the page waits until you answer.",
      ] },
    { id: "s3", label: "Close the dialog", actions: [/* v3 d1-now s3, with its focus asserts */],
      code: { file: "index.html", lines: [[17, 27]] },
      spotlight: ["#cancel-418 form", "#actions-418"],
      proof: "Show focus returning to the Actions button after dismissal.",
      bullets: [
        "Keep order closes the dialog. Escape closes the menu. Focus is back on Actions.",
        "The form uses method dialog. Any button in that form closes the dialog.",
        "The browser moves focus back for us. Keyboard users stay in the right place.",
      ] },
    { id: "s4", label: "Confirm the cancel", actions: [/* v3 d1-code s5, after reopening the dialog */],
      code: { file: "app.js", lines: [[7, 14], [26, 28]] },
      spotlight: ["#status"],
      bullets: [
        "This time we confirm. The status line says Order 418 was canceled.",
        "This is the only JavaScript on the page. It waits for the dialog to close.",
        "If the answer was confirm, it calls the server and shows the result.",
      ] },
    { id: "s5", label: "Keyboard only", actions: [/* v3 d1-now s4 */],
      code: { file: "index.html", lines: [[6, 16]] },
      spotlight: ["#status"],
      proof: "Open, choose, dismiss, and confirm with the keyboard only.",
      ifKeyboard: "Tab to Actions, then Enter, Tab, Enter, Escape. Press Next once to sync the frame.",
      bullets: [
        "Same task with the keyboard only. The key names show at the bottom of the demo.",
        "Enter opens, Tab moves and Escape closes. Focus always lands on the right button.",
      ] },
    { id: "s6", label: "Styles off", actions: [/* v3 d1-now s5 */],
      code: { file: "enhance.css", lines: [], off: true },
      proof: "Remove the enhancement CSS and show that the controls remain semantic and usable.",
      bullets: [
        "The CSS file is now off. The menu and the dialog look plain.",
        "They still open, close and return focus. The CSS only sets the look and the position.",
      ] },
  ],
  timing: { minutes: 2.25, cumulative: 8.0 },
}
```

The rewritten D1 cautions, shown under s6:

- "Use a dialog when the user must answer. Use a popover when they can ignore it."
- "Check permission on the server. The dialog does not protect your data."
- "Test with a screen reader. Browser support does not prove the page is accessible."

## 6. Design

### 6.1 Direction

Every demo frame (the Ridgeline Outfitters operations portal) and the demo slide chrome use glass: translucent white surfaces with a background blur, soft white borders and a soft, abstract, colored background behind them. The references are `docs/design/inspiration/glass-warm.webp` and `glass-cool.png`. The design agent writes the full spec at `docs/design/demo-glass-spec.md`, and you follow it. This section sets the rules the spec works within.

### 6.2 Shared portal theme

- One stylesheet, `public/theme/portal-glass.css`, holds the portal's look. It is never shown on screen, so the shown code stays about the feature.
- `lib/frames/compose.ts` injects `<link rel="stylesheet" href="/theme/portal-glass.css">` as the first element in every composed document's head: today, native, static and terminal builds.
- The whole file sits in `@layer portal-theme`. Shown CSS stays unlayered, so it always wins over the theme.
- The F2 apps on ports 3106 and 3107 import a copy. `pnpm theme:sync` copies the file and the portal backgrounds into each app's `public/`, and `pnpm check` fails when the hashes differ.
- The theme may style any element, but on `dialog`, `[popover]`, `::backdrop`, `select`, `::picker(select)`, `option`, `input` and `textarea` it may set only color, background, border, border-radius, box-shadow, padding, font and backdrop-filter. It may never use position, inset, display, appearance, sizing, `field-sizing`, container queries, `@scope`, anchor properties, transitions, animation, overlay or z-index on any element. `pnpm theme:lint` (PostCSS) enforces this. The enhancement-off proofs only stay honest this way.
- The `enhance-css` toggle never touches the theme.

### 6.3 Tokens

| Token | Value | Use |
|---|---|---|
| `--glass-surface` | `rgb(255 255 255 / 0.55)` | panels, cards, popovers, dialogs |
| `--glass-surface-strong` | `rgb(255 255 255 / 0.72)` | surfaces behind blue text or dense tables |
| `--glass-surface-solid` | `rgb(255 255 255 / 0.92)` | fallback when blur is off |
| `--glass-border` | `1px solid rgb(255 255 255 / 0.6)` | every glass surface |
| `--glass-blur` | `blur(24px)` | 24 px at most |
| `--glass-radius` | `20px` | frame surfaces; slide cards use 24px |
| `--glass-shadow` | `0 8px 32px rgb(15 28 65 / 0.12)` | raised surfaces |
| `--slalom-blue` | `#0C62FB` | buttons (white text), focus rings |
| `--dark-blue` | `#002FAF` | links and eyebrows on glass |
| `--navy` | `#0F1C41` | body text |
| `--cyan` | `#1BE1F2` | fills and background only |
| `--purple` | `#C7B9FF` | fills and background only |
| `--chartreuse` | `#DEFF4D` | the one accent: fills behind navy text, keylines on navy |
| `--coral` | `#FF4D5F` | errors: borders, icons and fills behind navy text |

Once the theme exists, move the presentational rules out of the shown files into it. D1's `enhance.css` loses its body, `.order` and button rules and keeps placement, state and motion. Do the same for every today build's stylesheet.

### 6.4 Contrast

- Text on glass meets 4.5:1. Code text in the panel meets 7:1, because projectors wash out color.
- Text sits only on surfaces of `--glass-surface` or stronger. Navy text on `--glass-surface` composited over the darkest palette color (navy) is about 5.7:1, so the floor holds over any background.
- Slalom Blue text needs `--glass-surface-strong` or stronger. Coral and chartreuse are never text colors on glass; coral text on white is about 3.2:1.
- A unit test composites each text token over each surface token over each palette color and fails below the limits. Axe runs in every frame with blur off as a second check.

### 6.5 Backgrounds

The backgrounds were generated with Higgsfield (Soul v2) on 28 October 2026 from the Slalom palette: soft, out-of-focus glass shapes with a pale center, no text, no logos and no people. They are in `public/backgrounds/` (see its README):

| File | Size | Used behind |
|---|---|---|
| `public/backgrounds/glass-fan.jpg` | 2048 by 1152 | the slide chrome of every demo page, including intro slides |
| `public/backgrounds/glass-petal.jpg` | 2048 by 1152 | native, framework and terminal frames (blue, white) |
| `public/backgrounds/glass-lavender.jpg` | 2048 by 1152 | today frames (purple and cobalt), shown under a stronger white veil so it reads lower in saturation |
| `public/backgrounds/glass-navy.jpg` | 2048 by 1152 | dark surfaces: an intro slide variant or a dark frame theme |
| `public/backgrounds/glass-blue.jpg` | 2048 by 1152 | saturated accent for the intro slide's visual panel only; never behind code or portal UI |

- Each file is a JPEG under 700 KB. Converting to WebP at build time is optional.
- The frame's own `body` carries the portal background with `background-size: cover`, because a blur inside an iframe cannot reach the parent page.
- The two portal backgrounds differ on purpose, so the room can tell old from new at a glance.
- If a file is missing, the theme falls back to a gradient of the same colors, and `pnpm check` warns.

### 6.6 Blur support and fallbacks

`backdrop-filter` works unprefixed in every current engine (web-features `backdrop-filter`, Baseline since September 2024: Chrome 76, Edge 79, Firefox 103, Safari 18). Rules:

- `@supports not (backdrop-filter: blur(1px))` swaps surfaces to `--glass-surface-solid`.
- `@media (prefers-reduced-transparency: reduce)` does the same. Only Chrome and Edge support the query today; that is fine.
- `?glass=off` on `/present` and `/speaker` passes a `glass:0` flag to every frame and sets `data-glass="off"` on the slide chrome. Use it on the day if the laptop drops frames.
- Do not nest blurred surfaces. A blurred element becomes the backdrop root for its children, so inner blur shows nothing. Inner cards use a translucent fill without blur.
- A blurred element becomes the containing block for fixed and absolute children. Top-layer dialogs and popovers are not affected. Do not put blur on an ancestor of anything the demo positions.
- Budget: 6 blurred elements per frame document at most. During playback, the 95th percentile frame time stays under 20 ms on the talk laptop with both windows open. Rehearsal mode records it.

## 7. Engine changes

Keep the v3 engine. Change only what follows.

### 7.1 Components and modules

1. **Schema.** `content/demo-schema.ts` to v4 (section 4).
2. **Deck assembly.** `content/slides/index.ts` builds 27 demo pages: 8 sections with 3 pages each, plus F1, F4 and F5.
3. **Intro slide.** New `components/page/IntroSlide.tsx` and `components/page/SupportRow.tsx`, reading `content/.generated/support.json`. No frame, no runtime, a single step.
4. **Walk page layout.** `DemoPageSlide.tsx` renders the eyebrow and title and drops the badge. `SLOT` becomes `{ split: { width: 880, height: 864 }, full: { width: 1792, height: 864 } }`. `styles/components/page.css` sets the body to `880px 880px` with a 32 px gap.
5. **Code panel.** 24 px code, 21 visible lines, file-name tabs, the `off` state and elision lines (item 6).
6. **Excerpts.** At build time, `lib/demo-files.ts` resolves `excerptOf` into `source`: the ranges joined by one generated elision line in the file's comment syntax, for example `// ... 61 more lines` or `/* ... 42 more lines */`. Elision lines render dimmed and italic and can never be highlighted.
7. **Used-to player.** The today frame and its code panel use the v3 code-page linking. `dispatch(keydown)` stays allowed on today builds.
8. **Notes.** Rewrite the notes column of `SpeakerView.tsx` to section 5.1.
9. **Theme.** Injection in `lib/frames/compose.ts`. `img-src ORIGIN` and `style-src ORIGIN` already allow the theme and backgrounds; check any build that overrides `BASE_CSP` (D5).
10. **Glass chrome.** Slide background, glass cards for the frame slot and code panel, the `glass` flag.
11. **Visuals.** `pnpm visuals` (Playwright) captures intro visuals and the D6 Firefox poster.
12. **Frame warming.** While on an intro slide, warm the used-to frame to s0, as v3 does for the next page.

### 7.2 Content migration

`scripts/migrate-v4.mts` is a one-off script. Run it once, commit the result and delete it.

- Today pages become used-to pages: frame kept, viewport set to 640 by 628, callouts dropped, meter moved to the last step, steps kept for review.
- Now and code pages merge into one now page: the code page's steps first, then the now page's proof steps, then cautions on the last step. Steps over the cap are kept and marked `TODO cut:`.
- `open` becomes `intro`. Each step's `notes` is split into sentences, one per bullet. All of it is marked `TODO rewrite:`.
- Intro pages are created with `TODO` description and visual.
- Remove the `extract:demos` script and `scripts/extract-demo-prd.mts`. It rebuilds `content/sections/` from the v3 PRD and would overwrite this work.

### 7.3 Trimming the today builds into shown files

The today builds are working code of 1,795 lines in total, and D1 alone has 399 lines of JavaScript. You cannot show them whole. Trim them like this:

1. Move the presentational CSS into the theme (section 6.3). Keep only the rules the old approach needs: portal roots, z-index, overlays, hidden states.
2. Format every file in `demos/*/today/` with Prettier at `printWidth: 44`. Add a `.prettierrc` override for that path. Line numbers in `excerptOf` refer to this formatted file.
3. Run `pnpm walk` on every used-to page. Behavior must not change.
4. For each used-to page, pick up to 4 files and one or more ranges in each, so each excerpt is 40 lines at most. Choose ranges that show the work the native version removes: open state, Escape, outside click, focus trap, scroll lock, routing, sink calls.
5. `pnpm check` verifies excerpt fidelity: every shown line equals its source line, ranges are in order and in bounds, and every highlighted line falls on a shown line.
6. Meters stay honest. `pnpm meters` formats each file in memory at `printWidth: 80` before it counts, so the 44-column layout does not inflate the number. D1 should still read about 399 lines.

### 7.4 Timing

The demo section runs from 5.0 to 31.0 on the talk clock. The table ends the last page at 29.5 and keeps a 1.5 minute buffer inside the section. That buffer sits ahead of the deck's own 1.5 minute buffer before the closing.

| Section | Intro | Used to | Now | Total | Ends at |
|---|---|---|---|---|---|
| Opening (Claude Design) | | | | 5.0 | 5.0 |
| D1 Dialog element | 0.25 | 0.5 | 2.25 | 3.0 | 8.0 |
| D2 Container queries | 0.25 | 0.5 | 1.75 | 2.5 | 10.5 |
| D3 Field sizing | 0.25 | 0.5 | 1.75 | 2.5 | 13.0 |
| D4 Navigation API | 0.25 | 0.5 | 2.25 | 3.0 | 16.0 |
| D5 Trusted Types | 0.25 | 0.5 | 2.0 | 2.75 | 18.75 |
| D6 Customizable select | 0.25 | 0.5 | 1.5 | 2.25 | 21.0 |
| F1 Still in motion | single | | | 1.0 | 22.0 |
| F2 Caching | 0.25 | 0.75 | 2.25 | 3.25 | 25.25 |
| F3 Package trust | 0.25 | 0.5 | 2.25 | 3.0 | 28.25 |
| F4 Vite 8 locally | single | | | 0.5 | 28.75 |
| F5 What you can delete | single | | | 0.75 | 29.5 |
| Section buffer | | | | 1.5 | 31.0 |

- Pace model: an intro slide is a 15 second paragraph. A step is about 15 seconds of speech plus its playback. Now pages with 6 steps get 2.25 minutes, 5 steps 1.75 to 2.0, and 4 steps 1.5.
- `timing.cumulative` is computed by the validator from `minutes`. It is not typed.
- Cut order: F5, then F4, then D2's last proof step, then F1.

### 7.5 Validator (`pnpm check`)

Add these rules. Each one fails the check unless marked as a warning.

- Page order per section: intro, used-to, now; or one single page.
- Step caps (section 1.5), proof steps (2 at most, last), bullets per step, word budgets.
- Writing rules (section 5.2): no U+2013 or U+2014 in any copy, no "!", sentences of 20 words at most, bullets of 25 words at most, banned words, no `TODO`.
- `code` on every walk-page step. Lines in bounds. 20 lines at most per step. No highlight on an elision line.
- Files: 44 columns and 40 lines at most, excerpts included. Excerpt fidelity (section 7.3).
- Intro pages: support id present in the installed web-features, the visual file exists, description of one sentence. `support.json` is current.
- Walk-page `eyebrow` equals the section's `feature`. `title` matches the stage.
- No callouts on used-to pages. At most 2 per step on now pages. Meter only on a used-to page's last step.
- Frame viewport 640 by 628 on walk pages and 1304 by 628 on single pages, within 2 percent aspect.
- Timing sums to the table. The last page ends at 29.5 or earlier.
- v3 field names fail: `notes`, `open`, `bridge`, `support.tier`.
- Theme lint and the F2 theme hash. Missing backgrounds are a warning.

### 7.6 Walk (`pnpm walk`)

- Drives all 27 pages in order with the arrow keys, in Chromium, then with `--browser=webkit` and `--browser=firefox`.
- Intro pages: four tiles render, and their text matches `support.json`.
- Every frame: the theme is applied (computed `--glass-surface` is set on the root).
- Geometry: the frame slot and code panel are each 880 px wide on the canvas.
- D6 in Firefox: the select is a normal select, and submitting the form posts the chosen color. With `--capture`, saves the Firefox poster.
- Speaker window at 1440 by 900: header, bullets and the Next line are visible on every step (section 5.1).
- Keeps the v3 checks: asserts, forward and back digests, keyboard parity.

## 8. Milestones

Build in this order. Each milestone ends with `pnpm validate` green and `pnpm walk` passing for the pages it touches.

**M0, schema and migration.** v4 schema, `migrate-v4.mts` run once, `extract:demos` removed, validator rules from section 7.5 in place. Accept: content compiles; `pnpm check` lists only `TODO` failures; one broken fixture per new rule fails.

**M1, support data and intro slide.** `web-features` pinned, `pnpm support`, logos, `IntroSlide`, `SupportRow`. Accept: `support.json` matches the table in section 3.2; D6 shows Firefox as "Not yet" with the generated sentence; nothing loads from the network.

**M2, walk layout and D1 end to end.** 50/50 layout, eyebrow and title, 24 px code panel, excerpts, the `off` state, the used-to player. D1 migrated fully, with the section 5.4 notes. Accept: a 44 by 40 fixture fits the panel in three engines with no horizontal scroll; D1 walks in three engines; excerpt fidelity passes; the D1 meter still reads about 399 lines.

**M3, speaker window.** Notes column per section 5.1. Accept: the 1440 by 900 visibility check passes on every D1 step; hands-on shows `ifKeyboard`; cautions show on s6; no selector text outside Reference.

**M4, glass theme and backgrounds.** Needs `docs/design/demo-glass-spec.md` and the Higgsfield files. Theme injection, theme lint, tokens, slide chrome, fallbacks, `?glass=off`, `pnpm theme:sync`. Accept: contrast unit test passes; axe passes in every frame with blur off; frame time budget met on the talk laptop; enhancement-off proofs look plain while the theme stays on.

**M5, D2 to D5.** Today builds trimmed and formatted, used-to excerpts, now pages merged within caps, notes rewritten, intro visuals captured. Accept: no `TODO` left in D1 to D5; every page within its word budget; D2's container widths respond inside the 640 px viewport.

**M6, D6 and F1.** New today build, native build from the moved files, Firefox capture, F1 trimmed to five tiles, F5 row added. Accept: D6 walks in Chromium and WebKit with the custom picker; Firefox posts the color from a normal select; F1 runs in 1.0 minute in rehearsal.

**M7, F2, F3, F4, F5.** Tool intro slides, F2 and F3 used-to and now pages, notes for all four. Accept: the F2 frame is requested once per audience entry and never by the speaker window, as in v3; F3 used-to files are committed and shown.

**M8, rehearsal.** Full run with both windows on the talk laptop and the projector. Accept: the run ends within 1.5 minutes of 29.5; code is readable from the back row; the speaker signs off on the notes.

## 9. RAID log

| Type | Item | Owner | Response |
|---|---|---|---|
| Risk | Blur drops frames on the talk laptop during playback. | Engineer | 6 blurred elements per frame, 24 px blur, no nesting, `?glass=off` ready. Measure in M4. |
| Risk | Glass washes out on the projector. | Design agent | Surface alpha floor, 7:1 code text, projector check in M8. |
| Risk | The 640 px viewport breaks layouts, mostly D2's container widths and D4's list. | Engineer | Retune in M5. The walk checks D2's breakpoints. |
| Risk | Trimming today builds changes their behavior or the meters. | Engineer | Walk before and after. Meters count at `printWidth: 80`. |
| Risk | Customizable select styling differs between Chrome and Safari. | Engineer | Keep the shown CSS to what both render the same. Walk in WebKit. |
| Risk | Rewriting 27 pages of notes runs late. | Writer | D1 is the model. The validator blocks `TODO`. Start in M2. |
| Assumption | web-features 3.44.0 is current enough. | Engineer | Refresh the week of the talk and rerun `pnpm support`. |
| Assumption | The talk laptop runs current Chrome for the audience window. | Speaker | Confirm in M8. |
| Issue | `pnpm extract:demos` overwrites `content/sections/`. | Engineer | Removed in M0. |
| Dependency | `docs/design/demo-glass-spec.md` from the design agent. | Design agent | Needed before M4. M0 to M3 do not wait for it. |
| Dependency | Higgsfield backgrounds in `public/backgrounds/`. | Done | Generated 28 October 2026; see `public/backgrounds/README.md`. |
| Dependency | Browser and tool logos from the vendors' brand assets. | Engineer | Needed before M1 sign-off. |

## 10. Open questions for the speaker

1. D1's title. This PRD uses "Dialog element", from your example, with popover and invoker commands on the "also uses" line. Would you prefer "Dialog and popover"?
2. D6's place. This PRD puts the select last in the core set, as a lead-in to F1. Would you rather have it right after D3, the other form demo?
3. D6's Firefox proof. Is a captured Firefox screenshot enough, or do you want a live Firefox window on the laptop?
4. Code panel color. Light glass matches the look. A dark navy panel may read better on the projector. Should we decide at the projector check?
5. The 1.5 minute buffer inside the section. Keep it, or spend part of it on a slower pace for D4 and D5?

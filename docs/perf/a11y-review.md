# Accessibility review: live presenter app (WCAG 2.2 AA)

Reviewed 29 October 2026 against production (`https://2026-advances-in-the-web.vercel.app`, commit
`cb8e46c`) with the frames from `https://2026-advances-in-the-web-demos.vercel.app`. No code was
changed. Tested in Playwright Chromium (headless) with axe-core, Chrome's accessibility tree
(CDP `Accessibility.getFullAXTree`) and rendered-pixel contrast sampling. Not tested: a real screen
reader (VoiceOver, NVDA, JAWS), Safari and Firefox, forced colors, and real touch devices.

Evidence lives in
`/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y/`
(written as `a11y/` below). The scripts that produced it are in the sibling `scripts/` folder:
`axe-all.mjs`, `kbd.mjs`, `kbd2.mjs`, `kbd3.mjs`, `contrast.mjs`, `motion.mjs`, `zoom.mjs`, `ax.mjs`.

## Summary

| Rank | Count | Findings |
| --- | --- | --- |
| High | 4 | Demo frame keyboard trap (25 slides). Single-key shortcuts fire anywhere. Code file tabs can't be reached by keyboard. Text can't be resized: zoom does nothing, and text renders at 4 to 5 px on phones. |
| Medium | 6 | The deck takes over Space and other keys on focused buttons. Focus drops to `<body>` on every slide change. Step changes are never announced, and slide changes are announced twice. The pill's focus ring is 2.45:1. Dimmed code lines are 2.5 to 2.9:1. Highlighted code lines aren't exposed to screen readers. |
| Low | 7 | Closing slide has no h1. Focus rings shrink with the stage. Footer slide number has no label. Speaker window semantics. Terminal frame scroll region can't take focus. Pill covers content in mobile landscape. Help lists presenter-only keys, and presenter titles don't change per slide. |

Automated scans are clean. axe (WCAG 2.0 to 2.2 A/AA plus best practice, `region` on) found 0
violations on `/` and all 50 `/s/<id>` pages in three states: closed, drawer open and keyboard help
open (`a11y/axe-all.json`). The only presenter hits were on `/speaker` (L4). Every real problem below
is behavioral, which is why `pnpm axe` and `pnpm axe --presenter` miss it.

---

## High

### H1. Keyboard trap in every live demo frame
- **WCAG**: 2.1.2 No Keyboard Trap (A), and 2.1.1 Keyboard (A) for everything after the frame.
- **Pages**: the 25 reader slides with a live frame (`d1`..`d6` used-to and now, `m1`..`m5` used-to and now, `f3-used-to`, `f3-now`, `f4-single`).
- **Evidence**: on `/s/d1-used-to` the first Tab lands in the frame, on `#t-actions`. After that, Tab, Shift+Tab and Escape all leave focus on that same button (`a11y/kbd2.log` section 1; 22 Tabs in `a11y/kbd-1600.json`, `d1-used-to` and `d2-now`; screenshot `a11y/trap-d1-used-to.png`). The code panel, the reader pill, the drawer and the help button can't be reached. The pill also fades to opacity 0 about 2.5 s later, because frame keystrokes never wake it (`pill 0` in the same log), so the user can't see their way out either. The only exits are undocumented: ArrowRight/ArrowLeft leave the slide entirely, and `h` turns on hands-on mode. Hands-on Tab order is correct: frame, file tab, code, Sections, Previous, Next, Help (`a11y/kbd2.log`, "hands-on tabs").
- **Cause**: in scripted mode (the default), `public/runtime/demo-runtime.js` `onKeydown` (around lines 1278 to 1295) calls `preventDefault()` and `stopPropagation()` on every key it doesn't forward, Tab included. `components/page/PageFrame.tsx` `mount()` still sets `iframe.tabIndex = 0` in reader mode.
- **Fix**:
  1. `public/runtime/demo-runtime.js`: in scripted mode, forward `Tab` and `Shift+Tab` instead of eating them (`post({ type: "key", key: "Tab", shift })`). Also forward `Escape`.
  2. `components/stage/Stage.tsx` `dispatchKey`: on a forwarded Tab, move focus to the next or previous tabbable element after or before `iframe.page-frame__iframe`, so the frame acts like one tab stop. On a forwarded Escape in hands-on mode, leave hands-on mode and call `focusStage()`.
  3. Also, in reader mode, consider `tabIndex = -1` on the frame unless hands-on is on, plus a visible "Try the demo" toggle in the pill (`components/chrome/ReaderControls.tsx`, `aria-pressed`, bound to `toggle-hands-on`). Keyboard users then get an explicit way in and out.
  4. Wake the pill when the frame forwards any key. `dispatchKey` already calls `wake()`, so forwarding Tab covers this.
  5. Add a check to `scripts/axe-frames.mts --presenter` or a walk: Tab 30 times from `/s/d1-used-to` and assert focus reaches `.reader-controls__button`.

### H2. Single-key shortcuts fire anywhere in reader mode
- **WCAG**: 2.1.4 Character Key Shortcuts (A).
- **Pages**: every `/s/<id>` page and `/`.
- **Evidence**: with focus on the stage, a pill button or a link, `s` opened `/speaker` in a new window and `o` opened the demo origin in a new tab. `d` showed the rehearsal overlay, `h` turned on hands-on mode, and `r`, `l`, `f`, `b`, `.`, `t` and `g` are wired the same way (`a11y/kbd2.log` section 4; screenshot `a11y/shortcut-d-rehearsal.png`). Speech-input users who say a word containing these letters trigger them. Nothing can turn them off or remap them, and they don't depend on a particular component having focus. The frame runtime forwards most of them too (`FORWARD_SCRIPTED`, `FORWARD_SCRIPTED_ONLY`).
- **Fix**:
  - `components/stage/Stage.tsx` `perform`: in `mode === "reader"`, drop the presenter-only actions entirely: `open-speaker`, `toggle-timer`, `toggle-blank`, `toggle-rehearsal`, `goto`. They do nothing useful for the public.
  - In the `onKey` handler, accept the remaining letter keys (`h`, `r`, `l`, `o`, `f`, `?`) only when `e.target` is the stage canvas (`#stage`) or `document.body`. That meets the "active only on focus" option. Alternatively, add a "Single-key shortcuts" switch to `components/chrome/KeyboardHelp.tsx`, stored in `localStorage`.
  - `lib/keys.ts`: split `actionForKey` into a deck map and a presenter map, keyed by mode.
  - `components/chrome/KeyboardHelp.tsx`: list only the keys that work in the current mode. This also covers L7.

### H3. Code file tabs can't be reached by keyboard
- **WCAG**: 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A).
- **Pages**: every walk page with more than one file (for example `/s/d1-used-to`: `index.html`, `styles.css`, `menu.js`, `modal.js`; `/s/d2-now`; `/s/f2-now`; `/s/d4-used-to`).
- **Evidence**: only the selected tab has `tabIndex=0`. The rest are `-1` (`a11y/kbd3.log`: `index.html:-1`, `card.css:-1`, `app.js:0`). The ARIA tabs pattern expects arrow keys to move between tabs, but ArrowRight on a focused tab moves the deck instead (`/s/d2-now` became `/s/d2-now?step=1`, `a11y/kbd3.log`). The tabs also have no `aria-controls`, and the `<pre>` has no `role="tabpanel"`. A keyboard user can only ever read the file the current step selects.
- **Fix** (`components/page/PageCodePanel.tsx`): implement the APG tabs pattern. Handle ArrowLeft, ArrowRight, Home and End on the `tablist` with `e.stopPropagation()`, give each tab an `id` and `aria-controls`, and give the `<pre>` `role="tabpanel"` and `aria-labelledby`. In `components/stage/Stage.tsx` `onKey` (or a new `isInteractiveTarget` in `lib/keys.ts`), return early when `e.target.closest('[role="tablist"]')`. A simpler option is to drop `role="tab"` and make every file button tabbable with `aria-pressed`.

### H4. Text can't be resized, and it renders at 4 to 5 px on phones
- **WCAG**: 1.4.4 Resize Text (AA). 1.4.10 Reflow (AA) only partly applies, because slides can claim the "presentations" two-dimensional exception, but the talk's text itself doesn't need two dimensions.
- **Pages**: every reader page. Most public visitors will arrive here from a shared link on a phone.
- **Evidence** (`zoom.mjs`): the stage scales the 1920 by 1080 canvas to fit the viewport, so browser zoom cancels itself out. 1280x720 at 100% and at 200% zoom (640x360 CSS px at DPR 2) produce the same physical text size: body 16 device px either way. Only the pill grows (`a11y/zoom-1280x720-d1-used-to.png` against `a11y/zoom-zoom200-1280x720-d1-used-to.png`). Effective CSS sizes at 390x844 (scale 0.203): code and body 4.9 px, footer 4.1 px, a walk-page h1 13 px. At 320x568: 4 px and 3.3 px (`a11y/zoom-390x844-d1-used-to.png`, `a11y/zoom-320x568-d1-used-to.png`). On a phone the slide fills 219 of 844 px of height, with black above and below. Pinch zoom still works because the viewport meta allows scaling, which is the only reason this isn't a total block.
- **Fix**:
  - Add a reading view for `/s/<id>`: the slide's title, body, cards, quotes, people list, step labels and code as normal reflowing HTML at real sizes. Show it automatically when `--stage-scale < 0.5` or when `(max-width: 900px)` matches, and let anyone switch it on with a "Text view" toggle in the pill. Where the stage can't stay legible it gives way to the reading view, without letting the stage reflow.
  - Files: new `components/page/ReadingView.tsx` (fed from `slide.glass`, `slide.page` and `lib/content`), `components/stage/SlidePage.tsx` (render both, CSS picks one), `styles/components/stage.css` (media query), `components/chrome/ReaderControls.tsx` (toggle).
  - A smaller interim step: honour zoom by capping the scale at `devicePixelRatio`-aware sizes and letting `.stage` scroll when zoomed. The reading view is the real fix.

---

## Medium

### M1. The deck takes over Space, Backspace, Home and End on focused buttons, and keys act behind the help dialog
- **WCAG**: 2.1.1 Keyboard (A); 3.2.2 On Input (A) applies in spirit.
- **Pages**: every reader page.
- **Evidence** (`a11y/kbd2.log` section 2):
  - Space on a focused **Previous** button moved **forward** (`/s/three-reactions` to `/s/two-perspectives`).
  - Space on **Keyboard help** advanced the deck instead of opening the help.
  - With the help dialog open, Space on its **Close** button advances the deck, and ArrowRight moved the deck underneath the modal (the stage remounted, the dialog closed, and focus fell to `<body>`).
  - Enter still works on every button. The drawer is fine because it blocks keys deliberately.
- **Cause**: `Stage.tsx` `onKey` runs on `window` for every target that isn't editable and calls `preventDefault()`.
- **Fix** (`components/stage/Stage.tsx`, `lib/keys.ts`): add `isInteractiveTarget(target)`, true for `button`, `a[href]`, `[role=tab]`, `summary`, `pre[tabindex]`, and anything inside an open `dialog`. For Space and Enter on those targets, return without acting. Inside an open `dialog.keyboard-help`, ignore everything except Escape, the same way `isNavOpen()` already works.

### M2. Focus drops to `<body>` on every slide change
- **WCAG**: 2.4.3 Focus Order (A).
- **Pages**: every reader page.
- **Evidence**: Enter on the pill's **Next** went to the next slide with `document.activeElement === body` (`a11y/kbd3.log`, line 1). The next Tab starts again from the slide's first link. Arrow keys still work because they're bound to `window`. A keyboard user stepping through 50 slides with the Next button has to Tab back to it after every press, and screen readers lose their place. The cause is that `ReaderControls` is rendered inside the `Stage` that `SlidePage` keys by `slide.id`, so the button that had focus is destroyed.
- **Fix**: render `ReaderControls`, `KeyboardHelp` and the announcer outside the keyed `Stage`, for example in a new `app/s/layout.tsx` or a persistent client wrapper fed through context, so they survive navigation. If that isn't possible, record the focused pill button's label before `router.push` in `Stage.go()` and refocus the matching button in the new stage's mount effect, the same pattern as the existing `focusOnArrival`. Files: `components/stage/Stage.tsx`, `components/stage/SlidePage.tsx`, `components/chrome/ReaderControls.tsx`.

### M3. Step changes are never announced; slide changes are announced twice from a live region that isn't stable
- **WCAG**: 4.1.3 Status Messages (AA), 1.3.1 Info and Relationships (A).
- **Pages**: every reader page (slide changes) and the 25 frame pages (steps).
- **Evidence** (`a11y/kbd2.log` section 5):
  - Next.js's own `#__next-route-announcer__` (`role="alert"`, assertive) already announces "Two perspectives · 2026 advances in the web". The deck's `.stage__announcer` (polite) then says "Two perspectives". That's two announcements per slide.
  - `.stage__announcer` is a **new node** after each navigation (`same announcer node: false`). A live region created and filled 150 ms later is announced unreliably in NVDA and JAWS.
  - A step change on `/s/d1-used-to` (`?step=1`) produced **no live-region mutation at all**. "Step 1 of 4" is `aria-hidden` (`PageBody.tsx`, per demo-glass-spec 186: "the speaker window already announces steps"), but reader mode has no speaker window. A screen reader user pressing Next on a demo page hears nothing while the frame and the code change.
- **Fix**: keep one persistent polite announcer outside the keyed stage (M2). Stop writing the slide title into it, and let Next's announcer handle route changes. On a step change, announce `Step ${n} of ${count}: ${step.label}`. The labels already exist in `steps` (`Stage.tsx` props). Add the highlighted file and lines when there are any (M6). Files: `components/stage/Stage.tsx` (the effect around "Announce the page title"), `components/page/PageBody.tsx`.

### M4. The reader pill's focus ring is 2.45:1
- **WCAG**: 1.4.11 Non-text Contrast (AA), applied to the focus indicator (2.4.7 is met, but the indicator is weak).
- **Pages**: every reader page.
- **Evidence**: the pill buttons use the global ring, 2 px `#0C62FB` at a 2 px offset. Sampled pixels on `/s/the-mandate` (light): ring L 0.158, pill interior L 0.035, so **2.45:1**; against the slide outside, 2.56:1. On `/s/closing` (dark): 3.2:1 against the pill and 2.8:1 outside (`scripts/ring.mjs`; crops `a11y/crop-pill-focus-sections-dark.png`, `a11y/crop-pill-focus-prev-light.png`, `a11y/crop-pill-focus-sections-closing-dark.png`). The design spec already says Slalom Blue fails on navy (demo-glass-spec 4.5) and uses cyan for slide links, but the pill never picked that up.
- **Fix** (`styles/components/reader-controls.css`): `.reader-controls__button:focus-visible { outline: 2px solid var(--glass-dark-focus); outline-offset: -2px; }`. The ring then sits inside the always-navy pill (cyan on navy is above 10:1) and doesn't spill onto the slide or the next button. Under `forced-colors`, use `Highlight`.

### M5. Dimmed code lines are 2.5 to 2.9:1
- **WCAG**: 1.4.3 Contrast (Minimum) (AA).
- **Pages**: every walk page on a step that highlights lines or is "off": `d1-now?step=last`, `d2-now?step=2`, `m1-now?step=last`, `m3-now?step=last` and others.
- **Evidence**: rendered-pixel sampling at 1920x1080 (`a11y/contrast-1920-laststeps.json`) found 243 of 342 text items below 4.5:1 and 75 below 3:1. Values are 2.54 to 2.9:1, for example `m1-now` comment "/* The arrow turns to face it…" at 2.56. The code is 24 canvas px regular weight. That only counts as large text at full 1920 scale, and it's 16 px at 1280x720, so 4.5:1 applies. The cause is `.code--page[data-has-highlight="true"] .code__line[data-highlighted="false"] { opacity: var(--chrome-code-dim-opacity) }` and the same rule for `[data-off="true"]` in `styles/components/page.css` (around lines 292 to 297). WCAG has no exemption for de-emphasized text. At step 0, with no highlight, all text passes. Of 2,466 items, the lowest p10 is 5.45:1 (`a11y/contrast-1920.json`).
- **Fix**: raise `--chrome-code-dim-opacity` to the value that keeps the lightest token colour at 4.5:1 over the code card (about 0.75 to 0.8). Let the highlight band (background plus the 4 px bar) carry the emphasis instead of heavy dimming. Add the dimmed state to `scripts/contrast-test.mts`, which today checks code at full opacity against 7:1.

### M6. Highlighted code lines aren't exposed to screen readers
- **WCAG**: 1.3.1 Info and Relationships (A). Visually, 1.4.1 is fine: the 4 px bar is a shape cue, not only colour.
- **Pages**: every walk page.
- **Evidence**: highlighted lines carry only `data-highlighted="true"` and CSS (`a11y/kbd3.log`). Nothing in the accessibility tree says which lines the step is about, and the "Off" chip on a file tab is the only text signal. On `d1-now?step=last` the whole file is dimmed with no text equivalent.
- **Fix** (`components/page/PageCodePanel.tsx`): wrap highlighted lines in `<mark>`, with a visually hidden "Highlighted:" at the start of the run and "End highlight" at the end, or set `aria-describedby` on the `<pre>` pointing to a visually hidden line such as "Lines 12 to 16 of app.js are highlighted." Put the same sentence in the M3 step announcement. For `code.off`, add a visually hidden "(turned off in this step)" after the file name.

---

## Low

### L1. The closing slide has no h1
- **WCAG**: 1.3.1 (A) / 2.4.6 Headings and Labels (AA), best practice.
- **Page**: `/s/closing` (the h1 count is 0 in `a11y/axe-all.json`; Chrome's tree has no heading, `scripts/ax.mjs`). Every other page has exactly one h1, and Chrome's computed names are correct, for example "2026 advances in the web" with the space between the line spans.
- **Fix** (`components/layouts/glass/GlassClosing.tsx`): make `.sg-closing__name` an `h1`, or add `<h1 class="visually-hidden">{slide.title}</h1>`.

### L2. Focus rings on slide links shrink with the stage
- **WCAG**: 2.4.7 Focus Visible (AA), 1.4.11 (AA).
- **Pages**: links on the cover, glass footers, closing slide and people slide.
- **Evidence**: the 3 px cyan or blue ring sits inside the scaled canvas: 2 px at 1280x720, 1.1 px at 844x390, 0.6 px at 390x844 (scales from `zoom.mjs`). It's fine at desktop sizes (`a11y/crop-footer-link-focus-dark.png`), and only a hardware-keyboard tablet or phone user would see the thin version.
- **Fix** (`styles/components/slides-glass.css`, around lines 215 to 242): `outline-width: calc(3px / var(--stage-scale)); outline-offset: calc(4px / var(--stage-scale));`. The same applies to `.code__pre:focus-visible` in `styles/components/code.css`.

### L3. The footer slide number has no label
- **WCAG**: 1.3.1 (A).
- **Pages**: every glass slide with a footer (for example `/s/what-changed`).
- **Evidence**: screen readers read the footer as "FITC Web Unleashed 2026, Bermon Painter, Slalom 48", a bare number.
- **Fix** (`components/layouts/glass/GlassSlide.tsx` `Footer`): `<span className="visually-hidden">, slide </span>` before `.sg-pill__num`.

### L4. Speaker window semantics
- **WCAG**: 1.3.1 (A), 2.4.2 Page Titled (A), 3.2.5 (AAA, advisory only) for new-tab links.
- **Pages**: `/speaker`.
- **Evidence**:
  - axe `landmark-one-main` and `landmark-unique` (two `region "Code"`) (`a11y/axe-all.json`).
  - Two h1s: the current and next previews.
  - The next-slide preview is neither `inert` nor `aria-hidden`, so a screen reader reads both slides' content.
  - The source links in the notes open new tabs without saying so.
  - The title stays "Speaker · 2026 advances in the web" on every slide (`scripts/ax.mjs`).
  - This window has a single user, which is why it's Low.
- **Fix** (`components/presenter/SpeakerView.tsx`): wrap the speaker layout in `<main>`, mark the next preview `inert`, and label the code regions "Current slide code" and "Next slide code". Add the visually hidden ", opens in a new tab" to the notes links (reuse `NewTabLink`). Set `document.title` to `Speaker · ${slideTitle} (${n}/50)` on change.

### L5. The terminal frame's scroll region can't take focus on its last step
- **WCAG**: 2.1.1 (A).
- **Page**: `/s/f3-now?step=last`, frame `07-package-workflow/terminal/session`.
- **Evidence**: axe inside the frame reports `scrollable-region-focusable` on `.term__scroll` at the last step. The first step is clean, and so are d1-used-to, d1-now, d6-now and m1-now at both their first and last steps (`scripts/ax.mjs` output). `pnpm axe` only scans the first step.
- **Fix**: give `.term__scroll` `tabindex="0"`, `role="region"` and `aria-label="Terminal output"` in `demos/07-package-workflow/terminal/session`. Extend `scripts/axe-frames.mts` to replay to the last step before scanning.

### L6. The pill covers content in mobile landscape
- **WCAG**: related to 1.4.10 Reflow (AA). It obscures content, not focus.
- **Evidence**: at 844x390 the 42 px pill sits over the bottom of the demo frame and the last code line (`<script …>`) (`a11y/zoom-844x390-d1-used-to.png`). At 1280x720 it overlaps the canvas but only covers the gap between cards.
- **Fix** (`styles/components/stage.css`, `components/stage/Stage.tsx` scale): when `(max-height: 500px)`, measure the wrapper with a bottom inset equal to the pill's height plus 8 px, so the canvas sits above it.

### L7. The help lists presenter-only keys; `/present` and `/speaker` titles don't change
- **WCAG**: 3.3.2 Labels or Instructions (A), advisory; 2.4.2 (A), advisory.
- **Evidence**: in reader mode the help lists "Blank the audience window", "Start or pause the talk timer", "Open or focus the speaker window" and "Speaker view: go to a slide number" (`a11y/help-open.png`). It doesn't explain how to get out of a demo frame. `/present` keeps the title "Audience · …" whatever the slide (`a11y/axe-all.json`).
- **Fix**: `lib/keys.ts` `KEY_HELP` gets a `modes` field, and `components/chrome/KeyboardHelp.tsx` filters on it. Add a "Tab: move past the demo" line once H1 lands. Updating the audience title is optional, since it's a projector window.

---

## What passed (no action)

- **axe**: 0 violations on `/` and all 50 `/s/<id>` pages, with the drawer and the help both open and closed. Frames: 0 violations at the first and last step of d1-used-to, d1-now, d6-now and m1-now, and at the first step of f3-now.
- **Language and metadata**: `lang="en-CA"`. Every `/s/<id>` title is unique and specific ("Dialog element: What we used to do · 2026 advances in the web"), and every page has a meta description. The viewport meta allows pinch zoom.
- **Structure**: one h1 per page except `/s/closing`. Landmarks: `main` (the slide), `nav "Deck controls"`, a named `region` or `article` per slide, `region "Code"`. A skip link isn't needed because there are only 0 to 3 links before the pill, once H1 is fixed.
- **Drawer**: opens on Enter with focus on the first link. Tab and Shift+Tab wrap. Escape returns focus to the Sections button. A jump moves to the slide and focuses the stage, and the title updates (`a11y/kbd2.log` section 3, `a11y/drawer-open.png`). `aria-current` marks the current link, and the number reads as ", slide 8". It works well on mobile (`a11y/zoom-390x844-drawer.png`).
- **Keyboard help dialog**: focus starts on Close, and Escape or Close returns focus to the trigger (`a11y/kbd3.log`).
- **Images**: intro stills have one-sentence alts. Caricatures on `three-reactions` are described. People photos are `alt=""` inside `aria-hidden` with the names in text. Support logos are `alt=""` with "Chrome, from version 37" in text. The offline poster alt is "Captured still of the live demo: …", and the QR alt names the URL. Iframe titles read "Live demo: <page title>", and the warming frame is `inert`, `aria-hidden` and `tabindex=-1`.
- **New-tab links**: all slide links end with a visually hidden ", opens in a new tab".
- **Text contrast at rest**: 2,466 text items over all 50 slides at 1920x1080, measured from rendered pixels with the backgrounds and glass, all pass. The lowest are the footer pill on `what-changed` (5.45:1) and the pill counter at opacity 0.75 (5.68:1 minimum). "Still in motion" chip: 3.8:1 (large, passes). In-frame focus is clearly visible (`a11y/crop-frame-focus-d1-used-to.png`).
- **Motion**: under `prefers-reduced-motion: reduce` there are no running animations in the page or the frames after load (scroll-driven demo m4-now: 5 without reduce, 0 with it). The crossfade is turned off in `stage-transition.css`, and code scrolling uses `behavior: auto`. Nothing auto-advances, no media autoplays, and steps only play on a press (`motion.mjs`).
- **Target size**: pill buttons are 36x36. Slide links smaller than 24 px at small scales still pass 2.5.8 through the spacing exception: the nearest targets are more than 24 px apart even at 390 px.

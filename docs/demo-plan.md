# Demo delivery plan

Working plan for finishing the demo portion of the presenter app: one developer, one presenter.
Grounded in the code as of 2026-10-27 and the Playwright audit of the same day. File paths are
relative to the repo root. Sizes: S under half a day, M about a day, L two days or more.

## 1. Goal and the three-beat flow

Goal: every demo slide can be presented end to end with nothing but the forward and back keys
(or the clicker, or the speaker window's Previous and Next buttons), with the audience window
animating each interaction, the code panel driving a spotlight in the live view, and the speaker
window telling the presenter what the next press will do.

The three beats, in the app's terms. One `demo-split` slide, one `Demo`, one ordered `steps[]`
list; the presenter only ever presses advance (`ArrowRight`, `PageDown`, `Space`) and retreat.

| Beat | Steps carry | Audience window shows | Code panel shows | Presenter presses |
|---|---|---|---|---|
| 1. Today, with a pile of JS | `phase: "before"`, `liveState` | The legacy frame (`/demos/[id]/legacy`): the same product card, driven by the old script; each step plays one interaction | The legacy files (`legacy/app.js` and friends), dimmed or highlighted per step, so the volume of JS is visible | advance, one press per interaction |
| 2. Now, native | `phase: "after"`, `liveState` | The native frame (`/demos/[id]`): each step plays the same interaction with the new HTML and CSS | The native files, no highlight yet (`highlight: []` keeps the panel quiet) | advance, one press per interaction |
| 3. Break down the code | `phase: "code"`, `highlight`, `target`, usually `liveState` | The native frame with the targeted element spotlit; if the highlighted code triggers an interaction, the state replays it | The highlighted lines of HTML, then CSS, then JS | advance, one press per highlighted range |

Beats 1 and 2 run in the slide's `demoView` (default `split`); the presenter can press `1` for
live only. Beat 3 is where `split`, `half` or `code` matters. Retreat walks the same beats
backwards and the demo state follows, because every step has an effective state (section 3, E1).

## 2. Requirement traceability

| Expectation | Current state | Evidence | Closed by |
|---|---|---|---|
| E-1 No keyboard: interactions animate as slides advance | Partial: 1 of 17 demos | Only `anchor-positioning/demo.ts` declares `liveState` on every step (5 of 5). The other 16 declare `action` text only ("Click the ••• button", "Press Esc", "Type three lines"). `DemoFrame.tsx` line 79 returns early when a step has no `liveState`, so nothing is posted | E1, E9 (all conversions) |
| E-2 Prev and next advance the demo to the next interaction | Partial | `Stage.tsx` lines 228 to 235: advance is steps first, then slide; retreat mirrors it. Going back re-posts the earlier state on `anchor-positioning` (audit). But a step without `liveState` leaves the demo where the previous step left it; `DemoSplitBody.tsx` line 41 passes `step?.liveState` with no fallback, and `DemoGridBody.tsx` line 29 passes state only for the enlarged cell | E1 (effective state), E4, E9 |
| E-3 Highlighted code spotlights the element; code that triggers an interaction triggers it | Missing | `CodeStep` (`content/schema.ts` lines 38 to 45) has no target field; `lib/demo-bridge.js` handles only `demo:setState`, `demo:ping`, `demo:reduceMotion`; `lib/compose/index.ts` injects no spotlight style | E2 (spotlight), E4 (stage posts it), E9 (targets per step) |
| E-4 Two windows, one on the projector, one with notes, in sync | Works, with two gaps | Audit: slide, step, view, cell, blank and timer sync both ways over `BroadcastChannel`; URLs mirror `?s=&step=`. Gap A: a window opened with `?s=` is pulled to the other window's slide (the `hello` reply in `lib/presenter/context.tsx` lines 105 to 108 settles state before the 300 ms URL fallback at lines 117 to 126 runs). Gap B: `SpeakerView.tsx` shows the current step's caption (line 132) and `action` (line 169) but not the next step or the phase | E8 (sync), E5 (speaker view) |
| Beat 1 "before" | Missing | No legacy variant exists under any `content/demos/[id]/`; `composeDemo` builds one document per demo; no phase field on `CodeStep` | E3 |
| Repeatable authoring and validation | Partial | `scripts/check-demos.mts` checks highlight ranges and the 56 column limit only; no `pnpm validate` (owed by the PRD, `package.json` scripts stop at `typecheck`); Playwright is not a dev dependency | E6, E7 |

## 3. Epics and stories

### E1 Schema and effective state

Touches: `content/schema.ts`, `lib/steps.ts`, `components/demo/DemoSplitBody.tsx`,
`components/demo/DemoGridBody.tsx`, `components/demo/DemoFrame.tsx`, `scripts/check-demos.mts`,
`docs/demo-contract.md`.

- E1.1 (S) Extend `CodeStep` with `phase?: "before" | "after" | "code"` and `target?: string`. Keep
  both after `caption` in every `demo.ts` so the step regex in `check-demos.mts` (which matches
  `id`, optional `file`, `highlight`, `caption` in that order) keeps working, or rewrite that regex
  in the same change. Add `Demo.legacy?: { code: CodeFile[] }`.
  Given a `demo.ts` with the new fields, when `pnpm typecheck` runs, then it passes and
  `npx tsx scripts/check-demos.mts <id>` still lists every step.
- E1.2 (S) Add `resolveLive(demo, stepIndex)` to `lib/steps.ts` returning `{ state, phase, target }`
  where `state` is the nearest declared `liveState` at or before the step (undefined if none),
  `phase` defaults to `"code"` when the step has a highlight and `"after"` otherwise, and `target`
  is the step's own `target` or null.
  Given steps s1 `liveState: "open"`, s2 no `liveState`, s3 `liveState: "saved"`, when resolving s2,
  then `state` is `"open"`; when resolving s3 then s2 (retreat), then `state` is `"saved"` then
  `"open"`.
- E1.3 (S) `DemoSplitBody` and `DemoGridBody` pass the resolved state, phase and target to
  `DemoFrame` instead of `step?.liveState`. `DemoFrame` posts `demo:setState` on every step change
  (keyed on `stepId`, not only on a changed state) so a demo the presenter clicked by hand is
  re-asserted, and again on `demo:ready`.
  Given a demo at step 2 whose state equals step 1's, when the presenter advances from 1 to 2, then
  the frame still receives `demo:setState` with `stepId: "s2"` and echoes `demo:state`.
- E1.4 (S) Demo state listeners must be idempotent: setting the same state twice is a no-op, and
  setting a state while a transition is mid-flight does not throw (the presenter will double-press).
  Document this in `docs/demo-contract.md` under "Hooks the stage uses".

### E2 Bridge spotlight

Touches: `lib/demo-bridge.js`, `lib/compose/index.ts`, `components/demo/DemoFrame.tsx`,
`docs/demo-contract.md`.

- E2.1 (S) Bridge message `demo:highlight { selector: string | null }`: set `data-spotlight` on
  every element matching `selector`, remove it from every other element, echo
  `demo:spotlight { count }` so the walk can assert. Invalid selectors are caught and reported as `demo:error` with
  the selector in the message.
  Given `selector: ".more"`, when posted, then exactly one element carries `data-spotlight` and the
  echo says `count: 1`; given `null`, then no element carries it.
- E2.2 (S) Composer injects `<style data-file="spotlight">` after the bridge script:
  `[data-spotlight]` gets `outline: 3px solid #0C62FB; outline-offset: 4px` plus a one-shot 240 ms
  `scale` and `opacity` pulse, `@media (prefers-reduced-motion: reduce)` keeps the outline and drops
  the pulse, nothing animates layout. `html[data-reduced-motion="true"]` is honoured the same way
  because the parent already posts `demo:reduceMotion`.
  Given a spotlit button inside an open popover, when inspected, then the outline is visible in the
  top layer (outline is painted on the element, not the backdrop).
- E2.3 (S) `DemoFrame` posts `demo:highlight` when the resolved target changes and `null` on
  unmount; it is posted after `demo:setState` so the target can be something the state reveals.

### E3 Phases and legacy frames

Touches: `lib/compose/index.ts`, new `app/demos/[id]/legacy/route.ts`, `lib/demo-files.ts`,
`components/layouts/DemoSplitSlide.tsx`, `components/demo/DemoSplitBody.tsx`,
`components/demo/DemoFrame.tsx`, `components/demo/CodePanel.tsx`,
`styles/components/demo-split.css`, `lib/stage-context.tsx`, `content/demos/[id]/legacy/*`.

- E3.1 (M) `composeDemo(demo, page, { legacy: true })` composes `demo.legacy.code` with the same
  bridge, CSP and spotlight style, `data-demo-id="[id]"` and `data-variant="legacy"`. New static
  route `app/demos/[id]/legacy/route.ts` (a literal segment, so it wins over `[page]`);
  `generateStaticParams` lists only demos with `legacy`. Legacy sources live in
  `content/demos/[id]/legacy/` and are listed as
  `demoCode(id, [{ file: "legacy/index.html", ... }])`.
  Given `popover-commands` has a legacy folder, when `/demos/popover-commands/legacy` is fetched,
  then it is a full document with the bridge and answers `demo:ping`.
- E3.2 (M) `DemoSplitBody` mounts two `DemoFrame`s when `demo.legacy` exists, both loaded eagerly,
  and sets `data-phase` on `.demo-split`; CSS stacks them and shows one with `visibility` and
  `opacity` (no `display: none`, no remount, so there is no reload flicker). Demo health is keyed
  `${id}:legacy` for the second frame so a broken legacy frame does not mask the native one. Reload
  (`r`) and fallback (`x`) apply to the visible frame.
  Given a slide at a `before` step, when the presenter advances into the first `after` step, then
  the native frame is visible within one animation frame and the network panel shows no new document
  load.
- E3.3 (S) `DemoSplitSlide` renders `demo.legacy.code` through `renderCodeFiles` too; `CodePanel`
  receives both file sets and shows the legacy set during `before` steps, with its own tabs.
  `resolveStep` resolves `file` against the legacy set when the step's phase is `before`.
  Given a `before` step pointing at `legacy/app.js` lines 1 to 40, when shown, then the panel's tab
  list is the legacy files and lines 1 to 40 are highlighted.
- E3.4 (S) Grid cells and terminal slides ignore `legacy` (no second frame); `check-demos.mts` and
  the validator warn if a grid or terminal demo declares one.

### E4 Stage and code panel

Touches: `components/stage/Stage.tsx`, `components/stage/SlidePage.tsx`,
`components/demo/DemoFrame.tsx`, `components/demo/CodePanel.tsx`, `styles/components/code.css`.

- E4.1 (S) Spotlight is posted only when `view` is `split`, `half` or `code`; `live` posts `null`.
  Changing view re-posts accordingly. (If decision D3 goes the other way, drop the view check.)
- E4.2 (S) Leaving a slide clears spotlight and posts nothing else; entering a slide (including
  arriving on its last step via retreat, `go(prevId, "last")`) posts the effective state of the
  landing step on `demo:ready`. Already true for declared states through `DemoFrame.tsx` line 55;
  this story makes it true for effective states and adds a test.
- E4.3 (S) `stepSets` passed from `SlidePage` carries `{ caption, phase }` so the stage announcer
  and the speaker view can say the phase without importing demo code.
- E4.4 (S) Code panel shows a small phase chip ("Today" for `before`, "Native" otherwise) next to
  the step counter; captions stay the single source of narrative.

### E5 Speaker view

Touches: `components/presenter/SpeakerView.tsx`, `styles/components/speaker.css`.

- E5.1 (S) Status bar shows phase and effective state: "Step 3 of 7 · Native · state: open".
- E5.2 (S) A "Next press" line under the action: the next step's caption and action when one exists,
  else "Next slide: <title>". Uses the same steps array the view already reads at lines 96 to 99.
- E5.3 (S) Health chips list the legacy frame as `[id]:legacy` when it exists. The preview stays the
  placeholder (`DemoFrame.tsx` lines 104 to 115); decision D4 can revisit.

### E6 Validator and Playwright walk

Touches: new `scripts/validate.mts`, new `scripts/walk-demos.mts`, `package.json`,
`scripts/check-demos.mts`, new `playwright.config.ts`.

- E6.1 (M) `scripts/validate.mts` wired to `pnpm validate`. Checks, per demo with non-bash code:
  every step has an effective state (first step must declare one); every `liveState` value appears
  in `Demo.liveStates` and every `liveStates` entry is used by a step; every `target` is a
  syntactically valid selector and its id or class tokens appear in the demo's html (or legacy html
  for `before` steps); highlights are in range; no line over 56 columns; `before` steps only on
  demos with `legacy`; files named by steps exist in the right set. Terminal demos (bash only) are
  exempt from state checks. Exit 1 on any problem with a one-line reason each.
  Note: `demo.ts` reaches `server-only` through `lib/demo-files.ts`. Run as
  `npx tsx --conditions=react-server scripts/validate.mts` (the package exports an empty module
  under that condition), or keep the regex approach of `check-demos.mts`. Decide during E6.1;
  the flag is the cleaner path.
- E6.2 (M) Add `@playwright/test` as a dev dependency, Chromium only. `scripts/walk-demos.mts`:
  start or reuse `pnpm dev`, open `/present?s=<slide>` for each demo slide, install an init script
  that records every `demo:*` message on `window.__demoLog`, then for each step press `ArrowRight`
  and assert: the frame echoed `demo:state` equal to the effective state; `demo:spotlight.count`
  equals 1 when the step has a target (0 in live view); the target's bounding box is non-null
  (visible); no `demo:error`. Then press `ArrowLeft` back to step 0 and assert the states replay in
  reverse. Grid slides: press `1` to `4`, walk, press `0`.
  Given all 15 frame demos pass, when `pnpm walk` runs, then it exits 0 in under three minutes.
- E6.3 (S) `pnpm validate` runs `typecheck`, `lint`, `validate.mts`; `pnpm walk` runs the Playwright
  walk. Document both in `README.md` and the contract.

### E7 Authoring template

Touches: `docs/demo-contract.md`, new `docs/demo-template.md`, new `content/demos/_template/`.

- E7.1 (S) `content/demos/_template/` with `index.html`, `styles.css`, `app.js` (a `demostate`
  listener skeleton with a `switch` on `e.detail.state`), `legacy/` with the same three files, and
  `demo.ts` with a commented steps table. Excluded from `allDemos()` by not being imported from any
  slide and skipped by the scripts (leading underscore).
- E7.2 (S) `docs/demo-template.md`: the steps table (phase, file, lines, caption, action, liveState,
  target), the state naming rule (kebab, past-tense result such as `open`, `saved`, `typed`), the
  "hover is never required" rule, and the checklist in section 8 of this plan.

### E8 Sync edge case

Touches: `lib/presenter/context.tsx`.

- E8.1 (S) When the window's URL has `?s=`, the first accepted peer state is compared with the URL;
  if the slide differs, the window calls `update({ slideId, stepIndex })` once (its `seq` is peer
  seq plus one, so both windows converge on the URL's slide). Without `?s=`, today's resume
  behaviour stays.
  Given the speaker window is on slide 12 and a new audience window opens at
  `/present?s=popover-commands`, when it settles, then both windows show slide 10; given a refresh
  of `/present` with no query, then it resumes slide 12.

### E9 Demo conversions

Each story: declare `liveState` on every step, fill `Demo.liveStates`, add `target` to every `code`
step, add a `demostate` listener where CSS cannot do the job, add a `legacy/` variant if D2 says so,
re-run `check-demos`, `validate` and `walk`. Touches `content/demos/[id]/*` only unless noted. Sizes
assume the native variant; add M for a legacy variant.

Baseline, slides 10 to 17

- E9.1 (M, pilot) `popover-commands` (5 steps). States: `closed`, `open`, `dismissed` (closed, focus
  back on `.more` with a forced `data-focus` class because programmatic focus does not always paint
  `:focus-visible`), `open`, `saved`. Listener in `app.js` calls `showPopover()`, `hidePopover()`,
  `focus()`, toggles `.saved`. Targets: `.more`, `#menu`, `#menu` (CSS step), `[command="--save"]`,
  `#card`. Legacy: a menu with click-outside, keydown Esc, focus return and manual positioning in
  about 60 lines of JS.
- E9.2 (S) `anchor-positioning` (5 steps, already state-driven). Add targets (`.ship`, `.tip`,
  `.tip`, `.tip`, `.ship`) and a state `edge` for s3 that scrolls the document via a four-line
  `app.js` listener (`window.scrollTo`), replacing "Scroll a little". Legacy:
  `getBoundingClientRect` plus scroll and resize listeners plus flip logic.
- E9.3 (M) `details-accordion` (4 steps). States: `returns`, `materials`, `materials` (Safari note),
  `found`. Listener sets `details.open`; `name` closes the siblings natively. `found` opens the
  panel and wraps "lugs" in a `<mark>` that only shows in that state, since find-in-page cannot be
  triggered from script; the caption says so.
- E9.4 (M) `field-sizing` (3 steps). States: `typed` (listener types three lines into the textarea
  at 30 ms a character and sets the select to the wide option), `pasted` (sets a long paragraph at
  once), `grip`. New `app.js`; add it to `code`.
- E9.5 (M) `colour-functions` (4 steps, has `app.js`). States: `yellow`, `navy`, `dark`, `sweep` (a
  `requestAnimationFrame` sweep across the hue input dispatching `input` events, 1.5 s, stops on the
  next state). Targets on the picker, the hero and the switch.
- E9.6 (S) `sibling-index` (3 steps, has `app.js`). States: `entered` (re-run the entrance by
  re-appending the grid), `date` (same visual), `more` (the Load more handler, called directly).
- E9.7 (M) `view-transitions` (5 steps, route kind, `app.js`). States: `sorted` (call the sort
  handler), `names`, `detail` (`navigation.navigate("?id=2")` so the intercept runs), `double` (two
  sorts 150 ms apart), `sorted` for the Firefox step. The bridge is already injected for route-kind
  documents by `composeDemo`.
- E9.8 (S) `es2026-console` (4 steps, has `app.js`). States reveal output lines: `line1`, `line2`,
  `all`, `all`. CSS-only on `html[data-state]`.

Two-engine, slides 18 to 20

- E9.9 (M) `scroll-driven` (3 steps). States: `top`, `scrolled`, `end`; new `app.js` listener calls
  `scrollTo({ behavior: "smooth" })` so the scroll-driven animation itself does the work. Targets on
  the progress bar and the images.
- E9.10 (L) `customizable-select` (6 steps). `select.showPicker()` needs user activation, so `open`
  cannot be synthesised. States: `open` (shows a static, honestly labelled replica of the picker
  drawn from the same option markup), `japan` (set `value`, dispatch `change`), `labels`, `open`,
  `submitted` (set the result text), `open`. Flag this as the one demo where the presenter may want
  one real click; the speaker view action says so.
- E9.11 (M) `cross-document-transitions` (3 steps, route kind, two pages, no script). States: `a`,
  `b`, `b`. A shared `nav.js` listener navigates to `page-b.html` when the state is `b` and the page
  is `a`, and back when the state is `a` and the page is `b`; it does nothing when already on the
  right page, which prevents a navigate loop after `demo:ready` re-posts the state. Keep `nav.js`
  out of the code panel narrative (the caption says "no script for the transition").

Chrome-only lightning round, slide 21 (grid; states apply only to the enlarged cell,
`DemoGridBody.tsx` line 29)

- E9.12 (S) `css-carousel` (2 steps). States: `next2` (`scroller.scrollBy` twice), `dot` (`scrollTo`
  the third item). `::scroll-button` cannot be clicked from script; scrolling the scroller is
  equivalent on screen.
- E9.13 (S) `interest-invokers` (2 steps). Interest cannot be shown from script; states `shown` and
  `shown-keyboard` call `showPopover()` on the hint and set a `data-focus` class on the handle.
- E9.14 (S) `css-if-function` (2 steps). States `size-lg`, `gap-16`; CSS-only
  (`html[data-state="size-lg"] .btn { --size: lg }`).
- E9.15 (S) `corner-shape` (1 step). State `shape-b` toggles `--shape` in CSS.

Terminal, slides 31 and 32 (transcripts, not frames)

- E9.16 (S) `pnpm-cooldown` and `npm-skipped-scripts`: confirm `Terminal.tsx` already replays the
  transcript per step (`targetFor` reveals lines up to the step's range) and that advance and
  retreat drive it in both windows. No `liveState`; the validator exempts bash-only demos. Rehearse
  `l` (hide recording) once.

## 4. Sequencing

| Milestone | Contains | Depends on | Parallel work |
|---|---|---|---|
| M0 Foundations (2 to 3 days) | E1.1 to E1.4, E2.1 to E2.3, E4.1 to E4.3, E8.1, E6.1 skeleton, `git init` | nothing | E8.1 and E6.1 are independent of E1 and E2 |
| M1 Pilot end to end (3 to 4 days) | E9.1 `popover-commands` with legacy, E3.1 to E3.4, E4.4, E5.1 to E5.3, E6.2 walk against the pilot, E7.1 and E7.2 drafted from what the pilot taught | M0 | E5 runs in parallel with E3; E7 starts once E3.3 settles the file layout |
| M2 Baseline conversions (3 to 4 days) | E9.2 to E9.8 (native states and targets first; legacy variants second if D2 says all) | M1 | Conversions are independent of each other; the walk runs per demo |
| M3 Two-engine, grid, terminal (2 to 3 days) | E9.9 to E9.16 | M1 | Same; E9.10 is the long pole, start it early in M3 |
| M4 Hardening (2 days) | Full `pnpm validate` and `pnpm walk` green, manual Safari and Firefox pass, two-window rehearsal, contract and README updates | M2, M3 | none |

Pilot choice: `popover-commands`. It is the biggest demo in the deck per the speaker notes, has
the most interaction kinds (open, dismiss, focus return, custom command), already has `app.js`,
and its legacy variant is the clearest "pile of JS" story. `anchor-positioning` is already
state-driven and is the fast second: it proves targets and the scroll listener without a
rewrite.

Order inside the pilot: E1 and E2 land first so the state and spotlight messages exist, then
the native conversion (E9.1 without legacy) proves E-1 to E-3 on one slide, then E3 adds the
legacy frame, then E5 and E6.2. Do not start M2 until the walk passes on the pilot.

## 5. Decisions needed

- D1 Legacy approach: two documents (`/demos/[id]` and `/demos/[id]/legacy`, two preloaded frames,
  two file sets in the code panel) versus one document with a `data-phase` toggle. Recommended: two
  documents. The toggle is less code but the code panel cannot contrast the legacy script with the
  native markup, which is the point of beat 1, and legacy scripts would have to coexist with native
  behaviour in one page.
- D2 Which demos get a "before" beat: every `demo-split` slide (10 to 20) or only the ones where the
  JS replaced is large (popover, anchor, accordion, view transitions, scroll-driven, customizable
  select). Recommended: all eleven split slides; grid cells and terminal slides never. Cost is about M
  per legacy variant.
- D3 Spotlight in live-only view (`1`): off (recommended, the live view is the "look at the product"
  view) or on with the same style.
- D4 Speaker preview running the demo: keep the placeholder (recommended; the laptop would otherwise
  run a second copy of every frame and the health chips already report the projector's state) or run
  it muted. The E5 status line gives the presenter the state without the frame.

## 6. RAID log

Risks

| Risk | Impact | Mitigation |
|---|---|---|
| R1 Synthetic interactions are not possible for some features: `select.showPicker()` needs user activation, interest invokers have no show method, find-in-page cannot be scripted, hover cannot be forced | Those steps cannot animate without a click | Per-demo substitutes in E9 (static replica, `showPopover()` on the hint, a `<mark>`, a forced state); the speaker view's action names the one place a real click is needed; the walk asserts whatever the substitute produces |
| R2 Top-layer and hidden targets: a spotlit element inside a closed popover or a closed `details` is `display: none`, and `::picker` and `::details-content` cannot be targeted | Spotlight invisible, presenter does not know | Validator warns when a target is inside `[popover]` or `details` and the step's state does not open it; the walk asserts a non-null bounding box; outline is on the element so open popovers work |
| R3 Legacy frames double the loaded documents on a slide and double `demo:ready` and health traffic | Memory and confusion in health chips | Only the current slide is mounted (`Stage` is keyed per slide), so the ceiling is two frames on split slides and four on the grid; health keyed per variant (E3.2) |
| R4 Safari and Firefox unverified for programmatic state changes (`@starting-style` on `showPopover()`, `overlay` exit, view transitions via `navigation.navigate`) | A beat snaps instead of animating on stage | Manual cross-browser pass in M4 with the standalone URLs; `browsers` order on each demo already says which engine to use first |
| R5 Presenter double-presses mid-animation | Two transitions collide, a listener throws, `demo:error` flips health to error | E1.4 idempotent, interruptible listeners; the walk presses at 100 ms intervals once per demo as a stress check |
| R6 Schema change breaks `check-demos.mts` regex (property order) | Silent empty step list | E1.1 keeps new fields after `caption` or rewrites the matcher; the validator parses with the real import |
| R7 The user writes content later and renames states, files or lines | Steps point at stale lines, states dangle | E6.1 catches every case; E7 template and checklist make the rule explicit |
| R8 Cross-document demo loops on `demo:ready` re-post | Frame navigates forever | E9.11 listener compares the current page with the wanted page before navigating |

Assumptions

- A1 Chrome drives the projector; Safari and Firefox are opened standalone from the speaker view's
  Open links for the "switch engine" steps, which stay manual.
- A2 Beats 1 and 2 use the slide's `demoView`; no per-step view override is needed.
- A3 Demos stay small enough that 56 columns and about 70 lines hold for native files; legacy files
  may run longer because their length is the point.
- A4 Playwright Chromium is the automated oracle; the built-in browser pane cannot load the iframes,
  so it is not used for verification.
- A5 One slide is mounted at a time in each window, so frame counts stay at two (split) or four
  (grid).

Issues

- I1 The project is not under git. Initialise it before M0 so each epic can be reverted.
- I2 Playwright is not installed; `pnpm validate` does not exist. Both are first tasks in E6.
- I3 `demo.ts` imports `server-only` through `lib/demo-files.ts`; the validator needs
  `--conditions=react-server` or regex parsing (E6.1).
- I4 Grid cells receive state only when enlarged, so beat 2 on slide 21 needs the presenter to press
  1 to 4; acceptable for a lightning round, noted in the speaker action text.

Dependencies

- Next.js static segment precedence (`legacy/route.ts` over `[page]/route.ts`) for E3.1.
- `@playwright/test` and a Chromium download for E6.2.
- Prettier at `printWidth: 56` for every new and legacy file.
- Decisions D1 and D2 before M1 starts the legacy work; D3 and D4 before E4.1 and E5.3.

## 7. Definition of done and test plan

Done when:

- Every demo step on slides 10 to 21 has an effective state, every `code` step has a target,
  `pnpm validate` and `pnpm walk` exit 0, and `pnpm typecheck` and `pnpm lint` pass.
- Each of the eleven split slides plays its three beats from the speaker window's Next button alone,
  forwards and backwards, with the audience window never needing a click (except the one documented
  click on `customizable-select` if R1 stands).
- The speaker window shows phase, state, action and the next press for every step.
- A window opened with `?s=` lands on that slide while another window is open.
- `docs/demo-contract.md`, `docs/demo-template.md` and `README.md` describe the new fields, messages
  and scripts.
- Manual pass in Safari and Firefox on the standalone URLs recorded in the rehearsal checklist.

Playwright walk asserts (per demo slide, per step, forward then backward): `demo:state` echoed with
the effective state; `demo:spotlight.count` is 1 when a target exists and the view is not live, else
0; the target has a bounding box; no `demo:error`; the code panel's `data-step` matches the step id
and `data-dimmed` is true only for steps without a highlight; on split slides with `legacy`,
`.demo-split[data-phase]` matches the step phase and no document load occurs on the phase change.
Grid: enlarge each cell, walk, restore with `0`.

Manual two-window rehearsal checklist (run once per milestone, once the night before):

1. Open `/speaker`, click Open audience window, drag it to the second display, press `f`.
2. Walk slides 10 to 21 with Next only; watch the projector, not the laptop. Note any step where
   nothing visibly changed.
3. Walk the same range with Previous only; the demo must match what it showed going forward.
4. On slide 10 press `1`, `2`, `3`, `4`; spotlight appears or disappears per D3.
5. Press `r` on a demo mid-step; the frame reloads to the current step's state.
6. Close the audience window, reopen it from the speaker window; it lands on the current slide and
   step.
7. Open `/present?s=anchor-positioning` while the speaker window is on slide 10; both move to slide
   11.
8. Slides 31 and 32: advance through the transcript, press `l`, press `l` again.

Cross-browser pass: for each demo, open the standalone URL in Safari and Firefox, post the states by
hand from the console (`document.documentElement.dataset.state = "open"` then
`document.dispatchEvent(new CustomEvent("demostate", { detail: { state: "open" } }))`),
and note snaps versus animations against the slide's support note.

## 8. Authoring checklist per demo

Follow this when writing or rewriting a demo's content. Start from `content/demos/_template/`.

1. Write the native `index.html`, `styles.css` and `app.js` for the product card; 56 columns,
   Prettier, standard CSS, no fonts, no network. Centre the card for a 520 x 428 viewport.
2. Decide the interactions the audience must see, in order. Give each a state name: kebab case, the
   result not the gesture (`open`, `saved`, `typed`, `scrolled`). List them in `Demo.liveStates`.
3. Make every state reachable without a pointer: CSS on `html[data-state="..."]` where it is visual
   only; a `demostate` listener in `app.js` where a real API is needed (`showPopover`, `open`,
   `focus`, typing, `scrollTo`, `startViewTransition`, navigation). Listeners are idempotent and
   never require hover.
4. If the slide has a "before" beat, write `legacy/index.html`, `legacy/styles.css`, `legacy/app.js`
   for the same card driven by the old script. Same states, same names, so one steps table covers
   both.
5. Fill the steps table in `demo.ts`, one row per press: `phase`, `file`, `highlight` (empty for
   live-only steps), `caption` (one sentence, true to the lines), `action` (what the audience sees,
   or the one click the presenter must make), `liveState` (always set), `target` (a selector in the
   html of that phase, for `code` steps). Keep `phase` and `target` after `caption`.
6. Order the beats: `before` steps, then `after` steps, then `code` steps in HTML, CSS, JS order.
7. Run `npx prettier --write content/demos/<id>` and `npx tsx scripts/check-demos.mts <id>`; read
   the printed lines back against the captions.
8. Run `pnpm validate`, then `pnpm walk -- <slide-id>`; fix anything red.
9. Open `/present?s=<slide-id>` and `/speaker` side by side and press Next through every step, then
   Previous. Confirm the speaker view's next-press line is right at each step.
10. Open `/demos/<id>` (and `/legacy`) in Safari and Firefox and drive the states from the console;
    record snaps in the slide's `support.note` and the demo's `gotcha`.

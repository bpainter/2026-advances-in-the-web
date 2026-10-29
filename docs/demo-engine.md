# Demo engine (schema v4)

How the demo section of the deck works, where its pieces live, and how to build a demo for it.
The specification is `docs/PRD-demos-v4.md`, with the speaker's fixed requirements in
`docs/design/feedback-2026-10-28.md`, the audience and notes guidance in
`docs/design/demo-flow-cx.md` and the visual spec in `docs/design/demo-glass-spec.md`. The
contract between engine and content is `content/demo-schema.ts`. v4 extends the v3 engine; it does
not replace it.

## Pages, not slides

The demo section is fourteen `DemoSection`s (`content/sections/`): six core demos (D1 to D6), the
five Still in motion demos (M1 to M5), then F2 to F4. Every section has three pages except F4,
which has one. M1 to M5 set `group: "still-in-motion"`: their intro slides carry a "Still in
motion" chip (`.intro__group`), and the navigation drawer lists them under that heading. PRD r7
removed the F1 opener; the M1 intro takes over its framing line.

| Stage | Page | What is on it |
|---|---|---|
| `intro` | Intro slide | Feature name, one-sentence description plus the generated support sentence, the browser (or tool) tiles, the "also uses" line, a captured still. No frame, no code, one step. |
| `used-to` | What we used to do | The today build on the left, excerpts of its code on the right (50/50), three steps (HTML, CSS, JavaScript), the meter on the last step. No callouts. |
| `now` | What we can do today | The native build on the left, its shown files on the right, five steps at most with code and behavior together, two proofs at most, cautions on the last step (speaker window only). |
| `single` | One page | F4: one 1792 by 864 slot. |

`content/slides/index.ts` assembles the deck: the native opening (7 slides), the 40 demo pages,
the native closing (3 slides), 50 slides in all. `timing.cumulative` is never typed:
`content/sections/index.ts` computes it from the authored minutes (the section starts at 6.5);
the last page ends at 38.75 and the closing starts after the section buffer at 39.25.

Each step has `actions` (pointer, click, key, focus, type, paste, resize, toggle, navigate,
network, hook, terminal, reveal, wait, assert), `code` (file, lines, `off` for enhancement-off
proofs) on every walk-page step, optional `spotlight`, at most one `callout` on now pages, a
`meter` (used-to: last step; now: the JavaScript step), `bullets`, `key` (the one point to stress
per page), `proof`, `ifKeyboard` and `poster`.

## Layout

On the 1920 by 1080 canvas: eyebrow at y 48 (with the step indicator at the right), title at y 88
(with the meter at the right), body at y 176. Walk pages split the body into two 880 by 864 cards
32 px apart. Frames are authored at 640 by 628 and scaled by 1.375; single pages use 1304 by 628.
A walk page may set `split: "60/40"` (`SPLITS` in `content/demo-schema.ts`, default `"50/50"`):
the frame card is 1056 wide, the code card 704, and the frame is authored at 768 by 628 at the
same scale. 44-column code still fits the 704 card without wrapping. D4 and D5 use it; the
validator checks the viewport against the split, and the walk checks both card widths.
The code card shows 24 px code in a scroller exactly 21 lines tall that scrolls in whole lines
(no line is cut at either edge), file-name tabs, a highlight that leads playback by 400 ms, elision
lines in the comment color and italic (gaps under three lines are shown in full), and an 18 px
"Off" chip on enhancement-off steps. Spotlights follow the target's radius, merge when within 12
frame px, and only fade; the cursor tip lands off a button's label; the last keycap of a step stays
up until the next step. A frame a hook narrows shows the frame background and a dashed edge.
Single pages put their title on the walk pages' baseline and may carry a support badge
(`badge`).

## Frames and the theme

Frames run on the demo origin (`http://127.0.0.1:3000`; the presenter is `http://localhost:3000`).
`lib/frames/compose.ts` builds every document from a build's `index.html` (inserted as written)
plus a shell: the portal theme `<link>` first in the head, any per-demo portal CSS
(`manifest.styles`, under `public/portal/`), charset, viewport, the presenter origin, the
runtime, flag metadata and instrumentation scripts.

- **Theme.** `styles/glass-tokens.css` (the design agent's file) is the one theme. `pnpm
  theme:sync` copies it to `public/theme/portal-glass.css` and, with the backgrounds and two font
  faces, into both F2 apps (`predev`, `prebuild` and the framework scripts run it; the copies are
  gitignored). `@layer portal-theme` is paint only; `@layer portal-layout` lays out `.portal*` and
  `.glass-*` classes only. Shown CSS is unlayered, so it always wins. `pnpm theme:lint` enforces
  the PRD 6.2 bans (and runs inside `pnpm check`, with the copies' hashes).
- **Portal shell.** `manifest.shell` wraps portal builds in the Ridgeline shell (nav rail, top bar)
  at compose time, so the shown code stays about the feature. The markup is wrapped as written,
  never reparsed; ids in `shell.outside` (overlay roots) are lifted out of `.portal`.
  `shell.context` adds an unshown context card after the shown markup (recent orders, recent
  cases, catalog from `fixtures/`), plain tables and chips that never use a demo's feature. The F2
  apps render the same shell themselves (`components/portal-shell.tsx`).
- **Glass off.** `?glass=off` on `/present` or `/speaker` sets `data-glass="off"` on the window and
  passes `glass:0` to every frame; surfaces turn solid.
- Native builds compose the section's shown files (`content/sections/<id>/files/`); today builds
  live in `demos/<nn>/today/` and are formatted with Prettier at 44 columns (`.prettierrc`).
  Used-to pages show `excerpt()`s of them: chosen ranges joined by generated elision lines
  (`lib/excerpt.ts`), checked line by line against the source.
- Flags: `enhance-css`, `enhance-js`, `csp-enforce` as in v3; the `supports-blocks` mode never
  touches the theme sheet.

## The runtime and the player

As in v3, `public/runtime/demo-runtime.js` runs the scripted actions; Next from the
previous step animates in the active document, any other move mounts a fresh document and replays
`s0..sN` instantly. Hands-on mode (`h`) gives the frame the keyboard. Back and Forward never
leave the frame. The guard is the Navigation API's `canGoBack`/`canGoForward` when its current
entry matches the document, else a count of the frame's own entries (loads, intercepted pushes,
`pushState`) kept in `window.name` while the name is empty or the runtime's own (the F2 apps keep
their session there, and `presenter.js` ignores a JSON name); the move is `history.back()`/`forward()`. Safari 26.0 needs
both: its `currentEntry` stays on the first entry after intercepted navigations, and its
`navigation.back()` in a sandboxed frame tries to move the presenter window.

A replaying document takes focus first, and the replay is posted from a task that carries the
presenter's press (`lib/engine/input-relay.ts`): Safari 26.0 refuses `focus()` in a cross-origin
frame outside such a task. Every press starts its own timer chain, because WebKit carries a press
through timers for one second from that press only: two Backs under a second apart used to post the
second replay from the first press's chain, after it had expired. Focus a page moves later (D4's
navigate handler focuses `#content` once the fetch returns) has no press behind it, so the runtime
notes a `focus()` that did not take during a run and sends `focus-request`; the handle answers
`focus-grant` through `withInput`, and the runtime repeats the same `focus()` in that handler. That
holds while the press's one second lasts; focus moved later in a long replay stays where WebKit left
it (review r7 M2). A forward run, which has the real key press, restores it. While an intro slide shows,
the next page's frame is loaded once in a hidden iframe to warm it (never for F2, whose apps log
every request).

Next during playback finishes the step; the next press advances (r7, section 6). A run counts as
playing only while it belongs to the current step entry and plays in the shown document; a
disposed document's run stops playing before it resolves. The 400 ms code lead is a run of its
own, so a press during it plays the step to its end at once instead of skipping it. A `finish` for
a run the frame has already ended posts its `step-done` again. The runtime's settle wait
(`quiescence()`) ignores paused and infinite animations, gives up after 2000 ms, and each frame
wait is an animation frame or 50 ms, whichever comes first, so a hidden window still reports done.
If a run still reports playing 1500 ms after Next asked it to finish, the stage advances anyway
(`window.__stuckPlayback`; rehearsal mode logs "Stuck playback on <page> <step>"). Once a step
moves focus into a frame, the runtime forwards every deck key in scripted mode (Home, End,
Backspace, Enter, `g`, `s`, `o` and `?` as well as the clicker keys); hands-on mode keeps them.

## Multi-page builds (M5)

A build may serve more than one composed document (`docs/design/still-in-motion-demos.md` 3.3).
`nativeBuild` and `folderBuild` take an optional fifth argument: `pages` (`["product.html"]`, each
composed like `index.html`, with the same wrapper, runtime and instrumentation), `render` (fills a
page's server template from fixtures; the shown file stays as written) and `extraDir` (unshown
hooks outside a today build's meter folder). The composer writes `data-pages` on `<html>` and moves
the shown markup's leading stylesheet links into the head, so the CSS that opts a page in to a
cross-document view transition blocks its first paint. A page request without `?flags=` takes the
flags and background of the build's last mount.

`Step.route` names the document a step ends on (`"product.html?id=trail"`). Forward runs keep the
real navigation: in a `data-pages` document, a click on a link or a `navigate` waits for
`pagehide`, whose `unloading` message names the next action, and the presenter resumes the run in
the new document (the same protocol D3 and D4 use for loads), so the view transition plays.
Instant replay loads the entry page, opens the last routed step's route with one navigation (a
real entry, so a later Back works; the runtime skips the view transition in `pageswap` for instant
runs) and runs that step's actions after its last click or navigate. The walk checks the frame's
address against `route` forward and back, and `pnpm axe` scans every routed document.

These rules keep it deterministic. A click on a link or a `navigate` to a URL waits until the
document's load event has finished: a navigation started before then is a replace in every engine,
which would leave no entry for Back (and WebKit's `history.back()` then restores a stale entry).
A fresh frame gets its address before it is inserted, so WebKit never records an `about:blank`
first document in the presenter's session history. The swap to a replayed frame hides the old frame
in the same task, so when a step reports done exactly one frame is shown. A document restored from
the back/forward cache posts `ready` again (`pageshow` with `persisted`), and `pagehide` posts
`unloading` only for a run still playing.

Asserts gained `style:<property>=<value>` (computed style). A `supports-blocks` enhancement may
start off (M2): the runtime removes its `@supports` blocks before the first paint the presenter
shows. Off removes every `@supports` block, positive and negative, and inserts nothing, so M2's s0
is the base rules alone: the cropped regular grid in every browser (PRD r7, 7.1). On restores both
blocks: lanes where the browser has them, CSS columns where it does not. The Chromium walk and `pnpm visuals` launch with `--enable-blink-features=CSSGridLanesLayout`
(Chrome's "CSS Grid Lanes Layout" flag, `chrome://flags/#css-grid-lanes-layout`) for M2.

## Spotlights (v5)

Protocol v2 (`lib/engine/protocol.ts`): every rect carries `radii: [tl, tr, br, bl]` in frame px,
resolved from computed style (percentages against the box, the smaller value per corner, corners
scaled down together when they overrun a side), and every rects message carries `animating`
(a finite animation or transition is running). The runtime samples rects every animation frame
while `animating` holds and posts on transition and animation end. Version 1 messages are
rejected with one console error.

The overlay draws each box from the target's four radii: a 3 px ring at a 4 px offset and white
halos, as borders on pseudo-elements so the arcs stay concentric. Spotlights, callouts and the
overlay focus ring pass through the settle gate (`lib/engine/settle.ts`): they fade out over 100 ms
when a rect moves by more than 0.5 px, the count changes, `animating` turns on or a
`resize-viewport` message arrives; they keep their last geometry while hidden; and they fade back
in over 160 ms at the latest geometry once nothing has moved for 120 ms. A new step's boxes wait
for its playback to finish. After 2000 ms without a settle they show anyway and follow the rects
(`window.__spotlightForced`; rehearsal mode logs "Spotlight forced after 2000 ms"). Reduced motion
makes the fades instant. Targets at the frame edge get an inset ring.

Top-layer occlusion: every rects message also carries `layers`, the frame's open popovers, modal
dialogs and fullscreen elements in opening order, each with its rect and radii, `z`, `owns` (the
watched selectors that match it or a descendant) and `focus` (it holds the focused element). A
box belongs to the highest layer that owns one of its selectors (or holds focus, for the focus
ring); every layer opened above that one is cut out of the box with a mask on its
`.overlay__layer` wrapper, so an open menu paints over a spotlight the way it paints over the
spotlighted page (D1 now s4: Cancel order over the status ring). Layer rects pass through the
settle gate with the boxes, so a hole never moves while a box is shown.

`/fixtures/spotlight` (development only) renders a page frame over `demos/00-fixtures/spotlight/`:
radius 0, 8, 16, 999, `12px 12px 0 0` and 50 percent targets, a button whose width transitions
and a panel that scales in. `pnpm walk fixtures` checks the radii, the fade timeline and reduced
motion there; the deck walk samples every forward step and fails when a shown box is off its
target.

## Backgrounds and grain (v5)

`content/backgrounds.ts` registers 25 files under `public/backgrounds/v5/` (1920 by 1080): one per
opening and closing slide and one per demo section (`Slide.background`, `DemoSection.background`;
demo pages take their section's). The stage draws `.stage__bg` from the slide's file and, in the
audience window only, `.stage__grain` (`public/theme/grain.png`, one tile pixel per device pixel,
`--grain-opacity` 0.10 with `--grain-blend` overlay; `pnpm grain` writes it from a fixed seed). The
audience window decodes the neighbouring slides' backgrounds ahead. Frames get `?bg=<section>`;
the composer writes `data-section-bg` and links `/theme/backgrounds.css` (written by `pnpm
theme:sync`), and the frame body shows the section image at the slide's alignment (1396.36 by
785.45 frame px at -47.27, -128.73, fixed) under its wash. `pnpm backgrounds` measures each file's
text zones into `content/.generated/backgrounds.json` for `pnpm test:contrast` and the walk.

## Wrappers (v5)

The v4 portal shell is replaced by one contextual wrapper per section (`manifest.wrapper`, ids in
`lib/frames/wrappers/index.ts`). A wrapper's `render()` returns markup before and after the shown
block, its stylesheets (`public/wrappers/base.css` first) and, for D2 only, a script. The composer
puts the shown markup, as written, inside `<div class="wrap-shown" data-shown>`, lifts ids in
`outside` (overlay roots) after the wrapper, and writes `data-wrapper` (and `data-scrolls` for D4)
on `<html>`. Wrapper markup and CSS use the `wrap-` prefix only, never a link, a focusable element
or a form control, and never the feature their section demonstrates; `pnpm check` lints them, and
the walk checks at s0 and on the last step that the shown CSS and the tab order stay inside the
shown slot, that the blocks fill 85 percent of the frame with no gap over 96 px, and that nothing
scrolls except D4. Wrapper data lives in `fixtures/portal-context.json` and the existing fixtures.

## Opening and closing slides (v5)

The opening and closing slides are native glass layouts (`components/layouts/glass/`, text in
`slide.glass`). The cover centers the eyebrow, a three-line title and the speaker's name and job
title as one group. The closing slide (`content/slides/34-closing.ts`) is always last: name, role and
LinkedIn on dark glass and a QR code on solid white. The speaker's name, job title, LinkedIn URL
and the Slalom URL live once in `content/deck.ts` (`speaker`, `org`); the validator checks that the
closing's QR URL equals `deck.speaker.linkedin`. The site pill, both wordmarks, the cover name, the
LinkedIn line and the QR code are links that open in a new tab (`NewTabLink`, `a[data-deck-link]`):
in the tab order in reader mode, `tabIndex={-1}` in the audience window and speaker previews. `pnpm qr` (also in `predev` and `prebuild`)
writes `public/qr/linkedin.svg` offline with the pinned `qrcode` package: error correction M, a
4-module quiet zone, 14 stage px per module; `pnpm check` fails when a fresh render differs, and
the walk checks the module size and the three lines.

## Speaker window

Previews on the left; the notes column on the right, top to bottom: header (eyebrow, title, "Step
n of m: label", Proof and Key point chips), the hands-on box (`ifKeyboard`), the page intro on step
0, the bullets (40 px, 28 to 56; the key step's last bullet in bold), cautions on the now page's
last step, a collapsed Reference (support, citations, step list, action summaries). Next is pinned
under the column; `d` adds the next step's actions under it. The step header shows "Playing" while
the audience frame runs the step and "Ready" once it is done (a `playback` sync message). Bullets
have markers. The previews use one captured poster per step. The timer stays hidden by default.

## Support data

`pnpm support` reads the installed `web-features` package and writes
`content/.generated/support.json` (committed): tiles, the "available since" sentence and the "also
uses" line. `pnpm support --tools` adds tool release dates from the npm registry. Intro slides read
only this file; logos are local (`public/logos/`).

## Scripts

| Command | What it does |
|---|---|
| `pnpm check [--strict] [section]` | The validator (`lib/validate/rules.ts`): page order, step caps, proofs, bullets, word budgets, writing rules (dashes, "!", sentence and bullet length, banned words, "X, not Y", no TODO), code on every walk step, highlights of 12 lines spanning 20 at most, 44 columns and 40 lines, excerpt fidelity, intro support and visuals, eyebrow and title, callouts, meters, viewports, the timing table (`lib/validate/timing.ts`), v3 field names, theme lint and hashes, and (r7, `validateR7` in `lib/validate/v5.ts`) one LinkedIn URL for the deck and the QR, the Still in motion group, and the drawer listing every demo section once. |
| `pnpm test` | `test:settle` (the spotlight gate with a fake clock), `test:validator` (one broken fixture per rule, theme lint included), `test:support` (the PRD 3.2 table), `test:contrast` (every text token over its surfaces, washes and palette). |
| `pnpm validate` | typecheck, lint, meters, test, check. |
| `pnpm backgrounds` | Measures every background's text zones into `content/.generated/backgrounds.json`. |
| `pnpm grain` | Writes the seeded grain tile `public/theme/grain.png`. |
| `pnpm qr` | Writes the closing slide's QR code `public/qr/linkedin.svg`. |
| `pnpm walk [page, section or prefix] [--browser=webkit\|firefox] [--capture] [--no-speaker]` | Drives the audience window with the arrow keys: step asserts, forward and back digests, intro tiles against support.json, the theme in every frame, slot geometry and a 44 by 40 fixture, and (Chromium) a speaker window at 1440 by 900 for notes visibility and hands-on. `pnpm walk d6 --browser=firefox --capture` saves `public/posters/d6-firefox.png`. Needs `pnpm dev`. |
| `pnpm visuals [section]` | Replays each intro's `visual.capture` step and saves the frame as a 2x PNG in `public/intro/`. |
| `pnpm capture [section]` | Production builds of the presenter and both F2 apps on ports 3300, 3316 and 3317 (separate build directories, beside `next dev`), then `pnpm visuals --posters` against them: intro stills and one poster per step in `public/posters/<page>/<step>.jpg`. |
| `pnpm measure:vite` | Builds `fixtures/vite-measure/app` with Vite 7 and Vite 8 (same plugins), five cold and five warm runs, and writes `fixtures/vite-measurements.json` for F4. |
| `node --import tsx scripts/record-f3.mts` | Records F3 sessions A to C for real against Verdaccio on 4873 with pinned pnpm and npm; session D stays a marked example. |
| `pnpm meters` | Counts today builds' and native shown JavaScript at printWidth 80 into `content/.generated/meters.json`. |
| `pnpm support [--tools]` | Writes `content/.generated/support.json`. |
| `pnpm axe [section]` | axe-core in every frame with `glass:0`. |
| `pnpm axe --presenter` | axe-core on presenter pages: `/s/title`, `/s/closing`, `/s/d1-intro` with the drawer closed and open, `/speaker` with it open. |
| `pnpm walk --advance [page or section]` | r7 6.5, Chromium and WebKit: on every framed page, Next after the last step leaves within 1500 ms by key with focus in the frame, the reader Next button and the speaker's Next button, also after a press in the code lead or mid-playback and after the shown document is disposed mid-run; Back from the next slide lands on the last step. |
| `pnpm walk transitions --fade=1`, `pnpm walk drawer`, `pnpm walk links` | r7 9.3 (the crossfade), 9.8 (the drawer's keyboard contract), 5.3 (the clicker after a slide link). The full walk runs the last two. |
| `pnpm walk m2 --no-lanes` | Chromium without the Grid Lanes switch: M2's columns fallback (r7 7.1), as `--browser=firefox` checks it. |
| `pnpm excerpt <file> <a-b> ...` | Prints an excerpt with the shown line numbers `code.lines` uses. |
| `pnpm theme:sync`, `pnpm theme:lint` | See Frames and the theme. |

Rehearsal mode (`d` in the audience window) shows the step id, digest, duration, failed asserts and
the 95th percentile frame time (the budget is 20 ms).

Talk day: `pnpm dev` (or `pnpm build && pnpm start`) serves the presenter on `localhost:3000` and
the frames on `127.0.0.1:3000`; the F2 apps start separately on 3106 and 3107 (`pnpm
dev:framework`, `pnpm dev:framework-today`). Open `http://localhost:3000/speaker`.

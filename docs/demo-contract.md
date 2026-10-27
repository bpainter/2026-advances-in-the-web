# Demo contract

Every demo under `content/demos/[id]/` is a standalone document composed from its listed files and
shown inside a sandboxed iframe on a demo slide, and opened directly at `/demos/[id]` in Chrome,
Firefox and Safari on stage. These rules keep a demo working in both places.

## Files

- `demo.ts` lists the files in display order: `index.html` first, then `styles.css`, then `app.js`
  (or `script.js`). The html file is the body; css files are inlined as `<style>`, js files as
  `<script type="module">`, at the position of their `<link>`/`<script src>` tags, which the composer
  strips. Keep those tags in the html so the file reads as a real page.
- Standard CSS and vanilla JS only. No Tailwind, no frameworks, no web fonts, no external requests
  (the demo CSP blocks them). Fonts: `system-ui`. Images: CSS shapes, gradients are banned on slides
  but allowed inside demos only when they are the point; prefer flat fills from the palette below.
- Prettier formatting with `printWidth: 56` (one declaration per line, 2-space indent, double quotes,
  semicolons). Run `npx prettier --write content/demos/<id>`. The code panel never wraps or scrolls
  horizontally, so no line may exceed 56 characters; `npx tsx scripts/check-demos.mts <id>` flags
  any that do.
- Keep each file reasonably short (under about 70 lines). The panel scrolls vertically and centres
  the highlighted lines, but the audience reads one screen at a time.

## Viewport

- The live view is laid out at half the frame size and scaled 2x (`demo.zoom`, default 2), so design
  for a **520 x 428 CSS px** viewport in the 60/40 split and **462 x 428** in the 50/50 split. Centre
  the component; a single product card about 260 to 320px wide reads well. Nothing may depend on a
  wider viewport. Use `min-height: 100vh` and `display: grid; place-items: center` on `body` for
  centring unless the demo needs scrolling.
- Standalone in a browser window the same document runs at 1x, so it must also look right at
  1200px wide: centre the component, do not stretch it.

## Visual language (the product card)

The deck's running example is one e-commerce product card: a hero image area, a title, a price, an
action. Every demo is a variation on that card so the audience sees one product evolve.

- Palette: accent `#0C62FB` (Slalom Blue), ink `#0F1C41`, text `#1C1C1E`, muted `#6B6B6B`,
  border `#E6E6E6`, surface `#FFFFFF`, page `#F5F5F7`. Hover/active tints come from `color-mix()`
  with the accent. Light scheme by default; the colour-functions demo is the one that toggles.
- Type: `system-ui`; 16px base, 1.5 line height; card title 18 to 20px/600; price 16px tabular;
  small text 13 to 14px. Buttons: 40 to 44px tall, 8px radius, 600 weight.
- Radii 8 to 12px on the card, 8px on controls. Elevation: one soft shadow on the card
  (`0 1px 2px rgb(15 28 65 / 0.06), 0 8px 24px rgb(15 28 65 / 0.08)`) and a slightly stronger
  one on floating layers (menus, tooltips). Borders 1px `#E6E6E6`.
- Visible focus: `outline: 2px solid #0C62FB; outline-offset: 2px` via `:focus-visible` on every
  interactive element. Hit targets at least 40px.

## Motion

- Animate only `transform`, `opacity` (and `translate`/`scale`/`rotate`), never layout properties.
  Enter: 180 to 240ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Exit: 120 to 160ms, `ease-in`.
- Top-layer enter/exit uses `@starting-style` plus `transition-behavior: allow-discrete` on
  `display` (and `overlay`, which only Chrome animates; harmless elsewhere).
- `@media (prefers-reduced-motion: reduce)`: keep a crossfade, drop the movement, shorten to 100ms.
  Do not remove the feature being demonstrated.

## Hooks the stage uses

- The slide drives the demo through steps: `CodeStep.liveState` posts a string the bridge sets
  as `html[data-state="…"]` and dispatches a `demostate` CustomEvent on `document`. CSS-only
  demos react with `html[data-state="x"] .thing { … }`; JS demos add one listener. Keep any existing
  `liveState` values working, or update the step in `demo.ts` with them.
- Every interaction the audience must see is a state. The presenter may have nothing but a
  clicker, so no step may depend on hover, a click inside the frame or typing: where CSS cannot
  do the job (`showPopover()`, `details.open`, `focus()`, typing, `scrollTo`, a view transition,
  navigation) the `demostate` listener in `app.js` does it. A step with no `liveState` inherits
  the nearest earlier one (the effective state), which is what makes retreat replay what advance
  showed; the first step of a frame demo must declare one.
- The stage re-posts `demo:setState` on every step change, including two steps with the same
  state and a presenter double-press mid-animation, so listeners must be idempotent (setting the
  current state again is a no-op) and must never throw while a transition is in flight.
- `CodeStep.target` is a CSS selector inside the demo document. On code steps in the split, half
  and code views the stage posts `demo:highlight { selector }`; the bridge marks matching elements
  with `data-spotlight`, which the composer styles (blue outline, short pulse, reduced-motion aware).
  Target only elements the step's state leaves visible; a closed popover or details is `display:
  none` and the outline cannot show. The live-only view clears the spotlight.
- `CodeStep.phase` names the beat: `before` (the legacy document in `legacy/`, shown while the
  slide tells today's story), `after` (an interaction in the native document) or `code` (a
  highlighted range with a target). The default is `code` for highlighted steps and `after` for
  the rest. Order the steps before, after, code.
- `Demo.requires` lists the feature checks the preflight page runs; keep them accurate.
- The bridge forwards clicker keys and Escape; do not trap keyboard focus inside the demo.

## Steps

`demo.ts` `steps[]` highlight line ranges in a named file with a caption and an on-stage action.
After editing a source file, re-point every step at the new lines and keep the caption true to the
code it points at. Run `npx tsx scripts/check-demos.mts <id>` and read the printed lines back, then
`pnpm check <id>` (errors on bad files, lines, targets and state lists; warns on demos that are
not clicker-driven yet). Keep `phase` and `target` after `caption` in each step so the checker's
matcher still finds the step.

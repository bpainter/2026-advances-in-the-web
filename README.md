# 2026 advances in the web · deck app

Presenter app for Bermon Painter's FITC Web Unleashed 2026 talk. Next.js App Router, TypeScript,
Tailwind 4 behind `@apply` only (JSX carries semantic class names), Slalom design-system tokens.

The deck's 35 slides and 17 demos load from `content/`, every layout renders, the presenter windows
sync, and every demo plays from the clicker alone in three beats (today's script, the native way,
the code) with the live view spotlit from the code panel. Still to come: the print route and PDF
export, and generated images for the image-led layouts. The demo work followed `docs/demo-plan.md`
(all milestones done); `docs/demo-template.md` is the authoring guide. The opening and closing
slides were designed in Claude Design and render through the `designed` layout.

## Presenting

Open <http://localhost:3000/speaker>, click "Audience window" (or press `s` from any window), drag
it to the projector and press `f`. The speaker window keeps the current and next previews on the
left and the notes in a column of their own on the right, which scrolls independently; the timing
bar stays hidden until you press "Timer" in the status bar (the choice is remembered), and a small
clock there shows elapsed time and whether you are over or under the slide's target. Both windows share one state over `BroadcastChannel` with a
`localStorage` fallback: slide, step, demo view, grid cell, blank and the timer. A refresh of either
window resumes where it was. `/speaker?rehearse=1` enlarges the preview and logs seconds per slide
to `localStorage`, exportable as JSON from the controls.

## Run

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. `pnpm build && pnpm start` serves the same deck offline.

`pnpm validate` runs typecheck, lint and `pnpm check` (the content validator in
`scripts/validate.mts`: files, highlight ranges, 56-column limit, spotlight targets, state lists;
`pnpm check <demo-id>` for one demo; `pnpm validate` runs it with `--strict`). `pnpm walk [slide-id]` drives
every demo slide in a headless Chromium with the forward and back keys and asserts each step's
state, spotlight and phase (`scripts/walk-demos.mts`; needs `pnpm dev` running;
`--browser=webkit|firefox` after `npx playwright install webkit firefox`).

## Keys

| Key | Action |
|---|---|
| `→` `PageDown` `Space` | next code step, then next slide |
| `←` `PageUp` `Backspace` | previous code step, then previous slide |
| `Shift+→` / `Shift+←` | next / previous slide, skipping steps |
| `n` / `p` | next / previous step only |
| `1` `2` `3` `4` | demo slide: live only, 60/40 split, code only, 50/50 split |
| `1`–`4`, `0` | lightning round: enlarge a cell with its code; 0 restores the grid |
| `l` | terminal slide: hide the recording so a real terminal can sit on top |
| `t` | start or pause the talk timer (it also starts on the first advance from slide 1) |
| `g` | speaker view: go to a slide number |
| `s` | open or focus the speaker window |
| `Home` / `End` | first / last slide |
| `Enter` / `Esc` | hand focus to the demo / take it back |
| `o` `r` `x` | open demo standalone, reload demo, show fallback |
| `b` `.` / `f` / `?` | blank, fullscreen, keyboard help |

## Where things live

- `content/schema.ts` — the slide schema (SLIDE_SCHEMA.md verbatim plus Part A additions and `demoView`).
- `content/slides/*.ts` — one slide per file; `index.ts` sets the order. Generated from the PRD by
  `scripts/extract-prd.mts` + `scripts/import-prd.mts`; edit the generated files directly from here on.
- `content/demos/[id]/` — `demo.ts` plus the real `index.html` / `styles.css` / `*.js` files it lists.
  Route-kind demos (view transitions, cross-document) serve each html file at `/demos/[id]/[page]`.
- `public/images/[slide-id].{avif,webp,jpg,png}` — generated stills; a placeholder renders until they exist.
- `components/layouts/` — `SlideShell`, `ContentSlide` (`list`), `DemoSplitSlide`, `PlaceholderSlide`.
- `components/demo/` — `DemoFrame` (sandboxed iframe + bridge), `CodePanel` (Shiki, stepped highlights), `SupportLabel`.
- `components/stage/Stage.tsx` — canvas scaling, key map, step and view state, URL sync. Under
  `/present` and `/speaker` it reads and writes the shared store instead of local state.
- `lib/presenter/` — presenter state, the sync transport and the provider; `components/presenter/`
  holds the audience wrapper, speaker view and timer.
- `lib/compose/` — assembles a demo's files into one document served at `/demos/[id]` with its own CSP.
- `lib/demo-bridge.js` — the only app code that runs inside a demo document.
- `styles/` — `tokens.css`, `theme.css` (Tailwind theme mapping), one CSS file per component.

## Fonts

Slalom Sans (Regular, Bold, Black) and Lora Italic are in `public/fonts/`, from the Slalom design
system, and loaded by `styles/fonts.css`. The designed slides name the single-weight families
("Slalom Sans Bold"); the rest of the deck uses "Slalom Sans" with weights.

## Designed slides

`layout: "designed"` renders a slide exported from Claude Design: one 1920 x 1080 `<section>` with
inline styles in `content/designed/<file>.html`, named by `slide.designed.file`. `lib/designed.ts`
parses it (no HTML injection) and the deck footer is laid over the bottom band. To update one,
export the slide's section file from the Claude Design deck, rewrite `/_blob/<id>` image sources to
`/images/design/<id>.png` (save the asset there), and replace the file.

## Demo views and size

Every `demo-split` slide starts in the view named by `slide.demoView` (`"live" | "split" | "code" | "half"`,
default `"half"`, the 50/50 view, so the code reads easily). Press `2` for the 60/40 view when the
demo needs more room, or set `demoView: "split"` on that slide. Keys `1` to `4` switch views on the
current slide; the choice resets when the slide changes.

Live frames are scaled by `demo.zoom` (default `2`): the demo is laid out at half the frame's size and
scaled up so it reads from the back of the room. Set `zoom: 1` on full-page website demos. Demo
sources keep a blank line between chunks; `steps[].highlight` line numbers count those blank lines.

## Steps drive the demo

Each step's `liveState` is posted into the frame (`demo:setState`); a step without one inherits the
nearest earlier state, so advance and retreat replay the same interactions. A step's `target`
selector is spotlit inside the demo (`demo:highlight`, a blue outline) in every view but live-only.
`phase` tags the beat (`before`, `after`, `code`); `demo.legacy` lists the legacy document served at
`/demos/[id]/legacy` and shown during `before` steps. Both frames stay mounted, so the switch never
reloads. See `docs/demo-contract.md` and `docs/demo-template.md`.

A window opened at a typed or linked `/present?s=<slide>` or `/speaker?s=<slide>` moves both
windows to that slide; a reload resumes the shared state instead.

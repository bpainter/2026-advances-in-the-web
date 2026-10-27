# 2026 advances in the web · deck app

Presenter app for Bermon Painter's FITC Web Unleashed 2026 talk. Next.js App Router, TypeScript,
Tailwind 4 behind `@apply` only (JSX carries semantic class names), Slalom design-system tokens.

The deck's 36 slides and 17 demos are loaded from the PRD (Part B), all 16 layouts render, and the
presenter windows sync. Still to come: `pnpm validate`, the print route and PDF export, fonts and
generated images. The demo portion (clicker-driven steps, code-to-demo spotlight,
the "before" beat and the validator) is planned in `docs/demo-plan.md`.

## Presenting

Open <http://localhost:3000/speaker>, click "Open audience window" (or press `s` from any window),
drag it to the projector and press `f`. Both windows share one state over `BroadcastChannel` with a
`localStorage` fallback: slide, step, demo view, grid cell, blank and the timer. A refresh of either
window resumes where it was. `/speaker?rehearse=1` enlarges the preview and logs seconds per slide
to `localStorage`, exportable as JSON from the controls.

## Run

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. `pnpm build && pnpm start` serves the same deck offline.

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

Slalom Sans and Lora are not in the repo. Drop the WOFF2 files into `public/fonts/` and add
`@import "./fonts.css";` to `styles/app.css`. Until then the fallback stacks in `tokens.css` apply.

## Demo views and size

Every `demo-split` slide starts in the view named by `slide.demoView` (`"live" | "split" | "code" | "half"`,
default `"split"`, the 60/40 view). Keys `1` to `4` switch views on the current slide; the choice resets when the slide changes.

Live frames are scaled by `demo.zoom` (default `2`): the demo is laid out at half the frame's size and
scaled up so it reads from the back of the room. Set `zoom: 1` on full-page website demos. Demo
sources keep a blank line between chunks; `steps[].highlight` line numbers count those blank lines.

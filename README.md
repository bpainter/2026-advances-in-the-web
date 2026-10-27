# 2026 advances in the web · deck app

Presenter app for Bermon Painter's FITC Web Unleashed 2026 talk. Next.js App Router, TypeScript,
Tailwind 4 behind `@apply` only (JSX carries semantic class names), Slalom design-system tokens.

The deck is the Claude Design opening (7 slides), the demo section (10 sections, 24 pages, each
page a scripted frame the presenter drives with the clicker) and the Claude Design closing. The
demo engine follows `PRD_Demos.md` (schema v3); `docs/demo-engine.md` explains it. Still to come:
the print route and PDF export, generated images, posters for the speaker previews.

## Presenting

Open <http://localhost:3000/speaker>, click "Audience window" (or press `s` from any window), drag
it to the projector and press `f`. The speaker window keeps the current and next previews on the
left and the notes in a column of their own on the right, which scrolls independently; the timing
bar stays hidden until you press "Timer" in the status bar (the choice is remembered), and a small
clock there shows elapsed time and whether you are over or under the slide's target. Both windows share one state over `BroadcastChannel` with a
`localStorage` fallback: page, step, blank, hands-on and the timer. A refresh of either
window resumes where it was. `/speaker?rehearse=1` enlarges the preview and logs seconds per slide
to `localStorage`, exportable as JSON from the controls.

## Run

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. `pnpm build && pnpm start` serves the same deck offline.

`pnpm validate` runs typecheck, lint, `pnpm meters` and `pnpm check` (the content validator); `pnpm walk` drives
every demo page in Playwright and asserts the frames' step results. See `docs/demo-engine.md`.

## Keys

| Key | Action |
|---|---|
| `→` `PageDown` `Space` | Next: plays the next step; after the last step, the next page |
| `←` `PageUp` `Backspace` | Previous: back one step (reset and replay), then the previous page |
| `Shift+→` / `Shift+←` | next / previous page, step 0 |
| `h` | hands-on mode: steps stop playing; your keyboard and pointer reach the demo |
| `r` | reset and replay the current step |
| `l` | terminal page: hide the recording for a live terminal |
| `d` | rehearsal overlay (step id, digest, duration, failed asserts) |
| `t` | start or pause the talk timer |
| `g` | speaker view: go to a slide number |
| `s` | open or focus the speaker window |
| `o` | open the frame standalone |
| `Home` / `End` | first / last slide |
| `b` `.` / `f` / `?` | blank, fullscreen, keyboard help |

## Where things live

- `content/schema.ts` — the slide schema (SLIDE_SCHEMA.md verbatim plus Part A additions and `demoView`).
- `content/slides/*.ts` — one slide per file; `index.ts` sets the order. Generated from the PRD by
  `scripts/extract-prd.mts` + `scripts/import-prd.mts`; edit the generated files directly from here on.
- `content/sections/<id>.ts` + `content/sections/<id>/files/` — the ten demo sections (schema v3) and their shown code files, extracted from the PRD.
- `demos/<nn-name>/` — each demo's builds (today, native extras, static, terminal) and `build.ts` registration.
- `public/runtime/demo-runtime.js` — the in-frame runtime; `lib/engine/` the presenter-side player; `lib/frames/` the composer, registry and routes.
- `public/images/[slide-id].{avif,webp,jpg,png}` — generated stills; a placeholder renders until they exist.
- `components/layouts/` — `SlideShell`, `ContentSlide` (`list`), `DemoSplitSlide`, `PlaceholderSlide`.
- `components/page/` — the demo page layout, frame player, overlay, code panel and badge.
- `components/stage/Stage.tsx` — canvas scaling, key map, step and view state, URL sync. Under
  `/present` and `/speaker` it reads and writes the shared store instead of local state.
- `lib/presenter/` — presenter state, the sync transport and the provider; `components/presenter/`
  holds the audience wrapper, speaker view and timer.
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


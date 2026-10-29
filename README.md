# 2026 advances in the web · deck app

Presenter app for Bermon Painter's FITC Web Unleashed 2026 talk. Next.js App Router, TypeScript,
Tailwind 4 behind `@apply` only (JSX carries semantic class names), Slalom design-system tokens.

The deck is the Claude Design opening (7 slides), the demo section (14 sections, 40 pages: an
intro slide, "What we used to do" and "What we can do today" for D1 to D6, M1 to M5, F2 and F3,
and a single page for F4, each frame driven by the clicker) and the Claude Design closing, 50
slides in all. The demo
section follows `docs/PRD-demos-v4.md` (schema v4) in the glass look of
`docs/design/demo-glass-spec.md`; `docs/demo-engine.md` explains it. Still to come: the print route
and PDF export, posters for the speaker previews.

## Presenting

Open <http://localhost:3000/speaker>, click "Audience window" (or press `s` from any window), drag
it to the projector and press `f`. The speaker window keeps the current and next previews on the
left and the notes in a column of their own on the right, which scrolls independently; the timing
bar stays hidden until you press "Timer" in the status bar (the choice is remembered), and a small
clock there shows elapsed time and whether you are over or under the slide's target. Both windows share one state over `BroadcastChannel` with a
`localStorage` fallback: page, step, blank, hands-on and the timer. A refresh of either
window resumes where it was. `/speaker?rehearse=1` enlarges the preview and logs seconds per slide
to `localStorage`, exportable as JSON from the controls. The notes column shows the page intro on
step 0, the step's bullets (the key step's last bullet in bold), Proof and Key point chips,
`ifKeyboard` in hands-on mode, cautions on a now page's last step, and Next pinned at the bottom;
citations and action summaries sit in the collapsed Reference. Add `?glass=off` to both windows
if the laptop drops frames: surfaces turn solid in the slides and in every frame.

## Run

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. `pnpm build && pnpm start` serves the same deck offline.

`pnpm validate` runs typecheck, lint, `pnpm meters`, `pnpm test` (validator fixtures, support
data, contrast) and `pnpm check` (the content validator); `pnpm walk` drives every demo page in
Playwright, with a speaker window beside it, and asserts the frames' step results. `pnpm support`
refreshes the browser support data from the pinned `web-features` package (refresh the package the
week of the talk), `pnpm visuals` recaptures the intro stills, `pnpm theme:sync` copies the portal
theme to `public/theme/` and the F2 apps (`pnpm dev` and `pnpm build` run it first), `pnpm
capture` regenerates the intro stills and the speaker's step posters from production builds, and
`pnpm measure:vite` measures F4 on this machine. Present from production builds (`pnpm build &&
pnpm start`, `pnpm start:framework`, `pnpm start:framework-today`). See `docs/demo-engine.md`.

## Framework demo apps (F2 caching)

The caching demo's frames are two separate Next.js 16 apps, not frames of this app (PRD Part A,
8.1 and 10.3): `demos/06-framework-cache/` runs with Cache Components on at
<http://localhost:3106> (the `f2-now` page) and `demos/06-framework-cache-today/`
runs with Cache Components off at <http://localhost:3107> (the `f2-used-to` page), because the old
route segment configs throw once the flag is on. Each is its own pnpm project with the same
pinned `next`, `react` and `react-dom` versions as this one; install them once with
`pnpm --dir demos/06-framework-cache install` and `pnpm --dir demos/06-framework-cache-today install`.

```bash
pnpm dev:framework          # next dev on 3106 (rehearsal; the dev server adds a validation render)
pnpm dev:framework-today    # next dev on 3107
pnpm build:framework && pnpm start:framework              # talk day: one long-lived next start on 3106
pnpm build:framework-today && pnpm start:framework-today  # talk day: next start on 3107
```

Both must be running before the F2 pages are opened; `use cache` is in-memory, so do not restart
the now app between the F2 pages. Rehearse F2 with the built presenter (`pnpm build && pnpm start`)
when the exact log rows matter: in `pnpm dev`, React Strict Mode mounts each frame twice and the
twin frame's requests can interleave with the shown one's. The frame routes in content (`/framework/...` and
`/framework-today/...`) resolve to those origins in `lib/frames/origins.ts`
(`NEXT_PUBLIC_FRAMEWORK_ORIGIN` and `NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN` override them). Each app
serves `/products/ridgeline-trail` (with `?presenter=1` it loads the frame runtime from the demo
origin and registers the hooks from `public/presenter.js`), `/__demo/log` (the request log as
server-sent events) and `POST /__demo/reset`. The today app's meter is printed by
`pnpm --dir demos/06-framework-cache-today count-cache-flags`.

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
- `content/sections/<id>.ts` + `content/sections/<id>/files/` — the eleven demo sections (schema v4) and their shown code files. Edit them directly; the v3 extractor is gone.
- `content/.generated/support.json` — browser and tool support for the intro slides (`pnpm support`).
- `styles/glass-tokens.css` — the glass tokens and the portal theme injected into every frame; `public/portal/` holds per-demo portal CSS; `public/logos/`, `public/intro/`, `public/backgrounds/` the slide assets.
- `demos/<nn-name>/` — each demo's builds (today, native extras, static, terminal) and `build.ts` registration.
- `public/runtime/demo-runtime.js` — the in-frame runtime; `lib/engine/` the presenter-side player; `lib/frames/` the composer, registry and routes.
- `public/images/[slide-id].{avif,webp,jpg,png}` — generated stills; a placeholder renders until they exist.
- `components/layouts/` — `SlideShell`, `ContentSlide` (`list`), `DemoSplitSlide`, `PlaceholderSlide`.
- `components/page/` — the intro slide and support row, the walk-page layout, frame player, overlay and code panel.
- `components/stage/Stage.tsx` — canvas scaling, key map, step and view state, URL sync. Under
  `/present` and `/speaker` it reads and writes the shared store instead of local state.
- `lib/presenter/` — presenter state, the sync transport and the provider; `components/presenter/`
  holds the audience wrapper, speaker view and timer.
- `styles/` — `tokens.css`, `theme.css` (Tailwind theme mapping), one CSS file per component.

## Fonts

Slalom Sans (Regular, Bold, Black) and Lora Italic are in `public/fonts/`, from the Slalom design
system, and loaded by `styles/fonts.css`. The deck uses "Slalom Sans" with weights.

## Opening and closing slides

The opening and closing slides are native glass layouts (PRD v5, 4.5): `glass-title`,
`glass-grid` (icons, portraits, numbered), `glass-quotes`, `glass-statement`, `glass-people` and
`glass-closing` in `components/layouts/glass/`, styled by `styles/components/slides-glass.css`.
Their text is typed data in `slide.glass` (`content/slides/0*.ts` and `3*.ts`), so `pnpm check`
applies the writing rules to it. Each slide names its background in `content/backgrounds.ts`;
portraits stay in `public/images/design/`. The Claude Design exports (`content/designed/`) are
gone.


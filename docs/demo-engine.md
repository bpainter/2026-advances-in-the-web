# Demo engine (schema v3)

How the demo section of the deck works, where its pieces live, and how to build a demo for it.
The specification is `PRD_Demos.md` (Part A, engine; Part B, content); the contract between the
two is `content/demo-schema.ts`.

## Pages, not slides

The demo section is ten `DemoSection`s (`content/sections/`), each with three pages (today, now,
code) or one single page. Every page is a slide of layout `demo-page` (`content/slides/index.ts`
assembles the deck: the Claude Design opening, the 24 demo pages, the Claude Design closing).
A page has a title, a frame, optional code files, and steps. Step 0 is the entry state.

Each step carries `actions` (pointer, click, key, focus, type, paste, resize, toggle, navigate,
network, hook, terminal, reveal, wait, assert), optional `spotlight` selectors, `code` lines on
code pages, `callouts` and a `meter` on today and now pages, and the speaker's `notes`.

## Frames

A frame is an iframe on the demo origin (`http://127.0.0.1:3000` offline; the presenter is
`http://localhost:3000`, so the two cannot read each other). `lib/frames/origins.ts` resolves
`Frame.route` to a URL; `/framework/` and `/framework-today/` prefixes resolve to the F2 apps on
ports 3106 and 3107.

Documents are composed by `lib/frames/compose.ts` from a build's `index.html` (inserted verbatim)
plus a shell: charset, viewport, the presenter origin, `/runtime/demo-runtime.js`, flag metadata,
and the manifest's instrumentation scripts at the end of the body. They are served by
`app/demos/[demo]/[build]/[[...path]]/route.ts` at `/demos/<demo>/<build>/index.html` (relative
links resolve there), with the build's files at `/demos/<demo>/<build>/<file>` and extra routes
from the folder's `routes` (today addresses, submit handlers). Root-level addresses (`/orders`,
`/cases`, `/api/...`) are thin app routes that delegate to the same `routes`.

- `demos/<nn-name>/build.ts` registers the folder: `today`, `native`, `static` or `terminal`
  builds with their manifests (`lib/frames/types.ts`), and extra routes. Helpers in
  `lib/frames/build-helpers.ts`; the map in `lib/frames/registry.ts`.
- Native builds compose the section's shown files from `content/sections/<id>/files/`, so the
  code on screen is the code that runs. Unshown hooks and instrumentation live in
  `demos/<nn>/native-extra/` and are listed in the manifest's `instrumentation`.
- Today builds live in `demos/<nn>/today/` and are working, hand-rolled implementations of the
  plan's "what teams commonly maintain" lists; `pnpm meters` counts their JavaScript.
- Flags: `enhance-css` disables the tagged stylesheets in place (mode `all`) or removes top-level
  `@supports` rules through the CSSOM (mode `supports-blocks`); `enhance-js` serves the document
  without the enhancement scripts (reload); `csp-enforce` switches D5's header (reload). Flags
  arrive as `?flags=enhance-css:0`.
- CSP per frame is `BASE_CSP` in `lib/frames/compose.ts`, overridable per build; sandbox per
  manifest. The runtime is Trusted Types safe.

## The runtime and the player

`public/runtime/demo-runtime.js` runs inside every frame. It does nothing until the presenter
sends `init`, then executes `run-step` (animated or instant) and `replay-to`, posts `cue`s for the
overlay (cursor, ripple, keycap, caption), `rects` for watched selectors, `step-done` with assert
results and a state digest, `error`, and forwards clicker keys. `key` actions run through the DOM
API named in `via` (synthetic key events are untrusted); clicks focus the target first.

`components/page/PageFrame.tsx` is the player. Next from the previous step plays the step animated
in the active document. Any other move (Prev, jump, hands-on off, `r`) mounts a fresh document
beneath, replays `s0..sN` instantly and swaps, so state is exact. Reloading toggles split a step:
the actions before run, the document remounts with the new flags, the rest run there.
`components/page/Overlay.tsx` draws the chrome above the iframe inside the scaled wrapper.

Hands-on (`h`): steps stop playing, the ghost cursor hides, the frame gets the keyboard, Next and
Prev change spotlights and highlights only; turning it off replays to the current step.

## Speaker window

`/speaker` shows the current and next page previews (posters or labels; no live mirror), the notes
for the exact step (`open` on step 0, the step's `notes`, `bridge` on the last step, `ifKeyboard`
in hands-on mode, cautions on the last code step, citations, a step list that jumps), the next
press, counters, the frame's health, and the timer.

## Scripts

| Command | What it does |
|---|---|
| `pnpm extract:demos` | Re-extracts the ten sections from `~/Downloads/PRD_Demos.md` (overwrites `content/sections/`). |
| `pnpm meters` | Counts today builds' JavaScript into `content/.generated/meters.json`. |
| `pnpm check [--strict] [section]` | The content validator (titles, stages, callouts, notes, timing, code lines, `via`, flags, meters, selectors against the builds). |
| `pnpm validate` | typecheck, lint, meters, check. |
| `pnpm walk [page or section] [--browser=webkit|firefox]` | Drives every page with the arrow keys in Playwright and asserts step results and forward/back digests. Needs `pnpm dev`. |

Talk day: `pnpm dev` (or `pnpm build && pnpm start`) serves the presenter on `localhost:3000` and
the frames on `127.0.0.1:3000`; the F2 apps start separately on 3106 and 3107 (see
`demos/06-framework-cache/`). Open `http://localhost:3000/speaker`.

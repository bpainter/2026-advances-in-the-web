# PRD perf: production performance and accessibility

This PRD turns three reviews into work: `docs/perf/platform-review.md` (Vercel delivery),
`docs/perf/frontend-review.md` (browser behaviour) and `docs/perf/a11y-review.md` (WCAG 2.2 AA).
All three measured production at `cb8e46c` on 29 October 2026. Start from `main` at `aa84356`; the
two commits since then change slide copy only. Everything in `docs/PRD-r7.md`,
`docs/demo-engine.md` and `docs/deploy.md` still holds unless this document changes it.

The speaker's ask: "optimize the slides for production so they load faster (prefetch, other
performance oriented techniques)... Double check for accessibility as well."

The order of what matters, fixed for every trade-off in this PRD:

1. **Clicker reliability on stage.** No press is ever lost, and nothing blank or white shows.
2. **Perceived speed on stage.** The projector is 1920 by 1080 at DPR 1, over venue Wi-Fi.
3. **Public reader mode.** People open `/s/<id>` on laptops and phones, during and after the talk.

A parallel PRD, `docs/PRD-speaker-view.md`, redesigns the speaker window. It owns
`components/presenter/SpeakerView.tsx`, the speaker's notes, reference and controls components and
`styles/components/speaker.css`. This PRD assigns none of those files. Section 7.2 lists the
handoffs.

## Decisions at a glance

| Topic | Decision |
|---|---|
| Priorities | P0: anything that can lose a press or flash on stage, plus caching and talk-day safety. P1: bytes and load (images, reader preload, fonts, prerender, function size, frame file caching). P2: measurement, the accessibility Mediums and Lows, the text view, small wins. |
| FrameWarm | Keep it. The runtime never takes focus in a warming document, and the audience stage reclaims focus whenever a non-demo iframe takes it. |
| Loading flash | Every frame slot shows the step's captured poster until the live document has replayed. The white "Loading demo…" card only shows when no poster exists. |
| Cache strategy | Hybrid. Content-hashed or folder-versioned files are `immutable` for a year. Everything else under `public/` gets `max-age=3600, stale-while-revalidate=86400`. HTML and RSC stay `must-revalidate`. Frame documents stay `no-store`. Frame build files are cached on the CDN per deployment. |
| Images | Pre-built with sharp by a committed `pnpm images` pipeline, never Vercel Image Optimization. AVIF first, WebP fallback where a `<picture>` allows it. Outputs are content-hashed under `public/opt/` with a committed manifest. |
| Image quality | Stills and posters: AVIF q70, 4:4:4. Backgrounds keep their baked grain: AVIF q70 4:4:4 by default, q55 4:2:0 only if the projector check passes. The `grain.png` overlay stays as it is. |
| Prerender | `/present` and `/speaker` become prerendered `[id]` routes behind a query rewrite, so `?s=` URLs keep working. `/present` lands in P1 after a spike. `/speaker` lands only after the speaker-view PRD reads `?rehearse=` on the client. If either misses the deadline, it waits until after the talk; the warm-up covers cold starts. |
| Speed Insights | Add it on the free tier, on `/` and `/s/*` only. It never loads in `/present`, `/speaker` or frames. Plus ($10 per month) is the speaker's call (open question 4). |
| Function region | Move to `yul1` (Montréal) through `vercel.json`, P2, only if it lands before the final rehearsal. |
| Warm-up | A `pnpm warmup` script warms the CDN and the functions from the talk laptop on venue Wi-Fi. It also checks the deployed build ID. A browser warm walk follows it on the pre-talk checklist. |
| Deploy freeze | No production deploys from T minus 24 hours. Any deploy after the final rehearsal triggers the full pre-talk checklist again. |
| Reflow (H4) | In scope as P2: a reader "Text view" of each slide, automatic on small screens and a toggle elsewhere. It ships after the talk unless it is merged and rehearsed before the freeze. No zoom hack on the stage. |
| Demos | Shown code, excerpt ranges, meters and support data do not change. Every listed check stays green on every merge. |

## 1. Writing rules for UI copy

Every string a slide, the pill, a dialog, an announcement or alt text shows follows PRD v4 5.2 and
the validator: no em or en dashes, sentence case, short sentences, no "!". All copy in this PRD
already passes. Engineers type it as written.

## 2. Guardrails: what must not change

### 2.1 Demos stay honest

- No PR in this PRD changes `content/sections/**`, `demos/**`, `content/.generated/meters.json` or
  `content/.generated/support.json`. Two exceptions, each with proof in the PR description:
  - `demos/07-package-workflow/terminal/index.html` and `player.css` (P2-A11Y L5), only if
    neither is a shown file of any page (`rg` the page files and excerpts).
  - Re-encoded bytes under `public/demo-assets/**` (P1-IMG 6): same names, same format, same
    aspect ratio.
- Excerpt line ranges and the code each step highlights stay the same. `pnpm check` (excerpt
  fidelity) is the gate.
- Meters show the same values. `pnpm meters` leaves no diff.

### 2.2 Checks that stay green on every merge

| Command | Notes |
|---|---|
| `pnpm validate` | typecheck, lint, meters, tests, check (including the OG cover hash). |
| `pnpm walk` | Chromium, 0 failures, against `pnpm dev`. Includes the drawer and links. |
| `pnpm walk --advance` | Chromium and WebKit. |
| `pnpm walk transitions --fade=1` | The r7 crossfade. |
| `pnpm axe`, `pnpm axe --presenter` | 0 violations. |
| `pnpm capture` | Runs at integration and after any change that touches what a frame paints. |
| OG hash | If `pnpm check` says "The cover changed; run pnpm og", the PR that tripped it runs `pnpm og` and commits `public/og/*`. |

WebKit and Firefox walks run at integration (section 8, step 4).

### 2.3 Behaviour that must not regress

- **Two-window sync.** A press in either window moves both within one frame of the RSC payload.
- **Prefetch (r7 9.2).** Two seconds after arrival, ArrowRight starts no page or RSC request, and
  the canvas paints within 60 ms p90.
- **Crossfade (r7 9.3).** Runs in the audience window and reader mode, off under automation,
  capture and reduced motion.
- **Drawer (r7 9.5).** The keyboard contract in r7 9.8.
- **Step playback.** The 400 ms code lead, finish on press, the stuck-playback watchdog, Back
  replays and the settle gate.
- **Audience keys.** Every key the audience window handles today still works there, from the
  stage and from inside a frame.

## 3. P0: the stage

### P0-1. FrameWarm must never take focus (WS-1)

**Finding** (frontend P0-1). On all 12 warmed intro slides, the hidden warm document takes the
audience window's focus 0.5 to 0.8 s after arrival. Presses go into it until the 1200 ms claim. On
a slow warm-up, focus moves after the last claim and every press on that intro slide is lost.
Cause: `probeFocusVisibleOption()` in `public/runtime/demo-runtime.js` calls `b.focus()` during
`features()` for the `ready` message.

**Change.**

1. `public/runtime/demo-runtime.js`:
   - `features()` reports `"focus-visible-option": null` and never probes at `ready`.
   - Probe lazily, at most once, the first time a run starts or the window inside the frame gets
     a `focus` event, and only when `document.hasFocus()` is true. Until then `focusVisibleNative`
     stays `null`, which the rects message already treats as false.
   - When the document URL carries `warm=1`, the runtime posts nothing, probes nothing and calls
     no `focus()`. It still loads, so its file and the theme are cached.
2. `components/page/FrameWarm.tsx`: append `warm=1` to the warm URL (after `frameQuery`).
3. `components/stage/Stage.tsx`, audience claim effect: keep the 0, 450 and 1200 ms claims. Add a
   window `blur` listener and a `focusin` listener. Each schedules a check in the next task. If
   `document.activeElement` is `body`, null, or an `iframe` without the `page-frame__iframe`
   class, the stage canvas takes focus (`preventScroll: true`). Active for the life of the stage,
   audience mode only.

**Acceptance.**

- On each of the 12 intro slides, presses at 0.3, 0.6, 0.9, 1.25, 2.5 and 4 s after arrival all
  advance. Run it with the warm document's response held back by 0, 1.5 and 3 s. 0 lost presses
  in 216 presses.
- Across 0 to 5 s after arrival on every intro slide, `document.activeElement` is never
  `iframe.frame-warm`.
- D1's focus-visible asserts pass in `pnpm walk` for Chromium, WebKit and Firefox.

**Test.** Port `probe3.mjs` and `probe3b.mjs` from the review's scratch folder into
`scripts/walk-perf.mts` as `pnpm walk focus` (section 10). Run against `pnpm dev`, then against
production after deploy.

### P0-2. A poster under every loading frame (WS-1)

**Finding** (frontend P0-2). Every used-to and now page shows a white "Loading demo…" card for 270
to 420 ms median, about 1 s p90 cold, after the slide has painted. The step's poster is already
captured and, in the audience window, already decoded.

**Change.**

1. `components/page/PageBody.tsx`: pass `poster={posters[step.id]}` to `PageFrame` in live mode.
2. `components/page/PageFrame.tsx`:
   - Mount the first document hidden: `mount(flags, false)`, as replays already do. `show()`
     reveals it on `ready`, after the replay.
   - While no document is shown and a poster exists, render
     `<img className="page-frame__poster" src={poster} alt="" decoding="sync" fetchpriority="high">`
     inside `.page-frame__scaled`, under the slot, at the slot's content size. Remove it in the
     same task as the first `show()`.
   - When a poster is shown, do not render "Loading demo…". The error copy stays as it is.
   - Reader mode: the iframe gets `tabIndex = -1` unless hands-on is on (see P0-3).
3. `styles/components/page.css`: `.page-frame__poster` fills the slot box (`position: absolute;
   inset: 0; width: 100%; height: 100%; object-fit: cover`). It sits under
   `.page-frame__iframe`. The frame's white background stays hidden while `data-visible="false"`.

The poster is decoration with `alt=""`: the iframe's title still names the demo. Playback,
`step-done`, the speaker's "Ready" and spotlights still wait for the live document.

**Acceptance.**

- Key to frame content visible (poster or live document), audience window, used-to and now pages:
  ≤ 100 ms p90 on the `venue` profile. Reader mode ≤ 100 ms p90 once P1-READ lands; ≤ 250 ms p90
  before it.
- No screenshot of the slot at 16, 50, 100 and 200 ms after the press shows "Loading demo…" on a
  page that has a poster.
- Poster and live document match at the swap. Mean absolute pixel difference ≤ 2% of 255 for every
  s0 poster and every last-step poster (Back lands there). A page above that gets its poster
  recaptured. If a recapture does not fix it, that page is excluded from the underlay and the
  exclusion is listed in the PR.
- `pnpm capture` output is unchanged for D1 and D4: same dimensions, mean pixel difference ≤ 1%.
- r7 9.3: the frame's s0 `step-done` still arrives within 300 ms of the no-fade baseline.

**Test.** `pnpm walk underlay` (new, `scripts/walk-perf.mts`): every framed page, forward
arrival and Back arrival, samples the slot and checks the swap diff. Then a manual look on the
talk laptop with the fade on.

### P0-3. No keyboard trap in demo frames (WS-1)

**Finding** (a11y H1). In scripted mode, the runtime eats Tab, Shift+Tab and Escape. In reader
mode the first Tab enters the frame and never leaves. The pill fades because frame keys never wake
it.

**Change.**

1. `public/runtime/demo-runtime.js` `onKeydown`, scripted mode only: forward `Tab` (with `shift`)
   and `Escape` as `key` messages, with `preventDefault()` in the frame as today. Hands-on mode
   is unchanged: Tab moves through the demo and leaves it at the end of its tab order, and Escape
   belongs to the demo (D1's dialog needs it).
2. `lib/engine/frame.ts`: pass `Tab` and `Escape` through `onKey` like any other forwarded key.
3. `components/stage/Stage.tsx` `dispatchKey`, for keys forwarded from a frame:
   - Reader mode, `Tab`: move focus to the next tabbable element after
     `iframe.page-frame__iframe` in document order. `Shift+Tab`: the previous one before it.
     The frame acts as one tab stop.
   - Reader mode, `Escape`: `focusStage()`.
   - Audience and speaker windows: ignore forwarded `Tab` and `Escape`. Focus stays where it is,
     so the clicker keeps working through forwarding.
   - Every forwarded key calls `wake()`, as today.
4. Reader mode: the frame's `tabIndex` is `-1` unless hands-on is on (P0-2, item 2). Keyboard users
   enter a demo with `h` from the stage, or the "Try the demo" toggle (P2-A11Y H1b).

**Acceptance.**

- From `/s/d1-used-to` and `/s/d2-now`, 30 presses of Tab reach `.reader-controls__button`, and 30
  presses of Shift+Tab reach the slide's first link or the stage. Also after a step has moved focus
  into the frame (`/s/d1-now?step=last`).
- After a forwarded Tab, the pill is visible (`data-idle="false"`).
- The audience walk's digests are unchanged on every step.

**Test.** `pnpm walk keys` (new, `scripts/walk-perf.mts`) covers the Tab checks. `pnpm walk` and
`pnpm walk --advance` cover digests and playback.

### P0-4. Keys act where the user means them (WS-1)

**Findings.** a11y M1: Space on a focused button moves the deck instead of pressing the button.
This hits the speaker window too: Space on its Previous button goes forward. Keys also act behind
the open help dialog. a11y H2: single-letter shortcuts fire from any focus in reader mode, and the
presenter-only ones (`s`, `t`, `b`, `.`, `d`, `g`) do things a reader never wants.

**Change.**

1. `lib/keys.ts`:
   - Add `isInteractiveTarget(target)`: true for `button`, `a[href]`, `[role="tab"]`, `summary`,
     `pre[tabindex]`, and any element inside an open `dialog`.
   - Split the map: `actionForKey(e, mode)`. Reader mode returns no action for `s`, `t`, `b`, `.`,
     `d` and `g`. Audience and speaker windows keep the full map.
   - `KEY_HELP` entries get `modes: Mode[]` (or `"presenter" | "reader" | "all"`). Add one reader
     entry, typed as written: keys `["Tab"]`, action "Move past the demo".
2. `components/stage/Stage.tsx` `onKey`:
   - Reader and speaker windows: Space and Enter on an `isInteractiveTarget` return without
     acting, so the browser presses the control. The audience window is unchanged: Space always
     advances there.
   - Reader mode: letter keys (`h`, `r`, `l`, `o`, `f`, `?`) act only when `e.target` is the stage
     canvas (`#stage`) or `document.body`. Arrows, PageUp, PageDown, Space, Backspace, Home and
     End keep working from anywhere except interactive targets (Space) and editable targets.
   - Inside an open `dialog.keyboard-help`, ignore every key except Escape, the way `isNavOpen()`
     already works.
   - Reader mode, keys forwarded from a frame: letters are ignored, navigation keys act.
3. `perform`: in reader mode, `open-speaker`, `toggle-timer`, `toggle-blank`, `toggle-rehearsal`
   and `goto` do nothing even if called.

**Acceptance.**

- Reader: Space on Previous goes back one step. Space on Keyboard help opens the help. Space on
  the help's Close closes it, and the deck does not move. ArrowRight with the help open does not
  move the deck.
- Speaker window: Space on its Previous button goes back. PageUp and PageDown work with focus on
  any speaker control.
- Reader: `s`, `o`, `d` and `h` pressed with focus on a pill button or a slide link do nothing.
  `h` with focus on the stage turns hands-on on.
- Audience: the walk's key matrix is unchanged: arrows, PageUp, PageDown, Space, `b`, `.`, `f`,
  F5, Escape, from the stage and from inside a frame.

**Test.** `pnpm walk keys` asserts each line above. `pnpm walk drawer` and `pnpm walk links` stay
green.

### P0-5. Caching that survives a Wi-Fi drop (WS-2)

**Finding** (platform 2, frontend P0-3). Everything under `public/` is
`public, max-age=0, must-revalidate`: a 304 round trip per file per load and per frame mount, 237
per deck walk. A warmed cache cannot serve a slide when the network drops. Frame build files are
`no-store` and go through a function on every mount.

**Change.** `next.config.ts` `headers()`, production builds only (`process.env.NODE_ENV ===
"production"`), so `pnpm dev` and the walks keep today's behaviour:

| Path | `Cache-Control` |
|---|---|
| `/backgrounds/v5/:path*` | `public, max-age=31536000, immutable` (folder-versioned) |
| `/intro`, `/posters`, `/images`, `/people`, `/logos`, `/demo-assets`, `/fonts`, `/qr`, `/theme`, `/runtime`, `/wrappers`, `/portal` (each `/:path*`) | `public, max-age=3600, stale-while-revalidate=86400` |
| `/og/:path*` | unchanged (default) |
| HTML and RSC | unchanged |

P1-CACHE adds the immutable rules for hashed and versioned files.

Why `stale-while-revalidate`: in Chrome, a cached file inside that window is used at once, and the
check runs in the background. If the check fails because the Wi-Fi dropped, the slide still has
its image. Why only an hour of `max-age`: unversioned files must pick up a deploy within an hour
without a manual cache clear.

**Acceptance.**

- On production, a second load of `/present?s=d1-now` within the hour makes 0 conditional requests
  for files under `public/` (304 count 0 in the CDP log).
- With the network cut after a warm walk (Playwright `context.setOffline(true)`), `/s/` slides
  visited in the warm walk still paint their background and intro still. Frames need the network;
  section 11 covers that case.
- `curl -sI` on one file per row of the table shows the header.

**Test.** `pnpm perf headers` (new, section 9.2) prints the header table for both origins.
`pnpm perf walk` reports the 304 count.

### P0-6. Talk-day safety: build ID, warm-up, freeze (WS-2)

**Change.**

1. `next.config.ts`: `env: { NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID ??
   process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev" }`. `/_health` then names the commit.
2. `scripts/warmup.mts` (new), `pnpm warmup [--origin=<presenter>] [--expect=<sha>]`:
   - `GET /_health`. Fail if the build ID differs from `--expect` (default `git rev-parse --short
     HEAD`).
   - `GET` `/`, every `/s/<id>`, `/present?s=<first>` and `/speaker?s=<first>`.
   - For each of the 25 framed pages: the frame document at its s0 URL, built the way
     `PageFrame` builds it (`frameUrl`, `frameQuery`, `glassFlags`), and every script, stylesheet
     and image that document references.
   - Every image, font and theme file the deck references, on the origin that loads it
     (backgrounds and fonts on both).
   - Print per class: count, failures, median and p95 TTFB, total bytes and the effective Mbit/s.
     Exit non-zero on any 4xx or 5xx, or a build mismatch.
   - It warms the CDN PoP and the functions. It cannot warm the browser; the checklist's warm
     walk does that.
3. `docs/deploy.md`: a "Talk day" section that holds section 11 of this PRD.
4. Settings (no code, recorded in `docs/deploy.md`): Skew Protection on if the plan has it.
   Record the rehearsed deployment's URL, so Instant Rollback can return to it.

**Acceptance.** `/_health` on production shows the 7-character commit. `pnpm warmup` finishes in
under 60 s on a 20 Mbit/s link with 0 failures. A second run reports frame documents at ≤ 150 ms
median TTFB from Toronto or the test location.

## 4. P1: bytes and load

### P1-IMG. A `pnpm images` pipeline (WS-3)

**Finding.** Images are 98% of the bytes: 40.3 MB per audience walk. Intro stills are 2x PNGs of up
to 3.95 MB shown at 832 px or less. Backgrounds download twice, once per origin. Slide 3's
portraits are 2.9 MB of PNG shown at 512 px.

**Change.**

1. `scripts/images.mts` (new), `pnpm images [--only=<glob>]`, sharp from Next's install. It reads
   masters where they are today and writes to `public/opt/<group>/<stem>-<w>.<hash8>.<ext>`.
   `hash8` is the first 8 hex characters of the SHA-256 of the output bytes. It also writes
   `content/.generated/images.json`, keyed by master path:
   `{ "w": 1920, "h": 1080, "sourceHash": "…", "avif": [{ "w": 1920, "src": "/opt/…" }], "webp": [...] }`.
   Outputs and manifest are committed, like `public/og/*`. A Vercel build never encodes.

   | Group | Masters | Output |
   |---|---|---|
   | Intro stills | `public/intro/*.png` (13) | AVIF q70 4:4:4 and WebP q85, at 416, 832 and 1664 w |
   | Backgrounds | `public/backgrounds/v5/*.jpg` (24) | AVIF at 1920 w. Quality per the projector check (decision D2). |
   | Posters | `public/posters/**/*.{jpg,png}` (126) | AVIF q70 4:4:4 at the captured size |
   | Slide 3 portraits | `public/images/design/*.png` (3) | AVIF q70 and WebP q85, at 512 and 1024 w |

   Per-file quality overrides live in a small table at the top of the script (for example a
   photographic still that shows banding gets q80).
2. `lib/assets.ts` (new, server-only). Every image URL the app renders comes from here:
   - `assetExists(publicPath)`: a lookup in `content/.generated/public-files.json`, the list of
     files under `public/intro`, `public/posters`, `public/images` and `public/opt`. It is written
     by `scripts/public-files.mts` (new) in `prebuild` and `predev`. In development it falls back
     to `existsSync` when the list is missing.
   - `introImage(master)`: `{ src, width, height, avifSrcSet, webpSrcSet }`.
   - `posterSrc(master)`: the AVIF for a master poster path, else the master.
   - `backgroundImage(id)`: `{ decodeUrl, css }`. `decodeUrl` is the AVIF (every stage and
     reader browser decodes AVIF). `css` is `image-set(url("<avif>") type("image/avif"),
     url("<jpg>") type("image/jpeg"))`.
   - `pictureSources(master)` for the portraits.

   **Day 0:** WS-3 lands a stub with this exact API that returns today's master paths. WS-1 and
   WS-4 code against it from the start.
3. `components/page/IntroSlide.tsx`: `<picture>` with an AVIF `<source>` and an `<img>` carrying
   the WebP `srcset`, `sizes="(min-width: 1920px) 832px, 44vw"`, and `width` and `height` from the
   manifest. Alt text unchanged. `styles/components/intro.css`: `height: auto` where the new
   attributes need it, so the box does not change.
4. `components/page/DemoPageSlide.tsx`: posters through `posterSrc`, existence through
   `assetExists`. No `existsSync` left.
5. `lib/images.ts`: `assetExists` in place of `existsSync`.
6. `public/demo-assets/**` (M1 `hiker-ridge.webp`, M2 trail photos, catalog): re-encode in place,
   same names and format (WebP), at twice their largest shown size in stage pixels. The aspect
   ratio must stay exact: pick a scale where both dimensions are integers with the same ratio, or
   keep the size and only lower the quality. Then run `pnpm capture m1 m2` and `pnpm visuals m1 m2`.
7. `components/layouts/glass/GlassSlide.tsx`: slide 3 portraits as `<picture>` from
   `pictureSources`, with `width={512} height={512}` as today.
8. Backgrounds in frames: `lib/validate/theme.ts` `backgroundsCss()` writes
   `--glass-frame-image: image-set(...)` from the manifest, so `pnpm theme:sync` puts it in
   `public/theme/backgrounds.css`. The frame uses the same 1920 file as the stage, which keeps the
   grain aligned one to one with stage pixels (`public/backgrounds/README.md`). The F2 apps keep
   their JPEG copy.
9. `scripts/capture.mts` and `scripts/visuals.mts`: run `pnpm images` for the sections they
   touched, at the end.
10. `lib/validate/assets.ts` (new), wired into `pnpm check` with one import line in
    `scripts/validate.mts`:
    - Every master has a manifest entry whose `sourceHash` matches. Failure message: "Images
      changed; run pnpm images".
    - Every manifest `src` exists.
    - `public-files.json` matches the disk.
    - Warning, an error under `--strict`: a page's posters are older than its frame inputs. The
      capture writes an input hash per page to `content/.generated/posters.json`.

Masters stay where they are, so `pnpm visuals`, `pnpm capture`, the walks and the OG hash (which
reads `title.jpg`) keep working. Pages no longer reference them.

**Acceptance.**

- Whole-deck audience walk ≤ 10 MB with q70 backgrounds, ≤ 7 MB if q55 passes the projector check
  (today 40.3 MB).
- Largest single image transferred in a walk ≤ 300 KB (today 3.95 MB).
- Cold `/s/m2-intro` ≤ 0.8 MB (4.52 MB). `/s/d1-intro` ≤ 0.7 MB (1.76 MB). `/present?s=d4-now`
  ≤ 1.2 MB (3.13 MB). `/speaker?s=d4-now` ≤ 1.2 MB (2.99 MB).
- CLS < 0.01 on warm and cold intro loads (today 0.08).
- The projector check (decision D2) is signed off in the PR.
- M1 and M2 walks pass with the re-encoded photos. Their recaptured posters and stills are
  committed.

**Test.** `pnpm images && pnpm validate`, `pnpm walk m1 m2 d1`, `pnpm perf walk` on production.
Before merge, compare old and new for 4 stills, 4 backgrounds and 4 posters at 1920 by 1080 on a
1080p display. Use `img-out/` in the review's scratch folder as the starting set.

### P1-CACHE. Immutable for what is versioned (WS-2)

**Change.**

1. `next.config.ts`, production only, added to P0-5's table:

   | Path | `Cache-Control` |
   |---|---|
   | `/opt/:path*` | `public, max-age=31536000, immutable`, plus the cross-origin asset headers |
   | `/fonts/v2/:path*` | `public, max-age=31536000, immutable` |
   | `/theme/:path*`, `/runtime/:path*`, `/wrappers/:path*`, `/portal/:path*` with `has: [{ type: "query", key: "v" }]` | `public, max-age=31536000, immutable` |

2. `scripts/asset-versions.mts` (new), in `prebuild` after `theme:sync`: writes
   `content/.generated/asset-versions.json`, the first 8 hex of the SHA-256 of each file under
   `public/theme`, `public/runtime`, `public/wrappers` and `public/portal`. Add it to
   `runtimeSources` in `next.config.ts`.
3. `lib/frames/compose.ts`: in production, every link and script the shell writes to those
   folders carries `?v=<hash>`. In development, no `?v`, so the non-immutable rule applies.
   Shown markup is never rewritten.
4. Versioned folders are write-once. `scripts/images.mts` and `scripts/fonts.mts` refuse to
   overwrite an existing versioned file with different bytes.

**Acceptance.** On a warm deck walk, 0 requests of any kind for `/opt`, `/fonts/v2` and versioned
theme files after their first use. A deploy that changes `portal-glass.css` reaches a fresh frame
mount without a cache clear.

### P1-FRAMEFILES. Frame build files from the CDN (WS-2)

**Change.**

- `lib/frames/compose.ts` `buildFile()`: `Cache-Control: public, max-age=300,
  stale-while-revalidate=86400` and `Vercel-CDN-Cache-Control: public, max-age=31536000`. Each
  deployment starts with an empty CDN cache, and these files are fixed per deployment.
- Audit the other frame file routes (`app/app.js`, `app/app.css`, `app/vendor/[...path]`, the static
  files under `app/demo/[...path]`). Static files get the same headers. Anything that returns
  state stays `no-store`: logs, `/api`, `/orders`, `/cases`, `/cms`. List each route and its
  header in the PR.
- Composed documents (`frameResponse`, `lib/frames/inner.ts`) stay `no-store` in the browser and
  on the CDN. They depend on flags, the host, the CSP and, for M5, per-instance state.

**Acceptance.** Step Back replay ≤ 300 ms median and ≤ 400 ms p90 on D1, D4, M2 and D5 (today 230 to
580 ms). Each frame mount makes one function request: the document. Key to frame s0 done, audience,
≤ 300 ms median and ≤ 450 ms p90 (today 250 to 350, p90 520).

### P1-READ. Reader mode loads ahead (WS-4)

**Finding.** Reader mode does not decode the next background, so each section change paints first
and its background arrives 130 to 630 ms later. The slide's own background is an LCP image that is
found only after the CSS.

**Change.**

1. `components/stage/SlidePage.tsx`:
   - `publicFile` becomes `assetExists`. Image URLs come from `lib/assets.ts`.
   - Reader mode gets neighbour assets like the audience window: the next slide's first image.
   - Audience and reader: when `prevHasSteps`, also the previous page's last-step poster (Back
     lands there).
   - `preload(backgroundImage(slide.background).decodeUrl, { as: "image", type: "image/avif",
     fetchPriority: "high" })` from `react-dom` for the slide's own background.
   - Pass `backgroundCss` (the `image-set()` string) and `neighbourBackgrounds` as decode URLs
     to `Stage`.
2. `components/stage/Stage.tsx` (after WS-1 merges, these lines only):
   - The neighbour-background effect runs for `reader` as well as `audience`.
   - `--slide-bg-image` takes the `backgroundCss` prop. `data-background` keeps the plain URL the
     walk reads.

**Acceptance.** Reader, key to background shown on a section change ≤ 60 ms p90 (today 130 to 630 ms
cold). The next intro still is decoded ≤ 50 ms after the press in reader mode. Lighthouse desktop
LCP ≤ 1.2 s on every sampled page (today 0.75 to 1.48 s, and 3.93 s on `/s/m2-intro`). Current-slide
LCP does not get worse from the neighbour preload hints; if it does, drop `fetchPriority` and
re-measure.

### P1-FONTS. WOFF2 subsets, preloaded (WS-4)

**Change.**

1. `scripts/fonts.mts` (new, `pnpm fonts`): from the OTF and TTF masters in `public/fonts/`, write
   `public/fonts/v2/<name>.latin.woff2`. Use `subset-font` or `pyftsubset --flavor=woff2`; WS-4
   picks one and pins it. Range: Basic Latin, Latin-1 Supplement, General Punctuation, Arrows,
   `€`, `™`, `−`, plus every character the deck uses. The script scans slide content, notes, demo
   files and fixtures, and fails if a character is missing from the subset.
2. `styles/fonts.css` and `styles/glass-tokens.css` (the frames' faces): `src` points to the WOFF2
   files with `format("woff2")`. `font-display: swap` stays.
3. `app/layout.tsx`: preload the weights the first paint of `/s/title` and a walk page uses, two at
   most (expected: Slalom Sans Regular and Bold), with `<link rel="preload" as="font"
   type="font/woff2" crossOrigin="anonymous">`.
4. Frame shell: the same preload for Regular in `lib/frames/compose.ts` (handoff to WS-2, one
   line).
5. Leave the OTF masters in place. The F2 apps keep their OTF copies (`FONTS` in
   `lib/validate/theme.ts` is unchanged), and the OG hash still reads the OTFs. The glyph outlines
   are identical, so the cover renders the same.

**Acceptance.** Fonts on the first walk page ≤ 60 KB over both origins (today 152 KB). Fonts start
at HTML parse, not after the CSS (Lighthouse network waterfall). No missing glyph across a full
walk: the script's check passes, and a visual pass over slides 1 to 7 and 48 to 50 shows no
fallback face.

### P1-PRERENDER. `/present` and `/speaker` from the CDN (WS-2)

**Finding.** Both routes are `force-dynamic` only to read `?s=`. Each open, reload and full prefetch
runs a function: 130 to 215 ms warm, 1.37 s cold.

**Change.**

1. **Spike first (half a day).** Build locally with production origins (`docs/deploy.md`, port 3200)
   and prove that `router.replace("/present?s=<id>")`, the full prefetch, `?step=`, `?glass=off`,
   `?capture=1`, `?fade=` and `?rehearse=1` all behave under the rewrite. If any fails, stop and
   write down why. The routes stay dynamic until after the talk.
2. `app/present/[id]/page.tsx` and `app/speaker/[id]/page.tsx` (new): `generateStaticParams()` over
   `slides`, with today's bodies using `params.id` in place of `searchParams.s`. An unknown id
   renders `slides[0]`, as today (`dynamicParams` stays true). Then `app/present/page.tsx` and
   `app/speaker/page.tsx` are removed, or kept as thin redirects if the rewrite needs them.
3. `next.config.ts` `rewrites()`: `/present` with `has: [{ type: "query", key: "s", value:
   "(?<s>[a-z0-9-]+)" }]` to `/present/:s`, the same for `/speaker`, and bare `/present` and
   `/speaker` to `slides[0]`. The address bar keeps `?s=` URLs; `lib/presenter/url.ts` does not
   change.
4. Titles (a11y L4 and L7, done here because the metadata lives here): `generateMetadata` sets
   `Speaker · ${slideTitle} (${n}/${total}) · ${deck.title}` and `Audience · ${slideTitle} ·
   ${deck.title}`. The App Router updates `document.title` on each navigation. This also ships if
   the prerender does not.
5. `/speaker` merges only after the speaker-view PRD reads `?rehearse=` on the client
   (section 7.2). `/present` does not wait for it.

**Acceptance.** `curl -sI "/present?s=d4-now"` shows a CDN hit (`x-vercel-cache: HIT` or
`PRERENDER`) at ≤ 100 ms server wait. The same for `/speaker`. The two-window sync, `pnpm walk`,
`pnpm walk --advance`, `pnpm walk transitions --fade=1`, `pnpm walk drawer` and `pnpm capture` are
green against a production build. A typed `?s=` URL still wins over peer state on a navigate load.
A reload resumes.

### P1-FUNC. Smaller functions (WS-2)

**Change.** Once WS-3 and WS-4 have removed every `existsSync` on `public/` (`SlidePage`,
`IntroSlide`, `DemoPageSlide`, `lib/images.ts`), remove `checkedPublic` from
`outputFileTracingIncludes`. Add `content/.generated/public-files.json`,
`content/.generated/images.json` and `content/.generated/asset-versions.json` to `runtimeSources`.

**Acceptance.** Page functions ≤ 16 MB (about 52 MB today, inferred from the repo). Measured by
`pnpm perf functions` (sums the unique traced files in `.next/server/**/*.nft.json` per route), then
confirmed with `vercel inspect <deployment>` once `vercel login` works.

## 5. P2: measurement, accessibility Mediums and Lows, text view

P2 lands after the talk, unless an item is merged and rehearsed before the freeze. CSS-only
accessibility fixes (M4, M5, L2) are the likely exceptions.

### P2-SI. Speed Insights on reader pages (WS-2)

- `pnpm add @vercel/speed-insights`. In `components/presenter/SiteAnalytics.tsx`, render
  `<SpeedInsights />` next to `<Analytics />` under the same `tracked()` guard. It does not render
  at all when `location.pathname` starts with `/present` or `/speaker`, so the stage windows never
  load the script. Frames never load a layout.
- **Acceptance.** No request to `/_vercel/speed-insights/*` from `/present`, `/speaker` or any
  frame. Requests from `/` and `/s/*`. Field targets once data exists: LCP p75 ≤ 2.5 s, INP p75 ≤
  200 ms and CLS p75 < 0.1 on mobile.

### P2-REGION. Functions in `yul1` (WS-2)

- `vercel.json`: `{ "regions": ["yul1"] }`. Confirm the region in the dashboard's list and its
  price first. Only before the final rehearsal; otherwise skip until after the talk.
- **Acceptance.** `x-vercel-id` on a frame document names `yul1`. `pnpm warmup` passes.

### P2-SCALE. The stage paints at its final scale (WS-4)

- `styles/components/stage.css`: default `--stage-scale: min(tan(atan2(100vw, 1920px)),
  tan(atan2(100dvh, 1080px)))`. The embedded speaker previews use container units against their
  box.
- `components/stage/Stage.tsx` (after WS-1): `useState<number | null>`. Write the inline
  `--stage-scale` only after the first measurement, so the server HTML uses the CSS value.
  `lastScale` behaviour stays.
- **Acceptance.** First load at 1440 by 900 and 1280 by 720: the first paint is already at the final
  scale (no cropped frame, no zoom). 1920 by 1080 unchanged. The r7 fade shows no zoom.

### P2-A11Y. Accessibility Mediums and Lows (WS-5)

| ID | Fix | Files |
|---|---|---|
| H1b | A "Try the demo" toggle in the reader pill on framed pages. `aria-pressed`, bound to `toggle-hands-on`. | `components/chrome/ReaderControls.tsx`, `styles/components/reader-controls.css` |
| H3 | APG tabs on the code panel: ArrowLeft, ArrowRight, Home and End on the `tablist` with `stopPropagation()`. Each tab gets an `id` and `aria-controls`. The `<pre>` gets `role="tabpanel"` and `aria-labelledby`. Only where the panel is interactive (reader). | `components/page/PageCodePanel.tsx` |
| M2 | Focus survives a slide change. Before `go()`, record which pill button had focus (`data-control="prev"`, `"next"`, `"sections"`, `"help"`, `"demo"`, `"text"`). The new stage refocuses the same button on mount, as `focusOnArrival` does for the drawer. | `lib/focus-restore.ts` (new), `components/chrome/ReaderControls.tsx`, two lines in `Stage.tsx` |
| M3 | One persistent polite announcer: a single `div[aria-live="polite"]` that `lib/announce.ts` appends to `body` once and reuses. Slide titles are no longer announced; Next's route announcer does that. On a step change, announce `Step ${n} of ${count}: ${label}`, then the M6 sentence when there is one. Remove `.stage__announcer`. | `lib/announce.ts` (new), lines in `Stage.tsx` |
| M4 | Pill focus ring: `outline: 2px solid var(--glass-dark-focus); outline-offset: -2px`. `Highlight` under `forced-colors`. Target ≥ 3:1 against the pill. | `styles/components/reader-controls.css` |
| M5 | Raise `--chrome-code-dim-opacity` from 0.55 to the lowest value that keeps the lightest token at 4.5:1 over the code card (expected 0.75 to 0.8). The highlight band and bar carry the emphasis. `scripts/contrast-test.mts` checks the dimmed state. | value handed to WS-4 for `styles/glass-tokens.css`; `scripts/contrast-test.mts` |
| M6 | Highlighted lines: a visually hidden sentence the `<pre>` points to with `aria-describedby`, for example "Lines 12 to 16 of styles.css are highlighted." For `code.off`, a visually hidden " (turned off in this step)" after the file name. | `components/page/PageCodePanel.tsx` |
| L1 | Closing slide: `<h1 className="visually-hidden">{slide.title}</h1>`. | `components/layouts/glass/GlassClosing.tsx` |
| L2 | Slide link and code focus rings keep their size: `outline-width: calc(3px / var(--stage-scale)); outline-offset: calc(4px / var(--stage-scale))`. | `styles/components/slides-glass.css`, `styles/components/code.css` |
| L3 | Footer number: `<span className="visually-hidden">, slide </span>` before `.sg-pill__num`. | handed to WS-3 for `GlassSlide.tsx` |
| L4 | Speaker window semantics. | speaker-view PRD (section 7.2); titles in P1-PRERENDER item 4 |
| L5 | Terminal frame: `.term__scroll` gets `tabindex="0"`, `role="region"` and `aria-label="Terminal output"`, only if guardrail 2.1 allows. `pnpm axe` replays to the last step before scanning. | `demos/07-package-workflow/terminal/index.html`, `scripts/axe-frames.mts` |
| L6 | Pill over content in mobile landscape: solved by the text view's automatic rule (`max-height: 500px`). | none |
| L7 | The help lists only the keys that work in the current mode (`KEY_HELP.modes`, P0-4). | `components/chrome/KeyboardHelp.tsx` |

Copy, as written: "Try the demo", "Text view", "Step 2 of 4: CSS" (the label comes from content),
"Lines 12 to 16 of styles.css are highlighted.", " (turned off in this step)", ", slide ",
"Terminal output", "Move past the demo".

**Acceptance.**

- Lighthouse accessibility 100 on `/`, `/s/title`, `/s/d1-used-to`, `/s/d1-now`, `/s/m2-intro`,
  `/s/people-to-follow` and `/s/closing`.
- axe stays at 0 violations, frames included at their last step.
- `pnpm walk a11y` (new, `scripts/walk-a11y.mts`):
  - Tab reaches every code tab, and ArrowRight on a tab changes the file without moving the deck.
  - Enter on Next keeps focus on Next across 5 slides.
  - A step change mutates the announcer once with the step sentence.
  - A slide change does not write the title into the deck's announcer.
  - The pill ring measures ≥ 3:1. Dimmed code passes 4.5:1 in `pnpm test:contrast`.
  - `/s/closing` has one h1.

### P2-TEXT. A text view for small screens (WS-5)

**Decision.** H4 (text can't be resized; 4 px text on phones) is real for the public, not for the
stage. The stage keeps its fixed canvas. Readers get a reflowing text view instead.

- `components/page/ReadingView.tsx` (new), rendered by `app/s/[id]/page.tsx` next to `SlidePage`.
  It contains, as normal HTML at real sizes:
  - The slide's title, eyebrow, body, cards, quotes, people and links.
  - Intro pages: the description, the support sentence and the still.
  - Walk pages: each step as a list item with its label, the step's poster (alt "Captured still of
    the live demo: <step label>"), the files with the highlighted lines marked, and the M6
    sentence.
  - The speaker notes' bullets under a "Speaker notes" heading. They are already readable at the
    public `/speaker` URL, so this exposes nothing new. The speaker can veto it.
- `styles/components/reading-view.css` (new): the view shows and the stage hides under
  `(max-width: 900px), (max-height: 500px)`, or when `html[data-text-view="on"]` is set.
- The "Text view" toggle in the pill (`aria-pressed`) sets the attribute and keeps it in
  `sessionStorage`.
- `PageFrame` (WS-1's file, a handoff after P0) does not mount a frame while the stage is hidden
  (`checkVisibility()` at mount, then a `ResizeObserver`). Phones in text view download no demo
  frames.
- Not in the audience or speaker windows. Not in captures.

**Acceptance.** At 390 by 844 and 320 by 568, body text ≥ 16 CSS px, no horizontal scroll except
inside code blocks, and 200% zoom reflows. axe 0 violations in text view. No frame request in text
view. The toggle works with the keyboard. The audience walk is byte for byte unchanged.

## 6. Decision records

### D1. Cache strategy

| Option | Verdict |
|---|---|
| Short `max-age` plus `stale-while-revalidate` everywhere | Simple, but every deploy risks a day of stale images, and nothing is ever immutable. |
| Content hashes plus `immutable` everywhere | Best caching, but shown code names `public/demo-assets` files, and the presenter's CSS names `grain.png`. Those names can't change. |
| **Hybrid (chosen)** | Generated images are content-hashed under `/opt`. Fonts and backgrounds are folder-versioned (`v2`, `v5`). Frame shell files carry `?v=<content hash>`. Each is `immutable` for a year. The few unversioned files get `max-age=3600, stale-while-revalidate=86400`. |

How assets get versioned: `pnpm images` names outputs by content hash and writes the manifest the
code reads. `scripts/asset-versions.mts` hashes the theme, runtime, wrapper and portal files at
build. Folder versions are bumped by hand, and the scripts refuse to overwrite a versioned file.
HTML and RSC stay `must-revalidate`, so a deploy shows on the next load.

### D2. Image quality and grain

- Stills and posters: AVIF q70, 4:4:4. The trials put UI stills at 40 to 46 dB PSNR and the
  photographic stills (M1, M2) at 36 to 37 dB. Text stays sharp at 4:4:4.
- Backgrounds keep their baked grain. Dropping it would change the reader view and the frames,
  which have no grain overlay (`grain.png` draws only in the audience window). That is a design
  change, not a perf change.
- Default background encode: AVIF q70 4:4:4 (42% of today's bytes, grain-safe).
- **Projector check** (WS-3, with the speaker or the design agent): show q70 4:4:4, q55 4:2:0 and
  today's JPEG for `title`, `d1`, `m2` and `c2`, full screen, from 3 m. Ship q55 only if nobody can
  pick it out. Also check two UI stills (D1, D5) and the two photographic stills (M1, M2) at q70.
  Use a 1920 by 1080 display if the venue projector is not available before the freeze.

### D3. Prerender `/present` and `/speaker`

Yes, if the spike passes. Both windows then come from the CDN, need no function and see no cold
start. Every neighbour prefetch during the talk becomes a CDN hit. Risks: the rewrite and the
App Router's client navigation, and `?rehearse=` read on the server. The spike and the speaker-view
handoff contain them. Deadline: merged and rehearsed by T minus 72 hours, or deferred until after
the talk. The warm-up script covers the cold start either way.

### D4. Speed Insights

Add it, free tier, reader pages only. It is the only view of real phones on venue and cellular
networks, and it costs nothing on the stage windows because they never load it. Plus adds per-route
LCP, INP and CLS for $10 per project per month. That is open question 4.

### D5. Function region

`yul1`, P2. It saves about 10 ms per function request from Toronto. After P1-FRAMEFILES there is one
function request per frame mount, so the gain is small. Ship it only before the final rehearsal.

### D6. Warm-up script

Yes (P0-6). It warms the PoP and the functions, doubles as a Wi-Fi check, and proves the build ID.
It does not replace the browser warm walk, because the browser cache is per profile and
partitioned per site.

### D7. Deploy freeze

- Code freeze for P1 and P2 at T minus 72 hours. After that only P0 fixes and stage bugs merge.
- Final rehearsal on production at T minus 48 to 24 hours, on the exact deployment.
- Deploy freeze from T minus 24 hours: nothing is pushed to `main`, and work goes to branches
  (previews only).
- An emergency deploy reruns the whole checklist in section 11. That includes clearing the talk
  profile's cached images and files, because `stale-while-revalidate` can serve one stale copy.
- Instant Rollback targets the rehearsed deployment.

### D8. Text view scope

In scope, P2, after the talk unless it is merged and rehearsed earlier. No interim zoom hack: the
stage's scaling must never react to zoom in the audience window.

## 7. Workstreams

Each file has one owner. A workstream that needs a line in another's file sends the exact diff to
the owner, who applies it. `Stage.tsx` is the one shared hot file. WS-1 owns it. After WS-1's P0
merge, WS-4 and then WS-5 may edit only the lines their sections name, and WS-1 reviews.

| WS | Priority | Scope | Files owned |
|---|---|---|---|
| **WS-1 Stage focus and playback** | P0 | P0-1, P0-2, P0-3, P0-4. New walk checks `focus`, `underlay`, `keys`. Applies the P2-TEXT `PageFrame` handoff after P0. | `components/page/FrameWarm.tsx`, `components/page/PageFrame.tsx`, `components/page/PageBody.tsx`, `components/stage/Stage.tsx`, `lib/keys.ts`, `lib/engine/*`, `lib/stage-context.tsx`, `public/runtime/demo-runtime.js`, `styles/components/page.css`, `scripts/walk-perf.mts` (new), `scripts/walk-demos.mts` (dispatcher lines) |
| **WS-2 Caching and delivery** | P0, P1, P2 | P0-5, P0-6, P1-CACHE, P1-FRAMEFILES, P1-PRERENDER, P1-FUNC, P2-SI, P2-REGION. Measurement scripts (section 9.2). | `next.config.ts`, `vercel.json` (new), `package.json`, `lib/frames/compose.ts`, `lib/frames/inner.ts`, `app/app.js/**`, `app/app.css/**`, `app/vendor/**`, `app/demo/**` (headers only), `app/present/**`, `app/speaker/**` (routes and metadata, see 7.2), `app/%5Fhealth/route.ts`, `components/presenter/SiteAnalytics.tsx`, `scripts/warmup.mts` (new), `scripts/asset-versions.mts` (new), `scripts/perf/**` (new), `docs/deploy.md`, `docs/perf/results/**` (new) |
| **WS-3 Images** | P1 | P1-IMG, the projector check, the poster freshness rule. Applies the L3 handoff. | `scripts/images.mts` (new), `scripts/public-files.mts` (new), `lib/assets.ts` (new), `lib/images.ts`, `lib/validate/assets.ts` (new), `scripts/validate.mts` (import line), `lib/validate/theme.ts`, `scripts/theme.mts`, `components/page/IntroSlide.tsx`, `components/page/DemoPageSlide.tsx`, `components/layouts/glass/GlassSlide.tsx`, `styles/components/intro.css`, `scripts/capture.mts`, `scripts/visuals.mts`, `scripts/og.mts` (only if the hash inputs must change), `public/opt/**` (new), `public/demo-assets/**`, `public/posters/**`, `public/intro/**`, `content/.generated/images.json` (new), `content/.generated/posters.json` (new), `content/.generated/public-files.json` (new, generated) |
| **WS-4 Reader loading and fonts** | P1, P2 | P1-READ, P1-FONTS, P2-SCALE. Applies the M5 value handoff. | `components/stage/SlidePage.tsx`, `app/layout.tsx`, `styles/fonts.css`, `styles/glass-tokens.css`, `styles/components/stage.css`, `scripts/fonts.mts` (new), `public/fonts/**`; `Stage.tsx` lines per P1-READ and P2-SCALE after WS-1 |
| **WS-5 Accessibility** | P2 | P2-A11Y, P2-TEXT. | `components/page/PageCodePanel.tsx`, `components/chrome/ReaderControls.tsx`, `components/chrome/KeyboardHelp.tsx`, `components/layouts/glass/GlassClosing.tsx`, `components/page/ReadingView.tsx` (new), `app/s/[id]/page.tsx`, `lib/announce.ts` (new), `lib/focus-restore.ts` (new), `styles/app.css`, `styles/components/code.css`, `styles/components/reader-controls.css`, `styles/components/keyboard-help.css`, `styles/components/slides-glass.css`, `styles/components/reading-view.css` (new), `scripts/axe-frames.mts`, `scripts/contrast-test.mts`, `scripts/walk-a11y.mts` (new), `demos/07-package-workflow/terminal/{index.html,player.css}` (guardrail 2.1); `Stage.tsx` lines per M2 and M3 after WS-4 |

### 7.1 Handoffs

- **WS-3 to all, day 0:** `lib/assets.ts` stub with the final API, returning today's paths.
- **WS-3 to WS-2:** `package.json` lines `"images"` and `"prebuild"`/`"predev"` additions for
  `public-files.mts`. WS-4 sends `"fonts"`. WS-2 owns `package.json` and applies them.
- **WS-4 to WS-2:** the frame shell font preload line in `lib/frames/compose.ts`.
- **WS-5 to WS-4:** the measured `--chrome-code-dim-opacity` value for `styles/glass-tokens.css`.
- **WS-5 to WS-3:** the L3 footer span in `GlassSlide.tsx`. It may trip the OG hash. If so, WS-3
  runs `pnpm og` in the same PR.
- **WS-5 to WS-1:** the `walk a11y` dispatcher line in `scripts/walk-demos.mts`, and the
  `PageFrame` visibility check for P2-TEXT.
- **WS-1 to WS-5:** `KEY_HELP.modes` and the reader help entry land in WS-1's P0-4. WS-5 renders the
  filtered list.
- **WS-2 to everyone:** the ported measurement scripts and the baseline, day 0 (section 9.2).

### 7.2 Coordination with the speaker-view PRD

This PRD does not touch `components/presenter/SpeakerView.tsx`, the speaker's notes, reference and
controls components, or `styles/components/speaker.css`.

| Item | Who |
|---|---|
| a11y L4: a `main` landmark, one h1, the next preview `inert` (which also removes the duplicate "Code" region from the tree), new-tab text on the notes links | speaker-view PRD |
| `document.title` per slide | this PRD (WS-2, `generateMetadata`). The speaker-view PRD should not set `document.title` itself. |
| Read `?rehearse=1` on the client (`window.location.search` in an effect) instead of as a prop from the page | speaker-view PRD. A prerequisite for the `/speaker` prerender. |
| Space on speaker buttons | this PRD (WS-1, `Stage.tsx`). New speaker key handlers should call `isInteractiveTarget` from `lib/keys.ts` and not handle Space themselves. |
| Poster and preview image URLs | Any new image use goes through `lib/assets.ts`. |
| `app/speaker/**` | WS-2 owns the route files. If the speaker-view PRD changes `SpeakerView`'s props, it lands first, and WS-2 rebases the `[id]` route on it. |

## 8. Order, parallelism and merge groups

1. **Day 0 (parallel, hours).**
   - WS-2 copies the review scripts into `scripts/perf/` and records the baseline on production
     (section 9.2). This is urgent: the scripts and results today live only in a temporary scratch
     folder.
   - WS-3 lands the `lib/assets.ts` stub.
2. **P0 (parallel).** WS-1 and WS-2's P0-5 and P0-6 touch disjoint files and merge independently,
   WS-1 first. Inside WS-1, the runtime's Tab and Escape forwarding and `Stage.tsx`'s handling
   must be in the same merge. Deploy, run `pnpm perf`, and do a clicker rehearsal on production.
3. **P1 (parallel).** WS-3, WS-4 and WS-2's P1 items.
   - WS-4's `Stage.tsx` lines wait for WS-1's merge.
   - WS-2's `/opt` immutable rule merges before or with WS-3, so the new files are never served
     with the hour-long default.
   - **Merge together:** WS-4's font switch (`fonts.css`, `glass-tokens.css`, layout preload) with
     WS-2's frame shell preload line.
   - **Merge after:** P1-FUNC's removal of `checkedPublic` comes after the last `existsSync` on
     `public/` is gone (WS-3 and WS-4).
   - **Merge together:** the `/speaker` prerender with the speaker-view PRD's client-side
     `rehearse`.
   - Projector check before WS-3 merges the backgrounds.
4. **Integration.** WebKit and Firefox walks, `pnpm walk --advance`, `transitions --fade=1`, axe,
   `pnpm capture`, `pnpm images`, `pnpm og` if tripped. Deploy, then run `pnpm perf` against the
   section 9 targets.
5. **Code freeze (T minus 72 hours), final rehearsal, deploy freeze (T minus 24 hours).**
6. **P2 after the talk:** WS-5 (except CSS-only items already rehearsed), P2-SI, P2-SCALE,
   P2-TEXT. P2-REGION only before the final rehearsal.

Effort: WS-1 about 2 days. WS-2 about half a day for P0 and 1.5 days for P1. WS-3 2 to 3 days with
the projector check. WS-4 about 1.5 days. WS-5 about 3 days with the text view.

## 9. Measurement plan

### 9.1 Before and target

"Before" is from the reviews (production, `cb8e46c`, Playwright Chromium 1920 by 1080 DPR 1;
`venue` is CDP throttling at 20 Mbit/s down, 5 up, 60 ms RTT). Targets hold on the `venue` profile
unless noted.

| Metric | Before | Target | Gate |
|---|---|---|---|
| Clicker presses lost after landing on an intro | every press 0.6 to 1.25 s after arrival; every press after 2.2 s on a slow warm-up | 0 of 216 | P0-1 |
| Key to frame content visible (poster or live), audience | 270 to 420 ms median, about 1 s p90 | ≤ 100 ms p90 | P0-2 |
| Key to frame content visible, reader | same | ≤ 100 ms p90 after P1-READ | P1-READ |
| Key to new canvas painted, both windows | 20 to 50 ms median, 60 ms p90 | ≤ 60 ms p90 (keep) | all |
| Key to frame s0 done, audience | 250 to 350 ms median, 520 ms p90 | ≤ 300 ms median, ≤ 450 ms p90 | P1-FRAMEFILES |
| Step Back replay (D1, D4, M2, D5) | 230 to 580 ms | ≤ 300 ms median, ≤ 400 ms p90 | P1-FRAMEFILES |
| Key to background shown, reader section change | 130 to 630 ms cold, 50 to 100 ms rehearsed | ≤ 60 ms p90 | P1-READ |
| 304 revalidations, warm deck walk (static assets and build files) | 237 per walk; 6 to 21 per page load | 0 | P0-5, P1-CACHE |
| Bytes, whole-deck audience walk (cold) | 40.3 MB, 771 requests | ≤ 10 MB (q70 backgrounds), stretch ≤ 7 MB | P1-IMG |
| Bytes, whole-deck reader walk (cold) | 38.7 MB | ≤ 10 MB | P1-IMG |
| Largest single image | 3.95 MB | ≤ 300 KB | P1-IMG |
| Cold `/s/m2-intro` / `/s/d1-intro` / `/present?s=d4-now` / `/speaker?s=d4-now` | 4.52 / 1.76 / 3.13 / 2.99 MB | ≤ 0.8 / 0.7 / 1.2 / 1.2 MB | P1-IMG |
| Fonts, first walk page, both origins | 152 KB | ≤ 60 KB | P1-FONTS |
| Lighthouse desktop LCP, sampled pages | 0.75 to 1.48 s; `/s/m2-intro` 3.93 s | ≤ 1.2 s each | P1-IMG, P1-READ |
| Lighthouse mobile LCP (default throttling) `/s/title`, `/s/d1-intro`, `/s/m2-intro`, `/s/d1-now` | not measured; baseline on day 0 | ≤ 2.5 s each | P1-IMG, P1-READ |
| Lighthouse desktop performance score | 80 to 100 (`/s/m2-intro` 80) | ≥ 95 on every sampled page | P1 |
| CLS | 0.08 on warm intro loads | < 0.01 | P1-IMG |
| `/present` and `/speaker` server wait | 130 to 215 ms warm, 1,372 ms cold | ≤ 100 ms (CDN hit) | P1-PRERENDER |
| Page function size | about 52 MB (inferred) | ≤ 16 MB | P1-FUNC |
| Lighthouse accessibility | not measured; axe 0 violations | 100 on the 7 sampled pages | P2-A11Y |
| axe (`pnpm axe`, `pnpm axe --presenter`) | 0 violations, except `/speaker` | 0, including `/speaker` after the speaker-view PRD | all |
| Keyboard contract (`pnpm walk keys`, `pnpm walk a11y`) | H1, H2, H3, M1 to M3 fail | all pass | P0-3, P0-4, P2-A11Y |

Sampled Lighthouse pages: `/`, `/s/title`, `/s/d1-now`, `/s/m2-now`, `/s/m2-intro`,
`/s/people-to-follow` and `/present?s=d4-now`.

### 9.2 Tooling (WS-2, day 0)

Copy the review's scripts from the session scratch folder into the repo before it is cleaned up:
`/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/perf/`
(`lib.mjs`, `load.mjs`, `nav.mjs`, `frame.mjs`, `deckwalk.mjs`, `scale.mjs`, `images.mjs`,
`shots.mjs`, `summarize-nav.mjs`, `probe3*.mjs`, `results/`, `img-out/`) and `.../scratchpad/a11y/`
plus `.../scratchpad/scripts/` (`axe-all.mjs`, `kbd*.mjs`, `contrast.mjs`, `zoom.mjs`, `ax.mjs`).
Port them to `scripts/perf/*.mts` and `pnpm perf <task> [--origin=<url>] [--profile=none|venue|poor]`:

| Task | Measures |
|---|---|
| `pnpm perf load` | First-load table (TTFB, FCP, LCP, CLS, hydration, frame s0, requests, bytes, 304s), cold and warm |
| `pnpm perf nav` | Key to paint, background, still, s0, both windows, with the prefetch on and blocked |
| `pnpm perf frame` | Step Back replays and requests per mount |
| `pnpm perf walk` | Whole-deck bytes, requests and 304s, audience and reader, cold then warm |
| `pnpm perf headers` | `cache-control`, `x-vercel-cache` and `x-vercel-id` for one file per header rule, both origins |
| `pnpm perf lighthouse` | Desktop and mobile, performance and accessibility, for the sampled pages |
| `pnpm perf functions` | Traced size per route from `.next/server/**/*.nft.json` |

Add a `poor` profile: 5 Mbit/s down, 1 up, 150 ms RTT. The P0-1 and P0-2 checks also run under it.

Each run writes `docs/perf/results/<date>-<commit>-<task>.json` and prints a markdown table. Each PR
pastes the before and after rows it moves.

### 9.3 Re-measuring production after a deploy

1. `curl -s https://2026-advances-in-the-web.vercel.app/_health`: the build ID is the merged commit.
2. `pnpm perf headers`, then `pnpm warmup` (both green).
3. `pnpm perf load --profile=venue`, `pnpm perf nav --profile=venue`, `pnpm perf frame`,
   `pnpm perf walk`, `pnpm perf lighthouse`.
4. `pnpm walk focus --origin=<production>` and `pnpm walk underlay --origin=<production>`. These two
   also run against production; everything else in `pnpm walk` stays on `pnpm dev`.
5. Compare with section 9.1. A missed P0 target blocks the freeze. A missed P1 target is fixed or
   reverted before the code freeze.
6. Once Speed Insights has data (P2-SI), check the field numbers by route a week after the talk.

## 10. Test plan

| Command | New or changed |
|---|---|
| `pnpm walk focus` | P0-1: presses on 12 intro slides at 6 delays and 3 warm-up delays; `activeElement` never the warm frame. Also `--origin`. |
| `pnpm walk underlay` | P0-2: slot samples after the press, the swap diff, forward and Back arrivals. Also `--origin`. |
| `pnpm walk keys` | P0-3 and P0-4: Tab out of frames, Space on controls in reader and speaker windows, reader letter scoping, the audience key matrix. |
| `pnpm walk a11y` | P2-A11Y: code tabs, focus after a slide change, announcements, closing h1, ring contrast. |
| `pnpm validate` | `lib/validate/assets.ts` (images manifest, public files list, poster freshness), the fonts subset check, the dimmed contrast in `test:contrast`. |
| `pnpm axe` | Frames at their last step too (L5). |
| `pnpm capture`, `pnpm visuals` | Run `pnpm images` at the end. |
| `pnpm perf …` | Section 9.2. |
| Production | Section 9.3. |
| Rehearsal | Section 11 on the talk laptop, with both windows and the clicker. The rehearsal log shows no "Stuck playback" and no forced spotlight. |

## 11. Pre-talk checklist

Use a dedicated Chrome profile for the talk, with the grid lanes flag on. T is the talk's start.

**Before T minus 24 hours (deploy freeze)**

1. The production deployment is the rehearsed one. Note its URL for Instant Rollback.
2. `/_health` names the expected commit.
3. A local fallback is built from the same commit and tested once, with production origins pointed
   at a local port (`docs/deploy.md`, "Checking a build locally"), plus the F2 apps.

**At the venue, T minus 60 minutes**

4. Join the venue Wi-Fi (or the tether you trust more). Run `pnpm warmup`. Green, the build ID
   matches, and frame documents have a median TTFB ≤ 300 ms. If it fails twice, switch to the
   local fallback (step 3) and stop here.
5. In the talk profile, if anything was deployed since the rehearsal: clear cached images and files
   (Chrome settings, all time).

**T minus 45 minutes**

6. Open `/speaker?s=title`, then `s` to open `/present`. Drag the audience window to the projector,
   then press `f`.
7. Warm walk: `Shift+ArrowRight` through all 50 slides from the speaker window, then `Home`. This
   fills the browser cache for every slide and frame on both origins.
8. Turn on rehearsal mode in the audience window (`d`) for one demo. Check the p95 frame time is
   under 20 ms, then press `d` again.

**T minus 15 minutes**

9. Clicker test on the projector: on `d1-intro`, press after 1 s and after 5 s. Both advance. Go
   back to the title with `Home`.
10. The audience window is 1920 by 1080, at scale 1, with nothing cropped.
11. Leave both windows open. Do not reload unless something breaks. A reload is safe: the cache
    serves the slides.

## 12. Risks

| Type | Item | Owner | Response |
|---|---|---|---|
| Risk | Lazy focus probing changes a focus-visible result in some engine. | WS-1 | D1's focus asserts in all three engines gate the merge. The rects message already falls back to the element's own `:focus-visible`. |
| Risk | A shown demo focuses an element on load, so a warm document still takes focus. | WS-1 | The `blur` and `focusin` claim handles any cause. `pnpm walk focus` covers all 12 intros. |
| Risk | A poster does not match the live frame. Posters are captured with `capture:1` (lighter scrim) and as JPEG q72. | WS-1, WS-3 | The swap diff check per page. Recapture, or exclude that page from the underlay. The freshness rule catches stale posters. |
| Risk | The rewrite breaks client navigation or prefetch on a prerendered `/present`. | WS-2 | The spike, before any route change. If it fails, the routes stay dynamic until after the talk. |
| Risk | A stale unversioned file after a deploy (`stale-while-revalidate` serves one stale copy). | WS-2 | Deploy freeze. Clear cached files in the talk profile after any deploy. Everything the stage shows that changes often is content-hashed. |
| Risk | AVIF smears the baked grain or text on the projector. | WS-3 | The projector check before merge. Per-file overrides. The default is the grain-safe q70 4:4:4. |
| Risk | Re-encoded demo photos shift the M2 layout. | WS-3 | Exact aspect ratio. The M1 and M2 walks and a recapture. |
| Risk | The font subset misses a glyph (arrows, curly quotes, `·`, `…`). | WS-4 | The scan in `pnpm fonts` fails on any missing character. |
| Risk | The Wi-Fi drops mid-talk. Frame documents are `no-store` and need the network. | Speaker | Slides and images keep painting from cache (P0-5). Frames need the network. The local fallback is the answer. |
| Risk | M5 flagless page loads read flags from one instance's memory (`globalThis.__pageState`). A second Fluid instance would show default flags. | Follow-up | Out of scope here. The warm walk and rehearsal show M5 working. Track as an engine follow-up: carry `flags` and `bg` on the request. |
| Issue | The review scripts and results exist only in a temporary scratch folder. | WS-2 | Copy them into the repo on day 0 (9.2). |
| Dependency | Talk date and time, which fix the freeze dates. | Speaker | Open question 2. |
| Dependency | The speaker-view PRD's client-side `rehearse` and L4 fixes. | Speaker-view PRD | Section 7.2. `/speaker` prerender waits for it. |
| Assumption | Every stage and reader browser decodes AVIF (Chrome, Safari 16.4 and later, Firefox). | WS-3 | Backgrounds fall back to JPEG through `image-set()`. Stills fall back to WebP. Posters are AVIF only. |

## 13. Considered, not doing

- **Vercel Image Optimization or `next/image`.** Backgrounds are CSS images, the stage decodes
  ahead from raw URLs, the first request per width is a slow metered transform, and frames run on
  another origin. Pre-built files behave the same on every load.
- **CDN caching of composed frame documents.** They depend on flags, host, CSP and M5's instance
  state. The poster underlay already hides their load.
- **Speculation Rules or `preconnect` to the demo origin.** Reader moves are client-side router
  transitions. Connections are partitioned, so a top-level preconnect is not used by the
  cross-site frame. The full RSC prefetch already paints in under 60 ms.
- **A service worker for offline frames.** It would cache cross-origin sandboxed documents and
  touch every request on stage. The local fallback build is simpler and already tested.
- **Dropping the baked grain.** A design change (D2).
- **Cutting client JavaScript.** 163 KB brotli, no long tasks, hydration under 0.5 s.
- **Moving the code panel's `<pre>` to a server component.** It saves about 8 KB per prefetch. Not
  worth the risk to the highlight lead.
- **Warming the now page's frame from the used-to page.** Re-measure after P0-1 and P1-FRAMEFILES.
  Consider it after the talk.

## 14. Open questions for the speaker

1. **Which origin runs the stage?** **Recommendation:** production, which is what this PRD hardens
   and what the room can follow. Keep a local build of the same commit warm on the laptop as the
   fallback (it also runs F2 live). Switch if `pnpm warmup` fails twice at T minus 60.
2. **Talk date and start time?** The freeze dates (D7) and the Event JSON-LD (r7 open question 2)
   need them. **Recommendation:** send them, and we pin the code freeze, the final rehearsal and the
   deploy freeze to the calendar.
3. **Projector check for images.** Can you, or the design agent, spend 15 minutes comparing the
   AVIF samples on the venue projector or any 1080p screen before WS-3 merges? **Recommendation:**
   yes. Without it, we ship the grain-safe q70 backgrounds (about 10 MB per walk instead of 7) and
   keep the baked grain.
4. **Speed Insights Plus ($10 per project per month)?** **Recommendation:** free tier now. Turn on
   Plus for one month after the talk only if you want per-route phone LCP while the slides are
   being shared.

# Front-end performance review: the live presenter

Reviewed 29 October 2026 against production (`cb8e46c`) on
`https://2026-advances-in-the-web.vercel.app` (presenter) and
`https://2026-advances-in-the-web-demos.vercel.app` (frames). No code was changed. The delivery
side (headers, CDN, functions) is covered in `docs/perf/platform-review.md`; this review covers
what the browser does with it: first load, slide to slide, frames, bytes, prefetch and caching.

## Bottom line

The app shell is already lean and the r7 prefetch works. A key press paints the next slide's canvas
in **20 to 50 ms** in both windows, against 100 to 175 ms with prefetch blocked. JavaScript is
163 KB brotli on every page, TBT is 0, and CLS is 0 except one image. The time and bytes go
elsewhere:

1. **A bug that loses clicker presses on all 12 warmed intro slides** in the audience window.
   `FrameWarm`'s hidden document takes the window's focus 0.5 to 0.8 s after arrival, and nothing
   gets it back until the 1.2 s claim. If the warm document is slow to load (venue Wi-Fi, a cold
   function), it takes focus after the last claim and **every press on that intro slide is lost**.
   Reproduced in headed and headless Chromium.
2. **Every frame page shows a white "Loading demo…" card for 270 to 420 ms (median), and up to
   about 1 s, after the slide has already painted.** The matching s0 poster is already captured, and
   the audience window already decodes it ahead, but it is never shown in the live slot.
3. **Images are 98% of the bytes.** Walking the deck downloads 40.3 MB, of which 39.5 MB are images.
   Intro stills are 2x PNGs of up to 3.95 MB shown at 832 px or less. Backgrounds are 238 to 690 KB
   JPEGs, and each section's background downloads twice: once per origin, 4.7 MB of duplicates.
   AVIF cuts intro stills by 94% and backgrounds by 90%, at about 36 dB PSNR or better.
4. **Nothing static is cached by the browser.** Every file under `public/` is served
   `public, max-age=0, must-revalidate`, and frame documents and build files are `no-store`. A repeat
   page load makes 6 to 21 revalidation round trips. Every frame mount (each step Back, each frame
   slide) makes 7 to 20. That is why `FrameWarm` does not measurably help: it primes nothing that
   the real frame can reuse.
5. **Reader mode does not decode the next background ahead**, so on every section change in `/s/`
   the slide paints first and its background arrives 130 to 630 ms later.

## How this was measured

- **Tools.** Playwright 1.58 with Chromium (`@playwright/test` in the repo), driving the live
  site. CDP network log for bytes (encoded), status, priority and cache flags. Site isolation was
  turned off in the measuring browser, so the page's CDP session also sees (and throttles) the
  cross-origin demo frames. The focus bug was re-checked with default site isolation, headless and
  headed. Lighthouse 12.8.2 (`--preset=desktop`, simulated throttling) on the same Chromium.
- **Viewport.** 1920 by 1080 at DPR 1, as on the projector, unless noted. Two runs of each
  first-load case; navigation walks cold (new context) then warm (same context, second pass).
- **Network profiles.** `none`: the machine's own connection, which reaches the `iad1` PoP with
  about 85 ms of TLS and 90 to 140 ms cold TTFB. `venue`: CDP throttling to 20 Mbps down, 5 Mbps up
  and 60 ms RTT, as a stand-in for venue Wi-Fi. Real venue Wi-Fi may be worse; the big-image
  numbers scale with it.
- **Under automation.** `navigator.webdriver` is true, so the r7 crossfade and Web Analytics are off
  in the Playwright numbers (by design, see `Stage.tsx` `fadeAllowed`). With the fade on, the
  visible swap adds its 200 ms animation after the paint times reported here. Lighthouse runs
  without webdriver, so its runs include analytics.
- **"Without prefetch."** RSC prefetch requests aborted with `page.route`, letting through only the
  navigation to the slide the press targets. Interception disables Chromium's HTTP cache, so
  intercepted runs are only compared with each other: the `FrameWarm` on/off comparison uses a
  control run with the same no-op interception.
- **Scripts and raw results.** Scratch folder
  `/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/perf/`:
  `load.mjs`, `nav.mjs`, `frame.mjs`, `deckwalk.mjs`, `scale.mjs`, `images.mjs`, `probe3*.mjs` (the
  focus bug), `shots.mjs`, and `results/` (JSON for every run, `nav-summary.txt`, `load-table.md`,
  `lighthouse.txt`), `lh/` (Lighthouse JSON), `img-out/` (sample AVIF and WebP encodes to view on
  the projector), `shots/` (frame slot while loading).

## Measurements (before numbers)

### First load

Median of two runs, `none` profile, except the `LCP venue` column. Times in ms from navigation
start. "Frame s0" is when the frame's first step reported done. KB is encoded bytes over the wire,
both origins.

| URL | Cache | TTFB | FCP | LCP (element) | LCP venue | CLS | TBT | Hydrated | Frame s0 | Requests | KB | 304s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | cold | 92 | 192 | 192 (title text) | 312 | 0 | 0 | 287 | | 16 | 714 | 0 |
| `/` | warm | 27 | 80 | 80 | 104 | 0 | 0 | 53 | | 16 | 0 | 1 |
| `/s/title` | cold | 124 | 228 | 228 (title text) | 268 | 0 | 0 | 262 | | 16 | 712 | 0 |
| `/s/title` | warm | 29 | 136 | 136 | 116 | 0 | 0 | 99 | | 16 | 0 | 1 |
| `/s/d1-intro` | cold | 113 | 344 | 344 (intro still) | 892 | 0.001 | 0 | 350 | | 23 | 1,760 | 0 |
| `/s/d1-intro` | warm | 29 | 104 | 172 | 176 | **0.087** | 0 | 81 | | 23 | 1 | 6 |
| `/s/d1-now` | cold | 98 | 184 | 412 (frame) | 796 | 0 | 0 | 243 | 696 | 37 | 2,746 | 0 |
| `/s/d1-now` | warm | 23 | 100 | 160 | 148 | 0 | 0 | 81 | 304 | 37 | 4 | 8 |
| `/s/m2-intro` | cold | 87 | 224 | 460 (intro still) | **2,028** | 0.082 | 0 | 382 | | 24 | **4,516** | 0 |
| `/s/m2-intro` | warm | 30 | 80 | 180 | 168 | **0.080** | 0 | 69 | | 24 | 1 | 6 |
| `/s/m2-now` | cold | 90 | 192 | 284 (frame) | 464 | 0 | 0 | 294 | 726 | 50 | 3,717 | 0 |
| `/s/m2-now` | warm | 28 | 104 | 176 | 172 | 0 | 0 | 71 | 289 | 50 | 7 | 21 |
| `/s/people-to-follow` | cold | 135 | 232 | 232 (title text) | 356 | 0 | 0 | 276 | | 32 | 695 | 0 |
| `/s/people-to-follow` | warm | 36 | 108 | 108 | 100 | 0 | 0 | 85 | | 32 | 2 | 13 |
| `/present?s=d4-now` | cold | 131 | 328 | 392 (frame) | 1,004 | 0 | 0 | 354 | 856 | 39 | 3,128 | 0 |
| `/present?s=d4-now` | warm | 39 | 180 | 244 | 216 | 0 | 0 | 149 | 552 | 39 | 20 | 10 |

Lighthouse desktop (simulated 10 Mbps, 40 ms RTT). Its LCP element is the stage background
(`div.stage__bg`) on every page. That is a CSS background found only after the stylesheet and the
inline style are parsed, so it starts late at Low priority. LCP breakdown on `/s/d1-now`: TTFB 149,
resource load delay 158, load 110 and render delay 190 ms.

| URL | Score | FCP | LCP | TBT | CLS | Bytes | Top opportunities |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 384 | 901 | 0 | 0 | 719 KB | |
| `/s/title` | 99 | 342 | 862 | 0 | 0 | 715 KB | |
| `/s/d1-now` | 95 | 310 | 1,476 | 0 | 0 | 2,749 KB | modern formats 1,325 KB; prioritize LCP image |
| `/s/m2-now` | 99 | 306 | 749 | 0 | 0.001 | 3,720 KB | |
| `/s/m2-intro` | **80** | 362 | **3,928** | 0 | 0.002 | 4,519 KB | modern formats 3,488 KB; responsive images 3,339 KB; unsized image |
| `/s/people-to-follow` | 100 | 392 | 806 | 0 | 0 | 698 KB | |
| `/present?s=d4-now` | 98 | 305 | 1,091 | 0 | 0 | 3,137 KB | modern formats 1,784 KB |

Lighthouse also flags 14 KB of legacy JavaScript (Next's polyfills) and 25 to 28 KB of unused JS
per page. Neither matters at this size.

### Slide to slide

Key press to: new canvas painted (two animation frames after the stage element is replaced); the
slide's background fetched (`bg`); the intro still decoded (`img`); the frame's first step done
(`s0`). Median / p90 in ms, cold pass, sequential walks through D1 to D3, M1 to M3 and the closing,
3 s on each slide before the press (prefetches finish). Full table in `results/nav-summary.txt`.

| Window | Prefetch | Network | Into an intro: paint / bg / img | Intro to used-to: paint / s0 | Used-to to now: paint / s0 | Into a glass slide: paint / bg |
|---|---|---|---|---|---|---|
| audience | as deployed | none | 38 / 0 / 32 | 19 / **352** | 50 / 251 | 18 / 0 |
| audience | as deployed | venue | 43 / 0 / 33 | 25 / 273 (p90 519) | 38 / 273 | 28 / 0 |
| audience | blocked | none | 174 / 194 / 413 | 140 / 468 | 144 / 431 | 107 / 0 |
| audience | blocked | venue | 112 / 580 / 898 | 120 / 505 | 150 / 506 | 98 / 0 |
| reader `/s/` | as deployed | none | 43 / **132 (max 336)** / 30 | 50 / **631 (p90 995)** | 44 / 243 | 48 / 149 |
| reader `/s/` | as deployed | venue | 40 / **311 (max 628)** / 31 | 48 / 309 (p90 599) | 50 / 304 | 48 / 202 |
| reader `/s/` | blocked | none | 102 / 700 / 669 | 77 / 382 | 99 / 431 | 76 / 215 |
| reader `/s/` | blocked | venue | 104 / 673 / 1,286 | 104 / 468 | 108 / 575 | 97 / 303 |

Warm pass (a rehearsed deck in the same browser): the same paint times. Reader backgrounds still
take 50 to 100 ms, because each one is revalidated (`max-age=0`). Audience frame s0 is 245 to
325 ms.

- PRD r7 9.2 acceptance holds: no RSC request to the target on a press 2 s after arrival, and the
  canvas within 150 ms (it is under 60 ms).
- The intro still is ready about 30 ms after the press in both modes. That is a side effect: the full
  RSC prefetch carries React's image preload hints, so the next slide's `<img>` files are fetched as
  `<link rel=preload as=image>` when the current slide loads. It also means a 1 to 4 MB PNG competes
  with the current slide's frame. On a cold `/s/d1-now`, `d2-product-card.png` (989 KB) downloads
  next to the D1 frame.
- **`FrameWarm` gives no measurable gain.** Same interception in both runs, intro to used-to `s0`
  median: warm on 415 / 399 / 369 / 369 ms against warm off 406 / 397 / 399 / 418 ms (none cold, none
  warm, venue cold, venue warm). The warm document is `no-store`, the build files are `no-store`
  and the shared files revalidate anyway. The only thing it primes is the TLS connection and the
  function.

What the room sees on a frame page. Screenshots of the D1 used-to slot at 112, 226, 308 and 487 ms
after the press (`shots/`): a blank white card with "Loading demo…" until about 400 ms, then the
demo. The captured `public/posters/d1-used-to/s0.jpg` is a near pixel match of the loaded frame.

### Frame remounts (step Back, `r`)

A step Back mounts a fresh document and replays `s0..sN` (audience, two forward steps, then Back
twice).

| Page | Replay (none) | Replay (venue) | Demo-origin requests | 304s | Bytes |
|---|---|---|---|---|---|
| D1 now | 243 to 263 ms | 207 to 345 ms | 13 | 7 | 3 to 4 KB |
| D4 now | 363 to 583 ms | 396 to 466 ms | 15 to 16 | 7 | 8 to 10 KB |
| M2 now | 227 to 230 ms | 228 to 245 ms | 26 | 20 | 6 KB |
| D5 used-to | 463 to 483 ms | 480 to 532 ms | 20 | 8 | 30 to 31 KB |

Each mount refetches the document and every build file through a function (`no-store`, 170 to
220 ms TTFB), and revalidates the theme, the wrappers, the runtime, the background and every demo
photo. D5 chains `app.js`, then `sanitize.js`, then `/vendor/purify.es.mjs`, then its JSON: a
four-step waterfall on every Back.

### Bytes

Whole deck, Shift+ArrowRight through all 50 slides, cold browser:

| Window | Requests | Total | Images | JS | CSS | Fonts | RSC + docs | 304s |
|---|---|---|---|---|---|---|---|---|
| audience `/present` | 771 | **40.3 MB** | 39.5 MB (presenter 31.7, demo 7.8) | 355 KB | 96 KB | 152 KB | 168 KB | 237 |
| reader `/s/` | 572 | 38.7 MB | 37.6 MB | 294 KB | 84 KB | 152 KB | 559 KB | 145 |

Fifteen files (the section backgrounds and two fonts) download on both origins: 4.7 MB extra. The
two hosts are different sites (`vercel.app` is on the public suffix list), so the browser cache is
partitioned and the frame cannot reuse the presenter's copy.

Per slide type, cold, one origin pair:

| Slide | JS | CSS | Fonts | Images | Doc + RSC | Notes |
|---|---|---|---|---|---|---|
| Glass opening and closing | 163 KB | 22 KB | 76 KB | 417 to 439 KB | 12 to 17 KB | background JPEG; slide 3 adds 2.9 MB of PNGs |
| Intro | 163 KB | 22 KB | 76 KB | 1.5 to 4.2 MB | 23 to 25 KB | intro PNG 627 KB to 3.95 MB, plus background |
| Walk page (used-to, now) | 181 to 187 KB | 36 to 39 KB | 152 KB | 2.3 to 3.3 MB | 18 to 31 KB | background twice, fonts twice, the next intro still preloaded |

### Assets

| Asset | Today | Displayed at | Trial encode (sharp, `img-out/`) | Saving |
|---|---|---|---|---|
| 13 intro stills, PNG | 18.2 MB, 1664 to 2108 px wide | at most 832 by 816 canvas px (832 device px on the projector) | AVIF q60 full size 1.09 MB; WebP q82 1.61 MB; AVIF at 1056 w 0.55 MB | 94 to 97% |
| 24 backgrounds, JPEG 1920 by 1080 | 8.7 MB (238 to 690 KB each) | full canvas, under glass and grain | AVIF q55 0.84 MB; WebP q78 1.57 MB | 90% (AVIF) |
| Slide 3 design images, PNG 1024 by 1024 | 2.9 MB | 512 by 472 | AVIF 1024 w 65 KB; 512 w 28 KB | 98% |
| Posters, JPEG about 878 by 862 | 7.7 MB in all (about 70 KB each) | speaker previews; the audience decodes the next page's s0 | AVIF q55 -47%, WebP -34% | about 40% |
| M2 trail photos, WebP 750 to 1000 px | 2.6 MB | a 3-column wall in a 640 px frame | 400 w WebP 48 KB, AVIF 28 KB (photo-02: 300 KB) | about 85% |
| M1 `hiker-ridge.webp` 1800 by 1200 | 318 KB | inside the frame | 400 w AVIF 13 KB | 95% |
| Fonts: Slalom Sans 400, 700 and 900 (OTF), Lora Italic (TTF) | 37.5 to 39.6 KB br each (Lora 71.8 KB) | | WOFF2 29 to 31 KB; Latin subset WOFF2 13.6 to 14.2 KB (Lora 20 KB) | 63% per weight |
| `grain.png` | 62 KB | audience tile | | leave |
| People WebP | 5 to 18 KB each, sized | 96 by 96 | | leave |

Minimum PSNR across every trial encode: 35.8 dB (M2 at 1056 w), typical 40 to 46 dB on the UI stills. That is
visually lossless for UI captures. Look at `img-out/m2-trail-photos.png.*` and
`img-out/d1.jpg.*` on the projector before committing: photographic stills (M1, M2) sit at
36 to 37 dB, the low end.

Fonts: `font-display: swap`, no preload, OTF and TTF rather than WOFF2, no subsetting. They are
found after the CSS (VeryHigh priority, starting around 320 ms in Lighthouse) and are loaded again
by every frame on the demo origin.

JavaScript: ten chunks, 163 KB brotli (540 KB raw): React DOM 73 KB, Next runtime 46 KB, the app's
stage, chrome and engine about 30 KB. No Shiki or other highlighter reaches the client
(`lib/highlight.ts` is `server-only`). The 41 KB `noModule` polyfill chunk is never fetched by modern
browsers. Hydration finishes 240 to 450 ms after navigation on a cold load. No long tasks.

### Caching observed from the browser

| What | Header | Effect |
|---|---|---|
| `/_next/static/**` | `public, max-age=31536000, immutable` | cached, correct |
| `/s/<id>` HTML and RSC | `public, max-age=0, must-revalidate` (prerendered, CDN `PRERENDER`) | the router keeps its own copy (`x-nextjs-stale-time: 300`) |
| `/present`, `/speaker` HTML and RSC | `private, no-cache, no-store` | function on every prefetch and load (expected, `force-dynamic`) |
| Everything under `public/`: backgrounds, intro, posters, people, logos, fonts, theme, runtime, wrappers, portal, demo assets | `public, max-age=0, must-revalidate` | a 304 round trip per file per page load and per frame mount |
| Frame documents and build files (`lib/frames/compose.ts`, `lib/frames/inner.ts`) | `no-store` | refetched through a function on every mount; never cached at the edge |

### Projector and first paint

On 1920 by 1080 the audience stage is at scale 1 from the first paint. On any other window size,
the server-rendered stage paints at scale 1 (cropped) and snaps to size when `Stage`'s layout
effect runs after hydration: 1440 by 900 paints at 223 ms and scales at 291 ms; 1280 by 720 paints
at 198 ms and scales at 262 ms (fast network; later on a slow one). It only shows on a first load
whose window is not exactly 1920 by 1080, for example the audience window before `f`, or a reader
on a laptop.

## What is prefetched today

| Asset for the next slide | Audience `/present` | Reader `/s/` | Speaker |
|---|---|---|---|
| RSC payload (prev and next) | yes, `kind: "full"` (`Stage.tsx`) | yes | yes (its own window) |
| Next background | decoded ahead (`decodeBackground`) | **no** | no |
| Next intro still | decoded ahead (`neighbourAssets`) and preloaded via RSC hints | preloaded via RSC hints only | via RSC hints |
| Next page's s0 poster | decoded ahead | no | decoded (previews) |
| Next frame document and its files | `FrameWarm` on intro slides only; no reuse (`no-store`, `max-age=0`) | no | no |
| Fonts | not preloaded anywhere | | |
| Demo-origin connection | opened by the first frame or `FrameWarm` | first frame | |

## Recommendations, in priority order

Impact is for the live talk first, then readers. Effort: S under half a day, M one to two days,
L more. Risk is the chance of a regression in the walk, captures or sync.

### P0-1. Stop `FrameWarm` from taking focus (clicker presses lost on intro slides)

- **Finding.** On all 12 intro slides with a warm-up (D1 to D6, M1 to M5, F3; F2 is skipped), each tested, focus
  moves to `iframe.frame-warm` 0.5 to 0.8 s after arrival. Presses then go into the warm document,
  which no `FrameHandle` listens to, until the stage's 1200 ms claim. With the warm document held
  back 1.5 s (slow Wi-Fi or a cold function), focus moved at 2.2 to 2.4 s and presses at 2.5 s and
  4 s were both lost: no claim runs after 1.2 s. `inert` and `tabIndex={-1}` do not stop it.
- **Cause.** `public/runtime/demo-runtime.js` `probeFocusVisibleOption()` runs inside `features()`
  for the `ready` message. It creates a button and calls `b.focus()`. In Chromium a programmatic
  focus inside a frame moves the page's focused frame to that iframe, and `b.blur()` leaves it
  there.
- **Change.**
  1. `demo-runtime.js`: skip the probe when `!document.hasFocus()` (report `null`), and run it
     lazily the first time an action needs it, when the frame owns focus anyway.
  2. `components/page/FrameWarm.tsx`: add `warm=1` to the query, and have the runtime post nothing
     and probe nothing in a warm document (`lib/frames/compose.ts` can also leave the runtime out
     of warm documents).
  3. Belt and braces in `components/stage/Stage.tsx` (audience claim effect): also claim on
     `window` `blur` and on `focusin` when `document.activeElement` is an `iframe.frame-warm`,
     rather than only at 0, 450 and 1200 ms.
- **Impact.** High: removes a talk-day failure that looks like a dead clicker. **Effort** S.
  **Risk** low: the probe result only feeds `supports`. Check that D1's focus-visible asserts still
  pass in `pnpm walk` for Chromium, WebKit and Firefox.
- **Test.** `probe3.mjs` and `probe3b.mjs` in the scratch folder: a press 900 ms after landing on
  each intro must advance.

### P0-2. Show the step's poster under a loading frame

- **Finding.** Every used-to and now slide shows a white card with "Loading demo…" for 270 to
  420 ms (median), and up to about 1 s at p90 cold, after the slide itself painted in 20 to 50 ms.
  This is the "first slide of each demo section waits on the frame" the speaker sees, and it happens
  again on every now page.
- **Change.**
  - `components/page/PageBody.tsx`: pass `posters[step.id]` (already computed) to `PageFrame`
    in live mode too.
  - `components/page/PageFrame.tsx`: while `status === "loading"`, render the poster as an `<img>`
    under the slot at the frame's size (`decoding="sync"`, `fetchpriority="high"`). Mount the first
    document hidden (`mount(flags, false)`) and reveal it in `show()` on `ready`, as replays already
    do, so the white iframe never shows. Drop the poster after the swap.
  - `components/stage/SlidePage.tsx` `slideImages`: the audience already decodes the next page's s0
    poster. Add the last step's poster when `prevHasSteps` (Back lands on the last step), and give
    reader mode the same assets (`neighbourAssets` is `[]` for `reader` today).
  - `styles/components/page.css`: poster box at the slot size. Hide "Loading demo…" when a poster
    is shown.
- **Impact.** High: the frame looks ready in about 30 ms on every walk page. Playback and the
  "Ready" signal still wait for the real `step-done`. **Effort** S to M. **Risk** low to medium: a
  stale poster would flash the wrong state for a few hundred ms. Re-run `pnpm capture` after any
  demo change, and add a validator rule that a page's posters are newer than its build files.
  Captures and walks are untouched when the poster sits under the iframe.

### P0-3. Cache what does not change, on both origins

- **Change.** In `next.config.ts` `headers()`:
  - `/backgrounds/v5/:path*`, `/intro/:path*`, `/posters/:path*`, `/images/:path*`,
    `/people/:path*`, `/logos/:path*`, `/demo-assets/:path*`, `/fonts/:path*`:
    `public, max-age=31536000, immutable`, once file names carry a version. `v5/` already does;
    add a content hash or a `?v=` written by the scripts that make them (`pnpm visuals`,
    `pnpm capture`, `pnpm og` already does this). Until then, `public, max-age=86400,
    stale-while-revalidate=604800`.
  - `/theme/:path*`, `/runtime/:path*`, `/wrappers/:path*`, `/portal/:path*`: `public,
    max-age=300, stale-while-revalidate=86400`, or immutable with a build-hash `?v=` added where
    `lib/frames/compose.ts` writes the links.
  - `lib/frames/compose.ts` `buildFile()`: `public, max-age=300, s-maxage=31536000` (Vercel purges
    the CDN per deployment). `frameResponse()` and `lib/frames/inner.ts`: keep the browser at
    `no-store` but add `Vercel-CDN-Cache-Control: max-age=31536000`, so documents come from the edge
    instead of a function. They are deterministic per URL and host. Leave F2 alone.
- **Impact.** High for the talk and for repeat readers. It removes 237 revalidations over the deck,
  6 to 21 per page load and 7 to 20 per frame mount. It should take step Back from 230 to 580 ms to
  roughly 150 to 350 ms (one document instead of a waterfall of round trips), reader backgrounds on
  a rehearsed deck from 50 to 100 ms to 0, and make `FrameWarm` actually prime the frame's cache
  partition. **Effort** S for headers, M with versioned names. **Risk** low for versioned paths. For
  unversioned ones, a redeploy shortly before the talk can leave a window on old assets for the
  max-age: reload both windows after any deploy (add it to the talk-day runbook).

### P1-4. Ship modern image formats at the size they are shown

- **Change.**
  - A `pnpm images` script (sharp is already installed through Next) that writes `.avif` and
    `.webp` next to each PNG and JPEG: intro stills at 1x (880 w) and 2x (1760 w); backgrounds at
    1920 w (AVIF q55, WebP q78); `images/design` at 512 and 1024; posters AVIF; M1 and M2 demo photos
    at 2x their shown width (about 400 to 560 w). Wire it into `pnpm visuals` and `pnpm capture`.
  - `components/page/IntroSlide.tsx`: `<picture>` with AVIF and WebP `srcset` (`880w, 1760w`,
    `sizes="832px"`), the PNG as fallback, and **`width`/`height` attributes** (this fixes the 0.08
    CLS on warm loads; Lighthouse "unsized-images").
  - Backgrounds: `content/backgrounds.ts` and `Stage.tsx` set `--slide-bg-image` to
    `image-set(url(x.avif) type("image/avif"), url(x.jpg) type("image/jpeg"))`. `decodeBackground`
    picks the same URL (detect AVIF once). `scripts/theme.mts` writes the same `image-set()` into
    `public/theme/backgrounds.css` for frames.
  - `components/layouts/glass/GlassSlide.tsx` (slide 3 portraits): `<picture>` at 512 and 1024.
  - Demo photos under `public/demo-assets/` only change the files, not the shown markup.
- **Impact.** High on bytes: the deck walk goes from about 40 MB to about 5 MB. Intro stills
  18.2 MB to about 1.1 MB, backgrounds 8.7 MB to 0.84 MB (and their demo-origin duplicates by the
  same factor), slide 3 2.9 MB to 65 KB. The cold `/s/m2-intro` goes from 4.5 MB to about 0.6 MB,
  and its Lighthouse LCP from 3.9 s to about 1 s. It also defuses the RSC image hints: the next
  slide's preloaded still drops from 1 to 4 MB to 50 to 250 KB. **Effort** M. **Risk** low; view the
  photographic stills on the projector first.

### P1-5. Reader mode: decode the next background, and preload the current one

- **Change.** `components/stage/Stage.tsx`: run the neighbour-background effect for `reader` as
  well as `audience` (the `mode !== "audience"` guard). `components/stage/SlidePage.tsx`: pass
  `slideImages(next)` to readers too. For the slide's own background, call `preload(background,
  { as: "image", fetchPriority: "high" })` from `react-dom` in `SlidePage` (server component), so
  the LCP image is in the head instead of being found in an inline style.
- **Impact.** Medium: reader section changes stop painting without a background (130 to 630 ms
  today, more on slow Wi-Fi). Lighthouse LCP loses most of its 160 to 230 ms resource load delay.
  **Effort** S. **Risk** low; the audience path is unchanged.

### P2-6. Fonts: WOFF2, Latin subset, preload

- **Change.** Convert `public/fonts/*` to WOFF2 subset to Latin plus punctuation (`pyftsubset
  --flavor=woff2`; check the deck's characters first). Update `styles/fonts.css`,
  `styles/glass-tokens.css` (the frame copy) and `scripts/theme.mts` (copies to the F2 apps). Add
  `<link rel="preload" as="font" type="font/woff2" crossorigin>` for Regular and Bold in
  `app/layout.tsx`, and in the frame shell in `lib/frames/compose.ts`.
- **Impact.** Low to medium: 152 KB to about 56 KB on the first walk page, fonts at HTML parse time
  instead of after the CSS, less swap flash on a cold first slide. **Effort** S. **Risk** low; check
  glyph coverage (curly quotes, en dash, arrows).

### P2-7. Paint the stage at its final scale

- **Change.** `styles/components/stage.css`: default
  `--stage-scale: min(tan(atan2(100vw, 1920px)), tan(atan2(100dvh, 1080px)))` (unitless ratio
  without JS). `components/stage/Stage.tsx`: do not write the inline `--stage-scale` until the
  first measurement (`useState<number | null>`), so the server HTML uses the CSS value.
- **Impact.** Low, first load only, on windows that are not 1920 by 1080: no cropped first frame
  and zoom. **Effort** S. **Risk** low; speaker previews (`stage--embedded`) need the same rule
  against their box (use container units there).

### P2-8. Keep `FrameWarm`, make it count, and extend it

- After P0-1 and P0-3, the warm document fills the right cache partition (presenter as top level,
  demo as a cross-site frame), so the used-to frame only fetches its document. Measure again with
  the control/warm-off pair in `nav.mjs` (`control` and `nowarm2` variants). Today: no difference.
- Consider warming the now page's frame from the used-to page: the documents differ, but they share
  the theme, wrappers, runtime and background. **Effort** S. **Risk** low (the same focus fix
  applies).

### P2-9. Smaller wins

- **Defer the next intro still.** Until P1-4 lands, the RSC hints preload a 1 to 4 MB PNG on load
  of every slide before an intro. Rendering the intro `<img>` with `loading="lazy"` in prefetched
  trees is not possible per slide; P1-4 is the real fix. No separate change.
- **Speaker window.** `/speaker` HTML preloads the next preview's intro still (1.4 MB for D5) and
  every step poster. Fine on the speaker's laptop; P1-4 shrinks it.
- **Code panel payload.** `PageCodePanel` is a client component that receives every highlighted
  line as React nodes, so code is in the HTML and again in the RSC payload (`/s/d1-now`: 93 KB raw,
  14 KB brotli; 8 to 9 KB brotli per prefetch). Moving the `<pre>` into a server component and
  driving the highlight with a data attribute would halve that. Low value; skip unless the panel
  is touched anyway.

## Considered, not recommended

- **Speculation Rules (prerender `/s/`).** Reader navigations are client-side router
  transitions, which prerendering does not serve. The full RSC prefetch already paints in under
  60 ms. Prerendering would also load each prerendered page's frame and count analytics.
- **`<link rel="preconnect">` to the demo origin from the presenter.** Chromium partitions
  connections by top-level site and cross-site bit, so a socket opened by the top document is not
  used by the cross-site frame. Only the first frame of a cold window pays TLS (about 85 ms);
  `FrameWarm` already opens a correctly keyed connection. Low value.
- **`next/image`.** `images: { unoptimized: true }` is deliberate. The stage scales a fixed canvas,
  frames run on another origin, and a static AVIF and WebP pipeline (P1-4) gets the bytes without a
  runtime optimizer.
- **Cutting client JavaScript.** 163 KB brotli, no long tasks, hydration under 0.5 s. Nothing heavy
  ships to the client.

## Targets for the PRD

Measured the way this review does (Playwright on the live production deployment, 1920 by 1080, DPR
1, `none` and `venue` profiles), so the scripts above can re-run them.

| Metric | Today | Target |
|---|---|---|
| Key to new canvas painted, both windows, with prefetch | 20 to 50 ms median, 60 ms p90 | ≤ 60 ms p90 (keep) |
| Key to background shown, reader section change | 130 to 630 ms cold; 50 to 100 ms rehearsed | ≤ 60 ms p90 |
| Key to frame content visible (poster or live), used-to and now | 270 to 420 ms median, about 1 s p90 ("Loading demo…") | ≤ 100 ms p90 |
| Key to frame s0 done (live), audience | 250 to 350 ms median, 520 ms p90 | ≤ 300 ms median |
| Step Back replay | 230 to 580 ms | ≤ 300 ms |
| Clicker presses lost after landing on an intro | every press 0.6 to 1.25 s after arrival; every press after 2.2 s when the warm-up is slow | 0 at any delay |
| Lighthouse desktop LCP, every page | 0.75 to 1.48 s; `/s/m2-intro` 3.9 s | ≤ 1.2 s |
| CLS | 0.08 on warm intro loads | < 0.01 |
| Bytes, whole-deck audience walk | 40.3 MB, 771 requests | ≤ 8 MB |
| Largest single image | 3.95 MB | ≤ 300 KB |
| Revalidations (304) on a repeat load, static assets | 6 to 21 per page; 237 per deck walk | 0 |

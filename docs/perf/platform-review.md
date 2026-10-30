# Platform and delivery review: production deploy

Reviewed 29 October 2026 against the production deployment of commit `cb8e46c` on
`https://2026-advances-in-the-web.vercel.app` (presenter) and
`https://2026-advances-in-the-web-demos.vercel.app` (frames). Nothing in the code or the Vercel
project was changed.

## How this was measured, and what could not be

- **Live build.** `/_health` answers `{"build":"dev"}` because `NEXT_PUBLIC_BUILD_ID` is unset,
  so it cannot name the deployment. `cb8e46c` was confirmed from the page itself:
  `/s/people-to-follow` carries the new UTM-tagged footer link and the headshots from `2706c27`.
- **Headers and timings.** `curl` over HTTP/2 with `Accept-Encoding: br, gzip`, each URL fetched
  twice. Every curl opens a new connection, so its TTFB includes about 85 ms of TLS. Server wait
  (TTFB minus pre-transfer on a reused connection) is reported separately.
- **Vantage point.** Requests landed on the `iad1` PoP (`x-vercel-id: iad1::…`), not Toronto.
  Read absolute times as relative; the venue will add its own Wi-Fi latency.
- **Bytes per slide.** Headless Chromium (Playwright 1.58, 1920 by 1080, DPR 1, cold cache) loading
  each page to network idle, summing encoded bytes from CDP, frame host included.
- **Image savings.** Trial encodes with `sharp` 0.35 (already in `node_modules` through Next),
  written to a scratch folder only.
- **Not read.** The Vercel CLI's saved login has expired and no Vercel MCP tools were available in
  this session. Project settings (Fluid, function region setting, CPU, Skew Protection,
  Deployment Protection, build cache), the deployment list, function sizes and runtime logs were
  **not** read. Statements about them are inferred from response headers and the repo, and are
  marked as such. Re-run `vercel login`, then `vercel project inspect 2026-advances-in-the-web
  --scope antifusion` and `vercel inspect <deployment-url>`, to confirm them.

## Measurements

### Routes

| Route | Shape | `x-vercel-cache` | `cache-control` | `x-nextjs-prerender` | Bytes (br) | TTFB 1st / 2nd (ms) |
|---|---|---|---|---|---|---|
| `/` | Prerendered | HIT (age 105 s) | `public, max-age=0, must-revalidate` | 1 | 8,294 | 162 / 133 |
| `/s/title` | Prerendered | HIT | same | 1 | 6,817 | 197 / 186 |
| `/s/d1-now` | Prerendered | HIT | same | 1 | 13,892 | 170 / 146 |
| `/s/m2-now` | Prerendered | HIT | same | 1 | 11,651 | 163 / 135 |
| `/s/m2-intro` | Prerendered | HIT | same | 1 | 8,138 | 127 / 142 |
| `/s/d1-now` RSC (`RSC: 1`) | Prerendered | HIT | same | | 9,005 | |
| `/present?s=d4-now` | Dynamic (`force-dynamic`) | MISS | `private, no-cache, no-store, max-age=0, must-revalidate` | | 11,413 | **1,372** (cold) / 341 |
| `/speaker?s=d4-now` | Dynamic (`force-dynamic`) | MISS | same | | 19,016 | 325 / 198 |
| `/_health` | Static (`force-static`) | HIT | `public, max-age=0, must-revalidate` | | 48 (not compressed) | 161 / 342 |
| `/robots.txt` | Dynamic (reads `host`) | MISS | `public, max-age=0, must-revalidate` | | 153 | 184 / 197 |
| `/sitemap.xml` | Static | HIT | same | | 383 | 195 / 141 |
| Frame `/demos/01-layered-ui/today` | Dynamic | MISS | `no-store` | | 1,278 | 149 / 177 |
| Frame `/demos/01-layered-ui/native` | Dynamic | MISS | `no-store` | | 1,374 | 179 / 295 |
| Frame `/demos/04-navigation-api/today` | Dynamic | MISS | `no-store` | | 2,557 | 184 / 202 |
| Frame `/demos/12-anchor-hotspots/native` | Dynamic | MISS | `no-store` | | 1,385 | 143 / 179 |
| Frame `/orders` | Dynamic | MISS | `no-store` | | 2,523 | 186 / 187 |
| Frame `/demos/07-package-workflow/timeline` | Dynamic | MISS | `no-store` | | 1,580 | 214 / 182 |
| Frame build files (`…/native/app.js`, `hooks.js`, `enhance.css`, `/app.js`, `/app.css`, `/demo/log.js`) | Dynamic | MISS | `no-store` | | 0.5 to 3 K | 57 to 150 (in browser) |

Server wait on a reused connection (TLS excluded): CDN HIT 34 to 73 ms; frame documents 54 to 84 ms;
`/present` 130 to 144 ms; `/speaker` 215 ms (warm). Function responses carry `x-vercel-id:
iad1::iad1::…`: the functions run in **iad1** (Washington, D.C.), the default region.

**Cold starts.** The first `/present` request of the session (no traffic from this client for
some time before it) took 1,372 ms against 341 ms on the next: about 1 s of cold start. A
second probe after about 10 minutes idle (19:01 EDT) found the functions still warm: a frame
document first (server wait 71 ms), then `/present` (268 ms) and `/speaker` (93 ms). Fluid
compute keeps the instance alive through gaps of at least that length. The frame routes and the
pages answered within the same warm window, which suggests they share an instance, but the
function grouping could not be read. Expect about 1 s once, on the first request after a long
idle or a new deployment, not on every slide.

### Static assets

Every file under `public/` is served by the CDN (HIT after first fetch) with **`public,
max-age=0, must-revalidate`**, the Next.js default for the public folder. Only `/_next/static` is
immutable.

| Asset | Bytes on the wire | Encoding | `cache-control` | Content-hashed name |
|---|---|---|---|---|
| `/_next/static/immutable/chunks/*.css` | 22,086 | br | `public,max-age=31536000,immutable` | yes |
| `/_next/static/immutable/chunks/*.js` (all on a page) | about 163 K | br | same | yes |
| `/backgrounds/v5/d1.jpg` (1920 by 1080) | 690,374 | none | `max-age=0, must-revalidate` | folder-versioned (`v5`) |
| `/backgrounds/v5/title.jpg` | 448,964 | none | same | folder-versioned |
| `/intro/m2-trail-photos.png` (2108 by 1724) | **4,046,107** | none | same | no |
| `/intro/d1-order-actions.png` (1756 by 1724) | 812,731 | none | same | no |
| `/posters/d4-now/s0.jpg` (878 by 862) | 68,366 | none | same | no |
| `/posters/m2-safari/s2.png` | **2,438,849** | none | same | no |
| `/posters/f2-now/s0.jpg` (F2 fallback) | 60,796 | none | same | no |
| `/people/aaron-gustafson.webp` (256 by 256) | 13,392 | none | same | no |
| `/demo-assets/trail/photo-02.webp` (1000 by 1000) | 307,764 | none | same | no |
| `/fonts/SlalomSans-Regular.otf` | 37,771 (55,364 raw) | br | same | no |
| `/fonts/Lora-Italic.ttf` | 71,764 (143,428 raw) | br | same | no |
| `/theme/portal-glass.css` | 9,710 | br | same | no |
| `/theme/grain.png` | 62,476 | none | same | no |
| `/runtime/demo-runtime.js` | 17,712 | br | same | no |
| `/og/cover.jpg` | 105,948 | none | same | `?v=<hash>` query |

What `max-age=0, must-revalidate` costs here: every window open or reload sends a conditional
request for every image, font, theme file and runtime (one round trip each, 304 if unchanged).
Because of `must-revalidate`, the browser may not use its cached copy when that request fails.
If the venue Wi-Fi drops, a warmed browser cache does not save the slides.

### Bytes per slide (cold browser cache, Chromium, 1920 by 1080)

The first page also pays for the shared shell: HTML, about 163 K of JS, 22 K of CSS and 76 K of fonts.

| Page | Requests | Total | Images (presenter host) | Frame host | Largest items |
|---|---|---|---|---|---|
| `/` | 16 | 714 K | 439 K | | `title.jpg` 439 K |
| `/s/title` | 16 | 712 K | 439 K | | `title.jpg` 439 K |
| `/s/d1-intro` | 23 | 1.76 MB | 1.48 MB | | `d1-order-actions.png` 794 K, `d1.jpg` 675 K |
| `/s/d1-now` | 37 | 2.75 MB | 1.67 MB | 785 K | `d1.jpg` 675 K **twice** (both origins), next intro `d2-product-card.png` 989 K |
| `/s/m2-intro` | 24 | **4.52 MB** | 4.23 MB | | `m2-trail-photos.png` 3.95 MB |
| `/s/m2-now` | 50 | 3.72 MB | 1.30 MB | 2.13 MB | 12 trail photos 107 to 301 K, next intro `m3-pricing-app.png` 1.0 MB |
| `/s/people-to-follow` | 32 | 696 K | 417 K | | `c2.jpg` 299 K |
| `/present?s=d4-now` | 40 | 3.13 MB | 2.27 MB | 585 K | next intro `d5-rich-content.png` 1.43 MB, `d4.jpg` 467 K twice |
| `/speaker?s=d4-now` | 30 | 2.99 MB | 2.71 MB | | `d5-rich-content.png` 1.43 MB, six step posters |

Whole deck: about 36 MB for the audience window (24 backgrounds 8.7 MB, 13 intro stills 18.2 MB,
the background again inside each frame about 4.4 MB, demo assets 3.1 MB, plus HTML and shell). The
speaker window adds the posters, 15.9 MB (122 JPEGs 7.6 MB, four M2 Safari PNGs 8.2 MB). Laptop LCP
on this connection was 0.2 to 0.55 s. Over shared venue Wi-Fi at about 10 Mbit/s, the 4 MB M2 still
alone takes about 3 s, and a phone opening `/s/m2-intro` from the QR code downloads 4.5 MB.

The stage hides most of this. The audience window decodes the next slide's first image, the speaker
window decodes the step posters and the next two slides, and an intro slide pre-mounts the next frame.
Jumps (`g`, the drawer, a reload) and the reader pages on phones are not hidden.

### Image encoding trials (sharp 0.35)

| Set | Today | AVIF (text and grain safe: q70, 4:4:4) | WebP q85 | AVIF at display size |
|---|---|---|---|---|
| Intro stills, 13 PNG, resized to 1664 wide | 18.2 MB | 1.24 MB (7%) | 1.49 MB (8%) | 512 K at 832 wide (3%) |
| Backgrounds, 24 JPEG at 1920 by 1080 | 8.7 MB | 3.6 MB (42%) | 3.3 MB (38%) | q55 4:2:0 reaches 0.84 MB but smears the baked grain |
| M2 Safari posters, 4 PNG | 8.2 MB | 665 K (8%) | 784 K (10%) | |
| Step posters, 122 JPEG at 878 wide | 7.6 MB | 4.8 MB (63%) | 5.2 MB (68%) | |
| Trail photos (6 sampled), 1000 by 1000 WebP | 849 K | 522 K (61%) | | 181 K at 500 wide |

The intro stills are 2.1 to 2.5 times their largest CSS size (`max-width: 832px; max-height: 816px`
in `styles/components/intro.css`), and 1664 is exactly 2x. The backgrounds keep a baked film grain
mapped one to one to stage pixels (`public/backgrounds/README.md`), which is why they only shrink
by about 40 to 60 percent at a quality that keeps it.

### Compression and protocol

- Brotli is applied to every text type checked: HTML, RSC payloads (`text/x-component`), JS, CSS,
  SVG (`/qr/linkedin.svg`), and also OTF and TTF fonts. `/_health` (48 bytes) is below the
  compression threshold. No JSON response over 1 KB was in the request path, so JSON was not checked.
- Images are not re-compressed, which is correct.
- Every response came over HTTP/2. No response carried an `alt-svc` header, so HTTP/3 is not
  advertised, and the local curl cannot test it. Vercel controls this; there is nothing to change.

### Function size (from the repo, not from the build output)

`outputFileTracingIncludes` adds `checkedPublic` (`public/posters`, `public/intro`,
`public/images`, about 38 MB) to `/present`, `/speaker` and `/s/**` so the pages can call
`existsSync` on them. Shiki and its grammars add about 17 MB (`lib/highlight.ts` loads every
language in `LANGS`), and `public/demo-assets` adds 3 MB to every function. That matches the
52 MB noted at the previous deploy. The images are only checked for existence, never read.

## Recommendations, prioritized

Impact is on load time for the stage windows and the reader pages. Effort: S under an hour,
M half a day, L more. Risk is the chance of breaking the show.

| # | Change | Impact | Effort | Risk |
|---|---|---|---|---|
| 1 | Pre-build images as AVIF at display size | High | M | Low to medium (visual) |
| 2 | Long-lived cache headers on public assets, content-hashed where possible | High on stage resilience, medium on speed | S to M | Low |
| 3 | Make `/present` and `/speaker` static | Medium | M | Medium |
| 4 | Drop the 38 MB of images from the functions (build-time manifest) | Medium | S | Low |
| 5 | Cache frame build files on the CDN; warm the functions before the talk | Medium | S | Low |
| 6 | Speed Insights on the reader pages only | Measurement | S | Low |
| 7 | Build ID from the commit, deploy freeze, Skew Protection | Stage safety | S | Low |
| 8 | Fonts as WOFF2, preload the two stage weights | Low | S | Low |
| 9 | Function region `yul1` (Montréal) | Low | XS | Low |

### 1. Pre-build images as AVIF at display size (not Vercel Image Optimization)

- **Change.** Add `scripts/images.mts` (sharp, already installed with Next), run from `prebuild`
  or committed like `og`. Output beside the sources:
  - Intro stills: `public/intro/<name>-1664.avif` and `-832.avif`, AVIF q70 4:4:4 (plus a WebP
    q85 fallback if Safari 15 matters; every stage browser supports AVIF). In
    `components/page/IntroSlide.tsx`, render `srcSet="…-832.avif 832w, …-1664.avif 1664w"
    sizes="832px"` with `width` and `height` (the image has neither today, so reader pages shift
    layout when it loads). Point `page.visual.src` and the decode-ahead list in
    `components/stage/SlidePage.tsx` at the 1664 file.
  - Posters: `public/posters/**` to AVIF q70 at their current size. Change the `.jpg` in
    `DemoPageSlide.tsx` (`stepPoster`) and `SlidePage.tsx` (`slideImages`), and the M2 Safari
    PNGs to AVIF (8.2 MB to 0.67 MB).
  - Backgrounds: generate `public/backgrounds/v6/*.avif` at q70 4:4:4 and have `pnpm theme:sync`
    (`scripts/theme.mts`, writing `public/theme/backgrounds.css`) emit `image-set(url(…avif)
    type("image/avif"), url(…jpg) type("image/jpeg"))`. The frame only paints the background
    at 1396 by 785 (`styles/glass-tokens.css`), so it can take a smaller copy.
  - Trail photos in `public/demo-assets/trail/` are 1000 by 1000 and shown as small tiles. Re-encode
    them in place at about 500 wide, keeping the names because shown code references them.
- **Why not `images.unoptimized: false` with Vercel Image Optimization.** The backgrounds are CSS
  `url()`s, which `next/image` cannot serve, and the stage decodes ahead from raw URLs. The first
  request for each width is a transform, slow on a 4 MB PNG, so it would need warming before the
  talk, and transforms are metered. Pre-built files behave the same on every load and need nothing
  at request time. Leave `images.unoptimized: true`.
- **Expected.** Intro stills 18.2 MB to about 1.2 MB, posters 15.9 MB to about 5.5 MB, backgrounds
  8.7 MB to about 3.6 MB (12.9 MB to about 5.3 MB counting the copy each frame loads).
  `/s/m2-intro` drops from 4.5 MB to about 0.7 MB, `/s/d1-intro` from 1.76 MB to about 0.6 MB, and
  `/present?s=d4-now` from 3.1 MB to about 1.0 MB. The whole deck goes from about 52 MB (both
  windows) to about 14 MB. `lib/images.ts` already prefers `.avif` for slide images, so the
  convention exists.
- **Risk.** Text sharpness in the stills and the grain in the backgrounds need a look on the
  projector, or at 1920 by 1080, before swapping (design review; the grain spec in
  `public/backgrounds/README.md`). `title.jpg` feeds the cover hash, so run `pnpm og` and commit
  `public/og/*` after changing it. Open question for design: if the backgrounds dropped the baked
  grain and relied on the `theme/grain.png` overlay already in place, they would compress to tens
  of KB.

### 2. Long-lived cache headers on public assets

- **Change, short term (S).** In `next.config.ts` `headers()`, add `Cache-Control` per path:
  - `/backgrounds/v5/:path*` (and `v6`): `public, max-age=31536000, immutable`. The folder is
    already versioned; bump the folder on any change.
  - `/intro/:path*`, `/posters/:path*`, `/people/:path*`, `/demo-assets/:path*`, `/fonts/:path*`,
    `/theme/:path*`, `/runtime/:path*`, `/wrappers/:path*`, `/portal/:path*`, `/logos/:path*`:
    `public, max-age=86400, stale-while-revalidate=604800`. A browser then reuses its copy for a
    day with no round trip, and after any deploy a hard reload picks up changes.
  - Keep `/og/:path*` at the default (the `?v=` query already busts social caches).
  Next.js 16.4 allows this for public-folder paths
  (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md`,
  section Cache-Control); only hashed `/_next/static` files are fixed.
- **Change, durable (M, with item 1).** Have `scripts/images.mts` write content-hashed names
  (`d1.<hash8>.avif`) and a manifest the code reads, then mark those `immutable`. Version
  `demo-runtime.js` and `portal-glass.css` in `lib/frames/compose.ts` with `?v=<build id>` and mark
  them `immutable` too.
- **Why it matters on stage.** With today's `must-revalidate`, the cache warmed during rehearsal
  cannot cover a Wi-Fi drop. With these headers, a window opened before the talk serves every image
  it has already seen, with or without the network.
- **Risk.** A stale image for up to a day after a redeploy. Rule for talk week: after any deploy,
  hard-reload both windows (Shift+Reload) before rehearsing.

### 3. Make `/present` and `/speaker` static

- **Today.** Both are `force-dynamic` only to read `?s=` on the server: initial slide,
  `generateMetadata` and the `existsSync` checks. Each open or reload runs a function: 130 to
  215 ms warm, 1.37 s on the one cold hit measured (rare under Fluid, see above).
- **Change.** Add `app/present/[id]/page.tsx` and `app/speaker/[id]/page.tsx` with
  `generateStaticParams()` over `slides`, holding the current page bodies with `params.id` in place
  of `searchParams.s`. Keep the public URLs with a rewrite in `next.config.ts`:
  `{ source: "/present", has: [{ type: "query", key: "s", value: "(?<s>[a-z0-9-]+)" }],
  destination: "/present/:s" }` (same for `/speaker`), and bare `/present` to `slides[0]`. Then
  both windows are CDN hits, about 35 ms, and neither depends on a function.
- **Risk (medium).** Check that client code reading `?s=` and `?step=` (the sync channel and
  `components/stage/Stage.tsx`) still works under the rewrite, and that `?glass=off` and `?capture=1`, which the
  client reads, are unaffected. Run `pnpm walk` and the two-window sync check before shipping.
  This can wait until after the talk if time is short; item 5's warm-up covers the cold start.

### 4. Drop the 38 MB of images from the functions

- **Change.** Have `prebuild` write `content/.generated/public-files.json`, the list of files under
  `public/intro`, `public/posters` and `public/images`. Replace the `existsSync` calls in
  `components/stage/SlidePage.tsx` (`publicFile`), `components/page/IntroSlide.tsx`,
  `components/page/DemoPageSlide.tsx` (`posterExists`) and `lib/images.ts` with a lookup in that
  set. Then remove `checkedPublic` from `outputFileTracingIncludes` in `next.config.ts`.
- **Effect.** Page functions shrink from about 52 MB to about 14 MB: faster cold starts, uploads
  and deploys. With item 3, shiki also leaves the request path for the windows, since prerendering
  highlights at build.
- **Risk.** Low. `pnpm check` can assert the manifest matches the disk.

### 5. Cache frame build files on the CDN; warm the functions before the talk

- **Today.** Each frame mount makes 1 document request plus 2 to 5 function requests for the
  build's own files (`buildFile()` in `lib/frames/compose.ts` sends `no-store`), and D4's
  `/orders/index.html` is a 302. Every Back or jump remounts and repeats them. The theme, runtime
  and wrappers already come from the CDN.
- **Change.** In `buildFile()`, replace `"Cache-Control": "no-store"` with
  `"Cache-Control": "public, max-age=0, must-revalidate"` plus
  `"CDN-Cache-Control": "public, max-age=31536000"`. Each deployment starts with its own CDN cache,
  and these files are fixed for a deployment and do not depend on flags or host. Keep the composed
  documents (`frameResponse`), `/orders`, `/cms`, `/demo` and `/api` `no-store`. They depend on
  flags, host, the CSP and per-instance state.
- **Warm-up runbook (no code).** Ten minutes before the talk, open `/speaker` and `/present`, step
  into D1's used-to page and back. The intro slides already pre-mount the next frame in a hidden
  iframe, which absorbs a cold start during the talk.
- **Correctness note (not speed).** `globalThis.__pageState` in
  `app/demos/[demo]/[build]/[[...path]]/route.ts` keeps M5's last flags in one instance's memory.
  Under Fluid compute, a flagless page load that lands on a second instance falls back to the
  default flags. Consider carrying `flags` and `bg` on the links, or in a cookie scoped to the
  demo host.

### 6. Speed Insights on the reader pages only

- **Worth it.** It is the only way to see how `/s/<id>` behaves on audience phones over venue and
  cellular networks, and to confirm items 1 and 2 worked. `/_vercel/speed-insights/script.js`
  already answers 200, which suggests it is enabled on the project (not confirmed in the dashboard).
- **Change.** `pnpm add @vercel/speed-insights`. In `components/presenter/SiteAnalytics.tsx`,
  render `<SpeedInsights />` from `@vercel/speed-insights/next` next to `<Analytics />`, with the
  same `tracked()` guard and `beforeSend` returning `null` when the path starts with `/present` or
  `/speaker`. Frame documents never load a layout, so they stay clean, as Web Analytics does today.
- **Decision for you.** The free tier (10,000 events over 30 days, shared across the team) shows
  only the Real Experience Score. Speed Insights Plus adds LCP, INP, CLS and TTFB breakdowns by
  route and country for $10 per project per month on Pro
  (https://vercel.com/docs/speed-insights/limits-and-pricing, checked 29 October 2026).

### 7. Build ID, deploy freeze and Skew Protection

- **Build ID.** In `next.config.ts`, set `env: { NEXT_PUBLIC_BUILD_ID:
  process.env.NEXT_PUBLIC_BUILD_ID ?? process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) }`. Then
  `/_health` names the live commit (today it says `dev`), and the presenter's sync channel can
  tell two windows on different builds apart.
- **Skew Protection** (Settings, Advanced; Pro and Enterprise). It keeps the old deployment's
  assets and RSC payloads reachable for open tabs after a deploy. That matters when a fix ships
  while `/present` and `/speaker` are open. Whether it is on, and the team's plan, were not
  readable. Even with it on, freeze production deploys for an hour before the talk and reload both
  windows after any deploy.
- **Deployment Protection.** Keep Vercel Authentication on previews. Previews cannot run live
  frames anyway (`frame-ancestors` names only the production hosts), so nothing is lost.
- **Build cache.** Leave it on (the default). Nothing here benefits from turning it off.

### 8. Fonts as WOFF2, preload the stage weights

- **Change.** Convert the three Slalom Sans OTFs and Lora Italic to WOFF2, subsetting Lora Italic
  to Latin. Update `src` in `styles/fonts.css` and `styles/glass-tokens.css` (`theme:sync` copies
  them on). Preload Regular and Bold in `app/layout.tsx` (`<link rel="preload" as="font"
  type="font/woff2" crossOrigin="">`).
- **Effect.** About 76 K to about 50 K on first load, and no late font swap on the first slide.
  Small, but it is the one render-blocking asset that is not hashed.

### 9. Function region `yul1`

- **Change.** Settings, Functions, Function Region: `yul1` (Montréal), or `"regions": ["yul1"]` in
  a `vercel.json`/`vercel.ts`. There is no database to stay near, so the audience decides. `cle1`
  (Cleveland) is the alternative.
- **Effect.** Roughly 10 ms less per function request from Toronto than `iad1`. Frames make 3 to 6
  per mount. That is small next to items 1 to 5. Check regional pricing first; it is slightly higher.

## Already right; leave it

- `/` and every `/s/<id>` are prerendered at build (`generateStaticParams`, `x-nextjs-prerender:
  1`) and served as CDN hits; their RSC payloads are hits too.
- `/_next/static` is content-hashed and `immutable` for a year.
- Brotli covers all text responses, fonts included, over HTTP/2.
- Frame documents are `no-store` on purpose, and small (1.3 to 2.6 K).
- The F2 poster fallbacks are plain static JPEGs served by the CDN (60 K each).
- Web Analytics loads only on presenter pages and never in frames.

## Minor

- `public/logos/README.md` and `public/backgrounds/README.md` are publicly served (as
  `text/markdown`). Harmless; move them out of `public/` if that matters.
- `/robots.txt` runs a function on every request (it reads `host`). Fine at this volume.

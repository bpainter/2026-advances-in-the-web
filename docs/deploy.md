# Deploying to Vercel

One Vercel project, `2026-advances-in-the-web`, serves the presenter and the demo frames from the
same deployment on two domains. The two domains keep the presenter and the frames on different
origins (PRD Part A, 8.1), the same way `localhost:3000` and `127.0.0.1:3000` do locally.

## Project settings

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | the repository root (leave empty) |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` (runs `prebuild`: `theme:sync`, `asset-versions`, `qr` and `meters`) |
| Output directory | default (leave empty) |
| Node.js version | 22.x |
| Web Analytics | enabled (Analytics tab), or `/_vercel/insights/script.js` answers 404 |
| Speed Insights | enabled (Speed Insights tab), free tier; Plus is the speaker's call (PRD perf, open question 4) |
| Skew Protection | on, if the plan has it (Settings, Advanced): open windows keep the old deployment's files and RSC payloads after a deploy |
| Function region | the default (`iad1`); `yul1` (Montréal) is deferred until after the talk (PRD perf, P2-REGION) |

Do not set `NEXT_DIST_DIR` on Vercel; it exists only so `pnpm capture` can build beside `next dev`.

## Domains

Both domains point at the production deployment of the same project.

| Domain | Serves |
|---|---|
| `https://2026-advances-in-the-web.vercel.app` | the presenter: `/`, `/s/<id>`, `/present`, `/speaker` |
| `https://2026-advances-in-the-web-demos.vercel.app` | the demo frames: `/demos/...`, `/orders`, `/cases`, `/cms/...` and the files they load |

Any second hostname works. A frame document builds its CSP from the host it was requested on, and
names the presenter in `frame-ancestors`. Both hosts serve every route; only the origins the
presenter uses decide which host shows what.

## Environment variables

Set these for Production and Preview. They are `NEXT_PUBLIC_` values, inlined at build time, so
a change needs a new deployment. No trailing slash. A production build (`VERCEL_ENV=production`)
without `NEXT_PUBLIC_PRESENTER_ORIGIN` fails in `next.config.ts`: every canonical URL, Open Graph
URL and JSON-LD id is built from it, and would otherwise point at localhost.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_PRESENTER_ORIGIN` | `https://2026-advances-in-the-web.vercel.app` |
| `NEXT_PUBLIC_DEMO_ORIGIN` | `https://2026-advances-in-the-web-demos.vercel.app` |

Leave `NEXT_PUBLIC_FRAMEWORK_ORIGIN` and `NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN` unset. With a
presenter origin that is not `localhost` or `127.0.0.1`, an unset framework origin turns the F2
frames off (`lib/frames/origins.ts`): the F2 used-to and now pages show each step's captured
poster (`public/posters/f2-*`) with a note, and no browser is ever pointed at `localhost:3106`.
`NEXT_PUBLIC_BUILD_ID` is optional: `next.config.ts` defaults it to the first 7 characters of
`VERCEL_GIT_COMMIT_SHA`, which Vercel sets on Git deployments, and to `dev` elsewhere. It names the
build in `/_health` and in the presenter's sync channel, so two windows on different deployments
never drive each other.

Preview deployments have their own hostnames, which the frames' `frame-ancestors` does not name,
so live frames only run on the production domains; previews show the slides, code and posters.
Without the two values a build falls back to the local origins and points frames at
`127.0.0.1:3000`.

## What the build does

- `prebuild` writes the gitignored files the app reads: `public/theme/portal-glass.css` and
  `public/theme/backgrounds.css` (`pnpm theme:sync`), `content/.generated/asset-versions.json`
  and `content/.generated/public-files.json` (`pnpm asset-versions`, below), `public/qr/linkedin.svg`
  (`pnpm qr`) and `content/.generated/meters.json` (`pnpm meters`). `support.json`,
  `backgrounds.json` and `public/theme/grain.png` are committed.
- `pnpm asset-versions` (also in `predev`) hashes every file under `public/theme`,
  `public/runtime`, `public/wrappers` and `public/portal` into `asset-versions.json`; in
  production the frame shell links them with `?v=<first 8 hex of the SHA-256>` (see "Caching").
  It also lists the files under `public/intro`, `public/posters`, `public/images` and
  `public/opt` in `public-files.json`, which `assetExists()` in `lib/assets.ts` reads instead of
  the disk.
- The audience and speaker windows are prerendered per slide at `/present/<id>` and
  `/speaker/<id>`. Their addresses stay `/present?s=<id>` and `/speaker?s=<id>`: `next.config.ts`
  rewrites them before the filesystem routes, and bare `/present` or `/speaker` (or a malformed
  `s`) to the first slide. Every other parameter (`step`, `glass`, `capture`, `fade`, `rehearse`)
  is read in the browser. The presenter provider (shared state and sync), the audience view and
  the speaker's controls live in `app/present/layout.tsx` and `app/speaker/layout.tsx`, so a
  slide move swaps only the page; anything that must outlast a slide belongs there, not in a page.
- The server reads demo sources with `fs` at request time. `outputFileTracingIncludes` in
  `next.config.ts` puts them in every function: `content/sections/**`, the demo folders except
  the two F2 apps, `fixtures/*.json`, `public/demo-assets/**`, the generated JSON, the F2 today
  app's `app/` and `lib/` sources (the used-to page excerpts three of them), and the generated
  JSON lists above. The posters, intro stills and slide images are not in any function: pages
  ask `assetExists()` (`lib/assets.ts`), which answers from `public-files.json` (PRD perf,
  P1-FUNC). Page functions trace about 15 MB (63 MB before). Keep every `fs` path under `public/`
  behind `/*turbopackIgnore: true*/`, or Turbopack traces all of `public/` into the function
  again; `pnpm perf functions` after `pnpm build` shows it.
- Vercel Web Analytics (`components/presenter/SiteAnalytics.tsx`) loads on the presenter's pages
  only, and only on Vercel builds. Speed Insights loads on `/` and `/s/<id>` only, never in
  `/present`, `/speaker` or a frame, so the stage windows never fetch its script. Frame documents
  come from route handlers, which no layout wraps, so they load neither. Windows under automation
  (Playwright walks and captures) and `?capture=1` send nothing.

## Caching

Production builds only (`NODE_ENV=production`, so `next start` too); `pnpm dev` keeps Next's
revalidating defaults and frame files stay `no-store`, so edits show at once. Rules live in
`next.config.ts` `headers()` and `lib/frames/compose.ts` (PRD perf, P0-5, P1-CACHE and
P1-FRAMEFILES).

| Path class | `Cache-Control` | Why |
|---|---|---|
| `/_next/static/**` | `public, max-age=31536000, immutable` (Next) | content-hashed names |
| `/backgrounds/v5/*`, `/fonts/v2/*` | `public, max-age=31536000, immutable` | folder-versioned: change a file, bump the folder |
| `/opt/*` | `public, max-age=31536000, immutable`, plus the cross-origin asset headers | content hash in the name (`pnpm images`) |
| `/theme`, `/runtime`, `/wrappers`, `/portal` with `?v=` | `public, max-age=31536000, immutable` | the frame shell adds `?v=<content hash>` in production |
| `/intro`, `/posters`, `/images`, `/people`, `/logos`, `/demo-assets`, `/fonts`, `/qr`, and `/theme`, `/runtime`, `/wrappers`, `/portal` without `?v=` | `public, max-age=3600, stale-while-revalidate=86400` | names never change (shown code names `demo-assets` files, CSS names `grain.png`): an hour with no round trip, then a cached copy is used while the browser rechecks, so a dropped Wi-Fi still paints a cached slide |
| `/og/*` | default (`public, max-age=0, must-revalidate` on Vercel) | `?v=` on the meta tag busts social caches |
| `/`, `/s/<id>`, `/present?s=<id>`, `/speaker?s=<id>` and their RSC payloads | default (`public, max-age=0, must-revalidate` on Vercel; `s-maxage=31536000` under `next start`) | prerendered; a deploy shows on the next load |
| Frame build files: a build's own CSS, JS and images, `/app.js`, `/app.css`, `/demo/*`, `/vendor/*`, M1's photos | `public, max-age=300, stale-while-revalidate=86400` and `Vercel-CDN-Cache-Control: public, max-age=31536000` | fixed per deployment; each deployment starts with an empty CDN cache. The CDN header never reaches the browser |
| Frame documents (`/demos/<demo>/<build>`, `/orders`, D4's and F3's documents, M3's inner page) and state (`/api`, `/cases`, `/cms`, D9's measurements, M2's photo pages, M5's product API) | `no-store` | depend on flags, the host, the CSP and per-instance state |

A cached unversioned file can be up to an hour old after a deploy, and `stale-while-revalidate`
may serve one stale copy after that. Hence the deploy freeze ("Talk day"), and a cache clear in
the talk profile after any deploy. Anything that changes often is content-hashed.

`pnpm perf headers --origin=<presenter>` fetches one URL per rule on both origins and fails on
any row that differs.

## Search and social

The presenter's reader pages are meant to be found and shared; everything else is not (PRD r7,
section 10).

| Route | Indexed | Metadata |
|---|---|---|
| `/` | yes | the talk: Open Graph, Twitter card, canonical `/`, JSON-LD of the talk, speaker and session |
| `/s/<id>` | yes | the slide: its own title and description, canonical `/s/<id>`, per-slide JSON-LD |
| `/present`, `/speaker` | no (`noindex, follow`) | the `?s=` slide's Open Graph data, canonical to its `/s/<id>`, no JSON-LD |
| frame documents and files | no | none: route handlers, no layout |

- **Metadata.** `lib/seo.ts` builds every route's metadata in full (title, description, Open
  Graph, Twitter, canonical, author) on `NEXT_PUBLIC_PRESENTER_ORIGIN`. The JSON-LD renders as a
  `<script type="application/ld+json">` at the top of `<body>` (the App Router has no per-page
  head slot for scripts; crawlers read it anywhere).
- **The share image.** One image, `public/og/cover.jpg` (1200 by 630), captured from the cover
  and committed: Vercel builds have no browser. `pnpm og` captures it from `pnpm dev` (or
  `DECK_URL=<server> pnpm og`) and writes `public/og/cover.json`, the SHA-256 of what the cover is
  drawn from (the title slide, `deck.speaker`, `deck.event`, `title.jpg`, the cover's CSS, the
  title branch of `GlassSlide.tsx` and its components, the Slalom Sans files). `pnpm check` fails
  with "The cover changed; run pnpm og" when any of them changes. The image URL carries
  `?v=<first 8 of the hash>`, so social caches refresh when it does. Commit both files.
- **Robots.** `/robots.txt` reads the `host` header. The presenter host allows `/` and `/s/`,
  disallows the windows and the frame routes, and names `/sitemap.xml`. The demo host, and any
  other host such as a preview, answers `Disallow: /`. Every response from the demo host also
  carries `X-Robots-Tag: noindex, nofollow` (`next.config.ts`, keyed on the hostname of
  `NEXT_PUBLIC_DEMO_ORIGIN`; the frame responses set it too).
- **Sitemap.** `/sitemap.xml` lists `/` and every `/s/<id>` on the presenter origin, dated at
  build time.
- **Event data.** `content/deck.ts` `event` feeds the Event JSON-LD. Until `startDate` and `venue`
  are set, it ships without a date or venue name and `pnpm check` warns.

After a production deploy:

```sh
curl -s https://2026-advances-in-the-web.vercel.app/s/d1-used-to | rg 'og:image|twitter:card|rel="canonical"|application/ld\+json'
curl -s https://2026-advances-in-the-web.vercel.app/robots.txt
curl -s https://2026-advances-in-the-web-demos.vercel.app/robots.txt        # Disallow: /
curl -sI "https://2026-advances-in-the-web-demos.vercel.app/demos/01-layered-ui/today" | rg -i x-robots-tag
curl -s https://2026-advances-in-the-web.vercel.app/sitemap.xml | rg -c '<loc>'   # 51
```

Then run Google's Rich Results Test on `/` and `/s/d1-used-to`, and preview a share in LinkedIn's
Post Inspector and in Slack. LinkedIn caches a card for about a week; Post Inspector refetches it.

## Not deployed: the F2 apps

`demos/06-framework-cache` and `demos/06-framework-cache-today` are separate Next apps (ports 3106
and 3107 locally). The main build ignores them: TypeScript excludes `demos/**`, file tracing
excludes both folders except the today app's `app/` and `lib/` sources, and the root install never
installs them.

To deploy them later, add two projects from the same repository:

| Project | Root directory | Domain (example) |
|---|---|---|
| `2026-advances-in-the-web-f2` | `demos/06-framework-cache` | `https://2026-advances-in-the-web-f2.vercel.app` |
| `2026-advances-in-the-web-f2-today` | `demos/06-framework-cache-today` | `https://2026-advances-in-the-web-f2-today.vercel.app` |

Each needs `PRESENTER_ORIGIN` and `DEMO_ORIGIN` set to the two origins above (its `proxy.ts`
writes them into its CSP) and the theme copies `pnpm theme:sync` writes into its `public/`. Either
build from the root (`cd ../.. && pnpm install --frozen-lockfile && pnpm -s theme:sync && cd -
&& pnpm build`, with source files outside the root directory included, the Vercel default) or
commit the copies. Then set `NEXT_PUBLIC_FRAMEWORK_ORIGIN` and
`NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN` on the presenter project and redeploy it.

Check two things before relying on them on stage. The apps keep their request log in memory, so
a log read can reach a different instance than the request it describes. And the frame session
cookie (`f2s`) is same site locally but third party between two `vercel.app` domains, where
browsers block it unless it is set `SameSite=None; Secure; Partitioned`.

## Checking a build locally

Build a clean copy with the production values pointed at a local port and start it:

```sh
NEXT_PUBLIC_PRESENTER_ORIGIN=http://localhost:3200 NEXT_PUBLIC_DEMO_ORIGIN=http://127.0.0.1:3200 pnpm build
NEXT_PUBLIC_PRESENTER_ORIGIN=http://localhost:3200 NEXT_PUBLIC_DEMO_ORIGIN=http://127.0.0.1:3200 pnpm exec next start -p 3200
```

Use `NEXT_DIST_DIR` for a build inside a checkout where `next dev` is running, or build a copy of
the checkout elsewhere. Then check it:

```sh
pnpm perf headers --origin=http://localhost:3200   # every caching rule, both origins
pnpm warmup --origin=http://localhost:3200         # every page, frame and file; the build ID
```

Under `next start`, prerendered pages answer `s-maxage=31536000` and `Vercel-CDN-Cache-Control`
reaches the client; Vercel rewrites the first and strips the second. On that build,
`http://localhost:3200/robots.txt` is the presenter's and `http://127.0.0.1:3200/robots.txt` the
demo host's, and every `127.0.0.1:3200` response carries `X-Robots-Tag`. To see the F2
poster fallback, use two `*.localhost` hostnames (for example `http://deck.localhost:3201` and
`http://frames.localhost:3201`): the presenter is then not local, so the F2 frames are off.

## Measuring

`pnpm perf <task> [--origin=<presenter>] [--demo=<demo origin>] [--profile=none|venue|poor]`
(PRD perf, 9.2). The origin defaults to production; the demo origin follows from it. Each run
writes `docs/perf/results/<date>-<commit>-<task>.json` (`--label=<name>` keeps two runs apart) and
prints a markdown table. The review's original scripts and raw results are in
`docs/perf/baseline/`.

| Task | Measures |
|---|---|
| `pnpm perf load` | first load, cold then warm: TTFB, FCP, LCP, CLS, blocking time, hydration, frame s0, requests, bytes, 304s |
| `pnpm perf nav` | key to paint, background, intro still and frame s0 (`--mode=reader\|audience`, `--variant=prefetch\|noprefetch\|nowarm\|control`) |
| `pnpm perf frame` | step Back replays and the demo-origin requests per frame mount |
| `pnpm perf walk` | the whole deck, cold then warm: bytes, requests, 304s (`--mode`, `--offline` reloads reader slides with the network cut) |
| `pnpm perf headers` | `cache-control`, `x-vercel-cache` and `x-vercel-id` per caching rule, both origins |
| `pnpm perf lighthouse` | Lighthouse 12.8.2 (through `pnpm dlx`), desktop and mobile, performance and accessibility |
| `pnpm perf functions` | traced size per route from the last build's `.nft.json` files (`--root`, `--dist`) |

`venue` is 20 Mbit/s down, 5 up, 60 ms RTT; `poor` is 5 down, 1 up, 150 ms.

After a production deploy: `curl -s <presenter>/_health` names the merged commit, then
`pnpm perf headers` and `pnpm warmup`, then `pnpm perf load --profile=venue`,
`pnpm perf nav --profile=venue`, `pnpm perf frame`, `pnpm perf walk` and `pnpm perf lighthouse`.

## Talk day

PRD perf, section 11 and decision D7. T is the talk's start.

**Freeze.**

- Code freeze for performance and accessibility work at T minus 72 hours; after that only stage
  fixes merge.
- Final rehearsal on production at T minus 48 to 24 hours, on the exact deployment. Write its
  URL here (the `…-<hash>-antifusion.vercel.app` deployment URL) so Instant Rollback can return
  to it: `____________________`.
- No production deploys from T minus 24 hours: work goes to branches (previews only).
- Any deploy after the final rehearsal reruns this whole checklist, including the cache clear in
  step 5.

**The warm-up.** `pnpm warmup [--origin=<presenter>] [--demo=<demo origin>] [--expect=<sha>]`
from the talk laptop, on the network the talk will use, from a checkout of the deployed commit:

- `GET /_health`; fails if the build differs from `--expect` (default `git rev-parse --short HEAD`).
- `GET /`, every `/s/<id>`, `/present?s=title` and `/speaker?s=title`, then every framed page's
  frame document at its step-0 URL (built as `PageFrame` builds it) and every script, stylesheet,
  image and font those documents and stylesheets load, and every image, font, theme file and
  Next chunk the pages name, each on the origin that loads it.
- Prints count, failures, median and p95 TTFB, kilobytes, effective Mbit/s and CDN hits per class.
  Exits non-zero on any 4xx or 5xx, a network error or a build mismatch.
- It warms the CDN PoP the room reaches and the functions. It does not warm the browser: step 7
  does that.

**Before T minus 24 hours (deploy freeze)**

1. The production deployment is the rehearsed one. Its URL is noted above for Instant Rollback.
2. `/_health` names the expected commit.
3. A local fallback is built from the same commit and tested once, with production origins pointed
   at a local port ("Checking a build locally"), plus the F2 apps.

**At the venue, T minus 60 minutes**

4. Join the venue Wi-Fi (or the tether you trust more). Run `pnpm warmup`. Green, the build ID
   matches, and frame documents have a median TTFB of 300 ms or less. If it fails twice, switch
   to the local fallback (step 3) and stop here.
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

**If the Wi-Fi drops mid-talk.** Slides, backgrounds and stills keep painting from the browser
cache. Frame documents are `no-store` and need the network; the local fallback is the answer.

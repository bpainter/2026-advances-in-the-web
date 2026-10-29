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
| Build command | `pnpm build` (runs `prebuild`: `theme:sync`, `qr` and `meters`) |
| Output directory | default (leave empty) |
| Node.js version | 22.x |
| Web Analytics | enabled (Analytics tab), or `/_vercel/insights/script.js` answers 404 |

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
a change needs a new deployment. No trailing slash.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_PRESENTER_ORIGIN` | `https://2026-advances-in-the-web.vercel.app` |
| `NEXT_PUBLIC_DEMO_ORIGIN` | `https://2026-advances-in-the-web-demos.vercel.app` |

Leave `NEXT_PUBLIC_FRAMEWORK_ORIGIN` and `NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN` unset. With a
presenter origin that is not `localhost` or `127.0.0.1`, an unset framework origin turns the F2
frames off (`lib/frames/origins.ts`): the F2 used-to and now pages show each step's captured
poster (`public/posters/f2-*`) with a note, and no browser is ever pointed at `localhost:3106`.
`NEXT_PUBLIC_BUILD_ID` is optional; it names the build in `/_health` and the presenter's sync
channel.

Preview deployments have their own hostnames, which the frames' `frame-ancestors` does not name,
so live frames only run on the production domains; previews show the slides, code and posters.
Without the two values a build falls back to the local origins and points frames at
`127.0.0.1:3000`.

## What the build does

- `prebuild` writes the gitignored files the app reads: `public/theme/portal-glass.css` and
  `public/theme/backgrounds.css` (`pnpm theme:sync`), `public/qr/linkedin.svg` (`pnpm qr`) and
  `content/.generated/meters.json` (`pnpm meters`). `support.json`, `backgrounds.json` and
  `public/theme/grain.png` are committed.
- The server reads demo sources with `fs` at request time. `outputFileTracingIncludes` in
  `next.config.ts` puts them in every function: `content/sections/**`, the demo folders except
  the two F2 apps, `fixtures/*.json`, `public/demo-assets/**`, the generated JSON, the F2 today
  app's `app/` and `lib/` sources (the used-to page excerpts three of them), and for the page
  routes the posters, intro stills and slide images whose existence they check.
- Vercel Web Analytics (`components/presenter/SiteAnalytics.tsx`) loads on the presenter's pages
  only, and only on Vercel builds. Frame documents come from route handlers, which no layout
  wraps, so they never load it. Windows under automation (Playwright walks and captures) and
  `?capture=1` send nothing.

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

Use `NEXT_DIST_DIR` for a build inside a checkout where `next dev` is running. To see the F2
poster fallback, use two `*.localhost` hostnames (for example `http://deck.localhost:3201` and
`http://frames.localhost:3201`): the presenter is then not local, so the F2 frames are off.

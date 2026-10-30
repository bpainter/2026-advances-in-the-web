import type { NextConfig } from "next";
import { DEMO_ORIGIN, PRESENTER_ORIGIN } from "./lib/frames/origins";

/**
 * Production guard (PRD r7, 10.1): canonical URLs, Open Graph URLs and JSON-LD ids are built from
 * NEXT_PUBLIC_PRESENTER_ORIGIN. A production build without it would point them all at localhost.
 */
if (process.env.VERCEL_ENV === "production" && !process.env.NEXT_PUBLIC_PRESENTER_ORIGIN && process.argv.includes("build")) {
  throw new Error("NEXT_PUBLIC_PRESENTER_ORIGIN is unset on a production build; every canonical URL would point at localhost (docs/deploy.md).");
}

/**
 * Every response from the demo host carries `X-Robots-Tag: noindex, nofollow` (PRD r7, 10.4). The
 * host comes from NEXT_PUBLIC_DEMO_ORIGIN at build (127.0.0.1 locally); Next matches `has` hosts
 * without the port, so the rule is left out when the two origins share a hostname.
 */
const demoHost = new URL(DEMO_ORIGIN).hostname;
const presenterHost = new URL(PRESENTER_ORIGIN).hostname;
const demoNoindex =
  demoHost === presenterHost ? [] : [{ source: "/:path*", has: [{ type: "host" as const, value: demoHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];

// Static assets that sandboxed (opaque-origin) demo documents fetch cross-origin.
const crossOriginAssets = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
];

/**
 * Files the server reads with fs at request time (docs/deploy.md). Every read is rooted at
 * process.cwd() with a runtime path, which file tracing cannot follow, so the functions on Vercel
 * get them from these globs: the shown files and today builds the frames compose and the code
 * panels excerpt, the generated JSON, and the fixtures. The F2 apps are separate Next apps and
 * not part of this deployment; only the three files the F2 used-to page excerpts are read.
 */
const runtimeSources = [
  "./content/sections/**/*",
  "./content/.generated/support.json",
  "./content/.generated/meters.json",
  // Written in prebuild (scripts/asset-versions.mts): the frame shell's ?v= hashes and the list of
  // files under public/intro, posters, images and opt that assetExists() answers from. The images
  // manifest comes from pnpm images (WS-3).
  "./content/.generated/asset-versions.json",
  "./content/.generated/public-files.json",
  "./content/.generated/images.json",
  // Every demo folder but the two 06 (F2) apps; Turbopack's globs have no !(...) negation.
  "./demos/{0[0-57-9],[1-9][0-9]}-*/**/*",
  "./demos/06-framework-cache-today/app/**/*.tsx",
  "./demos/06-framework-cache-today/lib/**/*.ts",
  "./fixtures/*.json",
  // M1 (demos/12-anchor-hotspots) serves photos from here through a demo route.
  "./public/demo-assets/**/*",
];
// Page routes no longer carry public/posters, intro and images (about 38 MB) to check which exist
// (docs/PRD-perf.md, P1-FUNC): assetExists() in lib/assets.ts answers from public-files.json. A
// new existsSync on public/ would need them back, and a path.join(process.cwd(), "public", …)
// without /*turbopackIgnore: true*/ makes Turbopack trace all of public/ into the function.

/**
 * Browser and CDN caching for public/ (docs/PRD-perf.md, P0-5 and P1-CACHE; docs/deploy.md,
 * "Caching"). Production builds only, so `pnpm dev` and the walks keep Next's revalidating default.
 * Versioned files are immutable for a year: backgrounds/v5 and fonts/v2 by folder, public/opt by
 * content hash in the name, and theme, runtime, wrapper and portal files when the frame shell
 * links them with `?v=<content hash>`. Everything else keeps its name across deploys, so it gets an
 * hour, then may be used stale for a day while the browser rechecks: a dropped Wi-Fi still paints
 * a cached slide. /og keeps the default (its ?v= busts social caches). HTML and RSC are untouched
 * (must-revalidate), and frame documents send their own no-store. For one path, the last rule
 * that sets a header wins, so the immutable rules come after the hour-long ones.
 */
const PRODUCTION = process.env.NODE_ENV === "production";
const IMMUTABLE = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
const HOUR = [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }];
const UNVERSIONED = ["intro", "posters", "images", "people", "logos", "demo-assets", "fonts", "qr", "theme", "runtime", "wrappers", "portal"];
const SHELL_VERSIONED = ["theme", "runtime", "wrappers", "portal"];
const cacheRules = PRODUCTION
  ? [
      ...UNVERSIONED.map((dir) => ({ source: `/${dir}/:path*`, headers: HOUR })),
      { source: "/backgrounds/v5/:path*", headers: IMMUTABLE },
      { source: "/fonts/v2/:path*", headers: IMMUTABLE },
      { source: "/opt/:path*", headers: [...IMMUTABLE, ...crossOriginAssets] },
      ...SHELL_VERSIONED.map((dir) => ({ source: `/${dir}/:path*`, has: [{ type: "query" as const, key: "v" }], headers: IMMUTABLE })),
    ]
  : [];

/**
 * The audience and speaker windows are prerendered per slide at /present/<id> and /speaker/<id>
 * (docs/PRD-perf.md, P1-PRERENDER) while their addresses stay /present?s=<id> and
 * /speaker?s=<id>. These run before the filesystem routes: a well-formed `s` goes to its page (an
 * unknown id renders the first slide on demand), and any other /present or /speaker (bare, or a
 * malformed `s`) to the first slide, as `?s=` always fell back. The other parameters pass through
 * and are read on the client (`rehearse` too, by the speaker's shell).
 */
const FIRST_SLIDE = "title";
const presentRewrites = ["/present", "/speaker"].flatMap((route) => [
  { source: route, has: [{ type: "query" as const, key: "s", value: "(?<s>[a-z0-9-]+)" }], destination: `${route}/:s` },
  { source: route, destination: `${route}/${FIRST_SLIDE}` },
]);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // /_health and the presenter's sync channel name the build (docs/PRD-perf.md, P0-6).
  env: { NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID ?? process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev" },
  outputFileTracingIncludes: {
    "/**": runtimeSources,
  },
  outputFileTracingExcludes: {
    "/**": ["./demos/06-framework-cache/**/*", "./demos/06-framework-cache-today/{node_modules,.next,public,fixtures,scripts,components}/**/*", "./fixtures/vite-measure/**/*"],
  },
  // No dev badge on stage or in captures (design review B1).
  devIndicators: false,
  // A second build directory lets a production build run beside `next dev` (pnpm capture).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: { unoptimized: true },
  async rewrites() {
    return { beforeFiles: presentRewrites, afterFiles: [], fallback: [] };
  },
  async headers() {
    return [
      ...cacheRules,
      { source: "/fonts/:path*", headers: crossOriginAssets },
      { source: "/demo-assets/:path*", headers: crossOriginAssets },
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      ...demoNoindex,
    ];
  },
};

export default nextConfig;

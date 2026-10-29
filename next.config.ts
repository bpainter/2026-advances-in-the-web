import type { NextConfig } from "next";

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
  // Every demo folder but the two 06 (F2) apps; Turbopack's globs have no !(...) negation.
  "./demos/{0[0-57-9],[1-9][0-9]}-*/**/*",
  "./demos/06-framework-cache-today/app/**/*.tsx",
  "./demos/06-framework-cache-today/lib/**/*.ts",
  "./fixtures/*.json",
  // M1 (demos/12-anchor-hotspots) serves photos from here through a demo route.
  "./public/demo-assets/**/*",
];
// Page routes check which stills and posters exist under public/ before they link them.
const checkedPublic = ["./public/posters/**/*", "./public/intro/**/*", "./public/images/**/*"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/**": runtimeSources,
    "/present": checkedPublic,
    "/speaker": checkedPublic,
    "/s/**": checkedPublic,
  },
  outputFileTracingExcludes: {
    "/**": ["./demos/06-framework-cache/**/*", "./demos/06-framework-cache-today/{node_modules,.next,public,fixtures,scripts,components}/**/*", "./fixtures/vite-measure/**/*"],
  },
  // No dev badge on stage or in captures (design review B1).
  devIndicators: false,
  // A second build directory lets a production build run beside `next dev` (pnpm capture).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: { unoptimized: true },
  async headers() {
    return [
      { source: "/fonts/:path*", headers: crossOriginAssets },
      { source: "/demo-assets/:path*", headers: crossOriginAssets },
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;

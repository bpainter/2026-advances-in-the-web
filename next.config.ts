import type { NextConfig } from "next";

// Static assets that sandboxed (opaque-origin) demo documents fetch cross-origin.
const crossOriginAssets = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

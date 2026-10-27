import type { NextConfig } from "next";

// Static assets that sandboxed (opaque-origin) demo documents fetch cross-origin.
const crossOriginAssets = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

import type { NextConfig } from "next";

// Cache Components off: the implicit model (route segment configs, fetch options).
const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;

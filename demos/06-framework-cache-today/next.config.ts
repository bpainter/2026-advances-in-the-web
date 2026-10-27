import type { NextConfig } from "next";

// Cache Components off: the implicit model (route segment configs, fetch options).
const nextConfig: NextConfig = {
  agentRules: false,
};

export default nextConfig;

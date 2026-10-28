import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default nextConfig;

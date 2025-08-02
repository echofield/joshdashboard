import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // Disables Vercel's CSS optimization
  },
};

export default nextConfig;
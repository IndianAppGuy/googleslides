import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Suppress ESLint warnings during builds
  },
};

export default nextConfig;

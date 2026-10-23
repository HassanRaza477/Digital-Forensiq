import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache to prevent Webpack PackFileCacheStrategy ERR_MEMORY_ALLOCATION_FAILED on Windows
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;

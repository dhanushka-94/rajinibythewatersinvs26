import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
  images: {
    // assets are pre-sized and pre-compressed for pixel-exact rendering
    unoptimized: true,
  },
};

export default nextConfig;

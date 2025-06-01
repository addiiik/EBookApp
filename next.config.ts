import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    scrollRestoration: false
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "images", hostname: "**" }] }
};

export default nextConfig;
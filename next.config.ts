import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Keep Next's built-in image optimizer and Vercel's CDN defaults.
    minimumCacheTTL: 60
  },
  async headers() {
    return [
      {
        // API responses are private by default. Individual public endpoints
        // may explicitly opt into shared caching in their route handlers.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      },
      {
        // Next fingerprints static assets, so they are safe to cache for a year.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      }
    ];
  }
};

export default nextConfig;

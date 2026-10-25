import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Allow external images for book covers
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" }, // Allow any HTTPS image source
    ],
  },

  // Experimental features
  experimental: {
    // Server Actions are stable in Next 15
    serverActions: {
      bodySizeLimit: "4mb", // For CSV imports and cover uploads
    },
  },

  // Don't fail build on lint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Don't fail build on TS errors (we run typecheck separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

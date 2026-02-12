import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "imgur.com",
      "i.imgur.com",
      "localhost" // For local development assets if served differently or future expansion
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
    ],
  },
  experimental: {
    // serverActions: true, // Not strictly needed in Next 15 as it's stable, but good to check docs if specific flags needed
  },
  // Ensure we can use API routes in Netlify
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
};

export default nextConfig;

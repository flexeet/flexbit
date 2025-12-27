import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.stockbit.com',
        pathname: '/logos/**',
      },
      {
        protocol: 'https',
        hostname: 'flxr2.com',
        pathname: '/flexbit/**',
      }
    ],
  },
};

export default nextConfig;


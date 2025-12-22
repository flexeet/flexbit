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
    ],
  },
};

export default nextConfig;


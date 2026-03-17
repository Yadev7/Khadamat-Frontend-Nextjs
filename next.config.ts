import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // Changed from 3000 to 3001
        pathname: '/uploads/**', // Changed to match your error path
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/v1/files/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
    // 'domains' is deprecated in newer Next.js versions; 
    // remotePatterns is the modern way to do it.
  },
};

export default nextConfig;
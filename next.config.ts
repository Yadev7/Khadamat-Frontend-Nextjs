import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Next 16 blocks cross-origin requests to dev-only assets/endpoints by
  // default (only `localhost` is allowed). Opening the dev server via
  // http://127.0.0.1:3000 then silently fails to hydrate (stuck on the
  // AuthGuard spinner). Allow the alternate hosts used in local dev.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.5'],
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/api/v1/files/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
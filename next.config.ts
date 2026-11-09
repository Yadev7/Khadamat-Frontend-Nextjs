import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // تحديد جذر Turbopack لحل تحذيرات المسار ومجلد الـ Frontend
  turbopack: {
    root: '.',
  },
  // السماح بربط الـ IP الفعلي الذي يظهر في التيرمينال لديك (192.168.56.1)
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.5', '192.168.56.1'],
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
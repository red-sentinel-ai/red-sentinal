import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oqymtqolwjujkayjyxdt.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

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
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    return config
  },
}

export default nextConfig

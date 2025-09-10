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
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    })

    if (isServer) {
      config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm'
    } else {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    }

    return config
  },
}

export default nextConfig

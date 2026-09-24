import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
})

// ── Content Security Policy ─────────────────────────────────────────────────
// Follows Privy's guide: https://docs.privy.io/security/implementation-guide/content-security-policy
//
// Rollout: the policy ships as `Content-Security-Policy-Report-Only` until
// CSP_ENFORCE=true is set in the environment, which switches it to an
// enforcing `Content-Security-Policy` header. Run through every flow (login,
// wallet connect on EVM/Solana/Sui, deploy/fund/attack, inbox, chat) in each
// environment with violations visible in the browser console before enforcing.
//
// Known gaps to revisit:
// - `NEXT_PUBLIC_SOLANA_RPC_URL` (Helius/QuickNode) host must be appended to
//   connect-src when a private RPC is configured in production.
// - script-src keeps 'unsafe-inline' because Next.js App Router injects
//   inline bootstrap scripts; harden with nonces via middleware later.
// - 'unsafe-eval' is only added outside production (React/Next dev tooling).
const CSP_ENFORCE = process.env.CSP_ENFORCE === 'true'

const cspDirectives = [
  "default-src 'self'",
  // challenges.cloudflare.com — Privy CAPTCHA (Turnstile)
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${
    process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''
  }`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://oqymtqolwjujkayjyxdt.supabase.co https://pbs.twimg.com https://api.dicebear.com https://img.walletconnect.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Privy iframe + WalletConnect verification iframes + Turnstile
  "child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com",
  "frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com",
  [
    'connect-src',
    "'self'",
    // Red Sentinel APIs
    'https://api.redsentinel.xyz',
    'https://notifications-api.redsentinel.xyz',
    'wss://notifications-ws.redsentinel.xyz',
    'https://tee-evm.redsentinel.xyz',
    // Supabase (DB + realtime websocket)
    'https://oqymtqolwjujkayjyxdt.supabase.co',
    'wss://oqymtqolwjujkayjyxdt.supabase.co',
    // Privy
    'https://auth.privy.io',
    'https://*.rpc.privy.systems',
    // WalletConnect + Coinbase Wallet
    'wss://relay.walletconnect.com',
    'wss://relay.walletconnect.org',
    'wss://www.walletlink.org',
    'https://explorer-api.walletconnect.com',
    // Solana RPCs (public fallbacks; Privy embedded wallets submit here too)
    'https://api.mainnet-beta.solana.com',
    'https://api.devnet.solana.com',
    // Sui RPCs (constants/sui-rpc.ts)
    'https://sui-rpc.publicnode.com',
    'https://sui-testnet-rpc.publicnode.com',
    'https://sui-mainnet-endpoint.blockvision.org',
    'https://sui-testnet-endpoint.blockvision.org',
    // EVM RPCs (lib/wagmi.ts chain defaults + BOT Chain failovers)
    'https://bsc-dataseed.binance.org',
    'https://data-seed-prebsc-1-s1.bnbchain.org',
    'https://arb1.arbitrum.io',
    'https://sepolia-rollup.arbitrum.io',
    'https://rpc.monad.xyz',
    'https://testnet-rpc.monad.xyz',
    'https://rpc.botchain.ai',
    'https://rpc.bohr.life',
    'https://rpc.kfeeswwz.cn',
    'https://rpc.amdixawp.cn',
    'https://rpc.jnhkpbxr.cn',
    'https://rpc.rpynemmx.cn',
    'https://rpc.kzrmeznc.cn',
    // Walrus aggregator (agent chat/explorer)
    'https://aggregator.walrus-mainnet.walrus.space',
  ].join(' '),
  // next-pwa service worker
  "worker-src 'self'",
  "manifest-src 'self'",
].join('; ')

const cspHeader = {
  key: CSP_ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
  value: cspDirectives,
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [cspHeader],
      },
    ]
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oqymtqolwjujkayjyxdt.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, { isServer, dev }) {
    config.experiments = {
      layers: true,
    }

    config.ignoreWarnings = [
      { module: /node_modules[\\/]ox[\\/]_esm[\\/]tempo/ },
    ]

    return config
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  skipTrailingSlashRedirect: true,
}

export default withPWA(nextConfig)

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Red Sentinel',
    short_name: 'RedSentinel',
    description:
      'On-chain AI security arena with two Sentinel types: Security Sentinels for testing real agent boundaries, and brand-safe Campaign Sentinels for partner communities. Attack Sentinels, earn bounties, build on-chain proof of skill.',
    start_url: '/',
    display: 'standalone',
    background_color: '#100f0f',
    theme_color: '#100f0f',
    orientation: 'portrait-primary',
    categories: ['games', 'security', 'education'],
    icons: [
      { src: '/icons/pwa-72x72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/pwa-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/pwa-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/pwa-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/pwa-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/pwa-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/pwa-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Attack Sentinels',
        short_name: 'Attack',
        description: 'Attack a live Sentinel and earn bounties',
        url: '/attack',
        icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Practice Lab',
        short_name: 'Practice',
        description: 'Practice prompt injection and jailbreak techniques',
        url: '/practice',
        icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96' }],
      },
    ],
    screenshots: [
      {
        src: '/og-image-v6.png',
        sizes: '1200x630',
        type: 'image/png',
      },
    ],
  }
}

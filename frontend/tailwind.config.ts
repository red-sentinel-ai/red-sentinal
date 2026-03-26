import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './constants/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neon Protocol: The Mint Shadow Palette
        surface: {
          DEFAULT: 'var(--surface)',
          bright: 'var(--surface_bright)',
          variant: 'var(--surface_variant)',
          container: {
            DEFAULT: 'var(--surface_container)',
            lowest: 'var(--surface_container_lowest)',
            low: 'var(--surface_container_low)',
            high: 'var(--surface_container_high)',
            highest: 'var(--surface_container_highest)',
          },
        },
        primary: {
          DEFAULT: 'var(--primary)',
          container: 'var(--primary_container)',
          fixed: 'var(--primary_fixed)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          container: 'var(--secondary_container)',
          fixed: 'var(--secondary_fixed)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
          container: 'var(--tertiary_container)',
        },
        on: {
          surface: 'var(--on_surface)',
          'surface-variant': 'var(--on_surface_variant)',
          primary: 'var(--on_primary)',
          'primary-container': 'var(--on_primary_container)',
          secondary: 'var(--on_secondary)',
          tertiary: 'var(--on_tertiary)',
        },
        outline: {
          DEFAULT: 'var(--outline)',
          variant: 'var(--outline_variant)',
        },
        // Legacy mappings for compatibility
        background: 'var(--surface)',
        foreground: 'var(--on_surface)',
        // Alert/error colors
        alert: 'var(--tertiary)',
        // Legacy blue/pink (for gradual migration)
        primary_blue: 'var(--primary_blue)',
        primary_pink: 'var(--primary_pink)',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        satoshi: ['var(--font-satoshi)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        marquee2: 'marquee2 25s linear infinite',
        shimmer: 'shimmer 8s ease-in-out infinite',
        flash: 'flash 1s ease-in-out',
        scroll: 'scroll 60s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-200%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        flash: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px var(--primary), 0 0 10px var(--primary)' },
          '100%': { boxShadow: '0 0 20px var(--primary), 0 0 30px var(--primary)' },
        },
      },
      boxShadow: {
        'ambient': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'glow-primary': '0 0 20px rgba(161, 255, 194, 0.1)',
        'glow-tertiary': '0 0 20px rgba(255, 115, 80, 0.15)',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [animate],
} satisfies Config

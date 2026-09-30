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
      borderRadius: {
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '9999px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        text: 'var(--text)',
        sentinel_pink: 'var(--sentinel_pink)',
        primary_pink: 'var(--primary_pink)',
        primary_pink_20: 'var(--primary_pink_20)',
        primary_pink_light: 'var(--primary_pink_light)',

        primary_blue: 'var(--primary_blue)',
        primary_blue_20: 'var(--primary_blue_20)',
        primary_blue_30: 'var(--primary_blue_30)',
        primary_blue_50: 'var(--primary_blue_50)',
        primary_blue_90: 'var(--primary_blue_90)',
        secondary_blue: 'var(--secondary_blue)',
        secondary_blue_60: 'var(--secondary_blue_60)',
        secondary_pink: 'var(--secondary_pink)',
        secondary_pink_60: 'var(--secondary_pink_60)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        marquee2: 'marquee2 25s linear infinite',
        shimmer: 'shimmer 8s ease-in-out infinite',
        flash: 'flash 1s ease-in-out',
        scroll: 'scroll 60s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
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
      },
    },
  },
  plugins: [animate],
} satisfies Config

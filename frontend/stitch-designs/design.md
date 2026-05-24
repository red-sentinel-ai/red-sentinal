---
version: alpha
name: Spacex-Inspired-design-analysis
description: An inspired interpretation of Spasex's design language — a mission-oriented
  aerospace brand built on pure black canvas, full-bleed photographic and video heroes
  of rockets and Mars landscapes, and uppercase D-DIN display type set in tight vertical
  leading. UI chrome is intentionally minimal a single ghost outlined pill button
  per band, all-caps eyebrow microtext, and a fixed top nav over photography. The
  system is unapologetically austere — black, white, and the imagery itself.
colors:
  primary: '#000000'
  ink: '#000000'
  on-primary: '#ffffff'
  on-primary-mute: '#f0f0fa'
  canvas-night: '#000000'
  canvas-night-soft: '#0a0a0a'
  canvas-light: '#ffffff'
  canvas-cool: '#f0f0fa'
  hairline-on-dark: '#3a3a3f'
  hairline-on-light: '#e0e0e8'
  link-on-dark: '#ffffff'
  link-blue-fallback: '#0000ee'
  ink-mute: '#5a5a5f'
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#cfc4c5'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#988e90'
  outline-variant: '#4c4546'
  surface-tint: '#c6c6c6'
  primary-container: '#000000'
  on-primary-container: '#757575'
  inverse-primary: '#5e5e5e'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c6c6c6'
  on-tertiary: '#303030'
  tertiary-container: '#000000'
  on-tertiary-container: '#757575'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-xxl:
    fontFamily: D-DIN-Bold, Arial Narrow, Arial, Verdana, sans-serif
    fontSize: 80px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: 1.6px
  display-xl:
    fontFamily: D-DIN-Bold, Arial Narrow, Arial, Verdana, sans-serif
    fontSize: 60px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 1.2px
  display-lg:
    fontFamily: D-DIN-Bold, Arial Narrow, Arial, Verdana, sans-serif
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.96px
  body-lg:
    fontFamily: D-DIN, Arial, Verdana, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0.32px
  body-md:
    fontFamily: D-DIN, Arial, Verdana, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.32px
  button-cap:
    fontFamily: D-DIN, Arial, Verdana, sans-serif
    fontSize: 13.008px
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: 1.17px
  micro-cap:
    fontFamily: D-DIN, Arial, Verdana, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 2.0
    letterSpacing: 0.96px
  caption:
    fontFamily: D-DIN, Arial, Verdana, sans-serif
    fontSize: 13.008px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  headline-lg-mobile:
    fontFamily: archivoNarrow
    fontSize: 42px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.8px
rounded:
  xs: 4px
  sm: 8px
  md: 16px
  pill: 32px
  full: 9999px
  DEFAULT: 1rem
  lg: 2rem
  xl: 3rem
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 18px
  xl: 24px
  xxl: 32px
  huge: 48px
  section-gap: 80px
components:
  button-ghost-on-dark:
    backgroundColor: '{colors.canvas-night}'
    textColor: '{colors.on-primary}'
    typography: '{typography.button-cap}'
    rounded: '{rounded.pill}'
    padding: 18px 24px
  button-ghost-on-light:
    backgroundColor: '{colors.canvas-light}'
    textColor: '{colors.ink}'
    typography: '{typography.button-cap}'
    rounded: '{rounded.pill}'
    padding: 18px 24px
  button-filled-cool:
    backgroundColor: '{colors.canvas-cool}'
    textColor: '{colors.ink}'
    typography: '{typography.button-cap}'
    rounded: '{rounded.pill}'
    padding: 18px 24px
  text-input:
    backgroundColor: '{colors.canvas-light}'
    textColor: '{colors.ink}'
    typography: '{typography.body-md}'
    rounded: '{rounded.xs}'
    padding: 12px 16px
  card-photo-band:
    backgroundColor: '{colors.canvas-night}'
    textColor: '{colors.on-primary}'
    typography: '{typography.body-md}'
    rounded: '{rounded.xs}'
    padding: 0px
  card-shop-product:
    backgroundColor: '{colors.canvas-light}'
    textColor: '{colors.ink}'
    typography: '{typography.body-md}'
    rounded: '{rounded.sm}'
    padding: 16px
  nav-bar-overlay:
    backgroundColor: '{colors.canvas-night}'
    textColor: '{colors.on-primary}'
    typography: '{typography.button-cap}'
    rounded: '{rounded.xs}'
    padding: 24px 32px
  link-on-dark:
    backgroundColor: '{colors.canvas-night}'
    textColor: '{colors.link-on-dark}'
    typography: '{typography.body-md}'
    rounded: '{rounded.xs}'
    padding: 0px
  link-on-light:
    backgroundColor: '{colors.canvas-light}'
    textColor: '{colors.ink}'
    typography: '{typography.body-md}'
    rounded: '{rounded.xs}'
    padding: 0px
  footer-dark:
    backgroundColor: '{colors.canvas-night}'
    textColor: '{colors.on-primary}'
    typography: '{typography.caption}'
    rounded: '{rounded.xs}'
    padding: 32px 24px
---


---
name: Red Sentinel
colors:
  # Background hierarchy (dark theme)
  bg-deepest: '#0d0c0c'
  bg-base: '#100f0f'
  bg-surface: '#1a1919'
  bg-elevated: '#1f1e1e'
  bg-subtle: '#2a2828'
  # Text hierarchy
  text-primary: '#ffffff'
  text-secondary: '#bcbbbb'
  text-muted: '#8f8e8e'
  text-faint: '#636161'
  # Primary accent (Crimson)
  primary: '#c8384f'
  primary-light: '#e04c63'
  primary-dark: '#a02840'
  primary-muted: 'rgba(200, 56, 79, 0.18)'
  # Secondary accents
  secondary-blue: '#60a5fa'
  secondary-blue-deep: '#2563eb'
  # Semantic colors
  success: '#4ade80'
  success-muted: 'rgba(74, 222, 128, 0.12)'
  danger: '#f87171'
  danger-muted: 'rgba(248, 113, 113, 0.12)'
  warning: '#facc15'
  info: '#60a5fa'
  # Borders
  border-subtle: 'rgba(255, 255, 255, 0.06)'
  border-default: 'rgba(255, 255, 255, 0.10)'
  border-strong: 'rgba(255, 255, 255, 0.16)'
  # Sidebar
  sidebar: '#0d0c0c'
  sidebar-accent: '#1f1e1e'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 1.2
    letterSpacing: '0'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
rounded:
  sm: 6px
  DEFAULT: 10px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 12px
  margin-desktop: 24px
---

# Design System: Red Sentinel

**Project:** Red Sentinel - AI Security Arena
**Framework:** Next.js 15 + React 18 + Tailwind CSS
**Theme:** Dark Mode (Aave Pro-inspired)

## 1. Visual Theme & Atmosphere

Red Sentinel embodies a **premium dark interface** inspired by modern DeFi dashboards like Aave. The visual language is sophisticated, information-dense, and unapologetically dark — a near-black canvas (#100f0f) that lets vibrant accent colors and crisp white typography command attention. This creates an atmosphere of controlled intensity befitting a competitive AI security arena where real stakes are on the line.

The design philosophy balances **technical precision with dramatic flair**. Deep charcoal backgrounds establish hierarchy through subtle opacity variations, while a crimson accent (#c8384f) — the "gold" of this palette — injects urgency and energy without overwhelming. The overall feel is: professional hacker terminal meets premium gaming interface. Every pixel communicates that this is a serious platform for serious security work, yet the polish and attention to motion design elevates it above utilitarian tools.

## 2. Color Palette & Roles

### Primary Foundation (Background Hierarchy)

| Color | Hex | Role |
|:---|:---|:---|
| **Void Black** | `#0d0c0c` | Deepest layer, sidebars, page edges |
| **Obsidian Base** | `#100f0f` | Primary page background |
| **Charcoal Surface** | `#1a1919` | Cards, modals, elevated containers |
| **Slate Elevated** | `#1f1e1e` | Hover states, secondary surfaces |
| **Ash Subtle** | `#2a2828` | Tertiary backgrounds, muted elements |

### Accent & Interactive

| Color | Hex | Role |
|:---|:---|:---|
| **Crimson Primary** | `#c8384f` | Primary CTA buttons, active states, brand accent |
| **Crimson Light** | `#e04c63` | Hover states for primary actions |
| **Crimson Dark** | `#a02840` | Secondary accent, gradient endpoints |
| **Crimson Muted** | `rgba(200, 56, 79, 0.18)` | Subtle backgrounds, glow effects |
| **Electric Blue** | `#60a5fa` | Links, info states, secondary accent |
| **Deep Blue** | `#2563eb` | Alternative accent for contrast |

### Typography & Text Hierarchy

| Color | Hex | Role |
|:---|:---|:---|
| **Pure White** | `#ffffff` | Primary text, headings, emphasis |
| **Silver** | `#bcbbbb` | Secondary text, descriptions |
| **Stone Gray** | `#8f8e8e` | Muted text, placeholders, labels |
| **Faint Gray** | `#636161` | Disabled text, tertiary info |

### Functional States

| Color | Hex | Role |
|:---|:---|:---|
| **Success Mint** | `#4ade80` | Active status, earnings, success states |
| **Danger Coral** | `#f87171` | Errors, defeated status, destructive actions |
| **Warning Amber** | `#facc15` | Warnings, locked states, cautions |
| **Info Sky** | `#60a5fa` | Information, neutral highlights |

## 3. Typography Rules

### Font Families

- **Inter** — Primary typeface for all display and body text. A geometric sans-serif with excellent x-height, making it highly legible at small sizes against dark backgrounds. Used at weights 300–700.
- **JetBrains Mono** — Monospace for code snippets, addresses, and technical data. Clean ligatures and distinct character shapes.
- **IBM Plex Mono** — Used sparingly for stats bar labels and uppercase metadata, giving a terminal/dashboard feel.

### Hierarchy & Weights

| Style | Size | Weight | Use Case |
|:---|:---|:---|:---|
| Display Large | 48px | 700 (Bold) | Hero headlines |
| Page Heading | 28px (1.75rem) | 500 (Medium) | Page titles |
| Headline Medium | 24px | 600 (Semibold) | Section headers, card titles |
| Body Base | 16px | 400 (Regular) | Standard text, descriptions |
| Body Small | 14px | 400–500 | UI labels, compact info |
| Caption | 12px | 500 (Medium) | Stats, metadata, badges |
| Micro | 10px | 500–700 | Status indicators, timestamps |

### Spacing Principles

- **Line Height:** Generous (1.35–1.5x) for body text to improve readability on dark backgrounds
- **Letter Spacing:** Slightly negative (-0.01em to -0.02em) for headlines to create a premium, tight feel; neutral for body text; expanded (0.05em) for uppercase labels
- **Paragraph Spacing:** 1.5x the font size between paragraphs

## 4. Component Stylings

### Buttons

**Primary (`.btn-black`):**
- Background: Crimson Primary (`#c8384f`)
- Text: Pure White
- Border-radius: 12px
- Min-height: 40px
- Padding: 0.5rem 1rem (8px 16px)
- Font: 500 weight, standard size
- Hover: Background shifts to Crimson Light (`#e04c63`)
- Disabled: 50% opacity, no pointer events

**Outline (`.btn-outline`):**
- Background: Transparent
- Border: 1px solid border-default (`rgba(255, 255, 255, 0.10)`)
- Text: Pure White
- Hover: Background gains 5% white overlay

**Secondary (`.btn-white`):**
- Background: Charcoal Surface (`#1a1919`)
- Border: 1px solid border-default
- Text: Pure White
- Hover: Background shifts to Slate Elevated

### Cards & Containers

**Agent Cards (`.agent-card`):**
- Background: Gradient from Charcoal Surface to Ash Subtle with transparent border trick
- Border: 1px transparent with gradient border (subtle crimson glow at bottom)
- Border-radius: 14px (lg) on desktop, 8px on mobile
- Shadow: `0 1px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)`
- Internal padding: 16px (lg:16px / mobile:8px)
- Image containers: Rounded-lg with object-cover
- Entrance animation: Framer Motion fade-up with staggered delay

**Standard Cards:**
- Background: `var(--color-bg-surface)` (#1a1919)
- Border: 1px solid `var(--color-border-subtle)`
- Border-radius: 10px (md)
- Shadow: Subtle card shadow

### Navigation

**Top Bar:**
- Height: 64px (h-16)
- Background: Base color at 80% opacity with backdrop-blur-xl
- Border-bottom: 1px solid border-subtle
- Position: Sticky top with z-30
- Layout: Flex with auto margin pushing actions right

**Sidebar:**
- Background: Void Black (`#0d0c0c`)
- Width: Collapsible, typically 240px expanded
- Active item: Crimson Primary background tint
- Text: White primary, muted for inactive

### Inputs & Forms

- Height: 40px (h-10)
- Background: Transparent (bg-background)
- Border: 1px solid input color (`rgba(255, 255, 255, 0.10)`)
- Border-radius: 8px (rounded-md)
- Padding: 12px horizontal (px-3)
- Font-size: 16px (prevents iOS zoom on focus)
- Focus: 2px ring with ring color, ring-offset-2
- Placeholder: Stone Gray (muted-foreground)

### Badges & Status Indicators

**Primary Badge:**
- Background: Crimson Primary
- Text: White
- Border-radius: Full (pill shape)
- Padding: 4px 16px
- Font: Bold

**Status Pills:**
- Active: Green border + green-tinted background + green text
- Defeated: Red border + red-tinted background + red text
- Warning: Amber tints
- Size: Very small (10px text, tight padding)

### Toasts (Sonner)

- Background: `#1a1919` at 96% opacity
- Border: 1px solid semantic color at 25% opacity
- Border-radius: 12px
- Backdrop-filter: blur(12px)
- Progress bar: Gradient of semantic color
- Shadow: Deep (0 4px 24px rgba(0,0,0,0.5))

## 5. Layout Principles

### Grid & Structure

- **Max Content Width:** 856px (`.max-w-v1`), 367px for narrow (`.max-w-v2`)
- **Container Padding:** 12px mobile, 24px desktop
- **Card Grid:** Responsive, typically 1-2 columns mobile, 3-4 desktop
- **Breakpoints:** Tailwind defaults (sm:640px, md:768px, lg:1024px, xl:1280px)

### Whitespace Strategy

- **Base Unit:** 4px grid
- **Component Spacing:** Generally 8px (sm), 16px (md), 24px (lg) gaps
- **Section Margins:** 32px+ between major sections
- **Card Padding:** 8-16px depending on size and breakpoint
- **Internal Padding:** Generous — cards use p-3/p-6 (12px/24px)

### Alignment & Visual Balance

- **Text Alignment:** Left-aligned for body, centered for card titles and CTAs
- **Grid Alignment:** Grid layouts with auto-fit and consistent gap
- **Visual Weight:** Crimson accent draws eye to primary actions
- **Asymmetric Balance:** Sidebars provide structure, content areas flow naturally

### Responsive Behavior & Touch

- **Mobile-First:** Core experience designed for mobile, enhanced on desktop
- **Touch Targets:** Minimum 40px height on interactive elements
- **Safe Areas:** `env(safe-area-inset-*)` respected for notched devices
- **Scroll Behavior:** Smooth scroll, iOS momentum scrolling enabled
- **Viewport Lock:** `maximum-scale=1, user-scalable=false` to prevent zoom on inputs
- **Tap Highlight:** Disabled (`-webkit-tap-highlight-color: transparent`)

## 6. Animation & Motion

### Entrance Animations

- **Fade Up:** `translateY(20px) → translateY(0)` with `opacity: 0 → 1`, 0.4s duration
- **Staggered Delay:** 0.1s increment per item in lists
- **Easing:** `ease-out` for natural deceleration

### Interactive Feedback

- **Hover Transitions:** Color/background changes over 0.2-0.3s ease
- **Focus Rings:** 2px with offset for accessibility
- **Button Press:** Subtle scale or opacity shift

### Ambient Motion

- **Marquee Scrolling:** 25-60s linear infinite for continuous data rows
- **Shimmer Loading:** 8s ease-in-out infinite for skeleton states
- **Rotate:** Smooth angle animation for decorative elements
- **Reduced Motion:** All ambient animations disabled via `prefers-reduced-motion`

### Shadows & Glow

- **Card Shadow:** Subtle double shadow for depth
- **Elevated Shadow:** Deeper for modals and overlays
- **Glow Effects:** Colored box-shadows (15px spread, 25-30% opacity) for status emphasis

## 7. Design System Notes for Stitch Generation

### Language to Use

When generating screens for Red Sentinel, use prompts that evoke:
- "Dark premium dashboard", "DeFi-inspired interface"
- "Near-black background with crimson accents"
- "High-contrast white text on deep charcoal"
- "Cyberpunk meets financial terminal"
- "Sleek, technical, competitive gaming UI"
- "Subtle gradient borders with glow effects"

### Color References

Use these descriptive names when prompting:
- **Background:** "void black", "obsidian", "charcoal surface"
- **Accent:** "crimson", "deep red", "blood red accent"
- **Text:** "crisp white", "silver gray", "muted stone"
- **Status:** "mint green success", "coral danger", "amber warning", "sky blue info"

### Component Prompts

Example prompts that would recreate Red Sentinel's aesthetic:

1. **Agent Card:** "Dark card with gradient border, agent profile image at top, status badge overlay, prize pool stats below, crimson CTA button at bottom, subtle hover glow"

2. **Stats Bar:** "Fixed top bar, void black background, centered flex row of stat items, colored accent values with uppercase micro labels below, minimal padding"

3. **Chat Interface:** "Dark sidebar conversation list, main chat area with message bubbles, user messages right-aligned with crimson tint, AI responses left with charcoal surface"

### Incremental Iteration

When refining generated screens:
1. First pass: Get the dark background and basic layout
2. Second pass: Refine the color hierarchy (ensure proper contrast)
3. Third pass: Add the gradient borders and subtle glow effects
4. Fourth pass: Polish with animations and micro-interactions
5. Final: Verify touch targets and mobile responsiveness

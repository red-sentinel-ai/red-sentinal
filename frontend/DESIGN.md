# Design System Strategy: The Neon Protocol

## 1. Overview & Creative North Star
**Creative North Star: "Cyber-Editorial Noir"**

This design system eschews the generic "hacker" tropes of falling green code and matrix grids for a high-end, editorial approach to social engineering. It balances the playful mint tones of the "intern" aesthetic with a lethal, high-contrast dark mode. We move beyond standard UI by treating the interface as a classified dossier—using intentional asymmetry, overlapping layers, and a typography scale that feels both urgent and sophisticated.

The goal is to make the user feel like a modern-day secret agent: precise, tech-savvy, and always three steps ahead. We break the template by utilizing deep tonal nesting and "glassmorphism" to create a UI that feels alive and illuminated from within.

---

## 2. Colors: The Mint Shadow Palette
The palette is built on a foundation of deep obsidians and vibrant mint greens, punctuated by an "alert" tertiary orange.

### Surface Hierarchy & Nesting
We reject the flat grid. Hierarchy is defined through **Tonal Layering**:
- **Base Layer:** `surface` (#00110d) – The deepest void.
- **Sectioning:** Use `surface_container_low` (#001712) for large content areas.
- **Nesting:** Place `surface_container_highest` (#002c23) or `surface_variant` (#002c23) elements inside containers to signify interactivity.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to separate sections. Boundaries must be defined solely by the shift from `surface_container_low` to `surface_container`. If you need to separate elements, use a `24` (5.5rem) or `16` (3.5rem) spacing gap or a subtle background shift.

### The "Glass & Gradient" Rule
Floating elements (like Top Secret modals) should utilize `surface_bright` (#003329) with a 60% opacity and a 20px backdrop-blur.
- **Signature Texture:** Apply a linear gradient from `primary` (#a1ffc2) to `primary_container` (#00fc9a) for main CTAs to give them a "radioactive" premium glow.

---

## 3. Typography: The Intelligence Briefing
We use a high-contrast pairing of **Space Grotesk** for tactical display and **Inter** for mission-critical legibility.

- **Display (Space Grotesk):** Large, aggressive, and slightly spaced. `display-lg` (3.5rem) is used for bounty totals or mission titles.
- **Headline (Space Grotesk):** `headline-sm` (1.5rem) uses all-caps for a "Top Secret" stamp feel.
- **Body (Inter):** `body-md` (0.875rem) handles the bulk of the social engineering scripts. High tracking (letter-spacing) is encouraged for a modern, breathable feel.
- **Labels (Space Grotesk):** `label-sm` (0.6875rem) in all-caps is reserved for metadata—timestamps, bounty IDs, and "Classified" tags.

---

## 4. Elevation & Depth: Tonal Sophistication
Shadows are a last resort. Depth is earned through light and transparency.

- **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-low` sections. This creates a soft "lift" that mimics high-end paper on a dark desk.
- **Ambient Shadows:** For floating dialogs, use an extra-diffused shadow: `offset: 0 20px, blur: 40px, color: #000000 (15% opacity)`. Tint the shadow with `on-surface` (#c3fdeb) at 4% to make it feel like the mint glow is reflecting off the surface below.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline_variant` (#175144) at **20% opacity**. This creates a "barely-there" structural hint without breaking the editorial flow.

---

## 5. Components: Operational Assets

### Chat Bubbles (The Social Engineering Feed)
- **Agent Bubbles:** Background `surface_container_highest`, text `on_surface`. Roundedness: `xl` (0.75rem), but `none` on the bottom-left corner to create a "tail" effect.
- **Target Bubbles:** Background `primary` (#a1ffc2), text `on_primary`. High contrast, signaling the successful "hook."

### Bounty Counters (The Scoreboard)
- **Style:** Use `display-md` for the number. Surround with a `Ghost Border` using `outline`.
- **The Glow:** Apply a subtle outer glow using the `primary` color at 10% opacity to make the bounty feel like a live, digital currency.

### Buttons (Tactical Actions)
- **Primary:** Gradient from `primary` to `primary_container`. Text: `on_primary_fixed` (Bold). Shape: `md` (0.375rem).
- **Secondary:** Transparent background with a `Ghost Border`. Text: `primary`.
- **Tertiary:** Text-only in `secondary_fixed`. No background. Use for "Cancel" or "Go Back."

### Cards & Lists
- **Rule:** Forbid divider lines. Use `spacing-4` (0.9rem) between items.
- **Interactive States:** On hover, a card should shift from `surface_container` to `surface_bright`. No "pop-up" animation; just a subtle, sophisticated color bleed.

### Input Fields (The Terminal)
- **Base:** `surface_container_lowest`.
- **Active State:** Border becomes `primary_container` (100% opacity). Add a label-sm "ENCRYPTING..." text in the helper-text area during typing for flavor.

---

## 6. Do’s and Don'ts

### Do
- **DO** use asymmetry. Align mission data to the left and bounty data to the far right with significant white space between them.
- **DO** use "Top Secret" watermarks. Rotate `label-md` text by -15 degrees and set opacity to 5% behind main content.
- **DO** leverage the `tertiary` orange (#ff7350) for high-stakes errors or "Mission Failed" states. It provides a jarring, necessary contrast to the mint.

### Don't
- **DON'T** use 100% white. Always use `on_surface` (#c3fdeb) for text to maintain the "dark mode" ocular comfort.
- **DON'T** use standard Material Design "shadowed" cards. If it looks like a generic Android app, you’ve failed the mission.
- **DON'T** use 1px dividers. If you can't separate content with color shifts or space, rethink the information architecture.

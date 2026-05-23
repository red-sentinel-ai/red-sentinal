---
name: Amber Sentinel
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d7c4ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9f8e78'
  outline-variant: '#524533'
  surface-tint: '#ffba43'
  primary: '#ffd597'
  on-primary: '#432c00'
  primary-container: '#ffb000'
  on-primary-container: '#6a4700'
  inverse-primary: '#805600'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#00fe41'
  on-tertiary: '#003907'
  tertiary-container: '#00de37'
  on-tertiary-container: '#005b10'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddaf'
  primary-fixed-dim: '#ffba43'
  on-primary-fixed: '#281800'
  on-primary-fixed-variant: '#614000'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#72ff70'
  tertiary-fixed-dim: '#00e639'
  on-tertiary-fixed: '#002203'
  on-tertiary-fixed-variant: '#00530e'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  panel-padding: 24px
---

## Brand & Style
The design system is an industrial-military interface designed for high-stakes monitoring and tactical oversight. It evokes the atmosphere of a hardened terminal or an avionics heads-up display (HUD). The brand personality is authoritative, urgent, and precise.

The aesthetic follows a **Modern Industrial Brutalism** approach:
- **Functional Density:** Information is prioritized over white space, using tight grids and high-information density.
- **Tactile Digital:** UI elements should feel like physical toggle switches and backlit instrumentation.
- **Atmospheric Depth:** While the interface is largely flat, subtle glows and scanline textures provide a sense of hardware-bound hardware.
- **Urgency:** The use of Amber Gold against deep blacks creates a "cautionary" state, implying that every piece of data is critical.

## Colors
The palette is strictly functional, rooted in the visual language of monochromatic cathode-ray tubes (CRTs) and tactical equipment.

- **Primary (Amber Gold):** #FFB000. Used for interactive elements, primary warnings, and high-priority data. It should have a slight "inner glow" in high-emphasis states.
- **Secondary (Obsidian):** #1A1A1A. Used for elevated surfaces, containers, and panel backgrounds.
- **Tertiary (Tactical Green):** #00FF41. Used sparingly for "system-go" status indicators and successful operations.
- **Neutral (Void):** #000000 to #0A0A0A. The bedrock of the interface, providing maximum contrast for the amber elements.
- **Surface Overlays:** Use a 5% opacity Amber tint for hover states and 10% for active states to maintain the monochromatic rigor.

## Typography
The typography system utilizes two distinct fonts to balance high-tech flair with utilitarian legibility.

- **Headlines:** Space Grotesk provides a futuristic, geometric structure for primary titles and dashboard metrics.
- **Technical/Body:** JetBrains Mono is used for all data, body copy, and UI labels. The monospaced nature ensures that columns of numbers align perfectly, essential for tactical monitoring.
- **Hierarchy:** Use uppercase styling and increased letter spacing for labels to mimic military hardware stenciling.
- **Scaling:** On mobile, `headline-lg` should scale down to 32px to ensure it remains within the viewport without breaking the "instrumentation" feel.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model within a flexible viewport container, mimicking a cockpit console.

- **Rhythm:** A 4px baseline grid governs all spacing. Vertical rhythm should be strictly adhered to.
- **Layout:** A 12-column grid for desktop with 16px gutters. Panels should be contained within clear borders rather than using white space for separation.
- **Density:** High density is preferred. Elements should be packed closely to suggest a wealth of available data, separated by technical dividers (1px lines) rather than large gaps.
- **Mobile:** Reflow into a single column, but maintain the panel-based containment. Horizontal scrolling is permitted for large data tables.

## Elevation & Depth
Elevation is not conveyed through soft shadows, but through **Tonal Layering** and **Luminescent Borders**.

- **Level 0 (Background):** Pure black (#000000).
- **Level 1 (Panels):** Obsidian (#1A1A1A) with a 1px border of #333333.
- **Level 2 (Active/Interactable):** Obsidian with a 1px border of Amber Gold (#FFB000).
- **Glow Effects:** Critical alerts or active buttons may use a "drop shadow" that is actually a 4px-8px Gaussian blur of the Amber color at 30% opacity to simulate light bleed from a screen.
- **Dividers:** Use 1px solid lines with 10% Amber opacity for internal sectioning.

## Shapes
The shape language is **Sharp (0)**. 

- **Hard Edges:** All buttons, panels, and input fields must have 0px corner radii. This reinforces the industrial, rugged nature of the system.
- **Angular Accents:** Use 45-degree clipped corners for decorative elements or high-priority tags to enhance the "tactical" feel.
- **Dividers:** Vertical and horizontal lines should be crisp 1px strokes.

## Components
- **Buttons:** Solid Amber Gold background with black monospaced text for primary actions. Ghost buttons use an Amber 1px border and Amber text.
- **Inputs:** Dark backgrounds with a 1px Amber bottom border. When focused, the border expands to a full 1px box around the input.
- **Chips/Status:** Rectangular blocks with no rounding. High-priority status uses a pulsing Amber background.
- **Cards/Panels:** Defined by a 1px grey border. Header areas of cards should have a slightly lighter background (#252525) and include a "System ID" or "Serial Number" label in the top-right corner.
- **Data Tables:** Strict monospaced rows with zebra-striping using #1A1A1A. Hovering over a row should highlight it with a 10% Amber tint.
- **Progress Bars:** Segmented blocks rather than a smooth continuous fill, suggesting digital increments.

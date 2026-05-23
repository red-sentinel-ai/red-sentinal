# Amber Sentinel Theme Design

## Scope

Apply the Stitch "Amber Sentinel" design language globally, then update the first-pass surfaces:

- Global theme tokens and typography
- App sidebar
- App top header
- Landing page hero, stats, Featured Sentinels, and Trending Sentinels

The Active Sentinels table/list remains functionally and structurally unchanged in this pass. It may inherit global colors and typography, but it will not receive a dedicated redesign.

## Design Direction

The frontend should move from the current dark crimson SaaS theme to an industrial tactical interface. The base is pure black with obsidian panels, amber controls, warm muted text, hard edges, and compact monospaced data presentation.

Typography uses Space Grotesk for display headings and JetBrains Mono for body, controls, labels, and data. Landing headings use uppercase technical language and tighter vertical rhythm.

## Components

Global CSS tokens will define the new color, border, radius, and font system. Legacy token names stay in place where possible so existing components continue to render without broad refactors.

The sidebar keeps the current responsive shadcn sidebar behavior, route matching, and collapse mechanics. Visual changes include amber active state, hard-edged controls, compact technical labels, a version label, and darker panel borders.

The top header keeps the current chain switcher and wallet connection behavior. It becomes a tactical bar with solid dark surface, amber border accents, and compact right-aligned controls.

The landing page keeps the current data hooks. The hero, chain availability row, stats cards, section headers, and sentinel mini cards are restyled to match the Stitch screen. The Featured and Trending rows continue to link to agent attack pages.

## Verification

Run type/build checks where practical. Start the local Next.js dev server and inspect the landing page across desktop and mobile widths, focusing on header/sidebar layout, text fit, card density, and ensuring the Active Sentinels section remains usable.

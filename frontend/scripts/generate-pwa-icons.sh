#!/usr/bin/env bash
# Generates all required PWA icon sizes from the source SVG.
# Requires: sharp-cli (bun add -g sharp-cli) or Inkscape + ImageMagick.
#
# Usage: bash scripts/generate-pwa-icons.sh

set -euo pipefail

SOURCE_SVG="public/icons/logo-sm.svg"
OUTPUT_DIR="public/icons"
SIZES=(72 96 128 144 152 192 384 512)
BG="#100f0f"

if ! command -v sharp &> /dev/null; then
  echo "sharp-cli not found. Installing globally..."
  bun add -g sharp-cli 2>/dev/null || npm install -g sharp-cli
fi

echo "Generating PWA icons from $SOURCE_SVG..."

for SIZE in "${SIZES[@]}"; do
  sharp -i "$SOURCE_SVG" -o "$OUTPUT_DIR/pwa-${SIZE}x${SIZE}.png" \
    resize "$SIZE" "$SIZE" \
    --fit contain \
    --background "$BG"
  echo "  ✓ pwa-${SIZE}x${SIZE}.png"
done

# Maskable icon: add ~20% safe-zone padding (51px on a 512px canvas)
# sharp-cli commands cannot be chained, so resize to a temp file first.
TMP_MASKABLE=$(mktemp).png
sharp -i "$SOURCE_SVG" -o "$TMP_MASKABLE" \
  resize 410 410 \
  --fit contain \
  --background "$BG"
sharp -i "$TMP_MASKABLE" -o "$OUTPUT_DIR/pwa-512x512-maskable.png" \
  extend 51 51 51 51 \
  --background "$BG"
rm -f "$TMP_MASKABLE"

echo "  ✓ pwa-512x512-maskable.png"
echo ""
echo "All icons generated in $OUTPUT_DIR"

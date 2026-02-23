#!/usr/bin/env bash
set -euo pipefail

EXTENSION_DIR="yt-truth-checker"
VERSION=$(grep '"version"' "$EXTENSION_DIR/manifest.json" | sed 's/.*"version": "\(.*\)".*/\1/')
OUT="yt-truth-checker-v${VERSION}.zip"

echo "Building release v${VERSION}..."

rm -f "$OUT"
zip -r "$OUT" "$EXTENSION_DIR"

echo "Created: $OUT"

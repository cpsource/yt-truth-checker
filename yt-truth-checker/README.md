# YT Truth Checker — Chrome Extension

A Chrome extension that checks YouTube video headlines for truth/accuracy using Claude AI.
Hover over any YouTube video title for ~1 second and get an instant verdict.

## Verdicts

| Verdict | Color | Meaning |
|---------|-------|---------|
| ✓ TRUE | Green | Core claim is factually accurate |
| ✗ FALSE | Red | Core claim is factually wrong |
| ⚠ MISLEADING | Orange | Kernel of truth, deceptive framing |
| 🎣 CLICKBAIT | Yellow | Exaggerated language dramatizing mundane events |
| 💬 OPINION | Blue | Subjective view, not a factual claim |
| ? UNVERIFIABLE | Gray | Can't determine truth from headline alone |

## Installation

1. **Get an Anthropic API key** from https://console.anthropic.com/
   - You need a funded account (even $5 is enough for thousands of checks)

2. **Load the extension in Chrome:**
   - Open `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `yt-truth-checker` folder

3. **Configure:**
   - Click the extension icon in your toolbar (puzzle piece → pin it)
   - Paste your Anthropic API key
   - Toggle hover mode on/off
   - Optionally enable auto-check (scans all visible titles on page load)
   - Click **Save Settings**

## Usage

- **Hover mode (default):** Pause your mouse over any YouTube video title for ~1 second.
  A tooltip appears with Claude's assessment.
- **Auto-check mode:** When you load a YouTube page, all visible titles get checked
  automatically and small colored badges appear on thumbnails.
- Results are cached for the session — hovering the same title again is instant.

## How It Works

```
You hover on title → content.js detects it (800ms debounce)
  → sends message to background.js
    → background.js calls Anthropic API (Claude Sonnet)
      → Claude analyzes the headline
    → result sent back to content.js
  → tooltip displayed + badge on thumbnail
```

## Cost

Each check uses Claude Sonnet (~200-300 tokens output).
At current pricing that's roughly $0.001-0.002 per check.
A thousand checks ≈ $1-2.

## Files

```
yt-truth-checker/
├── manifest.json      # Extension config
├── background.js      # Service worker (API calls)
├── content.js         # Injected into YouTube (hover detection + UI)
├── styles.css         # Tooltip and badge styles
├── popup.html         # Settings popup
├── popup.js           # Settings logic
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## Building a Release

From the repo root:

```bash
make release
```

This packages the `yt-truth-checker/` directory into a versioned zip file
(e.g. `yt-truth-checker-v1.0.zip`) ready to upload to the Chrome Web Store.

To remove built zips:

```bash
make clean
```

The version number is read automatically from `manifest.json`.

## Notes

- Only works on youtube.com
- Requires an Anthropic API key (not free, but very cheap per check)
- Claude judges based on the headline text alone — it doesn't watch the video
- The model has a knowledge cutoff, so very recent events may get "UNVERIFIABLE"
- Uses Claude Sonnet for speed + cost balance

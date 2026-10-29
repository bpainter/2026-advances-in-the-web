# Review r7: titles, cover, chip, Grid Lanes, links, fade, select and drawer

Reviewed on 29 Oct 2026 against `docs/PRD-r7.md` and `docs/design/r7-spec.md`, on the running dev server at 1920 by 1080. Skills used: design-accessibility-specialist and design-critique. Fixes are in styles only. Items that need markup or logic are marked "Open, needs code".

Screenshots: `/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/r7/review/`. Walk logs are in its `logs/` folder.

## What ran

| Check | Result |
|---|---|
| `pnpm walk deck` (Chromium) | 34 passed, 0 failed. Cover centered at y 540.0, title ends at x 993. Chips on M1 to M5. Every link has its URL, target and rel. |
| `pnpm walk d4` (Chromium) | 45 passed. Select 36 px tall, chevron 20 px from the edge, centered. Both titles on one line. |
| `pnpm walk d4 --browser=webkit` | 45 passed, 6 failed (M2 below). Select and titles pass. |
| `pnpm walk m2 --no-lanes` (plain Chromium) | 49 passed. s0 square grid, s1 columns with 5 heights, s2 18 figures, s3 6 columns drop to 4. |
| `pnpm walk transitions --fade=1` | 5 passed. Fade on next and previous, none on a step. |
| `pnpm walk drawer` | 8 passed, before and after the drawer change. |
| `pnpm axe --presenter` | 0 violations, before and after, drawer open and closed. |
| Drawer contrast, from rendered pixels | Script `scratchpad/r7/scripts/drawer.mjs`. Text hidden, the sheet sampled under every row. |
| Audience drawer | Chromium without the automation flag (`navigator.webdriver` false), `/present`. The pill shows on pointer move. |
| `pnpm validate`, `pnpm test:contrast` | 0 errors, 4 warnings (existing copy and the event date). Contrast 188 passed. |

## The speaker's requests

| # | Request | Status |
|---|---|---|
| 1 | Titles "What we used to do" and "What we can do today" | Pass. One line, clear of the meter, on every walk page walked. |
| 2 | Cover group vertically centered | Pass. Center at y 540.0. |
| 3 | F1 removed, chip on M1 to M5 | Pass. 50 slides, 40 pages. Chip renders as spec 3. |
| 4 | Grid Lanes masonry without lanes | Pass in the frame. See M1 for the dev code panel. |
| 5 | Real links | Pass. Hover underline and focus rings match spec 2. |
| 6 | Fade and prefetch | Fade passes the walk. Prefetch not measured: it needs a production build. |
| 7 | D4 chevron | Pass in Chromium and WebKit, both pages. |
| 8 | Drawer with visible transparency | Fixed, H1. |

## High

### H1. The drawer read as solid navy. Fixed.

The speaker asked for "some transparency". Navy 0.82 sat over the 0.36 navy scrim, so about 0.89 navy covered the slide. Nothing of the slide showed through.

| Before | After | Why |
|---|---|---|
| Fill navy 0.82, `blur(24px) saturate(140%)` | Fill navy 0.3, `blur(16px) saturate(170%) brightness(0.58)` | The filter dims the slide instead of the tint. Shapes and hues stay visible, and contrast holds. |
| Group headings `#B8C0D9` | `#D6DCEC` (`--glass-dark-ink-body`) | `#B8C0D9` falls to 4.6:1 on clear glass. `#D6DCEC` holds 6.0:1. |
| `data-glass="off"` fallback only | Also `data-flags*="glass:0"` | Matches the token file's off switch. |

Measured worst case per row, Chromium, rendered pixels:

| Backdrop | White links | Headings and numbers | White on current row |
|---|---|---|---|
| Pure white (synthetic worst case) | 8.27:1 | 6.03:1 | 6.25:1 |
| Light slide (`three-reactions`) | 8.54:1 | 6.22:1 | 6.77:1 |
| Light slide (`what-changed`) | 8.54:1 | 6.22:1 | 7.97:1 |
| Dark slide (`title`, orange glow) | 12.24:1 | 8.92:1 | 9.22:1 |
| Demo page (`m2-now`) | 8.27:1 | 6.03:1 | 6.25:1 |
| Demo page (`d4-now`) | 8.24:1 | 6.00:1 | 6.24:1 |
| Closing (white QR card) | 8.24:1 | 6.00:1 | 8.54:1 |

Before, over the same light slides: white 12.1:1, `#B8C0D9` 6.7:1. Sheet mean luminance rose from about 0.033 to 0.058, and the slide's figures and edges now read through the frost. The focus ring (cyan) stays above 5:1 against the sheet.

Files: `styles/components/nav-drawer.css`, `docs/design/r7-spec.md` section 4.

Before and after screenshots:
- Light: `before-three_reactions.png`, `after-three_reactions.png`, `before-what_changed.png`, `after-what_changed.png`
- Dark: `before-title.png`, `after-title.png`
- Demo: `before-m2_now.png`, `after-m2_now.png`, `before-d4_now.png`, `after-d4_now.png`
- Audience window (after): `after-audience-drawer.png`. Speaker window (after): `after-speaker-drawer.png`.

## Medium

### M1. The M2 code panel shows the old `wall.css` on the dev server. Fixed.

At s1 the panel shows "No lanes: crop to one height" and highlights the wrong lines. The frame itself runs the new columns CSS. `m2-trail-photos.ts` calls `sectionFile()` when the module loads, so the dev server kept the old text. `pnpm validate` and a production build read the new file. Fix now: restart the dev server, or touch `content/sections/m2-trail-photos.ts`. Lasting fix: make `source` a getter, as `demoCode()` and `excerpt()` already do.

Fixed: `sectionCode()` in `lib/demo-files.ts` gives each shown file a `source` getter, and all 14 demo sections use it instead of calling `sectionFile()` at load. An edit to `wall.css` showed on the next request with no restart.

### M2. D4 now in WebKit: Back replays leave focus on a link. Fixed.

`pnpm walk d4 --browser=webkit` fails six "back sN: #content focused" checks (got `a` or `body`). Forward steps pass. It is not a style issue. It may predate r7: r6 never walked WebKit.

Fixed, two causes in the engine (`docs/demo-engine.md`). The navigate handler focuses `#content` after a fetch, which has no press behind it in a fresh document: the runtime now sends `focus-request` for a `focus()` that did not take, and the presenter answers `focus-grant` on the press's timer chain. And a press under a second after the last one reused the old press's chain, which WebKit no longer honored (got `body`): every press now starts its own chain. `pnpm walk d4 --browser=webkit`: 45 passed, 0 failed.

### M3. Playwright's WebKit paints no backdrop filter. Open, check by eye.

It reports support (`CSS.supports` is true) but draws no blur, even on a plain `div`. There the drawer shows the 0.3 tint alone. White text then falls to about 3.8:1. Real Safari paints the filter. Open the drawer in Safari over `/s/what-changed` once before the talk.

## Low

### L1. The reader pill overlaps the code panel's bottom right corner. Fixed.

The menu button widened the pill to x 1620. On walk pages it covers the panel's last line near x 1620 to 1856, y 1015 to 1040. Reader mode only, and the pill fades when idle. A markup or layout call: move the pill, or reserve the corner.

Fixed: the controls are now a vertical rail in the canvas's right gutter (`docs/design/r7-spec.md` section 7), at x 1862 to 1912 at 1920 by 1080. No slide content sits under it, in reader mode or the audience window.

### L2. Prefetch not measured. Open.

PRD 9.2 acceptance needs `pnpm build && pnpm start` on 3200. The dev server was not restarted, as asked.

## Not checked

Firefox, the projector, real Safari, `?glass=off`, forced colors, and reduced transparency (CSS read only).

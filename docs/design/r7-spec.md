# r7 design spec: cover, links, chip, drawer, fade, select

Refines `docs/PRD-r7.md` sections 4, 5.2, 7.2, 8.3, 9.3 and 9.7. Where this spec and the PRD disagree on visuals, this spec wins. On behavior, data, contrast, timing and tests, the PRD wins.

Styles live in the WS-F files named in PRD 12. This page is the contract between that CSS and the markup other workstreams render: it names every class and attribute the CSS reads.

## 1. Cover (`styles/components/slides-glass.css`, `.sg--title`)

The speaker asked for the title in two lines again: "2026 advances", then "in the web". It stays 192 px. This replaces the three-line break of PRD r7 4.2; the PRD's 144 px fallback is not needed.

Markup (WS-B, `GlassSlide.tsx`, title branch). Every element is a direct child of the section, in this order:

```html
<section class="sg sg--title" data-tone="dark">
  <p class="sg-eyebrow">FITC Web Unleashed 2026, Toronto</p>
  <h1 class="sg-display sg-title-lines"><span>2026 advances</span><span>in the web</span></h1>
  <p class="sg-cover__name"><a href="…linkedin…" target="_blank" rel="me noopener">Bermon Painter<span class="visually-hidden">, opens in a new tab</span></a></p>
  <p class="sg-cover__role">Head of DXP and Commerce, Slalom</p>
  <a class="sg-wordmark" href="https://www.slalom.com" target="_blank" rel="noopener">slalom<span class="visually-hidden">, opens in a new tab</span></a>
</section>
```

The wordmark may also stay a `<p class="sg-wordmark">` wrapping the link; the CSS works either way.

```text
Region     x     y     w     h     Contents
---------  ----  ----  ----  ----  -------------------------------------------------
Group      64    261   1373  558   flex column, centered in the slide (center y 540)
  Eyebrow  64    261   560   36    28/36 Bold cyan
  Title    64    315   1373  368   192/184 Bold white, two lines, 18 top margin
    Line 1 64    315   1373  184   "2026 advances", glyphs end at x 1437
    Line 2 64    499   929   184   "in the web", glyphs end at x 993
  Name     64    715   900   50    36/50 Bold white, a link
  Role     64    769   900   50    36/50 Regular white, 4 below the name
Wordmark   right 64, bottom 64     48/56 Bold white, a link
```

- One visible rhythm, measured ink to ink: 56 px from the eyebrow to the title and 56 px from the title to the name (margins 18 and 32). The name and role stay a tight pair, 4 px apart.
- The group is 558 tall and its center stays at 540.
- The name and role carry the title's soft text shadow, so the three sit as one plain-text group with no card.

### Wash

Line one ends on the lower left edge of the orange glow. Under the 0.24 navy wash alone, its brightest pixel (rgb 223 158 128, at x 1435) gives white 3.48:1. The cover's `::before` adds one soft layer on top of the existing linear wash:

```css
radial-gradient(ellipse 560px 360px at 1340px 407px,
  rgb(15 28 65 / 0.22) 0, rgb(15 28 65 / 0.22) 35%, rgb(15 28 65 / 0.15) 55%,
  rgb(15 28 65 / 0.06) 78%, rgb(15 28 65 / 0) 100%)
```

- The plateau (0.22, to 35% of the radii) covers line one's right end, x 1240 to 1437 and y 315 to 499. Over the 0.24 wash it renders as 0.404 to 0.408 navy there.
- It fades over about 360 px with eased stops, so it reads as the glow starting a little further right, not as a shape. No edge shows at 1920 by 1080 or in the Open Graph image.
- The linear wash is unchanged: 0.24 to x 1480, then 0 by x 1800.

### Text zones and contrast

Text zones in `content/backgrounds.ts` are the line boxes above. Line one is split at x 1240 so the test can composite the ellipse's floor where it matters:

```text
Zone                      x     y    w     h    Wash  White on worst pixel (pnpm test:contrast)
------------------------  ----  ---  ----  ---  ----  -----------------------------------------
eyebrow                   64    261  560   36   0.24  8.40:1
title line 1              64    315  1176  184  0.24  4.76:1
title line 1, glow edge   1240  315  197   184  0.40  4.89:1
title line 2              64    499  929   184  0.24  6.15:1
name                      64    715  900   50   0.24  6.17:1
role                      64    769  900   50   0.24  6.30:1
```

The eyebrow is cyan (#1BE1F2), not white. The test checks its zone as white; cyan on the same worst pixel under the 0.24 wash is 5.22:1. If the title ever moves or grows, line one must stay inside the ellipse's plateau, and the walk (`scripts/walk-r7.mts`) fails past x 1440 or on any line count but two.

## 2. Links on slides (`slides-glass.css`)

Every `a` inside `.sg` (the footer pill, both wordmarks, the cover name, the closing LinkedIn line, the QR):

| State | Look |
|---|---|
| Rest (captures, walks, posters) | No paint: inherits color and font, no underline, same box as the old `<p>` or `<img>`. |
| Hover | Underline, 0.06 em thick, 0.16 em offset. The QR frame takes no underline. |
| Focus visible (reader mode) | 3 px ring, 4 px offset, radius 8. Cyan `--glass-dark-focus` on dark slides, `--glass-focus` on light slides and on the QR's white card. A link inside a footer pill rings the whole pill (2 px offset), so the ring follows the pill's shape. |
| Speaker previews (`.stage--embedded`) | `pointer-events: none`. |

The footer pill may be the link itself (`<a class="sg-pill">`) or wrap one. The closing line may be `<a class="sg-closing__link">` (logo plus text) or a `p.sg-closing__link` wrapping the `a`. The QR link wraps the `img` inside `.sg-qr__frame`.

## 3. "Still in motion" chip (`styles/components/intro.css`)

`<p class="intro__group">Still in motion</p>`, the first child of `.intro__text`, before `.intro__title`.

- Pill, 44 tall, padding 0 20 0 16, 24 px below it. Fill cyan at 0.12, 1 px cyan edge at 0.4, a 10 px cyan dot 12 px before the text.
- Text 28/36 Bold cyan, the eyebrow style on dark. Cyan on the navy 0.72 panel plus the tint is above 9:1.
- Fits the 952 panel: it adds 68 px to the group.

## 4. Navigation drawer (`styles/components/nav-drawer.css`)

Markup (WS-D, `NavDrawer.tsx`). Render the dialog outside `.stage__canvas` and outside `.reader-controls`, so neither the canvas transform nor the pill's fade reaches it.

```html
<dialog id="deck-nav" class="nav-drawer" closedby="any" aria-labelledby="deck-nav-title">
  <header class="nav-drawer__header">
    <h2 id="deck-nav-title" class="nav-drawer__title">Sections</h2>
    <button type="button" class="nav-drawer__close" commandfor="deck-nav" command="close">Close</button>
  </header>
  <nav class="nav-drawer__nav" aria-label="Sections">
    <ul class="nav-drawer__list">
      <li><a class="nav-drawer__link" href="/s/title" aria-current="true"><span class="nav-drawer__label">Opening</span><span class="nav-drawer__num">1</span></a></li>
      <li class="nav-drawer__group">
        <p class="nav-drawer__heading" id="deck-nav-g1">HTML, CSS, and JavaScript</p>
        <ul class="nav-drawer__list" aria-labelledby="deck-nav-g1">
          <li><a class="nav-drawer__link" href="/s/d1-intro">…</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</dialog>
```

The close button may hold a Lucide `X` icon with an `aria-label` instead of the word; both are styled.

Triggers: add `nav-drawer-trigger` to the button in every window.

| Window | Button |
|---|---|
| Reader | `<button class="reader-controls__button nav-drawer-trigger" aria-label="Sections">` with Lucide `Menu`, first (top) in the rail |
| Speaker | `<button class="speaker__button nav-drawer-trigger">` with `Menu` and the text "Slides", first in `.speaker__controls` |
| Audience | `<nav class="reader-controls reader-controls--audience" aria-label="Deck controls">` holding the reader button, in the same rail position. It hides with the cursor (`.audience[data-cursor="hidden"]`). Do not render it under automation or capture. |

Visual (PRD 9.7, refined so the whole list shows at 1080 tall with no wrapped names):

- Sheet: right side, 16 px from the top, right and bottom, `inline-size: min(520px, 100vw - 32px)` (520, not 420: "Scoped custom element registries" fits on one line), radius 24. Dark edge, highlight and shadow.
- Fill (review r7 H1, clear dark glass): navy 0.3 tint over `blur(16px) saturate(170%) brightness(0.58)`. The speaker asked for visible transparency. Navy 0.82 over the scrim read as solid. The filter dims the slide instead of the tint, so shapes and hues show through. The values live in `--nav-drawer-tint` and `--nav-drawer-filter` on `.nav-drawer`. Proposed token: promote both to `glass-tokens.css` if a second clear surface appears.
- Header: padding 20 20 8 36; title 28/36 Bold white; close button 44 tall, pill, white 0.08 fill, white edge 0.16.
- List: padding 4 20 16, so the first link's focus ring is never clipped by the scroller.
- Group headings 18/24 Bold `#D6DCEC` (`--glass-dark-ink-body`), 16 px above, 4 px below, 16 px inline padding (aligned with link text). `#B8C0D9` falls to 4.6:1 on the clear fill.
- Links 22/28 white, 10 by 16 padding, radius 12, 48 tall (the target floor is 44). Slide number right-aligned, 18/24 `#D6DCEC`.
- At 1080 tall the 16 rows and four headings fit (about 1040 px). Shorter windows scroll the list inside the sheet.
- Current: cyan 0.16 fill, Bold, 3 px cyan inline-start bar. Hover: white 0.08. Focus: 3 px cyan ring, 2 px offset.
- Contrast, measured in Chromium from rendered pixels over a pure white backdrop (the worst case): white 8.3:1, `#D6DCEC` 6.0:1, white on the current row 6.3:1. Over the real light slides and demo pages every row stays at or above those values.
- The contrast depends on the backdrop filter painting. Where `backdrop-filter` is unsupported the sheet is solid. Playwright's WebKit reports support but paints no backdrop filter, so check Safari by eye, not in that build.
- Backdrop: `--glass-scrim` (navy 0.36).
- Motion: in, `translateX(24px)` to 0 and opacity 0 to 1 over 200 ms; out, opacity to 0 over 140 ms; `--glass-ease`. The backdrop fades with it. Reduced motion: opacity only.
- Fallbacks: no `backdrop-filter`, `prefers-reduced-transparency` or `data-glass="off"` give solid `--glass-dark-solid`. Forced colors: `Canvas`, `CanvasText`, `Highlight` ring and a `Mark` current bar.

## 5. Fade (`styles/components/stage-transition.css`)

Refines PRD 9.3: the new slide fades in over 200 ms (`--glass-ease`) over the old slide, which holds at full opacity, with normal blending. The PRD's 140 ms fade-out let the pair sum to about 0.87 in the first frames, a visible dip toward the black letterbox. The root (letterbox, reader pill) swaps at once instead of taking the browser's 250 ms root crossfade. Reduced motion turns the slide animation off.

## 6. Native select chevron (`styles/glass-tokens.css`)

As PRD 7.2: inside frames, a native single select (not D6's, which has a `button` child) gets `appearance: none`, 36 px end padding, `line-height: 20px` and a 16 px Lucide `chevron-down` (stroke `#0F1C41`, 1.75) at `right 11px center` (1 px border + 11 + 8 puts its center 20 px from the border edge). Disabled selects draw it in `#3E4A6B`. The theme lint allows `appearance` on that one selector only.

## 7. Reader controls (`styles/components/reader-controls.css`, review r7 L1)

A vertical rail in the canvas's right gutter, not a horizontal pill over the slide. Every slide keeps its content 64 units clear of the canvas's right edge (x 1856 of 1920); the bottom margin is as thin as 28 (glass footers end at y 1052) and walk pages start at y 48, so only the right gutter holds a 44 px target everywhere.

- Order, top to bottom: menu (the drawer trigger), previous, counter, next, keyboard help. The audience window's rail holds the menu button alone.
- The counter stacks the slide number over the total, split by a white 0.4 hairline, 13/16 tabular (number Bold). Screen readers hear "12 of 50".
- Geometry follows the scaled canvas, in viewport px: canvas width `min(100vw, 100dvh * 16 / 9)`, free room right of the content = side letterbox + width / 30. Buttons are that room less 20, clamped to 32 to 44 (44 at 1920 by 1080: the rail is 50 wide with its edge, 8 px from the right edge, x 1862 to 1912). The rail centers in the room and sits 8 px above the canvas's bottom edge. Below a 1080 px wide 16:9 window the 32 px floor overlaps the content by a few px.
- Fill as before (navy 0.85, opacity 0.75 at rest, 0 when idle, 1 on hover or focus), plus the dark glass edge, highlight and `--glass-blur`. The fill alone carries the contrast, so a missing backdrop filter changes nothing. Reduced transparency: solid `--glass-dark-solid`. Forced colors: `Canvas`, `CanvasText`.

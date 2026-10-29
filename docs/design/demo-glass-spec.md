# Demo glass spec

Artifact: visual design spec for the demo section (slide chrome, intro slide, portal UI in every frame)
Status: draft for engineering review. Version 1.0, 28 October 2026.
Implements: `docs/design/feedback-2026-10-28.md` (design changes) inside the rules of `docs/PRD-demos-v4.md` section 6.
Tokens and base classes: `styles/glass-tokens.css`. Every value below is a token in that file. Where this spec gives a raw number, the token name follows it.

PRD v4 says the spec wins on visuals and the PRD wins on behavior, timing, contrast and data. Section 13 lists the places where this spec changes a PRD value, with the reason.

## 1. Direction

```text
Intent:   A web developer in row 20 watches a projected 1920 by 1080 slide. The demo plays on the
          left and the code highlights on the right. In about 10 seconds per step they must link
          the highlighted lines to what just changed in the portal. It should feel like a calm,
          real product seen through frosted glass. The one thing moving is the only thing you notice.
Domain:   top layer, backdrop, frost, pane, order queue, pick list, stock hold, back office.
Color:    Slalom Blue signal, navy ink, cyan ice, purple haze, white frost, one chartreuse flag.
Signature: Frosted where it floats. The app pane is frosted glass over a soft background. Cards
          inside it are clear tinted fills with no blur. Only top-layer surfaces (dialog, popover,
          menu, select picker, toast) frost again, so the platform's top layer reads as the layer
          above. Five places: pane, dialog, menu or popover, select picker, toast.
Rejecting: uppercase tracked card labels (inspiration) -> sentence-case bold titles;
          blur on every card -> blur on the pane and floating layers only;
          saturated outlined priority pills -> tinted chips with a dot and a text label.
Dials:    variance 3 (one consistent product) / motion 3 / density 5.
```

## 2. Delivery

| Item | Rule |
|---|---|
| Source file | `styles/glass-tokens.css`. Copy it to `public/theme/portal-glass.css` for frames (PRD 6.2). Next.js serves only `public/`, so frames cannot load `styles/` directly. `pnpm theme:sync` copies it on to the F2 apps. |
| Presenter | May import `styles/glass-tokens.css` for the `--chrome-*`, `--intro-*` and `--glass-dark-*` tokens. Every frame-only rule is scoped to `:root[data-build]`, which the presenter never has. |
| Frame scoping | `lib/frames/compose.ts` already writes `data-build="today\|native\|static\|terminal"` on each frame's `<html>`. `today` selects the used-to background; everything else gets the now background. The F2 apps must write `data-build="native"` (3106) and `data-build="today"` (3107) themselves. |
| Layers | `@layer portal-theme` holds paint and follows the PRD 6.2 lint list. `@layer portal-layout` holds layout for `.portal*` and `.glass-*` class selectors only (section 13, item 1). Shown CSS stays unlayered and always wins. |
| Backgrounds | Root-relative URLs (`/backgrounds/glass-fan.jpg`). Frames on `127.0.0.1:3000` can load them because the same Next server serves both origins, and `img-src ORIGIN` in `BASE_CSP` and both D5 policies allows them. |
| Font in frames | Slalom Sans Regular and Bold load from `/fonts/` on the demo origin. `font-src ORIGIN` allows it, and the test render confirmed both faces load in a frame on `127.0.0.1:3000`. Stack: `"Slalom Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. The F2 apps fall back to system-ui unless `theme:sync` also copies the two OTF files. |
| Code font | `ui-monospace, "SF Mono", Menlo, Consolas, monospace`. JetBrains Mono is named in `styles/tokens.css` but is not in the repo; SF Mono on the talk Mac has the 0.6 em advance the panel math assumes. |
| Icons | Lucide outline, 20 frame px, stroke 1.75, `currentColor`, inline SVG. It is the family the presenter already uses. |

## 3. Backgrounds and intensity

The images are already soft, so they need a wash rather than blur to sit back.

| Surface | Image | Wash on top | Token |
|---|---|---|---|
| Now, native, static, terminal frames | `glass-fan.jpg` | white at 40 percent | `--glass-frame-wash` |
| Used-to (today) frames | `glass-petal.jpg` | lavender gray `rgb(240 238 250)` at 55 percent | same token, `[data-build="today"]` |
| Walk-page slide chrome | `glass-fan.jpg` | white at 78 percent for y 0 to 168, easing to 45 percent by y 320 | `--chrome-wash` |
| Intro slide | `glass-navy.jpg` | navy at 35 percent | `--intro-wash` |
| Intro visual card | `glass-blue.jpg` (D1, D3, D5, F2) or `glass-lavender.jpg` (D2, D4, D6, F3) | none | `--intro-visual-image-a`, `-b` |

- The frame `body` carries its own background with `background-size: cover` and `background-attachment: fixed`, because blur in an iframe cannot reach the parent page.
- If an image fails, a gradient of the same colors shows (`--glass-frame-fallback`).
- `glass-blue.jpg` and `glass-lavender.jpg` never sit behind code or portal UI.
- PRD file names map to these files: `slide-demo.webp` = `glass-fan.jpg`, `portal-now.webp` = `glass-fan.jpg`, `portal-used-to.webp` = `glass-petal.jpg`. Converting to WebP at 350 KB or less (PRD 6.5) is still owed: petal, blue, navy and lavender are 380 to 650 KB as JPEG.

## 4. Tokens

Frame tokens are in frame CSS px. Walk-page frames are authored at 640 by 628 and scaled by 1.375, so 15 frame px shows as 20.6 stage px.

### 4.1 Surfaces and blur

| Token | Value | Use |
|---|---|---|
| `--glass-pane` | `rgb(255 255 255 / 0.32)` | the app pane; only `--glass-ink` text sits on it directly |
| `--glass-surface` | `rgb(255 255 255 / 0.55)` | cards |
| `--glass-surface-strong` | `rgb(255 255 255 / 0.72)` | secondary buttons, current nav item |
| `--glass-surface-float` | `rgb(255 255 255 / 0.78)` | menus, popovers, select picker, dialogs, toasts |
| `--glass-surface-field` | `rgb(255 255 255 / 0.85)` | inputs, selects, textareas |
| `--glass-surface-solid`, `--glass-pane-solid` | `#ffffff`, `#eef1f8` | fallbacks (section 11) |
| `--glass-surface-hover` | `rgb(15 28 65 / 0.06)` | quiet hover |
| `--glass-surface-selected` | `rgb(12 98 251 / 0.10)` | selected row, active menu item |
| `--glass-scrim` | `rgb(15 28 65 / 0.36)` | `dialog::backdrop`, `.glass-backdrop` |
| `--glass-filter-pane` | `blur(24px) saturate(140%)` | the pane, on `.portal::before` |
| `--glass-filter-float` | `blur(16px) saturate(140%)` | menu, popover, picker, toast |
| `--glass-filter-dialog` | `blur(24px) saturate(140%)` | dialog |

Blur budget per frame document: pane 1, plus at most one open menu or picker, one dialog and one toast. That is 4, under the PRD cap of 6. The slide chrome and intro slide use no blur at all.

### 4.2 Edges, depth, radii, spacing

| Token | Value |
|---|---|
| `--glass-border` | `1px solid rgb(255 255 255 / 0.6)`; floating layers use `0.7` |
| `--glass-highlight` (inner highlight) | `inset 0 1px 0 rgb(255 255 255 / 0.7)` |
| `--glass-rule` (dividers) | `rgb(15 28 65 / 0.08)` |
| `--glass-control-border` | `rgb(15 28 65 / 0.14)` |
| `--glass-field-border` | `rgb(15 28 65 / 0.5)`, 3.25:1 against the field fill |
| `--glass-shadow-card` | `0 1px 2px rgb(15 28 65 / 0.06)` |
| `--glass-shadow` (pane) | `0 8px 32px rgb(15 28 65 / 0.12)` |
| `--glass-shadow-float` | `0 12px 32px rgb(15 28 65 / 0.18)` |
| `--glass-shadow-dialog` | `0 24px 64px rgb(15 28 65 / 0.24)` |
| Radii | pane 16, dialog 16, card 12, float 10, control 8, item 6, pill 999 (`--glass-radius-*`) |
| Spacing | 2, 4, 6, 8, 12, 16, 20, 24, 32 (`--glass-space-1` to `-9`) |
| Frame padding | `clamp(12px, 1.5vw, 20px)`: 12 at 640, 20 at 1304 (`--glass-frame-pad`) |

### 4.3 Type scale in frames

A 1.2 ratio from a 15 px base, rounded to whole pixels. Weights: 400 and 700 only.

| Token | Frame px / line | Stage px at 1.375 | Use |
|---|---|---|---|
| `--glass-text-xs` | 12 / 16 | 16.5 | count badges, menu group labels, nav headings |
| `--glass-text-sm` | 13 / 18 | 17.9 | table headers, chips, hints, field labels, meta |
| `--glass-text-md` | 15 / 20 (prose 22) | 20.6 | body, cells, buttons, inputs, menu items |
| `--glass-text-lg` | 18 / 24 | 24.8 | portal page title at 640, dialog title |
| `--glass-text-xl` | 22 / 28 | 30.3 | portal page title at 900 and wider |
| `--glass-text-2xl` | 26 / 32 | 35.8 | stat values |

Do not use `font-variant-numeric: tabular-nums` with Slalom Sans: its tabular figures put wide gaps around commas and periods. Right-align numeric columns instead.

### 4.4 Text colors and focus

| Token | Value | Where it may sit |
|---|---|---|
| `--glass-ink` | `#0F1C41` navy | any surface, including the pane |
| `--glass-ink-soft` | `#3E4A6B` | cards and stronger; never on the pane |
| `--glass-link` | `#002FAF` dark blue | cards and stronger |
| `--glass-on-accent` | `#FFFFFF` | on Slalom Blue fills only |
| `--glass-focus` | `#0C62FB`, 3 px outline, 2 px offset | all focusable elements |

### 4.5 Dark variant (navy slides)

Add the class `glass-dark` to any container. It remaps the light tokens, so every `.glass-*` class works on navy.

| Token | Value |
|---|---|
| `--glass-dark-surface` | `rgb(15 28 65 / 0.56)`; strong 0.72, float 0.82 |
| `--glass-dark-border-color` | `rgb(255 255 255 / 0.16)` |
| `--glass-dark-highlight` | `inset 0 1px 0 rgb(255 255 255 / 0.12)` |
| `--glass-dark-shadow` | `0 24px 64px rgb(0 10 37 / 0.4)` |
| `--glass-dark-ink`, `-ink-body`, `-ink-soft` | `#FFFFFF`, `#D6DCEC`, `#B8C0D9` |
| `--glass-dark-focus` | `#1BE1F2` cyan (Slalom Blue is 2.3:1 on navy and fails as a ring) |
| `--glass-dark-solid` | `#16234D` (fallback) |

## 5. Legibility

Method: each ratio composites the text color over the surface, over the wash, over the darkest pixel of the blurred background (sampled from the real files: `glass-fan.jpg` darkest is `rgb(4 21 211)`), and over plain navy as the floor.

| Text | Surface | Worst ratio | Verdict |
|---|---|---|---|
| ink | pane 0.32 | 6.55 | pass |
| ink-soft | pane 0.32 | 3.45 | fail: ink only on the pane |
| ink | card 0.55 on pane | 11.37 | pass |
| ink-soft | card 0.55 on pane | 5.99 | pass |
| dark blue link | card 0.55 on pane | 7.09 | pass |
| ink-soft | float 0.78, no pane, over navy | 5.52 | pass |
| Slalom Blue text | float 0.78 over navy | 3.18 | fail: never a text color on glass |
| white on Slalom Blue button | | 5.05 | pass |
| navy on coral, cyan, purple, chartreuse fills | | 5.13, 10.37, 9.35, 14.66 | pass |
| ink on each chip tint over a card | | 7.79 or more | pass |
| white on intro tile over the brightest arc | | 11.57 | pass |
| soft `#B8C0D9` on intro tile | | 6.38 | pass |

Rules:

1. Text sits on `--glass-surface` (0.55) or stronger, inside the pane. The pane carries ink only: nav labels and the page title.
2. Slalom Blue, cyan, purple, chartreuse and coral are never text colors on light glass. Links and eyebrows use dark blue. Errors pair a coral border or icon with ink text.
3. The wash is part of the theme and is never removed. The contrast unit test (PRD 6.4) must composite over wash plus palette color, as this table does. Without the wash, ink-soft on a card fails over raw navy.
4. Code panel: `--chrome-code-surface` is near solid (white at 96 percent, no blur). Every code color meets 7:1 there, as the PRD requires: ink 16.6, keyword `#002FAF` 9.9, string `#6B2C91` 8.4, property `#005A73` 7.4, comment `#4A5470` 7.2, number `#8A1F2E` 9.0.
5. Non-highlighted code lines dim to 55 percent opacity (3.8:1), not the current 40 percent (2.5:1). At 24 px the code is large text, so 3:1 holds.
6. Color is never the only signal. Chips carry a text label. Selected rows add a 3 px bar and `aria-selected`. Invalid fields add an icon and a message. Unsupported browsers add "Not yet" and a dashed edge.

## 6. Slide chrome: walk pages

Stage px on the 1920 by 1080 canvas. Geometry follows PRD 1.4.

```text
Region          x     y     w     h     Contents
--------------  ----  ----  ----  ----  ------------------------------------------------
Background      0     0     1920  1080  glass-fan.jpg cover, --chrome-wash
Eyebrow         64    48    *     36    feature name, 28/36 Bold, #002FAF, sentence case
Step indicator  *     48    *     36    right edge at 1856, vertically centered
Title           64    88    *     72    "What we used to do" or "What we can do today", 64/72 Bold, navy
Meter           *     88    *     72    used-to last step only, right edge at 1856
Frame card      64    176   880   864   radius 24, iframe 640 by 628 scaled 1.375
Code card       976   176   880   864   radius 24, --chrome-code-surface
Gap             944   176   32    864   background shows through
Bottom margin   0     1040  1920  40
```

- **Cards.** Both use `--chrome-card-border` (`1px solid rgb(255 255 255 / 0.7)`), `--chrome-card-highlight` and `--chrome-card-shadow` (`0 24px 64px rgb(15 28 65 / 0.16), 0 2px 6px rgb(15 28 65 / 0.06)`), with `overflow: hidden`. The frame card has no padding; the portal's own 12 px frame padding shows the frame background inside it. Its loading state fills with `--glass-surface-solid` and shows the status text in ink-soft, 20 px.
- **Code card.** Tabs row 56 px (`--chrome-code-tabs-height`), 32 px side padding, tabs 24 px apart, a 1 px `--glass-rule` under the row. A tab is the file name as written (no uppercase), 20 px monospace, ink-soft; the active tab is ink, Bold, with an inset 3 px Slalom Blue bottom bar. The "Off" chip sits 8 px after the file name: coral fill, navy text, 14 px Bold, pill. Code: 24/36 px monospace, padding 24 px top and bottom and 32 px at the sides. 864 minus 56 minus 48 leaves 760 px, which shows 21 lines (756 px). The inner width of 816 px fits 56 columns, so 44-column files never scroll sideways. Highlighted lines: `--chrome-code-highlight-bg` across the full width, an inset 4 px `--chrome-code-highlight-bar`, line padding 0 8 px. Elision lines: comment color, italic, never dimmed below it.
- **Step indicator.** Text "Step 3 of 6", 20 px, ink-soft, then 12 px gap, then one segment per step, 6 px apart: done steps 16 by 6 navy, the current step 40 by 6 Slalom Blue, future steps 16 by 6 navy at 16 percent. All radius 3. Width and text carry the state, so color is not the only signal. Mark the group `aria-hidden="true"`; the speaker window already announces steps.
- **Meter.** Label 20 px ink-soft, value 40/72 Bold dark blue (not Slalom Blue: 3.2:1 on the wash), baseline aligned, 12 px apart.
- **Callouts** (overlay, frame px inside the scaled wrapper): `--chrome-callout-bg` navy fill, white 19/23 Bold (26 stage px), padding 6 by 12, radius 9 frame px (12 stage), no border. The leader stays a 2 px Slalom Blue line, 24 frame px long, ending in a 6 px Slalom Blue dot with a 2 px white ring. At most 3 words.
- **Spotlight.** Keep the 3 px Slalom Blue outline, 4 px offset and the white halo. Set its radius to the target's radius plus 4.
- **Keycaps.** Keep navy with the 2 px chartreuse keyline. This is the deck's one sanctioned chartreuse use on navy.
- **Support badge** (single pages F1, F4, F5 only; walk pages drop it per PRD 1.3): a chip in the title row, right edge 1856, height 48, padding 0 20, `--glass-surface-strong`, `--glass-border`, radius pill, 22 px Bold ink. A missing browser shows its name struck through with a visually hidden "missing".
- **Single pages:** one card at x 64, y 176, 1792 by 864, with a 1304 by 628 frame viewport at the same scale.

## 7. Intro slide

The intro slide is navy (`glass-dark`), so each section opens with a clear break from the light walk pages.

```text
Region          x     y      w     h     Contents
--------------  ----  -----  ----  ----  ------------------------------------------------
Background      0     0      1920  1080  glass-navy.jpg cover, --intro-wash
Visual card     64    64     880   952   radius 24, accent image cover, border 1px white 0.24,
                                          shadow --glass-dark-shadow
Capture         88    132    832   816   PRD 1.1 still, radius 16, border 1px white 0.6,
                                          shadow 0 24px 64px rgb(15 28 65 / 0.32)
Right column    1008  64     848   952   flex column, group centered vertically
  Title                      848   96/ln  88/96 Bold white, at most 2 lines
  Description   gap 32       848   50/ln  36/50 Regular #D6DCEC, at most 7 lines
  Support row   gap 56       847   196   4 tiles 196 by 196, 21 px apart
  Also uses     gap 32       848   32/ln  24/32 Regular #B8C0D9, at most 2 lines
```

- **Capture placement.** The 640 by 628 capture scales to 832 by 816, inset 24 px left and right and centered vertically: 64 + (952 minus 816) / 2 = 132. With no capture yet, the card shows the accent image alone as an abstract crop.
- **Worked example (D1).** Title 96, description 4 lines (200), support row 196 and a 2-line also-uses line (64) give a 676 px group. It starts at y 202 and ends at 878, which the mock render confirmed.
- **Inline code in the description:** monospace at 32 px, white, `rgb(255 255 255 / 0.1)` fill, radius 6, padding 0 8.
- **Supported tile.** `--glass-dark-surface` with `--glass-dark-border-color`, `--glass-dark-highlight` and radius 20 (`--intro-tile-radius`). Content is a centered stack: logo 72, 12 gap, version 48/48 Bold white, 4 gap, name 24/28 ink-soft. The stack is 164 px tall, leaving 16 px above and below.
- **Not supported yet.** Transparent fill, `1px dashed rgb(255 255 255 / 0.32)`, logo `filter: grayscale(1)` at 40 percent opacity, "Not yet" at 36/48 Bold `#D6DCEC` in place of the version. The row height does not change.
- **Tool tiles (F2, F3).** Same anatomy: logo, version, name.
- **Markup.** `<ul aria-label="Browser support">`. Each `<li>` reads "Chrome, from version 37" (the words "from version" are visually hidden) or "Firefox, not supported yet". Logos use `alt=""`. The capture's alt text is one sentence naming the state, for example "The order portal with the cancel dialog open."
- **Motion.** On arrival, tiles fade up in order (section 10). Nothing else moves.

## 8. Portal app shell

Markup: `.portal` > `nav.portal__nav` + `header.portal__top` + `main.portal__main`. Overlay roots, toasts and any element a today build positions with `position: fixed` are direct children of `body`, outside `.portal`.

| Part | 640 by 628 viewport (walk pages) | 1304 by 628 viewport (single pages) |
|---|---|---|
| Pane | 616 by 604 after 12 px frame padding; radius 16; frosted fill on `.portal::before` | 1264 by 588 after 20 px padding |
| Nav | 56 px icon rail. Labels and headings stay in the DOM, visually hidden. Count badges move to the icon's top right corner. | 200 px with labels; heading "Operations" 12/16 Bold ink |
| Nav item | 40 by 40, icon 20, radius 8 | 40 tall, padding 0 8, icon then label, 10 gap |
| Current item | `--glass-surface-strong`, `--glass-border`, highlight and card shadow, Bold. Set it with `aria-current="page"`. | same |
| Brand | 32 px navy tile with a white "R" | tile plus "Ridgeline" 15 Bold |
| Top bar | 56 tall, 16 px side padding, 1 px rule below. `h1.portal__title` 18/24 Bold, then actions pushed right: search (pill field, 180 wide), avatar 32 (purple fill, navy initials 13 Bold). | title 22/28 |
| Main | padding 16, cards stacked 12 apart, scrolls on overflow. Content width 528 px. | content width about 1030 px |

The rail switches at a 900 px viewport through a media query in `portal-layout`, so no demo sets it by hand. Pane separators are `--glass-rule` lines; the nav keeps the pane color, as in the references.

## 9. Component inventory

Inside a frame, bare elements already get the default look: `button`, `input`, `select`, `textarea`, `table`, `dialog`, `[popover]`, `a`, `h1` to `h3`. Shown HTML stays free of styling classes. Add classes only for variants and structure. Modifiers may stand alone on a bare element (`<button class="glass-btn--primary">`).

| Component | Glass treatment | Classes | States |
|---|---|---|---|
| App shell | Frosted pane over the wash, 1 px white edge, pane shadow | `.portal`, `__nav`, `__nav-heading`, `__nav-link`, `__nav-icon`, `__nav-label`, `__brand`, `__brand-mark`, `__brand-name`, `__top`, `__title`, `__actions`, `__avatar`, `__main` | current via `aria-current`, hover white at 40 percent |
| Card | Clear tint 0.55, no blur, white edge, inner highlight, hairline shadow, radius 12, padding 16 | `.glass-card`, `--flush`, `--inset`, `--selected`, `__header`, `__title`, `__meta`, `__media`, `__footer` | selected: strong fill plus a 1 px Slalom Blue ring at 50 percent |
| Stat | Inside a card: label 13 ink-soft, value 26 Bold | `.glass-stat`, `__label`, `__value` | none |
| Table | Sits in a card. Header 13 Bold ink-soft, cells 15, padding 10 by 12, hairline row rules, no outer border | `.glass-table`, `__row--selected`, `__num`, `__primary` | hover white at 35 percent; selected `--glass-surface-selected` plus a 3 px blue bar; `aria-selected="true"` also works |
| Button, secondary (default) | Strong fill, navy 14 percent edge, inner highlight, 36 tall, padding 7 by 14, radius 8, 15 Bold | `.glass-btn` or bare `button` | hover white 0.9; active white 0.6 with an inset shadow; disabled white 0.4, ink-soft, no shadow; focus ring |
| Button, primary | Slalom Blue fill, white text, dark blue edge | `.glass-btn--primary` | hover `#0A4EC9`, active `#002FAF` |
| Button, danger | Coral fill, navy text | `.glass-btn--danger` | hover lightens with a 16 percent white overlay |
| Button, quiet and icon | No fill or edge; icon is 36 by 36 | `.glass-btn--quiet`, `--icon`, `--sm` (28 tall) | hover `--glass-surface-hover` |
| Field | Label 13 Bold ink above, 6 gap, control, hint 13 ink-soft | `.glass-field`, `__label`, `__hint`, `__error` | see the control |
| Input, select, textarea | Field fill 0.85, navy 50 percent edge, faint inset shadow, radius 8, padding 7 by 12 | `.glass-input`, `--search` (pill, 34 px left for the icon) or bare elements | hover edge 70 percent; focus edge blue plus the ring; invalid (`aria-invalid`) 2 px coral edge, a coral icon and an ink message; disabled white 0.4 with a navy 24 percent edge |
| Select picker (D6) | Float fill, 16 px frost, radius 10, padding 6. Options padding 8 by 10, radius 6 | `::picker(select)`, `option` (theme only) | hover `--glass-surface-selected`; checked 16 percent blue and Bold |
| Menu, popover | Float fill 0.78, 16 px frost, white 0.7 edge, float shadow, radius 10, padding 6 | `.glass-menu`, `__item`, `__label`, `__separator`, `__icon--danger`, or bare `[popover]` | item hover, `.is-active` and focus: `--glass-surface-selected`; focus ring inset 2 px; destructive items keep ink text with a coral icon |
| Dialog | Float fill, 24 px frost, radius 16, padding 24, dialog shadow; scrim navy at 36 percent | `.glass-dialog`, `__title`, `__body`, `__actions`, `.glass-backdrop` (today builds), or bare `dialog` | actions right aligned, 8 apart, primary last |
| Count badge | Slalom Blue pill, white 12 Bold, 20 tall, minimum 20 wide | `.glass-badge` | none |
| Status chip | Tinted fill, matching 1 px edge, 6 px dot, 13 Bold ink, pill, 20 tall | `.glass-chip`, `--info`, `--success`, `--pending`, `--error`, `--new`, default neutral | not interactive |
| Toast | Float fill, 16 px frost, radius 12, padding 12 by 14, leading icon, 3 px inset left bar | `.glass-toast`, `--success`, `--error`, `__title`, `__icon--success`, `__icon--error` | `role="status"`; place it in build CSS, bottom right, 16 px from the edges |
| Tabs | Text tabs on a hairline; selected ink Bold with a 2 px blue underline | `.glass-tabs`, `__tab` | `aria-selected` or `aria-current` |
| Prose (D5) | 15/22, 12 px block gaps, purple quote rule | `.glass-prose` | none |
| Skeleton, empty | Static navy 8 percent block (the theme cannot animate); empty state centered 15 ink-soft | `.glass-skeleton`, `.glass-empty` | none |

Chip vocabulary: info for Processing and Open; success for Shipped, Paid and Resolved; pending for Awaiting stock and On hold; error for Payment failed and Overdue; new for New only (the one chartreuse use in the portal); neutral for Draft and Closed. Interactive targets are 36 frame px by default and never under 28 (`--sm`); the AA floor is 24.

## 10. Motion

The theme never animates (PRD 6.2). Motion lives in build CSS: in shown files when the motion is part of the feature (D1's dialog), in the build's unshown CSS otherwise. Unshown CSS uses the tokens. Shown CSS writes literal values that match them, so the code on screen reads on its own. Animate only `opacity` and `transform`.

| Element | Enter | Exit | Origin and notes |
|---|---|---|---|
| Menu, popover, select picker | opacity 0 to 1, translateY(-4px) to 0, scale 0.98 to 1, 160 ms | opacity to 0, 120 ms | origin at the edge nearest the anchor (top right for menus that open below and to the left) |
| Dialog | opacity 0 to 1, scale 0.97 to 1, 200 ms; scrim fades in over 200 ms | opacity to 0, 140 ms | centered origin |
| Toast | opacity 0 to 1, translateY(8px) to 0, 200 ms | opacity to 0, 160 ms | bottom edge |
| Intro tiles | each fades in with translateY(8px) to 0 over 200 ms, 80 ms apart, starting 120 ms after arrival | none | left to right |
| Buttons, nav, rows, chips | no transition | none | the clicker drives the room; instant state reads best |

Easing is `--glass-ease`, `cubic-bezier(0.23, 1, 0.32, 1)`, for both directions. Never use `ease-in`, `scale(0)` or `transition: all`.

Reduced motion: the tokens set every shift to 0 and every scale to 1, so the same rules become opacity crossfades of 160 ms or less. Intro tiles appear at once. Shown CSS that wraps its transition in `prefers-reduced-motion: no-preference` (D1 does) is instant under reduce, which also fits.

Pattern for unshown build CSS:

```css
.glass-menu {
  opacity: 0;
  transform: translateY(var(--glass-shift-menu)) scale(var(--glass-scale-menu));
  transition:
    opacity var(--glass-dur-menu-out) var(--glass-ease),
    transform var(--glass-dur-menu-out) var(--glass-ease),
    display var(--glass-dur-menu-out) allow-discrete,
    overlay var(--glass-dur-menu-out) allow-discrete;
}
.glass-menu:popover-open {
  opacity: 1;
  transform: none;
  transition-duration: var(--glass-dur-menu-in);
}
@starting-style {
  .glass-menu:popover-open {
    opacity: 0;
    transform: translateY(var(--glass-shift-menu)) scale(var(--glass-scale-menu));
  }
}
```

## 11. Fallbacks

| Condition | Result |
|---|---|
| `@supports not (backdrop-filter: blur(1px))` | Every surface token becomes solid: pane `#EEF1F8`, cards, fields and floats `#FFFFFF`. Edges switch to navy at 14 percent (18 percent on floats) so cards stay distinct. Filters become `none`, the inner highlight is dropped and the code panel goes to solid white. |
| `prefers-reduced-transparency: reduce` | Same as above, plus dark tiles become `#16234D`. The background image stays: it is not transparency. |
| `?glass=off` | The `glass:0` flag reaches frames in `data-flags`, and the theme matches `:root[data-flags*="glass:0"]`. The slide chrome sets `data-glass="off"` on its root. Both give the solid set. |
| `forced-colors: active` | Filters off; chip dots use `CanvasText`. System colors handle the rest. |
| Missing image | The gradient fallback layer shows. `pnpm check` warns (PRD 6.5). |
| Enhancement off | The theme stays on. It never styles anything a feature toggles, so the proofs look plain where they should. |

The test render confirmed the switch: with `glass:0` the pane filter computes to `none` and menus to opaque white.

## 12. How to restyle a demo

1. Wrap the build's markup in the shell from section 8. Delete the build's own `body`, color, font, border and button rules (PRD 6.3).
2. Use bare elements first and add `.glass-*` classes only for variants and structure.
3. Keep feature CSS in the shown files: placement, state, motion, sizing of dialogs and menus (menus 192 px minimum width, dialogs 360 px maximum inline size at 640).
4. Never put `backdrop-filter` on an element inside `.portal`, and never put an overlay root inside it. Cards stay unblurred.
5. Use believable Ridgeline data: order numbers like RO-48207, real-looking totals ($412.80), outdoor products (Trail Runner 2, Summit 40L pack).
6. Check each frame at 640 by 628: nothing wider than 528 px in `main`. D2's container widths are the known risk (PRD RAID).
7. Run axe with `?glass=off` and look at the frame at stage size before calling it done.

## 13. Changes to PRD v4 and decisions for the engineer

1. **Theme lint scope.** PRD 6.2 bans `display`, sizing and `position` anywhere in the theme. The shell and component layout cannot exist under that rule. Proposal: the lint applies in full to `@layer portal-theme`; `@layer portal-layout` may use layout properties on `.portal*` and `.glass-*` class selectors only, never on element, `[popover]`, `dialog`, form-control, `::backdrop` or `::picker` selectors. Engineer decides; without it, the shell CSS moves into every build.
2. **Slalom Blue text.** PRD 6.4 allows it on `--glass-surface-strong`. Measured, it is 2.8:1 over navy there. It is never a text color on glass.
3. **`--glass-surface-solid`** is opaque `#FFFFFF`, not white at 92 percent, so the fallbacks are truly solid.
4. **Radius.** `--glass-radius` aliases the 12 px card radius (PRD 20). The pane and dialogs use 16, slide cards 24. The references use small radii.
5. **Blur.** Pane and dialog 24 px, floating layers 16 px; cards none. The pane blur sits on `.portal::before`, so the pane is never the containing block or backdrop root for demo content.
6. **Code panel math.** PRD 1.4 subtracts 64 px of vertical padding and still gets 21 lines; that leaves 744 px, which is 20. This spec uses 24 px top and bottom (760 px, 21 lines).
7. **Intro slide on navy.** This spec chooses navy so sections read as breaks. The light version only needs `glass-dark` removed and `--chrome-wash` as the background. The speaker should see both at the projector check.
8. **Walk-page nav as a rail.** At 640 px, a labeled nav would leave 448 px for the demo. The rail leaves 528.
9. **Code panel color** (PRD question 4) stays light by default. The tokens are ready for a navy panel if the projector check prefers it.
10. **Placeholders.** `styles/tokens.css` still has placeholder values for dark blue, cyan, coral, purple, chartreuse and dark gray. This file uses the real Slalom values; the presenter tokens should be updated to match.

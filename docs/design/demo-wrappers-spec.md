# Demo wrappers and slides spec, v5

Artifact: visual design spec for the v5 round. It covers the contextual demo wrappers, the intro slides, the native opening and closing slides, the new closing slide, the grain overlay and the spotlight boxes.
Status: draft for engineering. Version 1.0, 28 October 2026.
Implements: `docs/design/feedback-2026-10-28-v5.md` inside `docs/PRD-demos-v5.md`. Content per wrapper follows `docs/design/demo-wrappers-cx.md`.
Extends, never replaces: `docs/design/demo-glass-spec.md` and `styles/glass-tokens.css`. Every value here is a glass token unless this spec adds one (section 3.3).

Precedence. The PRD says this spec wins on visuals and the PRD wins on behavior, data, contrast, timing and tests. The CX doc wins on what each wrapper shows. Section 11 lists every place this spec changes a PRD or CX value.

Units. Stage px are on the 1920 by 1080 canvas. Frame px are CSS px inside a frame. Walk frames are 640 by 628 and single-page frames 1304 by 628, both scaled 1.375. A frame point (fx, fy) lands on the stage at (65 + 1.375 fx, 177 + 1.375 fy).

## 1. Direction

```text
Intent:    A web developer in row 20 of a Toronto conference room. Each demo should read as a real
           place in two seconds (orders, store, help desk, editor, terminal), and the one thing that
           changes should be the only lit object in it. Calm, believable, quiet around the edges.
Domain:    fulfillment queue, storefront, case desk, product editor, advisory feed, terminal session,
           benchmark run, pull request.
Color:     the section gradient as daylight behind each place; white frost; navy ink; Slalom Blue
           reserved for the spotlight and the one primary action; cyan as the signal on dark glass.
Signature: One lit object per room. Every wrapper is a place drawn at low emphasis (quiet glass,
           ink-soft text, no shadow). The shown element is the single raised object (strong glass,
           focus shadow), and the spotlight lands on it. Five places carry it: the D1 row, the D3
           form card, the D6 variants card, the D5 and F2 dark drawers, the F4 and F5 tables.
Rejecting: one universal app shell -> one place per section, five families;
           an empty pane -> context that fills 85 percent with large quiet shapes;
           context that competes -> context never above 15 frame px, never colored, never raised.
Dials:     variance 4 (five families, one system) / motion 2 (wrappers never move) / density 5 in
           frames, 3 on slides.
```

## 2. What changes from the glass spec

| Area | v4 (glass spec) | v5 (this spec) |
|---|---|---|
| Frame chrome | One portal shell: rail, top bar, frosted pane, mostly empty | One wrapper per section in five families (3.2). Only D4 keeps the rail. |
| Frame background | `glass-fan.jpg` or `glass-petal.jpg` | The section's v5 file, aligned with the slide (PRD 4.2), under the same washes |
| Context content | `shell.context` tables appended after the shown markup | Wrapper blocks from fixtures, placed before and after the shown block |
| Shown block | Sat in `.portal__main` on the pane | Sits in `.wrap-shown`, the strongest surface in the frame |
| Wrapper text | 13 to 22 px | 14 px floor (new `--wrap-text-sm`), 15 px ceiling, except single-page titles |
| Spotlight | Outline, radius target plus 4 | Concentric ring built from borders, radii from the target, fade gate (section 9) |
| Opening and closing slides | Claude Design HTML on flat fills | Native glass layouts on v5 backgrounds (section 6) |
| Grain | None | Shared overlay over the background on every audience slide (section 8) |

Everything else in the glass spec stands: tokens, legibility rules, component looks, motion, fallbacks.

## 3. Shared wrapper system

### 3.1 Files

| File | Holds |
|---|---|
| `lib/frames/wrappers/<id>.ts` | `render(fixtures, build)` returning `before`, `after`, `styles`, `scripts` (PRD 4.4). Markup lives here, because it reads fixtures. There are no wrapper `.html` files. |
| `lib/frames/wrappers/index.ts` | The registry of the 13 ids in 3.4 |
| `public/wrappers/base.css` | Shared wrapper classes (3.6). Every wrapper lists it first in `styles`. |
| `public/wrappers/<id>.css` | That wrapper's layout and any class used by it alone |
| `public/wrappers/storefront-merch.js` | D2's context label script, the only wrapper script |
| `public/portal/<demo>.css` | Kept where it lays out shown markup (D1, D3, D4, D5, D6 already exist). Rules for the shown block's surface, docking and hidden rows go here, not in wrapper CSS. |

Layers: `@layer portal-theme, portal-layout, wrapper;`. Wrapper CSS selects only `.wrap-*` classes and the `data-shown` slot. It never selects an element, an id or a class from shown markup.

### 3.2 Families

| Family | Sections | Frame | Page-level glass |
|---|---|---|---|
| Admin page | D1, D3, D6 | Frosted sheet inset by the frame padding, header bar inside it | Sheet blur (1) |
| App | D4 | Sheet with icon rail and top bar (the v4 portal, corrected) | Sheet blur (1) |
| Storefront | D2, D5, F2 | Full-bleed site header, page on the washed background, no sheet | Header blur (1) |
| Report | F1, F3 used-to, F4, F5 | Sheet with a document header bar | Sheet blur (1) |
| Terminal | F3 now | Dark glass window filling the frame | None |

Blur budget: one page-level blur plus the shown top layers (dialog, popover, picker, toast), so at most 4 per frame, under the cap of 6.

### 3.3 Tokens added

Add to `styles/glass-tokens.css` in `@layer portal-theme`, then sync. All are aliases or new steps; no raw color appears in wrapper CSS.

| Token | Value | Use |
|---|---|---|
| `--wrap-surface-quiet` | `var(--glass-surface)` (white 0.55) | Context cards |
| `--wrap-surface-focus` | `var(--glass-surface-strong)` (white 0.72) | The shown block |
| `--wrap-shadow-focus` | `0 8px 24px rgb(15 28 65 / 0.14), 0 1px 2px rgb(15 28 65 / 0.06)` | The shown block only |
| `--wrap-surface-dark` | `var(--glass-dark-surface-float)` (navy 0.82) | Drawers, terminal |
| `--wrap-text-sm`, `--wrap-leading-sm` | 14 px, 18 px (19.3 stage px) | Wrapper text floor (CX) |
| `--wrap-bar-height` | 48 px | Admin, app and report header bars |
| `--wrap-site-height` | 52 px | Storefront header |
| `--wrap-row-height` | 72 px | D1 queue rows |
| `--wrap-pad` | 16 px | Inner padding of bars, cards, body |
| `--wrap-clear` | 16 px | Minimum space between a spotlight target and any wrapper edge (CX) |

### 3.4 Wrapper ids and files

| Section | Wrapper id | Family | Files |
|---|---|---|---|
| D1 | `order-queue` | Admin | `order-queue.ts`, `order-queue.css` |
| D2 | `storefront-merch` | Storefront | `storefront-merch.ts`, `.css`, `.js` |
| D3 | `support-case` | Admin | `support-case.ts`, `.css` |
| D4 | `portal-dashboard` | App | `portal-dashboard.ts`, `.css` (takes over `shell.ts`) |
| D5 | `product-page` | Storefront | `product-page.ts`, `.css` |
| D6 | `product-editor` | Admin | `product-editor.ts`, `.css` |
| F1 | `watch-list` | Report | `watch-list.ts`, `.css` |
| F2 | `storefront-product` | Storefront | `storefront-product.css`; markup in both apps' `components/storefront-shell.tsx` |
| F3 used-to | `advisory-feed` | Report | `advisory-feed.ts`, `.css` |
| F3 now | `terminal-window` | Terminal | `terminal-window.ts`, `.css` |
| F4 | `ci-report` | Report | `ci-report.ts`, `.css` |
| F5 | `dependency-review` | Report | `dependency-review.ts`, `.css` |

The `.ts` files sit in `lib/frames/wrappers/`, the `.css` and `.js` files in `public/wrappers/`. `theme:sync` copies `base.css` and `storefront-product.css` into both F2 apps.

### 3.5 Focus tier and context tier

This is the signature. It is what keeps a full frame from competing with the demo.

| | Focus tier (shown) | Context tier (wrapper) |
|---|---|---|
| Surface | `--wrap-surface-focus` 0.72 | `--wrap-surface-quiet` 0.55, or the sheet 0.32 for bar text |
| Depth | `--glass-highlight`, `--wrap-shadow-focus` | `--glass-highlight` only, no shadow |
| Edge | `--glass-border` | `--glass-border` |
| Radius | 12 (card) | 12 (card), 16 (sheet) |
| Text | As the theme sets it (15 body, 18 h1) | 14/18 ink-soft; keys and titles 15/20 Bold ink |
| Color | Status chips and alarms allowed | Neutral chips only. No Slalom Blue, coral, chartreuse or warning icons. |
| Controls | Real | None. Nothing looks like an input, caret, toggle or strong button. |

Two exceptions are deliberate. On single pages the report title is 22/28 Bold ink, because it titles the shown content. In the app family the rail and top bar keep the v4 look, because the app is the feature's context.

`.wrap-shown` gets the focus surface by default. Where the shown block already paints its own card (D1 row, D4, F1 tiles, F4 and F5 tables), the wrapper uses `.wrap-shown--bare`, which has no surface, and the build CSS paints the shown card with the same focus values.

`.wrap-shown` must never become a containing block or a backdrop root: no `transform`, `filter`, `backdrop-filter`, `contain`, `will-change` or `overflow: hidden` on it. Popovers and dialogs are top layer, but today builds position menus against the page.

### 3.6 Base classes (`public/wrappers/base.css`)

| Class | Look | Notes |
|---|---|---|
| `.wrap` | Grid, `block-size: 100vh`, `padding: var(--glass-frame-pad)` (12 at 640, 20 at 1304), one row `minmax(0, 1fr)` | The body's own padding becomes 0 under a wrapper |
| `.wrap--store` | Padding 0, rows `auto minmax(0, 1fr) auto` | Storefront family |
| `.wrap-sheet` | Radius 16, `--glass-border`, highlight, `--glass-shadow`; frost on `::before` (`--glass-pane`, `--glass-filter-pane`) | The only page blur in admin, app and report frames |
| `.wrap-bar` | 48 tall, padding 0 16, 1 px `--glass-rule` below, 14/18, nowrap, one row at every width | Header bar |
| `.wrap-brand`, `__mark` | Mark 24 by 24, radius 6, navy fill, white "R" 13 Bold; name 14/18 Bold ink, 8 gap | "Ridgeline Outfitters" in full (CX) |
| `.wrap-bar__divider` | 1 by 16, `--glass-control-border` | Between brand and area |
| `.wrap-bar__area` | 15/20 Bold ink | Orders, Support, Products |
| `.wrap-bar__meta` | 14/18 ink-soft | One short line |
| `.wrap-bar__end` | Pushed right, 12 gap | Meta, chips, avatar |
| `.wrap-avatar` | 28 circle, purple fill, "BP" 12 Bold navy, `aria-hidden` | Admin and app only |
| `.wrap-body` | Padding 20 16 16, flex column, 12 gap | Below the bar |
| `.wrap-title` | 15/20 Bold ink | Wrapper page titles |
| `.wrap-caption` | 14/18 Bold ink-soft | Label above a shown block |
| `.wrap-card`, `__title` | Quiet surface, radius 12, border, highlight, 14/18 ink-soft; title 14/18 Bold ink | Context cards |
| `.wrap-rows`, `.wrap-row` | List with 4 px block padding; rows grid, `min-block-size` per wrapper, padding 0 16, 1 px rule between | Sibling rows |
| `.wrap-row__key` | 15/20 Bold ink | Order number, name |
| `.wrap-num` | Right aligned, ink | Totals. No `tabular-nums` (glass spec 4.3). |
| `.wrap-chip` | 22 tall, padding 0 8, pill, neutral tint and edge, 6 px dot, 14 Bold ink | Neutral only |
| `.wrap-muted-label` | 14/18 Bold ink-soft | Static "Actions" on sibling rows |
| `.wrap-shown`, `--bare` | Focus surface, radius 12, padding per wrapper | The `[data-shown]` slot |
| `.wrap-site` | 52 tall, padding 0 20, full bleed, 16 gap; frost on `::before` (white 0.72, `--glass-filter-pane`), 1 px white 0.6 edge plus a `--glass-rule` line below | Storefront header |
| `.wrap-search` | 32 tall pill, max 240 wide, navy 6 percent fill, search icon 20, "Search trail gear" 14 ink-soft | A shape, not an input: a `span`, no caret, no border |
| `.wrap-site-foot` | 40 tall, full bleed, quiet surface, 14/18 ink-soft, padding 0 20 | Storefront footer line |
| `.wrap-drawer`, `__tabs`, `__tab`, `__tab--current` | Dark surface, radius 12, white 0.16 edge, dark highlight, `--glass-shadow-float`; tab strip 36 tall, 14 px, tabs 16 apart, `#D6DCEC`; current tab white Bold with an inset 2 px cyan bar | Developer tools drawer (D4, D5, F2) |
| `.wrap-icon` | 20 by 20, Lucide outline, stroke 1.75, `currentColor`, `aria-hidden` | Glass spec icon family |
| `.wrap-skeleton` | Navy 8 percent bar, 12 tall, radius 6 | Placeholders (F1, F4, F5) |

Markup rules: wrapper text uses `p`, `span`, `ul`, `li`, `dl` and `section` with `aria-label`. No `h1`. No `a`, `button`, form control or `tabindex`. One `header` per wrapper, and no `main` when the shown markup has one (PRD 2.1).

### 3.7 Density limits (from CX, made measurable)

- At most five wrapper blocks per frame. A bar counts as one. A row list counts as one.
- At most 40 words of wrapper text per frame.
- Wrapper text 14 to 15 frame px (19.3 to 20.6 stage px). Nothing smaller.
- No numbers except ones that name a thing: order numbers, prices, versions, dates, counts generated from fixtures.
- The shown block's top edge sits in the upper two thirds of the frame (fy 400 or less), and in the first column of any two-column layout.
- Fill (PRD 2.1 rule 4): measure visible blocks other than `.wrap` and `.wrap-sheet`. Their union spans at least 544 by 534 frame px on walk frames and 1108 by 534 on single pages, and no vertical gap between blocks exceeds 96.
- Spotlight clearance: every spotlight target keeps 16 frame px from a wrapper edge and 12 from the viewport edge, so the full ring (9 px) never clips.

### 3.8 Frame background under a wrapper

PRD 4.2 holds: section image at `1396.36px 785.45px`, position `-47.27px -128.73px`, `fixed`, with the existing wash on top (white 0.40 now, lavender gray 0.55 used-to). The frame body padding becomes the wrapper's padding, so 12 px of washed gradient frames every sheet and card, as in v4.

## 4. Per-demo wrappers

Diagrams are in frame px. Each states s0 unless it says otherwise. Fixture paths are under `fixtures/` unless noted. Every number in wrapper markup comes from a fixture (PRD 2.1 rule 7). New fixture fields go in `fixtures/portal-context.json` (PRD 4.4).

### 4.1 D1 Order actions: `order-queue`

Admin family. Same on used-to and now. Mock: `scratchpad/v5-design/mock-d1.png` (path in section 10).

```text
640 x 628
 12 +------------------------------------------------------------+ sheet 616 x 604, r16
    | [R] Ridgeline Outfitters | Orders     5 awaiting shipment (BP)| bar 12..60
 60 +------------------------------------------------------------+
 80 |  Open orders                          (shown h1, 18/24)      |
116 |  +--------------------------------------------------------+  | shown row 418
    |  | Order 418, awaiting shipment              [ Actions ]  |  | focus, 116..184
184 |  +--------------------------------------------------------+  | Actions 132..168
196 |  +--------------------------------------------------------+  | queue card 196..488
    |  | Order 419  Field notebook   $68 (Awaiting shipment) Actions | rows 72
    |  | Order 421  Day pack 22 L    $98 (Awaiting shipment) Actions |
    |  | Order 422  Camp mug        $341 (Awaiting shipment) Actions |
    |  | Order 423  Merino socks    $138 (Awaiting shipment) Actions |
488 |  +--------------------------------------------------------+  |
500 |  | [truck] Canada Post pickup at 3:30 pm                  |  | pickup card 500..556
556 |  +--------------------------------------------------------+  |
616 +------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Sheet, bar | `.wrap-sheet`, `.wrap-bar`: brand, divider, area "Orders"; end: meta "5 awaiting shipment" (count of Open orders in the queue fixture), avatar |
| Body | x 28 to 612 (584 wide), from y 80 |
| Shown | `.wrap-shown--bare`. Build CSS (`public/portal/01-layered-ui.css`) gives `.orders .order` the focus surface, padding 16 16 16 20, `min-block-size: 68px`, and the row text 15 Bold. Gap 12 inside `.orders`. Add `#t-status:empty { display: none }` so the today page matches the native `#status:empty` rule. |
| Queue card | `.wrap-card.wrap-queue`, `.wrap-rows`, 4 rows at 72. Columns: `84px minmax(0, 1fr) 56px 156px 60px`, 12 gap. Key "Order 419" 15 Bold; item 14 ink-soft (first item name only); total `.wrap-num`; neutral chip "Awaiting shipment"; `.wrap-muted-label` "Actions" |
| Pickup card | `.wrap-card`, 56 tall, padding 0 16, Lucide `truck` 20 then "Canada Post pickup at 3:30 pm". Carrier and time from a new `pickup` fixture field. |
| Data | Siblings: the next four Open orders after 418 in `demos/04-navigation-api/fixtures/orders.json` (419, 421, 422, 423; 420 is Shipped, CX difference 1). No customer names. |
| Focus | Row 418 is the only strong surface. The Actions button's ring clears the row edge by 16. |
| After confirm | `#status` (20 tall) appears at y 196 and pushes the queue to 228 and the pickup card to 532 to 588. That is under the sheet bottom padding (600). The spotlight gate hides the boxes during the shift. |
| Fill | 12 to 556 is 544 tall (86.6 percent); width 616 (96 percent) |
| Blur | Sheet 1, popover 1, dialog 1 |

Shown CSS note (optional, flagged in 11). The fallback `inset: 9.5rem 2rem auto auto` in `enhance.css` was set for the v4 layout and lands on the button. For browsers without `position-area`, change it to `inset: 10.75rem 2.75rem auto auto`. That puts the menu 4 px under Actions (bottom 168) with its right edge on the button's (596). It changes one shown line.

### 4.2 D2 Product card: `storefront-merch`

Storefront family. Same wrapper on both pages. The body differs only because the shown markup differs (CX).

```text
640 (560 when the hook narrows the page)
  0 +--------------------------------------------------------------+ site header 0..52
    | [R] Ridgeline Outfitters  (o Search trail gear      )   [cart] |
 52 +--------------------------------------------------------------+
 68 |  Search results              <- context label, 15/20 Bold     | 68..88 (now only)
 96 |  +----------------------------------------------------------+ | shelf = .wrap-shown
    |  |  +---------------------+                                 | | 96..572
    |  |  | shown slot and card |  (slot 352 at s0)               | | quiet surface,
    |  |  |                     |                                 | | padding 16
    |  |  +---------------------+                                 | |
572 |  +----------------------------------------------------------+ |
588 +--------------------------------------------------------------+ footer 588..628
    |  Free returns within 30 days                                  |
628 +--------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Site header | `.wrap-site`: brand, `.wrap-search` (flex 1, max 240), Lucide `shopping-cart` 20 at the end, no count. At the narrowed width (560) it still fits on one row: about 486 px of content. |
| Context label | `.wrap-context`, 15/20 Bold ink, from x 20, y 68. It matches the used-to `h2.section-title` headings in size and weight, so both pages share words and look. Empty and `display: none` on used-to. |
| Shelf | `.wrap-shown` with the quiet surface (not focus): `min-block-size: 476px` (96 to 572), padding 16, radius 12, x 20 to 620 (to 540 when narrowed). The card is the only object on it. The shelf is the page; the slot inside it is what the hooks resize. |
| Footer | `.wrap-site-foot` "Free returns within 30 days" (days from a `store.returnsDays` fixture field) |
| Label script | `public/wrappers/storefront-merch.js` reads `.product-slot`'s `getBoundingClientRect().width` on load and in a `ResizeObserver`. Width 240 or less: "Recommended". Under 416: "Search results". 416 or more: "Featured". The thresholds are 15rem and 26rem, the card's own breakpoint. Steps give 352 "Search results", 240 "Recommended", 512 and 448 "Featured". It sets `textContent` only. It never touches shown elements. |
| Focus | The card. The shelf is quiet, so the card's 2 px edge and image carry the eye. The "Container edge" callout (s5) must sit inside the shelf: it is on the slot's right side at x 20 + 16 + 448 = 484, which leaves 56 to the shelf edge at the 560 width. v4 placed it at the left frame edge, clipped (current-deck capture). |
| Used-to | Header, empty label, shelf holding the three headed slots, footer. Risk: at s3 the featured card stacks at 480 px wide and the page runs about 200 px past the frame (v4 shows the same clip). The fix is in shown CSS, a 2:1 image ratio on the stacked variant. See open decision 3. |
| Banned | No container query, `cq*` unit, `@scope` or `:has()` in wrapper CSS or script (PRD 2.2) |
| Fill | 0 to 628 at every step; the largest gap is shelf bottom to footer, 16 |

### 4.3 D3 Support form: `support-case`

Admin family. Same on both pages. Mocks: `mock-d3.png` (now, grown) and `mock-d3-s0.png`.

```text
640 x 628
 12 +------------------------------------------------------------+
    | [R] Ridgeline Outfitters | Support                    (BP)  | bar 12..60
 60 +------------------------------------------------------------+
 80 |  New case  (Order 418, canceled) (Normal priority)          | 80..102
116 |  +--------------------------------+  +-------------------+ |
    |  | Subject                        |  | Order 418         | |
    |  | [ input, grows ]               |  | Base layer, 3     | |
    |  | Details                        |  | $162              | |
    |  | Steps, order number, ...       |  | ----------------- | |
    |  | [ textarea 6lh -> 12lh ]       |  | Placed 18 Oct 2026| |
    |  |                                |  | Canceled 28 Oct   | |
    |  | [ Open case ]                  |  |                   | |
600 |  +--------------------------------+  +-------------------+ |
616 +------------------------------------------------------------+
       shown card 28..412 (384)           side card 428..612 (184)
```

| Part | Spec |
|---|---|
| Bar | Brand, divider, area "Support", avatar |
| Case head | `.wrap-title` "New case", then two neutral chips "Order 418, canceled" and "Normal priority" (priority from a `caseHeader` fixture), 8 gap |
| Columns | `.wrap-cols`: `minmax(0, 1fr) 184px`, gap 16, stretch to the sheet's bottom padding (600) |
| Shown | `.wrap-shown`, focus surface, padding 20, stretches to 600. The form gets 344 px inside. The textarea runs about 45 characters a line at 15 px. Grown to 12 lines, the form is 428 tall and fits the 484 px card with room to spare. Nothing sits under the form (CX). |
| Side card | `.wrap-card.wrap-side`, padding 16, stretches to 600. "Order 418" 14 Bold ink; "Base layer, 3" 14 ink-soft; "$162" 15 Bold ink; 1 px rule with 12 px margins; "Placed 18 Oct 2026" (orders.json); "Canceled 28 Oct 2026" (`caseHeader` fixture) |
| Focus | The form card. The `#subject` and `#details` rings clear the card edges by 20. |
| Fill | 12 to 616 at every step, because both columns stretch |

### 4.4 D4 Dashboard navigation: `portal-dashboard`

App family, the one wrapper with app chrome (PRD, CX). It takes over `lib/frames/shell.ts` with these corrections.

```text
640 x 628, document scrolls (manifest scrolls: true)
 12 +-----+------------------------------------------------------+
    | [R] | Ridgeline Outfitters                           (BP)  | top bar 12..60, sticky
    |     +------------------------------------------------------+
    | rail| All orders  Order 418  Order 419 | Status [Open] Apply| shown toolbar 72..120
    | 56  | Open orders                                          | shown h1 + list
    | [o] | Order 401  ...                                       | scrolls under the bar
    | [ ] | Order 402  ...                                       |
    | [ ] | ...                                                  |
424 |     | +--------------------------------------------------+ |
    |     | | Address /orders/418      Title  Order 418        | | evidence drawer
    |     | | Focus   h1               Scroll 0                | | fixed 84..612,
    |     | | 1. navigate /orders/418                          | | 424..604, dark
604 |     | +--------------------------------------------------+ |
616 +-----+------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Rail | 56 wide, x 12 to 68, sticky. Brand mark at top, then five Lucide icons in 40 by 40 items (v4 look). Orders is current via `aria-current`, and that never changes. Items are `span`, not `a`: no `href` (PRD 2.1 rule 3). |
| Top bar | 48 tall, sticky at top 12: "Ridgeline Outfitters" 14 Bold, avatar at the end. No breadcrumb or page path (CX). |
| Main | `.wrap-main`, padding 12 16, `padding-block-end: 196px` so the last rows can scroll above the drawer |
| Shown toolbar | Unchanged theme look, a quiet card 48 tall. The build CSS keeps its links as the only underlined text. |
| Evidence drawer | Build CSS (`public/portal/04-navigation-api.css`) docks `aside.demo-panel`: `position: fixed`, x 84 to 612, y 424 to 604 (180 tall), `--wrap-surface-dark`, radius 12, padding 12 16. The `dl` runs in two columns (Address and Title, Focus and Scroll): labels 14 `#B8C0D9`, values 15 mono white. `#request-log` sits below, newest first, 3 rows at 22, 14 mono `#D6DCEC`, with a white 0.1 rule between rows. White on navy 0.82 is above 12:1. |
| Focus | The drawer is the real subject (CX). It is the only dark, raised surface. Spotlights on `#s-url` and `#s-scroll` sit on dark glass, and the ring design in section 9 covers that. |
| Spotlight on `#content` | Its rect runs past the viewport while the page scrolls. The overlay clips it to the viewport and the part above the drawer, then draws it in inset mode (9.4). |
| Blur | Sheet 1 |

### 4.5 D5 Rich content: `product-page`

Storefront family. Same wrapper on both pages; the drawer is open on now and collapsed on used-to (11, item 9). Mock: `mock-d5.png`.

```text
640 x 628
  0 +--------------------------------------------------------------+ site header 0..52
    | [R] Ridgeline Outfitters  (o Search trail gear      )   [cart] |
 52 +--------------------------------------------------------------+
 64 | [img 48] $129  4.5 out of 5, 2 reviews   Free returns, 30 days | product bar 64..112
112 +--------------------------------------------------------------+
124 |  +--------------------------------------------------------+    | shown block
    |  | Ridgeline Trail (h1)                                   |    | focus, 20..620
    |  | description from the CMS                               |    | 124..
    |  +--------------------------------------------------------+    |
376 |  +--------------------------------------------------------+    | drawer (now)
    |  | Console  Elements  Network                              |    | 376..616, dark
    |  | newest message first ...                                |    | used-to: 572..616
616 |  +--------------------------------------------------------+    |
```

| Part | Spec |
|---|---|
| Site header | As D2 |
| Product bar | `.wrap-pdp-bar`, quiet surface, full bleed, 48 tall from y 64, padding 0 20: thumbnail 48 by 48 (the shoe image, radius 8), 12 gap, "$129" 18/24 Bold ink, 12 gap, "4.5 out of 5, 2 reviews" 14 ink-soft; at the end "Free returns within 30 days". Price, rating and returns come from a new `store` fixture field, shared with D2 and F2. |
| Shown | `.wrap-shown`, focus surface, padding 16 20, x 20 to 620, from y 124. The used-to markup keeps its own two-column layout (article and promo rail) inside it. |
| Drawer, now | `.wrap-drawer`, `position: fixed`, inset 12 at the sides and bottom, 240 tall (y 376 to 616). Tabs "Console" (current), "Elements", "Network". The shown `#console` is docked over it by the build CSS: same rect, `z-index: 1` above the drawer, `padding: 44px 14px 12px`, transparent fill, 14/22 mono, newest first, errors white with a coral 6 px dot. The ring on `#console` then wraps the whole drawer. |
| Drawer, used-to | The same drawer, 44 tall (y 572 to 616), tab strip only. The used-to steps never spotlight the console, and the shown content needs the height (about 490 px in v4). |
| No alarms | The wrapper uses no red or warning styling. The injected banner and console errors are the only alarms (CX). |
| CSP | No wrapper script and no inline style. Every wrapper rule is in `product-page.css`. |
| Fill | 0 to 616 on both pages. The gap between the shown block and the drawer on now must stay under 96: if the CMS description at s0 is shorter than 156 px, raise the drawer to 280. |

### 4.6 D6 Variant picker: `product-editor`

Admin family. Same on both pages, including the Firefox step.

```text
640 x 628
 12 +------------------------------------------------------------+
    | [R] Ridgeline Outfitters | Products  Trail Runner 2 (Draft)(BP)| bar
 60 +------------------------------------------------------------+
 80 |  Variants                         | +----------------------+ |
 98 |  +-----------------------------+  | | Title  Trail Runner 2| | details card
    |  | Trail Runner 2 (shown h1)   |  | | Price  $140          | | 80..236
    |  | Color                       |  | | SKU    RT-2          | |
    |  | [ Moss            v ]       |  | +----------------------+ |
    |  | [ Save ]                    |  | | Colors               | | colors card
    |  | status                      |  | | [##] [##] [##]       | | 248..392
    |  | (Firefox capture, last step)|  | | Black Moss Sand      | |
    |  |                             |  | +----------------------+ |
    |  |                             |  |  Sizes 7 to 13           | 404..422
600 |  +-----------------------------+                            |
616 +------------------------------------------------------------+
     shown card 28..380 (352)          right column 396..612 (216)
```

| Part | Spec |
|---|---|
| Bar | Brand, divider, area "Products", meta "Trail Runner 2"; end: neutral chip "Draft", avatar |
| Caption | `.wrap-caption` "Variants" at y 80 |
| Shown | `.wrap-shown`, focus surface, padding 20, y 98 to 600, x 28 to 380. The select's 288 px minimum fits in the 312 inner width. The picker opens 4 px under the select and may overlap the right column; it is top layer. |
| Firefox step | The hook appends `#firefox-capture` after `#status`, inside the shown card. Re-capture `/posters/d6-firefox.png` cropped to the shown card, at most 312 by 200 frame px, so it fits under the status line. |
| Details card | `.wrap-card` 216 wide, padding 16, a `dl` in three rows: label 14 ink-soft, value 15 ink. Title, price and SKU come from a new `editor` fixture field. |
| Colors card | `.wrap-card`, title "Colors", three 56 by 56 tiles (radius 8) 12 apart with the name under each in 14 ink-soft. Tile fills use wrapper tokens `--wrap-swatch-black`, `-moss`, `-sand`, which alias the D6 color values. They never use `.swatch` or `.black` (shown selectors). |
| Sizes | `.wrap-meta` "Sizes 7 to 13", plain text, no chips (CX difference 4) |
| Banned | No `select`, `appearance`, `::picker()`, `selectedcontent` or listbox in the wrapper |
| Fill | The shown card spans 98 to 600; the right column ends at 422 beside it |

### 4.7 F1 Still in motion: `watch-list`

Report family, single page, 1304 by 628 (padding 20).

```text
1304 x 628
 20 +--------------------------------------------------------------------------------+
    | [R] Ridgeline Outfitters | Platform watch list     (Use) (Wait for)  28 Oct 2026 | bar 20..68
 68 +--------------------------------------------------------------------------------+
 92 |  Worth a prototype, not yet a default   (shown h1, 22/28)                      |
136 |  +-------------+  +-------------+  +-------------+                             | tiles row 1
    |  | 1 Anchor    |  | 2 Grid Lanes|  | 3 Cross-doc |                             | 136..296
296 |  +-------------+  +-------------+  +-------------+                             |
312 |         +-------------+  +-------------+                                       | row 2
    |         | 4 Scroll    |  | 5 Scoped    |                                       | 312..472
472 |         +-------------+  +-------------+                                       |
488 |  [ Prototype. Verify. Promote. ]   (shown rule, 52)                            | 488..540
560 |  Support data: web-features 3.44.0                                             | 560..578
608 +--------------------------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Bar | Brand, divider, area "Platform watch list"; end: legend chips "Use" (neutral) and "Wait for" (neutral, text in `--glass-link`, the color the tiles use for that label), then the date from the deck's talk date |
| Body | x 44 to 1260 (1216), from y 92 |
| Tiles | The build keeps its 6-column grid (tiles span 2; row 2 starts at column 2), with rows fixed at 160 and a 16 gap. Tiles use the focus surface. |
| Hidden tiles (s0) | CX: five faint numbered slots. Build CSS: `.tile[hidden]` keeps its box, sets `visibility: hidden` on its children, and draws `1px dashed rgb(15 28 65 / 0.16)` on a transparent fill, plus a `::before` counter "1" to "5" in 22/28 Bold ink-soft at the top left. No feature name shows early. |
| Rule | Shown `#rule`, 52 tall, navy fill, white 24 Bold, radius 12. It now fits (v4 clipped it at the frame bottom). |
| Source line | `.wrap-meta` from the web-features version in generated data |
| Fill | 20 to 608 |

### 4.8 F2 Caching: `storefront-product`

Storefront family, rendered by both Next apps as `components/storefront-shell.tsx`, used by `app/layout.tsx` (PRD 4.4). The apps write `data-section-bg="f2"`.

```text
640 x 628
  0 +--------------------------------------------------------------+ preview strip 0..40
    | Preview as  [agent-2 v] [EU v]  Reload  Reset                  | dark, demo controls
 40 +--------------------------------------------------------------+ site header 40..92
    | [R] Ridgeline Outfitters  (o Search trail gear      )   [cart] |
 92 +--------------------------------------------------------------+
104 |  +--------------------------------------------------------+    | shown product page
    |  | Ridgeline Trail / copy / stock line / $149             |    | focus 104..~300
    |  +--------------------------------------------------------+    |
404 |  +--------------------------------------------------------+    | request log drawer
    |  | Requests                                               |    | 404..616, dark
    |  | #7 inventory query ridgeline-trail eu          no      |    | newest 4 at top
616 |  +--------------------------------------------------------+    |
```

| Part | Spec |
|---|---|
| Preview strip | The current admin bar (user, region, reload, reset, copy, save) keeps its controls but reads as a staff preview toolbar: 40 tall, full bleed, `--wrap-surface-dark`, 14 px, `#D6DCEC` labels, controls in the dark glass variant (`.glass-dark`). It is demo control, not store. See open decision 4 against CX "no region picker". |
| Site header | As D2, with no count, no greeting and no per-user data (CX). The layout reads no cookies. |
| Shown | The page in `.wrap-shown`, focus surface, x 20 to 620 |
| Request log | `.wrap-drawer`, fixed, inset 12, y 404 to 616 (212), tab "Requests" only. The log table is inside, newest first, 4 rows at 36, 14 mono. "Cached" values are text (yes, no, miss), never color alone. |
| Spotlight | `#request-log` is the drawer, radius 12. `.stock` sits inside the focus card. |
| Fill | 0 to 616 |

### 4.9 F3 Package trust, used-to: `advisory-feed`

Report family, walk frame. The page is static.

```text
640 x 628
 12 +------------------------------------------------------------+
    | [shield] npm security advisories            Updated 28 Oct 2026| bar 12..60
 60 +------------------------------------------------------------+
 76 |  Ecosystem npm   Type malware, takeover   Aug 2025 to Oct 2026 | filters 76..94
108 |  +--------------------------------------------------------+  | shown timeline
    |  | Eighteen months of incidents                           |  | focus 108..568
    |  | o 26 Aug 2025 Nx s1ngularity   o 31 Mar 2026 Axios     |  |
    |  | ...                                                    |  |
568 |  +--------------------------------------------------------+  |
580 |  Sources: GitHub Advisory Database, Socket, StepSecurity     | 580..598
616 +------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Bar | No Ridgeline brand: this is a public feed. Lucide `shield-alert` 20 in ink, "npm security advisories" 15 Bold; end: "Updated 28 Oct 2026" |
| Filters | Plain text, 14 ink-soft, with labels in Bold ink and 24 between pairs. No chips (CX: nothing selectable). |
| Shown | The timeline in `.wrap-shown`, focus surface, padding 20. In the build markup, drop the `.tl__eyebrow` "npm supply chain" (the bar says it) and its uppercase tracking (v4 M13). Keep the title and range. Markers are Slalom Blue, the one accent CX allows. Solid means a short live window and hollow means wide reach, as now. |
| Source line | `.wrap-meta`, from the section citations, three names at most |
| Fill | 12 to 616 |

### 4.10 F3 Package trust, now: `terminal-window`

Terminal family. The one wrapper that differs between pages (PRD 2.1 rule 6, CX).

```text
640 x 628
 12 +------------------------------------------------------------+ window, r12
    | o o o   pnpm 12.11 and npm 11.15, test registry  (Recorded) | title bar 12..52
 52 +------------------------------------------------------------+
    | [ ~/fixture-workspace ]                                      | tab strip 52..84
 84 +------------------------------------------------------------+
    | $ pnpm install                                              | shown lines
    | ...                                                         | [data-terminal]
    |                                                             | 84..580
580 +------------------------------------------------------------+
    | registry localhost:4873   pnpm 12.11.0   npm 11.15.0   node 20.20.0 | status 580..616
616 +------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Window | x 12 to 628, y 12 to 616, radius 12, `--wrap-surface-dark`, white 0.16 edge, dark highlight, `--glass-shadow-float`. No blur: navy at 0.82 already hides the background. |
| Title bar | 40 tall: three 12 px dots in white 0.24, 8 apart (decorative, not colored); title 14 Bold white, centered; on the right the chip "Recorded 28 Oct 2026": 22 tall, pill, white 0.12 fill, 14 Bold `#D6DCEC`. No "Live", clock or blinking cursor (CX). |
| Tab strip | 32 tall, one tab with the working directory in 14 mono white and an inset 2 px cyan bar under it, white 0.16 rule below |
| Lines | Shown `[data-terminal]` scroller, padding 12 16, 15/22 mono (one step over v4's 14 for row 20). Commands white Bold with a cyan `$`; output `#D6DCEC`; comments `#B8C0D9`. It shows 22 lines. |
| Status bar | 36 tall, white 0.16 rule above, 14 mono, labels `#B8C0D9`, values white, 24 between pairs. Values come from the recording's `env`. |
| Build markup | Move `.term__bar` and `.term__env` out of `terminal/index.html` into the wrapper. The build keeps `#lines` and the scroller. |
| Fill | 12 to 616 |

### 4.11 F4 Vite 8 locally: `ci-report`

Report family, single page.

```text
1304 x 628
 20 +--------------------------------------------------------------------------------+
    | [R] Ridgeline Outfitters | Build benchmarks                Measured 28 Oct 2026 | bar 20..68
 68 +--------------------------------------------------------------------------------+
 88 |  App fixture app | Before Vite 7.3.7 | After Vite 8.3.5 | Machine Apple M4 ... | Runs median of five | run card 88..152
168 |  One fixture app, two builds   (shown h1, 22/28)                               | 168..196
208 |  +--------------------------------------------------------------------------+  | table card
    |  | Measure          Before            After                                 |  | focus 208..564
    |  | Cold build       625 ms            280 ms                                |  | rows 60
    |  | ... skeleton rows until revealed                                         |  |
564 |  +--------------------------------------------------------------------------+  |
572 |  measure foot (shown, last step)                                              | 572..596
608 +--------------------------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Bar | Brand, divider, area "Build benchmarks"; end: "Measured" plus the date from `measuredAt` |
| Run card | `.wrap-card`, 64 tall, five cells in a row: label 14 ink-soft over value 15 ink. Values come from `fixtures/vite-measurements.json` (versions, machine, node). It replaces the build's `#measure-meta`, which the build drops. No repository name (CX). No pass badges. |
| Table | The build's `.measure__card` uses the focus surface with 16 px inline padding, so row rings stay inside the card. Header 56, rows 60. |
| Hidden rows | Build CSS: `tr[hidden]` keeps `display: table-row`, its cells get `visibility: hidden`, and the row paints two `.wrap-skeleton`-style bars (12 tall, navy 8 percent) under the Before and After columns via a background on the `tr`. The room sees five rows waiting. |
| Fill | 20 to 608 |

### 4.12 F5 What you can delete: `dependency-review`

Report family, single page.

```text
1304 x 628
 20 +--------------------------------------------------------------------------------+
    | [R] Ridgeline Outfitters | Pull requests                                 (Draft) | bar 20..68
 68 +--------------------------------------------------------------------------------+
 84 |  Remove UI libraries the browser now covers  (22/28 Bold)                      | 84..112
116 |  Removes 11 packages. npm downloads, week of 20 Oct 2026                       | 116..134
150 |  +--------------------------------------------------------------------------+  | table card
    |  | Demo | Code it replaces | Libraries | Weekly | Not yet                   |  | focus 150..590
    |  | Order actions  ...                                                       |  | header 44
    |  | ... 7 rows at 56, skeleton until revealed                                |  | rows 56
590 |  +--------------------------------------------------------------------------+  |
608 +--------------------------------------------------------------------------------+
```

| Part | Spec |
|---|---|
| Bar | Brand, divider, area "Pull requests"; end: neutral chip "Draft" (CX: a proposal, not merged) |
| PR head | `.wrap-pr-title` 22/28 Bold ink, then `.wrap-meta`. The count is generated from `fixtures/npm-pull.json` (distinct packages in the table) and the week from the pull date. It replaces the build's `.delete__head` and `#pull-date`. No diff, reviewers, checks or merge button. |
| Table | Focus surface, 16 inline padding. Package names 16/22 mono, two per cell at most, so rows are 56. Weekly counts right aligned, dark blue Bold. |
| Hidden rows | As F4: skeleton bars, cells hidden |
| Fill | 20 to 608 |

## 5. Intro slides

PRD 1.6 sets the panel. This section sets the rest. Mock: `slide-intro-d1.png`.

```text
1920 x 1080, section background, grain
  64 +-------------------------------+  +-------------------------------+
     | visual card, light glass       |  | text panel, dark glass strong |
     |  132 +-----------------------+ |  |  Title 88/96, 2 lines max      |
     |      | capture 832 x 816     | |  |  32                            |
     |      | radius 16             | |  |  Description 36/50, 6 max      |
     |      |                       | |  |  56                            |
     |  948 +-----------------------+ |  |  [184][184][184][184] tiles    |
     |                                |  |  32                            |
1016 +-------------------------------+  |  Also uses 24/32, 2 lines max   |
     x 64, 880 wide                     +-------------------------------+
                                         x 976, 880 wide, padding 48
```

| Region | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Background | 0 | 0 | 1920 | 1080 | Section file, `cover`, no wash. Grain overlay above it. |
| Visual card | 64 | 64 | 880 | 952 | Radius 24, white 0.40 plus `--glass-filter-pane`, `--chrome-card-border`, `--chrome-card-highlight`, `--chrome-card-shadow`. No text sits on it. The accent image goes (PRD 1.6). |
| Capture | 88 | 132 | 832 | 816 | Radius 16, 1 px white 0.6 edge, shadow `0 24px 64px rgb(15 28 65 / 0.24)` |
| Text panel | 976 | 64 | 880 | 952 | Radius 24, `--glass-dark-surface-strong` plus 24 px blur, white 0.16 edge, dark highlight, `--glass-dark-shadow`. Padding 0 48, so text runs from x 1024 to 1808 (784). The group is centered vertically. |
| Title | 1024 | auto | 784 | 96 a line | 88/96 Bold white, 2 lines at most |
| Description | | +32 | 784 | 50 a line | 36/50 `#D6DCEC`, 6 lines at most |
| Support row | | +56 | 784 | 184 | 4 tiles of 184 with 16 gaps. Tile: radius 20, navy 0.56, white 0.16 edge. Stack: logo 64, 12, version 48/48 Bold, 4, name 24/28 `#B8C0D9` (156 tall, 14 above and below). "Not yet" and tool tiles keep v4 rules at this size. |
| Also uses | | +32 | 784 | 32 a line | 24/32 `#B8C0D9`, 2 lines at most |

The tiles shrink from 196 to 184 because the panel is now 880 wide with 48 padding (11, item 6). Worked D1 example: 96 + 32 + 200 + 56 + 184 + 32 + 64 = 664, so the group starts at y 208.

Left visual per section. All are full-frame stills of the now page with the wrapper, with no spotlight, callout or cursor (CX). Recapture after M5.

| Section | Still | What must be in frame |
|---|---|---|
| D1 | `d1-now` s2 | "Cancel order 418?" dialog over the queue and its backdrop |
| D2 | Composition (below) | Three widths, each under its context label |
| D3 | `d3-now` s2 | Subject filled, details grown to 12 lines, case head visible |
| D4 | `d4-now` s1 | Order 418 open, drawer reading "/orders/418" |
| D5 | `d5-now` s4 | Console drawer with the blocked write as its top row. Check that the row reads at 832. |
| D6 | `d6-now` s2 | Picker open with swatches, the colors card beside it |
| F2 | `f2-now` s1 | Page above the log; only inventory queries repeat |
| F3 | `f3-now`, the step where pnpm names the blocked script (CX) | The blocked line inside the window |

D2 composition, inside the 832 by 816 capture box on the light card. Crops come from real captures of `d2-now` at scale 1.2, each cropped to its shelf with 16 px around the card:

| Crop | Source | Size | Position in the box |
|---|---|---|---|
| Label "Featured" | text, 20/28 Bold navy | | 0, 0 |
| Featured card | s2 (slot 32rem) | 614 by about 194 | 0, 36 |
| Label "Search results" | | | 0, 254 |
| Search results card | s0 (22rem) | 422 by about 511 | 0, 290 |
| Label "Recommended" | | | 446, 254 |
| Recommended card | s1 (15rem) | 288 by about 456 | 446, 290 |

The crops sit directly on the light card with radius 12 and the capture shadow. The labels are navy on white 0.40 glass, which passes over every d2.jpg pixel.

## 6. Opening and closing slides

### 6.1 Shared rules

Mocks for every slide are in `scratchpad/v5-design/slide-*.png`.

- Grid: 64 margins; three columns of 576 with 32 gutters (x 64, 672, 1280). Content runs from y 64 to y 984. The footer row runs from y 1012 to 1052.
- Type: the PRD 4.5 scale only. Quotes use the title step (64/72) in Regular. Display 144/144 Bold appears on title, mandate and keep-humanity only; the closing name uses 120/128 (11, item 7).
- Light glass card: `--glass-surface-strong` (white 0.72) plus `blur(24px) saturate(140%)`, `--chrome-card-border`, `--chrome-card-highlight`, `--chrome-card-shadow`, radius 24. 0.72, not 0.55: ink-soft on 0.55 over c1's cobalt band measures 4.4:1 and fails, while 0.72 gives 5.8:1.
- Dark glass card: `--glass-dark-surface-strong` (navy 0.72) plus the same blur, white 0.16 edge, dark highlight, `--glass-dark-shadow`, radius 24.
- Text on light: titles navy, body `--glass-ink-soft`, eyebrows and numbers `--glass-link` (`#002FAF`). On dark: white, body `#D6DCEC`, eyebrows and numbers cyan.
- Icons: Lucide, stroke 1.75. 48 in a row, 56 in a tile. Dark blue on light, white on dark.
- Blur budget: 7 blurred surfaces per slide at most. People-to-follow uses one panel, not twelve cards.
- No uppercase, no tracking, sentence case. The text is carried over word for word, except the title eyebrow (PRD).
- Footer: two pills at y 1012, 40 tall, padding 0 16, pill radius, 20/28. Left: "thefutureiscomposable.com". Right: "FITC Web Unleashed 2026, Bermon Painter, Slalom" with the slide number 16 after it in Bold. Light slides use white 0.72 with ink-soft text; dark slides navy 0.72 with `#D6DCEC`. A pill keeps the footer legible over any bottom band (c1's cobalt, c2's orange edge), so no per-file tone guess is needed. `lib/designed.ts`'s hex guess goes. Title and closing hide the footer.
- Classes: `.sg` (slide root), `.sg-eyebrow`, `.sg-title`, `.sg-display`, `.sg-body`, `.sg-card`, `.sg-card--dark`, `.sg-card__title`, `.sg-card__body`, `.sg-num`, `.sg-icon`, `.sg-footer`, `.sg-pill`. They live in `styles/components/slides-glass.css` and read only `--glass-*`, `--chrome-*` and `--slide-bg-image`.

### 6.2 Per slide

**title** (`glass-title`, title.jpg, dark)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Eyebrow | 64 | 64 | auto | 36 | "FITC Web Unleashed 2026, Toronto", 28/36 Bold cyan |
| Title | 64 | 424 | 1200 | 288 | "2026 advances / in the web", display, white. Measured 1048 wide. |
| Speaker card | 64 | 840 | 720 | 176 | Dark glass, padding 40 48: "Bermon Painter" 36/50 Bold white, 4 gap, "Head of DXP and Commerce, Slalom" 24/32 `#D6DCEC`. The card keeps the name off the magenta glow lower left. |
| Wordmark | 1640 | 960 | 216 | 56 | Slalom, white, on the dark lower right |
| QR slot | 1680 | 840 | 176 | 176 | Reserved and empty unless PRD question 2 says yes |

**the-mandate** (`glass-grid`, variant `icons`, o2.jpg, light)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Eyebrow | 64 | 64 | | 36 | "The mandate" |
| Display | 64 | 116 | | 144 | "Use AI", navy on the chartreuse bloom |
| Eyebrow | 64 | 644 | | 36 | "The reaction" |
| Cards | 64, 672, 1280 | 696, 856 | 576 | 128 | Light glass; Lucide 48 (wrench, key-round, graduation-cap, user-check, clipboard-check, activity), 24 gap, label 32/40 Bold navy, padding 0 40 |

The band between y 260 and 644 is left open on purpose: the bloom is the image.

**three-reactions** (`glass-grid`, variant `portraits`, o3.jpg, light)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Title | 64 | 64 | | 72 | "Three reactions" |
| Cards | 64, 672, 1280 | 168 | 576 | 816 | Light glass, padding 32 |
| Portrait | +32 | 200 | 512 | 512 | `/images/design/*.png` as now, radius 16, alt text as now |
| Name | +32 | 744 | 512 | 40 | 32/40 Bold navy |
| Description | +32 | 792 | 512 | 64 | 24/32 ink-soft, 2 lines |
| Question | +32 | 880 | 512 | 72 | "Why?", "How?", "Should we?", 64/72 Bold dark blue, pinned to the card bottom. Slalom Blue is never text on glass (glass spec 5). |

**two-perspectives** (`glass-quotes`, o4.jpg, dark)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Panel | 64 | 64 | 1792 | 920 | One dark glass panel. The title sits inside because o4's cyan glow top left would fail white text on the field. |
| Title | 128 | 128 | | 72 | "Two perspectives", white |
| Divider | 959 | 296 | 1 | 624 | White 0.16 |
| Quote 1 | 128 | 352 | 768 | 360 | 64/72 Regular white, 5 lines, curly quotes as now |
| Cite 1 | 128 | +40 | | 36 | "Sir Tim Berners-Lee, 2017", 28/36 Bold cyan |
| Quote 2 and cite | 1024 | 352 | 768 | | "W3C Strategy Team, October 2026" |

Lora goes: the PRD fixes Slalom Sans Regular and Bold.

**keep-humanity** (`glass-statement`, o5.jpg, saturated)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Panel | 352 | 300 | 1216 | 480 | Dark glass strong, centered on the slide |
| Statement | 448 | 396 | 1030 | 288 | "Keep humanity / at the center", display, white, left aligned inside the panel. Measured 1049 wide at the longer line. |

**open-web** (`glass-grid`, variant `icons`, o6.jpg, light)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Title | 64 | 64 | | 72 | "Why the open web matters" |
| Lede | 64 | 152 | 1400 | 100 | 36/50 ink-soft, 2 lines |
| Cards | 64, 672, 1280 | 316, 666 | 576 | 318 | Light glass, padding 40. Lucide 56 at top left (monitor-smartphone, sliders-horizontal, link, accessibility, shield-check, door-open). Title 32/40 Bold and subtitle 24/32 ink-soft pinned to the bottom, 8 apart. |

**what-we-cover** (`glass-grid`, variant `numbered`, o7.jpg, dark)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Eyebrow | 64 | 64 | | 36 | "2026 advances in the web", cyan |
| Title | 64 | 116 | | 72 | "What we’ll cover", white |
| Cards | 64, 672, 1280 | 584 | 576 | 400 | Dark glass, padding 40. Number "01" to "03" 64/72 Bold cyan at top left; Lucide 56 white at top right (code-xml, layers, package); label 36/50 Bold white pinned to the bottom, 2 lines at most. The cards sit over o7's purple and cyan bands. |

Numbers change from chartreuse to cyan: chartreuse stays the keycap's one use on navy.

**what-changed** (`glass-grid`, variant `numbered`, c1.jpg, light)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Title | 64 | 64 | | 72 | "What changed in 2026" |
| Cards | 64, 672, 1280 | 168, 592 | 576 | 392 | Light glass, padding 40. Number 32/40 Bold dark blue; 16; title 32/40 Bold navy, 2 lines at most; 16; body 24/32 ink-soft, 4 lines at most. The tallest card needs 360 of 392 (a two-line title and a four-line body), as the mock shows. |

**people-to-follow** (`glass-people`, c2.jpg, light)

| Element | x | y | w | h | Spec |
|---|---|---|---|---|---|
| Title | 64 | 64 | | 72 | "People to follow" |
| Panel | 64 | 168 | 1792 | 816 | One light glass panel, padding 24 48 |
| Grid | 112 | 192 | 1696 | 768 | 3 columns by 4 rows, 32 column gap, rows 192, a 1 px `--glass-rule` between rows, reading order left to right |
| Entry | | | | | Avatar 96 circle, Slalom Blue, initials 32/40 Bold white (4.6:1, large); 24 gap; name 32/40 Bold navy; role 24/32 ink-soft, one line (the longest, "Author, CSS: The Definitive Guide", fits the 424 px text column in the mock) |

Notes change per PRD 4.6: this is no longer the last slide.

## 7. Closing slide

`glass-closing`, closing.jpg, dark, footer and slide number hidden. Mock: `slide-closing.png`. It confirms PRD 4.6 with these exact values.

```text
1920 x 1080
  64 +--------------------------------------------+
     |  dark glass strong, r24                     |      182 +-----------------------+
     |                                             |          | white card, r24       |
     |  Thank you                (28/36 cyan)      |          |   238 +-------------+ |
     |  Bermon Painter           (120/128 white)   |          |       | QR 544      | |
     |  Head of DXP and Commerce, Slalom (36/50)   |          |       | module 14   | |
     |  [in] linkedin.com/in/bermonpainter (36/50) |          |   782 +-------------+ |
     |                                             |          |   Scan to open LinkedIn|
     |  slalom (904)                               |      898 +-----------------------+
1016 +--------------------------------------------+         x 1200, 656 wide
     x 64, 1072 wide
```

| Region | x | y | w | h | Contents |
|---|---|---|---|---|---|
| Background | 0 | 0 | 1920 | 1080 | closing.jpg, grain overlay |
| Left panel | 64 | 64 | 1072 | 952 | `--glass-dark-surface-strong`, 24 blur, white 0.16 edge, dark highlight, `--glass-dark-shadow`, radius 24 |
| Text group | 128 | 372 | 944 | 336 | Flex column centered between y 64 and 1016: 36 + 16 + 128 + 24 + 50 + 32 + 50 = 336, so it starts at 372 (mock confirmed). |
| Eyebrow | 128 | | 944 | 36 | "Thank you", 28/36 Bold cyan |
| Name | 128 | +16 | 944 | 128 | "Bermon Painter", 120/128 Bold white, letter-spacing -0.01em, one line. Measured 909 wide; at 144 it is 1091 and would not fit. |
| Role | 128 | +24 | 944 | 50 | "Head of DXP and Commerce, Slalom", 36/50 Regular `#D6DCEC` (620 wide) |
| Link | 128 | +32 | 944 | 50 | LinkedIn logo 40 by 40 from `public/logos/linkedin.svg` (white "in" tile as published), 16 gap, "linkedin.com/in/bermonpainter" 36/50 Bold white (556 wide). Text, not a link: the room cannot click. |
| Wordmark | 128 | 904 | 216 | 56 | Slalom wordmark, white |
| QR card | 1200 | 182 | 656 | 716 | `--glass-surface-solid` (#FFFFFF), radius 24, shadow `0 24px 64px rgb(0 10 37 / 0.4)`. Solid, not glass: scanners need flat white. |
| QR | 1256 | 238 | 544 | 544 | Version 3, error correction M, 29 modules plus a 4-module quiet zone (37). Module 14 stage px gives 518, centered with 13 px margins. Navy `#0F1C41` on white, `shape-rendering="crispEdges"`. |
| Caption | 1256 | 806 | 544 | 36 | "Scan to open LinkedIn", 28/36 Bold navy, centered |

Contrast: white on navy 0.72 over closing.jpg's brightest pink pixel is above 7:1 (PRD 1.5). Navy on white is 17:1. The QR's module contrast is the same 17:1.

## 8. Grain overlay

Confirmed: PRD 1.2 as written. The overlay is the grain of record and the baked grain is the base. The mocks used a 256 tile with sigma 18 percent at 0.10 overlay. Grain shows on mid tones (title, keep-humanity, d5) and fades out on near-white bands (o2 cream) and near-black fields. That is the overlay curve doing what it should.

```css
/* styles/components/stage.css */
:root {
  --grain-opacity: 0.1;   /* tune 0 to 0.16 at the projector check (M8) */
  --grain-blend: overlay;
}
.stage__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--slide-bg-image) center / cover no-repeat;
}
.stage__grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url("/theme/grain.png");
  background-repeat: repeat;
  /* one tile pixel per device pixel at any stage scale */
  background-size: calc(256px / (var(--stage-scale) * var(--dpr)));
  image-rendering: pixelated;
  mix-blend-mode: var(--grain-blend);
  opacity: var(--grain-opacity);
}
.stage__slide { position: relative; z-index: 2; }
@media (prefers-reduced-transparency: reduce) {
  .stage__grain { opacity: 0; }
}
```

| Rule | Value |
|---|---|
| Tile | `public/theme/grain.png`, 256 by 256, 8-bit gray, Gaussian, mean 50 percent, sigma 18 percent, fixed seed |
| Blend, opacity | `overlay`, 0.10 |
| Layer | Inside the stage, above `.stage__bg`, below every slide element. It belongs to the stage, not the slide, so a slide crossfade never doubles it. Nothing between bg and grain may set `isolation`, `opacity` or a filter, or the blend breaks. |
| Applies to | Every slide in the audience window: title, opening, intro, walk, single, closing. Over the background only: glass panels blur it, and the code card and QR card cover it. |
| Does not apply to | The speaker window and previews, frames (they show their baked grain under the wash), captures and posters |
| Fallbacks | `?glass=off`, reduced transparency and forced colors set the opacity to 0. Reduced motion changes nothing: the grain is static. |
| Projector check | If o7 and closing (the two heaviest baked files) look sandy, drop the token to 0.06 for all slides. Do not split the token by slide. |

## 9. Spotlight boxes

### 9.1 Geometry

The box covers the target rect (frame px) with the runtime's four radii (PRD 3.1). It draws three concentric bands. Each band is a border on its own element, with radii set per corner by the overlay, so the arcs are concentric in Chromium, WebKit and Firefox alike. An outline's corner math differs between engines at small radii, and a spread box-shadow's does too. The visible result keeps PRD 3.1's 3 px ring at a 4 px offset.

| Band | Element | Inset from target | Width | Corner radius | Color |
|---|---|---|---|---|---|
| Inner halo | `::after` | -4 | 4 (border) | r + 4 | `--spot-halo` white 0.9 |
| Ring | `::before` | -7 | 3 (border) | r + 7 | `--spot-ring` `#0C62FB` |
| Outer halo | `::before` box-shadow | -9 | 2 (spread) | r + 9 | `--spot-halo` |

- A corner with r = 0 stays 0 in every band, so a square target gets a square ring (PRD: no minimum radius).
- The total extent is 9 frame px (12.4 stage px). Targets keep 12 frame px from the viewport edge (3.7).
- The box itself has no paint. `border-radius` is set to the four target values, which the walk test reads.

```css
/* styles/components/page.css */
.overlay {
  --spot-ring: var(--color-slalom-blue);
  --spot-halo: rgb(255 255 255 / 0.9);
  --spot-fade-out: 100ms;
  --spot-fade-in: 160ms;
  --spot-ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* --glass-ease */
}
.overlay__spotlight {
  position: absolute;          /* left, top, width, height: target rect */
  box-sizing: border-box;
  pointer-events: none;
  border-radius: var(--r-tl) var(--r-tr) var(--r-br) var(--r-bl);
  opacity: 0;
  transition: opacity var(--spot-fade-out) var(--spot-ease-out);
}
.overlay__spotlight[data-state="shown"] {
  opacity: 1;
  transition-duration: var(--spot-fade-in);
  transition-timing-function: var(--ease-brand);
}
.overlay__spotlight::before,
.overlay__spotlight::after {
  content: "";
  position: absolute;
  box-sizing: border-box;
}
.overlay__spotlight::before {
  inset: -7px;
  border: 3px solid var(--spot-ring);
  border-radius: var(--ring-tl) var(--ring-tr) var(--ring-br) var(--ring-bl);
  box-shadow: 0 0 0 2px var(--spot-halo);
}
.overlay__spotlight::after {
  inset: -4px;
  border: 4px solid var(--spot-halo);
  border-radius: var(--halo-tl) var(--halo-tr) var(--halo-br) var(--halo-bl);
}
@media (prefers-reduced-motion: reduce) {
  .overlay__spotlight { transition: none; }
}
```

`Overlay.tsx` sets, per corner, `--r-*` = r, `--halo-*` = (r ? r + 4 : 0) and `--ring-*` = (r ? r + 7 : 0), all in px. Inline custom properties are fine: the overlay lives in the presenter, not under D5's CSP.

### 9.2 Shapes

| Target | Radii reported | Result |
|---|---|---|
| Square (D2 `.product-slot`, `#status`, table rows, timeline items) | 0 | Square ring |
| Control, radius 8 (buttons, inputs, select) | 8 | Ring corners 15, halo 12 |
| Card, radius 12 (D6 capture, F1 tiles, drawers) | 12 | Ring corners 19 |
| Popover 10, dialog 16 | 10, 16 | 17, 23 |
| Pill (999 px) | h / 2 after the CSS clamp | Concentric pill: ring corners h / 2 + 7 |
| Circle (50 percent on a square) | w / 2 | Concentric circle, diameter w + 14 |
| Ellipse (50 percent on a rectangle) | min of the two radii per corner (PRD) | A stadium around the ellipse, at most a few px off at the ends. No target in the deck is elliptical. |
| Mixed (`12px 12px 0 0`) | per corner | Rounded top, square bottom, concentric |
| Merged rects (within 12) | largest member's radii | One ring on the union |
| Multi-line inline (D4 links) | one rect per line box, merged | One ring on the union, radius 0 |
| `clip-path`, SVG shapes, rotated elements | bounding box, radius 0 | A square ring on the box. The walk warns when a spotlight target has a clip-path or a rotation, so content can target a rectangular parent instead. |

### 9.3 Fade

PRD 3.2 holds: `SETTLE_MS` 120, `FADE_OUT_MS` 100, `FADE_IN_MS` 160, `MAX_HOLD_MS` 2000, opacity only. This spec fixes the curves: fade out with `--glass-ease` (`cubic-bezier(0.23, 1, 0.32, 1)`) and fade in with `--ease-brand` (`cubic-bezier(0.22, 1, 0.36, 1)`). Both are ease-out; nothing uses ease-in. The ease-out start makes the box leave within the first frame or two of movement, which is what reads as "it got out of the way". Callouts and the overlay focus ring use the same gate and curves. The ghost cursor, ripple and keycaps are not gated.

### 9.4 Inset mode

When a ring would cross the frame viewport (the target is within 9 px of an edge, or its rect runs past one, as with D4's `#content`), the overlay clips the box to the viewport and draws it inside. `data-mode="inset"` sets `::before` to inset 0 with radii r, `::after` to inset 3 with radii max(r - 3, 0) and a 2 px halo border, and no outer shadow. Clipped sides get square corners. With the clearance in 3.7, only D4's scrolling main uses it.

### 9.5 Color on light and dark

One treatment works everywhere, so the runtime does not need to report a tone. The ring is Slalom Blue between two white bands.

| Where the ring sits | Band contrast |
|---|---|
| Light glass (white 0.55 to 0.96) | Ring against the halo and the glass: 4.6:1. The halos merge into the glass. |
| Section background through the wash | Blue against white halos: 4.6:1; halos against the darkest washed pixel (d1 violet): above 3:1 |
| Dark glass (D4, D5 and F2 drawers, F3 window) | Halos against navy 0.82: above 14:1. The blue reads as a stripe between them. Blue alone on navy would be 2.3:1. |

The overlay focus ring: 2 px ring at inset -4 (radii r + 4, or 0) with a 2 px white 0.9 outer halo, no inner halo.

## 10. Checks

Run in headless Chromium against mocks served from the scratchpad (not the repo), with the real theme CSS, fonts, backgrounds and portraits:
`/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/v5-design/`
Wrapper mocks: `mock-d1.png`, `mock-d3.png`, `mock-d3-s0.png`, `mock-d5.png`. Slide mocks: `slide-<id>.png` for all nine slides, plus `slide-closing.png` and `slide-intro-d1.png`. The current deck at the start of this round is in `current/`.

- Swap test. The five families would be missed: a storefront header, a case desk and a terminal cannot swap for the v4 shell.
- Squint test. In D1, D3 and D5 the strongest shape is the shown block or the drawer. Context reads as one quiet layer.
- Signature test. The focus surface is present on the D1 row, the D3 form, the D6 variants card, the D5 and F2 drawers, and the F4 and F5 tables.
- Token test. `--wrap-surface-quiet`, `--wrap-surface-focus` and `--wrap-shadow-focus` name the two tiers.
- Measured: the closing name, the title and the statement widths (sections 6 and 7). The D1 and D3 fill and clearance from the mock render. Ring concentricity at radii 0, 8, 10 and 12 in Chromium.

Not run: WebKit and Firefox renders of the ring, D2, D4, D6 and F1 to F5 mocks, the used-to D5 height, axe, `?glass=off`, forced colors, the projector check. The contrast figures for the grain are estimates; `pnpm test:contrast` decides.

## 11. Changes to the PRD and CX, and open decisions

Changes this spec makes (visuals, so the spec wins unless the speaker says otherwise):

1. Spotlight bands are borders on pseudo-elements, not `outline`. The geometry is the same (3 px at 4 px), plus a 2 px outer white halo for dark surfaces. Inset mode is added for edge targets (9.4).
2. Wrapper files: `public/wrappers/base.css` is added, shared by every wrapper.
3. `--wrap-text-sm` (14 px) is added. The glass 13 px step is not used in wrappers (CX floor).
4. Opening and closing footers become two glass pills (6.1).
5. Quotes use 64/72 Regular. No new size.
6. Intro text panel: padding 48, tiles 184 instead of 196, logo 64 instead of 72, so four tiles fit the 880 px panel.
7. Closing name at 120/128, as in PRD 4.6's layout, not the display step: 144 does not fit (measured).
8. D1 shown CSS: optional fallback `inset` change (4.1). It touches one shown line.
9. D5 drawer: open on now, collapsed on used-to. That is the same wrapper with a build-driven state; PRD 2.1 rule 6 allows it in spirit, the engineer confirms.
10. F builds: F3 now moves its bar and env footer into the wrapper; F4 and F5 move their meta lines into the wrapper; F3 used-to drops its eyebrow. These are build files, not shown code panels.
11. CX D1 summary line sits in the bar, not under it.
12. D2: one footer line ("Free returns within 30 days") is added to meet the fill rule. CX's "no promo banners" still holds: it is a plain line, not a banner.

Open decisions for the speaker or the coordinator:

1. Title slide QR (PRD question 2): a slot is reserved at 1680, 840, 176 by 176. Yes or no.
2. CX question 1, customer names: the wrappers show none. D4's server-rendered list still shows the computer-scientist names from `orders.json`. Switch the fixture or keep it?
3. D2 used-to overflow at s3 (4.2): accept the clip as in v4, or change the stacked image ratio in the shown CSS.
4. F2's admin bar is drawn as a staff preview strip. CX says no region picker in the layout. Keep the strip (it drives the demo), or move user and region to hooks only and drop it.
5. Grain token at the projector: 0.10 default, 0.06 if o7 and closing read sandy.

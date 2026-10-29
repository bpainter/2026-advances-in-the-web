# PRD v5: backgrounds, wrappers, spotlights and slides

This PRD covers the fifth round of changes to the presenter app. The speaker's requirements are in `docs/design/feedback-2026-10-28-v5.md`. They are fixed. Everything in `docs/design/feedback-2026-10-28.md` and `docs/PRD-demos-v4.md` still holds unless this document changes it.

Start from the commit that closes the v4 fix round now in progress. That round touches `public/runtime/demo-runtime.js`, `styles/components/page.css` and `demos/04-navigation-api/build.ts`. Rebase on it before M1. Do not reapply its changes by hand.

Visual detail lives in `docs/design/demo-wrappers-spec.md`, which the design agent writes. It covers the wrappers and, in its last section, the opening and closing slides. Where it and this PRD disagree on visuals, the spec wins. On behavior, data, contrast, timing and tests, this PRD wins.

## Decisions at a glance

| Topic | Decision |
|---|---|
| Backgrounds | 21 new Higgsfield files in `public/backgrounds/v5/`: smooth multi-color gradients with grain. The five `glass-*.jpg` files are deleted. |
| Grain | Baked moderate grain in each file, plus one shared grain overlay drawn at 1 device pixel per tile pixel. The overlay is the grain of record. |
| Assignment | Title, every opening slide, every closing slide and every section get their own file. All pages of a section share the section's file. |
| Frames | A frame shows its section's background, aligned with the slide behind it. |
| Wrappers | The universal portal shell goes. Each section gets a contextual wrapper. Only D4 keeps app chrome. |
| Spotlights | Corner radii come from the target. Boxes fade out while things move and fade back in once rects settle for 120 ms. |
| Slides | The Claude Design slides move to native glass layouts. `content/designed/` is removed. |
| Closing | A new last slide: name, title, LinkedIn and a QR code generated locally. |

## 1. Backgrounds

### 1.1 The look

The references are `gradient-1.png` to `gradient-4.png` and `grain-texture.webp` in `docs/design/inspiration/v5/`. Each background is a smooth field of two to four hues that blend with no hard edges. There are no shapes, no glass objects, no text, no logos and no people. Grain covers the whole image.

The coordinator generates the files with Higgsfield. They arrive at `public/backgrounds/v5/<id>.jpg` with grain baked in at moderate strength. Delivery rules:

- 1920 by 1080, so the baked grain maps one to one to stage pixels on a 1080p projector.
- JPEG, quality 85 to 90. Aim for 900 KB or less. The check warns above 900 KB and fails above 1.5 MB.
- One light or dark tone per file, as the table in 1.4 states.

### 1.2 Grain: baked plus a shared overlay

Recommendation: a shared overlay is the grain of record. The baked grain stays as a soft base.

Why:

- JPEG at this budget smears fine grain into soft blotches. The overlay is a lossless PNG tile.
- Each Higgsfield file has its own grain size and strength. The overlay is identical on every slide, so the deck reads as one set.
- The stage scales to fit the window. Grain baked into an image scales with it and goes soft. The overlay tile is sized in device pixels, so it stays crisp at any window size.
- One token tunes it at the projector check. No image needs to be regenerated.

How it works:

- `scripts/grain.mts` writes `public/theme/grain.png`: 256 by 256, 8-bit gray, Gaussian noise around 50 percent gray with a standard deviation of 18 percent. It uses a fixed seed and Node's own `zlib`, so it needs no package and no network. The file is committed. `pnpm check` regenerates it in memory and fails if the hash differs.
- The audience window draws one layer, `.stage__grain`, inside the stage, above the slide background and below every panel and text. It uses `background: url(/theme/grain.png) repeat`, with `background-size: calc(256px / (var(--stage-scale) * var(--dpr)))`. `--dpr` is set from `devicePixelRatio`, and `image-rendering: pixelated` keeps it sharp.
- Strength: `--grain-opacity: 0.10` with `mix-blend-mode: overlay`. Tune it between 0 and 0.16 at the projector check. If the baked grain alone reads crisp there, set the token to 0. That needs no code change.
- Glass panels blur what sits behind them, grain included, so panels stay smooth. The code panel is near solid and shows no grain.
- The speaker window and its previews draw no grain. At preview size it only adds mud.
- Frames draw no overlay. A frame shows the baked grain of its section background under its wash.
- The layer is a static image with no filter, so it costs one composite per frame.

### 1.3 Assignment rules

1. The deck title slide gets a unique background.
2. Every opening and closing slide gets a unique background.
3. Each demo section (D1 to D6, F1 to F5) gets one background. Its intro, used-to and now pages all use it. Single-page sections use theirs on the one page.
4. No file is used by two sections, or by a section and a non-demo slide.
5. Two sections that sit next to each other never share a lead hue. The lead hue is the first hue named in the table.
6. Light files keep the band from y 0 to 168 pale and low in chroma. That band holds the walk-page eyebrow and title.

All 11 section files are light, because walk pages carry light glass, navy text and a near-white code panel. Section intro slides hold their text in a dark glass panel (section 1.6), so a light file works there too.

### 1.4 Assignment table

Background ids follow the slide file numbers in `content/slides/`, not the Claude Design file names. Palette names refer to the Slalom palette: blue `#0C62FB`, dark blue `#002FAF`, navy `#0F1C41`, cyan `#1BE1F2`, purple `#C7B9FF`, chartreuse `#DEFF4D`, coral `#FF4D5F`. Warm yellow, orange and magenta may appear as supporting hues.

| Slide or section | File | Palette direction (lead hue first) | Tone | Where text sits |
|---|---|---|---|---|
| `title` | `title.jpg` | Navy and cobalt blue field, magenta glow lower left, orange glow upper right. Fine grain. | dark | Left two thirds, white text on the dark field. Keep color mass in the right third. |
| `the-mandate` | `o2.jpg` | Chartreuse and yellow bloom upper center, cyan wash lower left, cream base. | light | Headline top left on the pale field. Tiles on light glass below. |
| `three-reactions` | `o3.jpg` | Peach upper left, lavender and pale blue lower right, cream base. | light | Headline top left. Three portrait cards on light glass across the middle. |
| `two-perspectives` | `o4.jpg` | Navy base, violet center, magenta glow right, cyan glow top left. | dark | Two quote panels on dark glass, side by side. |
| `keep-humanity` | `o5.jpg` | Saturated cobalt blue with violet lower left and magenta and pink upper right. | saturated (text in a dark glass panel) | One centered dark glass panel holds the statement. |
| `open-web` | `o6.jpg` | Pale blue, lilac and cream vertical washes, peach at the right edge. | light | Headline and lede top left. Six tiles on light glass. |
| `what-we-cover` | `o7.jpg` | Navy base, purple and cyan bands across the lower half, a small chartreuse and yellow glow lower right. | dark | Headline top left. Three columns on dark glass. |
| D1 `d1-order-actions` | `d1.jpg` | Cyan and cobalt upper left, violet lower half, pale yellow upper right. | light to mid (cyan top left; check the title zone) | Walk pages: top band. Intro: right dark panel. |
| D2 `d2-product-card` | `d2.jpg` | Beige and peach left, coral center, lavender right. | light | Same as D1. |
| D3 `d3-support-form` | `d3.jpg` | Pale mint top, chartreuse and cyan along the bottom. | light | Same as D1. |
| D4 `d4-dashboard-navigation` | `d4.jpg` | Pale periwinkle white, dark blue and purple sweep from the lower left. | light | Same as D1. |
| D5 `d5-rich-content` | `d5.jpg` | Saturated violet, magenta and pink vertical bands. | saturated (walk-page titles need the chrome wash or a panel) | Same as D1. |
| D6 `d6-variant-picker` | `d6.jpg` | Pale grey-white top, soft cyan, pink and yellow glows across the lower middle. | light | Same as D1. |
| F1 `f1-still-in-motion` | `f1.jpg` | Chartreuse lower left, cyan center, pale blue and white right. | light | Single page: top band. |
| F2 `f2-caching` | `f2.jpg` | Warm grey field, cobalt blue orb left, orange and yellow glow right. | light to mid | Same as D1. |
| F3 `f3-package-trust` | `f3.jpg` | Icy white top, cyan and navy along the bottom with a coral edge lower right. | light | Same as D1. |
| F4 `f4-vite-8-locally` | `f4.jpg` | Lilac, periwinkle and pink soft blooms on white. | light | Single page: top band. |
| F5 `f5-what-you-can-delete` | `f5.jpg` | Blush white top, orange upper right, magenta and purple along the bottom. | light | Single page: top band. |
| `what-changed` | `c1.jpg` | Ice white top, cobalt, purple and cyan haze rising from the bottom. | light | Headline top left. Six cards on light glass. |
| `people-to-follow` | `c2.jpg` | Cream center, yellow and coral glow upper right, orange and purple at the edges. | light | Headline top left. Twelve people cards on light glass. |
| `closing` | `closing.jpg` | Near-black navy left, cobalt blue center, purple into a coral and pink band on the right. | dark | Left panel on dark glass. QR card on the right. |

The palette and tone columns describe the files as generated (Higgsfield Soul v2, 28 October 2026, 2048 by 1152 JPEG, fine grain baked in). Where a file is saturated or mid-tone behind a title zone (d1, d5, f2), the contrast test decides whether the chrome wash suffices or the title sits on a glass panel.

### 1.5 Contrast

- Every text element sits on a glass surface that meets PRD v4 6.4, or directly on a field whose text zone passes the same limits.
- `pnpm backgrounds` (new, Playwright) decodes each file in Chromium and writes `content/.generated/backgrounds.json`: the darkest and brightest pixel of each text zone, the mean color and a 16 by 9 thumbnail. `pnpm test:contrast` composites every text token over its surface and wash, over both extremes of the zone under it. It fails below 4.5:1 for text and 7:1 for code.
- White text on dark glass uses `--glass-dark-surface-strong` (navy at 0.72) or stronger. Over a white pixel that gives about 7:1 for white and 5:1 for `#D6DCEC`.

### 1.6 Where the backgrounds change existing chrome

- **Walk pages.** `--chrome-image` becomes the section file. `--chrome-wash` is unchanged.
- **Intro slides.** The full-slide navy wash goes. The right column (title, description, tiles, also uses) sits in one `glass-dark` panel at x 976, y 64, 880 by 952, on `--glass-dark-surface-strong` with 24 px blur. The visual card loses its accent image. It becomes a light glass card over the section background, with the capture inside as before. Tile styling does not change.
- **Frames.** See section 4.2.
- **Removed.** `glass-fan.jpg`, `glass-petal.jpg`, `glass-lavender.jpg`, `glass-navy.jpg`, `glass-blue.jpg`, the old README and every reference to them, including the copies `pnpm theme:sync` places in the F2 apps.
- **Preload.** The audience window decodes the backgrounds of the next and previous slides with `img.decode()`, so no slide arrives without its background.

## 2. Demo wrappers

### 2.1 Rules

The v4 portal shell put every demo in the same app frame with a mostly empty pane (`current-d1-frame.webp`). v5 replaces it with one wrapper per section that shows the place the feature lives in.

1. **Unshown.** The wrapper is injected at compose time. It never appears in a shown file or an excerpt. Its classes use the `wrap-` prefix, and no shown file may contain that prefix.
2. **Never the feature.** The wrapper never uses the feature its section demonstrates, or any feature on the section's "also uses" line. The banned list per section is in 2.2.
3. **Never in the way.** No wrapper element matches a selector in the section's shown CSS or JavaScript. No wrapper element is focusable or navigates: no `href` (D4 intercepts navigations), no `tabindex` of 0 or more, no form controls. The keyboard proofs therefore stay exact.
4. **Fills the frame.** At s0 and on the last step, visible content spans at least 85 percent of the viewport's width and height. No vertical gap between visible blocks is larger than 96 frame px. The document does not scroll unless the manifest sets `scrolls: true` (D4 only, because scroll restore is part of that demo).
5. **Glass system.** Wrapper CSS sits in `@layer wrapper`, after `portal-theme`. It uses `--glass-*` tokens only, with no raw colors. It follows the theme lint, and layout properties are allowed only on `.wrap-*` selectors. The blur budget of 6 blurred elements per frame still applies, counting wrapper and shown elements together.
6. **Same on both pages.** The used-to and now pages of a section use the same wrapper, so the room sees the same place twice. Only F3 differs, because its two frames show different things. The used-to wash stays grayer than the now wash, as in v4.
7. **Real data.** Wrapper content comes from `fixtures/` or from generated files. Numbers are never typed into wrapper markup.
8. **One landmark each.** The wrapper adds no `main` when the shown markup has one. `pnpm axe` passes with glass off.

### 2.2 Wrapper per section

The design agent sets layout and visuals in `docs/design/demo-wrappers-spec.md`. This table fixes what each wrapper is and what it may not use.

| Section | Used-to and now wrapper | What fills the frame | Must never use |
|---|---|---|---|
| D1 Order actions | `order-queue`: the fulfillment order queue | Store header strip, queue summary stats, the shown row for order 418, then static sibling rows (419 to 422) with status chips and totals | `popover`, `dialog`, `command`, `commandfor`, `inert`, `showModal`, any focus script |
| D2 Product card | `storefront-merch`: a storefront landing page | Store header with a static search and cart, the three contexts the card moves through (Featured, Search results, Recommended rail). On the now page a context label names where the slot is at its current width. | `container-type`, `@container`, `cq*` units, `@scope`, `:has()` |
| D3 Support form | `support-case`: a support desk "New case" page | Case header (customer, linked order, priority chip, assignee), the shown form, a customer summary card and a recent orders card | `field-sizing`, form controls, any auto-grow script |
| D4 Dashboard navigation | `portal-dashboard`: the Ridgeline portal. The one wrapper with app chrome, because the demo is navigation inside an app. | Rail, top bar, the shown list and the pinned evidence panel | Navigation API, History API, `href` on any wrapper element, `fetch` |
| D5 Rich content | `product-page`: a storefront product page | Store header, image, price and rating around the shown article. `#console` docks as a browser console drawer on dark glass. | Any HTML sink (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `setHTML`), `trustedTypes`, any wrapper script |
| D6 Variant picker | `product-editor`: the admin product editor | Editor header with a Draft chip, static Title, Price and SKU values, an image strip, a Size row of static chips, and the shown Color field in a Variants card | `select`, `appearance`, `::picker()`, `selectedcontent`, any listbox |
| F1 Still in motion | `watch-list`: a team's platform watch list | Page header with the date, a legend for "Try now" and "Wait for", the five shown tiles, a source line naming the web-features version | Anchor positioning, Grid Lanes, view transitions, scroll-driven animation, scoped registries |
| M1 Shop the look | `lookbook`: the storefront home page | Store header with static nav words and the cart count, a season column with three "More looks" thumbnails, the shown look | `anchor-name`, `position-anchor`, `position-area`, `position-try`, `anchor()`, `popover`, `command`, `commandfor`, any script |
| M2 Trail photos | `product-photos`: the top of the Ridgeline Trail product page | Site header, a product bar (photo, name, price, rating and photo count from fixtures, an "Add to cart" look-alike), the "From the trail" heading over the shown wall | `grid-lanes`, masonry, multi-column layout, any script |
| M3 Pricing app | `editor-pricing`: the D6 product editor on its Pricing tab | Editor header (Trail Runner 2, Draft, SKU), a static tab strip, the shown Pricing card, Sales channels and product cards | `customElements`, `CustomElementRegistry`, `attachShadow`, an `iframe`, any script |
| M4 Return guide | `help-center`: the customer help center | Header with a search look-alike, a plain breadcrumb, the shown article pane over a Related articles card, a "Still need help?" column with hours and the return window | `animation-timeline`, `scroll-timeline`, `view-timeline`, `animation-range`, scroll listeners, `IntersectionObserver`, any script |
| M5 Trail gear pages | `storefront-catalog`: the storefront around the category page and the product page | Store header strip (name, static nav words, cart count) and a footer strip with the free shipping note, identical on both pages | `view-transition-name`, `@view-transition`, `startViewTransition`, `pageswap`, `pagereveal`, `href` |
| F2 Caching | `storefront-product`, rendered by both F2 apps | Storefront header, the product page, and the request log docked as a drawer on dark glass, newest 4 rows | Any fetch, cache directive or `revalidate` in the layout |
| F3 used-to | `advisory-feed`: a security advisories page | Header, static filter chips, the shown incident timeline, a source footer | Nothing extra; the page is static |
| F3 now | `terminal-window`: a full-frame terminal app on dark glass | Title bar, session tab, working directory, a status bar with the registry address and the pinned pnpm and npm versions, the "Recorded" chip | Any sign of a live session |
| F4 Vite 8 locally | `ci-report`: a benchmark run report | Run header (repository, commit, machine, run counts from `fixtures/vite-measurements.json`), the shown table, the measurement date | Typed numbers |
| F5 What you can delete | `dependency-review`: a pull request that removes packages | Header with counts generated from the same npm data, the shown table | Typed numbers |

D2's context label is set by the wrapper's own unshown script, which reads the slot width. It never uses a container query. It is the only wrapper script in the deck.

## 3. Spotlight boxes

### 3.1 Radius

- The runtime reports four corner radii for every rect: `radii: [tl, tr, br, bl]` in frame px.
- It reads `border-top-left-radius` and the other three from computed style. A percentage resolves against the box: horizontal against width, vertical against height. Each corner uses the smaller of its two values. If adjacent corners add up to more than a side, all four scale down by the same factor, as CSS does.
- The overlay sets the box's `border-radius` to exactly those four values. The outline keeps its 3 px width and 4 px offset. Browsers draw an outline's corners at the box radius plus the offset, so the outline stays concentric with the target.
- A square target gets a square outline. There is no minimum radius.
- When rects merge (within 12 frame px), the union takes the radii of its largest member by area.
- The overlay focus ring uses the same radii.
- v4's single `r` field goes. The overlay never adds 4 to the radius itself.

### 3.2 Fade while things move

Constants live in `lib/engine/settle.ts`:

| Name | Value | Meaning |
|---|---|---|
| `EPSILON` | 0.5 frame px | Smallest change that counts as movement |
| `SETTLE_MS` | 120 | Quiet time before rects count as settled |
| `FADE_OUT_MS` | 100 | Fade out, `ease-out` |
| `FADE_IN_MS` | 160 | Fade in, `--ease-brand` |
| `MAX_HOLD_MS` | 2000 | Longest the boxes stay hidden |

Behavior:

1. **Moving** starts when any rect of the current step's spotlights, callouts or focus ring changes by more than `EPSILON` (x, y, w, h or a radius), when the rect count changes, when `animating` turns true, or when a `resize-viewport` message arrives. Boxes fade out over 100 ms.
2. While moving, a box keeps its last geometry and only its opacity changes. It never slides or stretches on screen.
3. **Settled** means no qualifying change for 120 ms and `animating` is false. The boxes snap to the latest geometry while hidden, then fade in over 160 ms.
4. A new movement during a fade-in cancels it and fades out from the current opacity.
5. **New step.** The previous step's boxes fade out when the step starts. The new step's boxes appear at the first settle after `step-done`. In hands-on mode and in instant replay there is no playback, so they appear at the first settle.
6. **Fail-safe.** If rects never settle within 2000 ms, the boxes show at the latest geometry. Rehearsal mode logs "Spotlight forced after 2000 ms" with the step id.
7. **Reduced motion.** Hide and show are instant: opacity goes 1 to 0 and 0 to 1 with no transition. The settle window still applies.
8. Only opacity animates. Position and size are never transitioned (design review L8).
9. The ghost cursor, ripple and keycaps are not gated.

### 3.3 Protocol change

The message version goes from 1 to 2 on both directions. `parseFromRuntime` rejects version 1, so a stale cached runtime fails loudly.

```ts
// lib/engine/protocol.ts
export type Radii = [tl: number, tr: number, br: number, bl: number];
export type Rect = { x: number; y: number; w: number; h: number; radii: Radii };

// FromRuntime, rects message
{ v: 2; type: "rects"; frameId: string; seq: number;
  viewport: { w: number; h: number };
  rects: Record<string, Rect[]>; focus: Rect | null; focusVisibleNative: boolean;
  animating: boolean }   // a finite animation or transition is running in the document
```

Runtime changes in `public/runtime/demo-runtime.js`:

- `rectOf` returns `radii` as in 3.1.
- `animating` is true while `document.getAnimations()` holds a running animation with a finite duration. Infinite animations, such as spinners, do not count.
- While `animating` is true, the runtime samples rects every animation frame. Today it posts only on resize, mutation, scroll and focus, so transform animations leave stale rects.
- It also posts on `transitionend`, `transitioncancel`, `animationend` and `animationcancel`, so the final geometry always arrives.
- Posts stay deduplicated by content, as now.

The parent side owns the decision. `lib/engine/settle.ts` is a pure state machine with an injectable clock. `Overlay.tsx` feeds it and renders `data-motion="moving|settled"` on `.overlay` and `data-state="shown|hidden"` on each box.

### 3.4 Acceptance tests

- **Unit** (`scripts/settle-test.mts`, part of `pnpm test`): fake clock and scripted rect streams. It covers a single move, repeated moves inside 120 ms, `animating` holding the state, a fade-in cancelled by movement, the 2000 ms fail-safe, a new step waiting for `step-done`, and reduced motion.
- **Fixture.** A dev-only route `/fixtures/spotlight` renders a PageFrame with a static build at `demos/00-fixtures/spotlight/`. It has targets with radius 0, 8, 16, 999 px, `12px 12px 0 0` and 50 percent on a square. It also has a button whose width transitions over 400 ms and a panel that scales in over 200 ms. The route returns 404 in production.
- **Walk on the fixture.** Each box's computed four radii equal the target's within 0.5 px. During the width transition, the box reads `data-state="hidden"` within 1 frame of the first change and reaches opacity 0 within 100 ms plus 1 frame. It stays hidden until the transition ends. It shows no earlier than 120 ms and no later than 170 ms after the last change, at the final geometry within 1 px. With reduced motion, no sampled opacity falls strictly between 0 and 1.
- **Walk on the deck.** The core invariant: on every step, sampled every animation frame, a box with opacity above 0.05 matches its target's current rect within 1 frame px. D2 s1 and s2, D1 s1 and s2, D4 s3 and D6 s2 must pass it.
- **Protocol.** Every rects message has `v: 2`, and every rect has four finite radii.

## 4. Engine and content changes

### 4.1 Background data

- `content/backgrounds.ts` (new) is the registry: `BACKGROUNDS: Record<BackgroundId, { file: string; tone: "light" | "dark"; lead: Hue; hues: Hue[]; textZone: string }>`. It has 26 entries: the 21 of table 1.4 plus `m1` to `m5` for the Still in motion demos (`docs/design/still-in-motion-demos.md` 2). `BackgroundId` is its key type.
- `content/schema.ts`: `Slide.background: BackgroundId`, required.
- `content/demo-schema.ts`: `DemoSection.background: BackgroundId`, required. Pages have no background field of their own, so a section cannot split.
- `content/slides/index.ts`: `pageSlide` copies `section.background` onto each page slide.
- `components/stage/Stage.tsx`: renders `.stage__bg` (the slide's file, `cover`) and `.stage__grain` under the slide, and sets `--dpr`. It also preloads neighbouring backgrounds. `styles/components/page.css` and `intro.css` read `--slide-bg-image` instead of the fixed URLs.
- `styles/glass-tokens.css`: remove every `/backgrounds/glass-*` URL, `--intro-image` and `--intro-visual-image-*`. Add `--grain-opacity` and `--grain-blend`.
- `scripts/theme.mts`: `sync` copies `v5/f2.jpg` into both F2 apps and writes `public/theme/backgrounds.css` from the registry, one rule per id: `:root[data-section-bg="d1"] { --glass-frame-image: url(/backgrounds/v5/d1.jpg) }`.
- `scripts/grain.mts` (new) and `scripts/background-stats.mts` (new, `pnpm backgrounds`).
- `public/backgrounds/README.md`: rewritten for v5, with the generation date and the prompt per file.

### 4.2 How frames get their section background

- `components/page/PageFrame.tsx` adds `bg=<section.background>` to the frame URL beside `flags`.
- `lib/frames/compose.ts` accepts `bg` only when it is a registry id. It writes `data-section-bg` on `<html>` and links `/theme/backgrounds.css` right after the theme. With no inline style, the D5 CSP stays as it is.
- The frame body shows the section image aligned with the slide behind the card. Both slots start at stage x 65 and y 177 inside the card border, and the frame scale is 1.375. So `background-size` is 1396.36 by 785.45 frame px, `background-position` is -47.27 by -128.73 frame px, and `background-attachment` is fixed. The existing wash goes on top.
- `.page-frame` in `page.css` uses the same image and alignment in stage px for the strip a hook narrows (D2).
- The F2 apps write `data-section-bg="f2"` in their own layouts.

### 4.3 Overlay

- `lib/engine/protocol.ts`, `lib/engine/frame.ts`: version 2 and the types in 3.3.
- `lib/engine/settle.ts` (new): the state machine and constants.
- `components/page/Overlay.tsx`: per-corner radii, the merge rule, the gate for spotlights, callouts and the focus ring.
- `styles/components/page.css`: `.overlay__spotlight` drops its fixed `border-radius: 4px` and the `overlay-spot-in` keyframes. It gets `transition: opacity` with the two durations, keyed on `data-state`. The reduced-motion rule sets the duration to 0.
- `public/runtime/demo-runtime.js`: radii, `animating`, frame sampling, end-event posts.

### 4.4 Wrappers

- `lib/frames/types.ts`: `BuildManifest.shell` becomes `wrapper: { id: WrapperId; outside?: string[]; scrolls?: boolean }`. It is required on every frame build.
- `lib/frames/wrappers/<id>.ts` (new, one per wrapper in 2.2), plus `lib/frames/wrappers/index.ts`. Each one exports `render(fixtures): { before: string; after: string; styles: string[]; scripts: string[] }`. Compose inserts the shown markup between `before` and `after`, inside `<div class="wrap-shown" data-shown>`, as written and never reparsed. Ids in `outside` are lifted out after the wrapper, as `wrapInShell` does today.
- `public/wrappers/<id>.css` and, for D2 only, `public/wrappers/storefront-merch.js`. Scripts load as instrumentation, so `enhance-js` off never removes them.
- `lib/frames/shell.ts` is deleted. Its portal markup moves to `wrappers/portal-dashboard.ts`, where the nav links lose their `href`. `shell.context` and its tables go; each wrapper renders its own context.
- `demos/*/build.ts`: switch every `shell` to `wrapper`. Fold `public/portal/*.css` into the wrapper CSS, or keep a file as `styles` when it lays out shown markup.
- F2: in both apps, `components/portal-shell.tsx` becomes `components/storefront-shell.tsx`, used by `app/layout.tsx`.
- F3, F1, F4, F5: their static and terminal builds get `wrapper` entries. Their own CSS keeps only rules for shown markup.
- `fixtures/portal-context.json` grows to hold wrapper data: sibling orders, customer, case header, editor fields, CI run metadata.
- `scripts/theme.mts lint` also lints `public/wrappers/*.css` and the banned features per section.

### 4.5 Slides

Recommendation: move the opening and closing slides to native layouts. Do not edit the designed HTML.

Why:

- The designed files carry inline styles, uppercase tracked labels, raw colors and their own type sizes in nine places. Matching the glass system there means copying tokens by hand into each file, and they would drift.
- Native layouts reuse the chrome tokens, the background registry and the contrast test as they are.
- The validator can then check slide text against the writing rules. It cannot read inline-styled HTML reliably.
- `lib/designed.ts` guesses the footer tone from a hex color. That guess is wrong over images.

Layouts (new, in `components/layouts/glass/`, styled by `styles/components/slides-glass.css`):

| Layout | Used by |
|---|---|
| `glass-title` | `title` |
| `glass-grid` with variants `icons`, `portraits`, `numbered` | `the-mandate`, `three-reactions`, `open-web`, `what-we-cover`, `what-changed` |
| `glass-quotes` | `two-perspectives` |
| `glass-statement` | `keep-humanity` |
| `glass-people` | `people-to-follow` |
| `glass-closing` | `closing` |

Shared rules:

- Slalom Sans Regular and Bold. Margins of 64. Cards have radius 24, gaps of 32, and `--chrome-card-*` borders and shadows (light) or `--glass-dark-*` (dark).
- Type scale: eyebrow 28/36 Bold, title 64/72 Bold, intro title 88/96, body 36/50, card title 32/40 Bold, card body 24/32, meta 20/28. One added step, display 144/144 Bold, is used only for the title, the statement and the closing name.
- No uppercase or tracked text. Headings are in sentence case. Eyebrows use dark blue on light and cyan on dark.
- Text is carried over word for word, except where the writing rules require a change. The title eyebrow becomes "FITC Web Unleashed 2026, Toronto" in sentence case. Icons become Lucide equivalents, which the design spec names. Portraits stay in `/images/design/`.
- `content/slides/0*.ts` and `3*.ts` hold the content as typed data. `components/stage/SlideRouter.tsx` maps the new layouts.
- Delete `components/layouts/DesignedSlide.tsx`, `lib/designed.ts`, `styles/components/designed.css` and `content/designed/`.

### 4.6 Closing slide

`content/slides/34-closing.ts`: id `closing`, layout `glass-closing`, background `closing`, 0.25 minutes. Notes: "Leave this up during questions." The notes on `people-to-follow` no longer say it is the last slide.

```text
Region        x     y     w     h     Contents
------------  ----  ----  ----  ----  ---------------------------------------------------
Background    0     0     1920  1080  closing.jpg, grain overlay
Left panel    64    64    1072  952   glass-dark strong, radius 24; text group centered
  Eyebrow     128   auto  944   36    "Thank you", 28/36 Bold cyan
  Name        128   auto  944   128   "Bermon Painter", 120/128 Bold white, one line
  Role        128   auto  944   50    "Head of DXP and Commerce, Slalom", 36/50 #D6DCEC
  Link        128   auto  944   50    LinkedIn logo 40, 16 gap, "linkedin.com/in/bermonpainter" 36/50 Bold white
  Wordmark    128   904   216   56    Slalom wordmark, white
QR card       1200  182   656   716   solid white (--glass-surface-solid), radius 24, card shadow
  QR          1256  238   544   544   navy modules on white, quiet zone included
  Caption     1256  806   544   36    "Scan to open LinkedIn", 28/36 Bold navy, centered
```

- The gaps in the left group are 16 after the eyebrow, 24 after the name and 32 after the role.
- QR content: `https://www.linkedin.com/in/bermonpainter`, error correction M, quiet zone of 4 modules. Module size is a whole number of stage px, at least 12. The image is scaled to the largest whole module size that fits 544 px, and centered. It uses `shape-rendering="crispEdges"`.
- `scripts/qr.mts` writes `public/qr/linkedin.svg` with the `qrcode` npm package pinned to an exact version as a dev dependency. It runs in `predev` and `prebuild` and needs no network. The SVG is committed, and `pnpm check` fails if a fresh render differs.
- `public/logos/linkedin.svg` comes from LinkedIn's published brand assets, as a local file.
- The slide hides the footer and slide number.

### 4.7 Validator (`pnpm check`)

Add these rules. Each one fails unless marked as a warning.

- Every slide has a `background` that is in the registry. The file exists, is 1920 by 1080 (read from the JPEG header) and is 1.5 MB or less. Above 900 KB is a warning.
- Each registry id is used by exactly one non-demo slide or one section. Adjacent sections have different `lead` hues. All 26 file hashes differ.
- Nothing is left under `public/backgrounds/` except `v5/` and the README. No source file names a `glass-*.jpg`.
- `backgrounds.json`, `grain.png` and `linkedin.svg` match fresh output.
- Every frame build has a `wrapper` with a known id. Wrapper CSS and markup pass the rules in 2.1 and the banned list in 2.2. No shown file contains `wrap-`.
- The writing rules (PRD v4 5.2) apply to every opening and closing slide's text and notes. Slide CSS has no `text-transform: uppercase` and no positive `letter-spacing`.
- `test:validator` gets one broken fixture per new rule.

### 4.8 Walk (`pnpm walk`)

- It walks the whole deck in order: 7 opening slides, 27 demo pages and 3 closing slides, 37 in all.
- Every slide: the computed background matches the registry, the image has decoded before arrival, and the grain layer is present with the token opacity (audience window only).
- Background distinctness: the 16 by 9 thumbnails of every pair of required-unique files differ by a mean of at least 12 out of 255 per channel.
- Every frame: `data-section-bg` equals the section's id, and the background size and position match 4.2 within 0.5 px.
- Every frame at s0 and on the last step: exactly one `[data-shown]`. Every match of a shown CSS selector sits inside it. The tabbable sequence equals the shown sequence. The fill thresholds in 2.1 hold, and nothing scrolls unless `scrolls` is set.
- Spotlights: the tests in 3.4.
- Closing: the QR renders at a whole module size of at least 12 stage px, and the three text lines match 4.6.
- The v4 checks stay: asserts, digests, keyboard parity, intro tiles, speaker visibility at 1440 by 900.
- `pnpm visuals` and `pnpm capture` rerun after M5, because every intro still and poster changes.

## 5. Milestones

Build in this order. Every milestone ends with `pnpm validate` green and `pnpm walk` in Chromium at 0 failures. WebKit and Firefox walks run at M3 and M8.

**M0, baseline.** Rebase on the closed v4 fix round. Accept: `pnpm validate` and `pnpm walk` are green before any v5 change.

**M1, spotlight protocol.** Protocol v2, runtime radii and sampling, `settle.ts`, Overlay and CSS changes, unit test, fixture route. Accept: the tests in 3.4 pass. D2 s1 and s2 show no box out of place while the slot resizes.

**M2, backgrounds and grain.** Needs the 21 files. Registry, schema fields, stage layers, grain tile, `pnpm backgrounds`, frame alignment, the intro slide change from 1.6, removal of the old files. Accept: background rules in 4.7 and 4.8 pass. The contrast test passes over every text zone. No `glass-*.jpg` reference remains.

**M3, wrapper engine with D1 and D4.** Needs `docs/design/demo-wrappers-spec.md`. Types, compose injection, `wrappers/index.ts`, wrapper lint, walk checks, `order-queue`, and `portal-dashboard` with the shell deleted. Accept: D1 and D4 pass every wrapper check in Chromium, WebKit and Firefox. The D4 back and forward proofs still pass with the wrapper links inert.

**M4, wrappers for D2, D3, D5 and D6.** Accept: all wrapper checks pass. D5 enforces its CSP with no violation from the wrapper. D6 in Firefox still posts the color from a normal select.

**M5, wrappers for F1 to F5.** F2 storefront shell in both apps, F3 advisory feed and terminal window, F1, F4 and F5 wrappers. Accept: all wrapper checks pass. The F2 frame is still requested once per audience entry. `pnpm visuals` and `pnpm capture` are rerun and committed.

**M6, native opening and closing slides.** Layouts, content as data, designed files removed. Accept: all 9 slides render on their backgrounds. Writing and contrast rules pass. No uppercase or tracked text remains.

**M7, closing slide.** `34-closing.ts`, `qr.mts`, LinkedIn logo. Accept: the walk checks in 4.8 pass. Two phones scan the QR from the projector screen at the back of the room in rehearsal.

**M8, projector check and rehearsal.** Tune `--grain-opacity` and confirm wash strength and spotlight timing on the venue projector. Accept: the speaker signs off on grain, contrast and the fade. A full run with both windows has no forced spotlight in the rehearsal log.

## 6. RAID log

| Type | Item | Owner | Response |
|---|---|---|---|
| Risk | The v4 fix round and v5 edit the same files (runtime, `page.css`, Overlay). | Engineer | M0 rebases first. No v5 work starts on a dirty tree. |
| Risk | Grain bands or shimmers on the projector, or doubles up with the baked grain. | Design agent | One token, tuned in M8. Set it to 0 if the baked grain is enough. |
| Risk | Boxes stay hidden on content that keeps moving. | Engineer | The 2000 ms fail-safe and the rehearsal log. Infinite animations do not count as movement. |
| Risk | A wrapper element matches shown CSS or steals focus, which breaks a proof. | Engineer | Selector containment and the tabbable-sequence walk checks. |
| Risk | Wrapper links fire D4's navigate handler. Wrapper scripts break D5's CSP. | Engineer | No `href` in wrappers. No script in D5's wrapper. |
| Risk | A light background leaves white text on intro slides below 4.5:1. | Engineer | The dark text panel from 1.6 and the zone-based contrast test. |
| Assumption | The 21 files arrive at 1920 by 1080 with the tones in table 1.4. | Coordinator | Their report updates the table and registry in one commit. |
| Assumption | The venue output is 1920 by 1080. | Speaker | Confirm with FITC. The grain overlay stays crisp at other sizes anyway. |
| Issue | The opening slides add up to 6.5 minutes, but the demo clock starts at 5.0. The closing timing is off by 1.5 minutes. | Engineer | Open question 1. Fix the clock in M6. |
| Dependency | `docs/design/demo-wrappers-spec.md`, including the slides section. | Design agent | Needed before M3. M1 and M2 do not wait. |
| Dependency | The `qrcode` package and LinkedIn brand assets, fetched once at authoring time. | Engineer | Needed before M7. |

## 7. Open questions for the speaker

1. The opening slides add up to 6.5 minutes, but the demo section is timed to start at 5.0. Should we trim the opening to 5.0, or start the demo clock at 6.5 and cut 1.5 minutes from the section buffer? **Decided 28 October 2026: start the demo clock at 6.5. The demo pages run from 6.5 to 30.5, leaving 0.5 minutes of buffer, and the section still ends at 31.0.**
2. People photograph the first slide. Should the title slide also carry the LinkedIn QR code, small, in the lower right?
3. The closing slide eyebrow reads "Thank you". Do you want different words, or none?
4. Section intro slides will now sit on each section's light background, with their text in a dark glass panel. Do you want to see a fully light intro at the projector check as well?

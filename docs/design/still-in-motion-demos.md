# Still in motion: five full demos

The speaker asked to turn the five "Still in motion" tiles into full demos: "Let's expand these into full demos like the other sections. They're just too good to not include." This spec gives each feature the same three pages as D1 to D6: an intro slide, "How we used to do it" and "How we do it now". The F1 tile page stays as a short opener for the group.

Read with `docs/design/demo-flow-cx.md` (pace, notes pattern, step caps), `docs/PRD-demos-v5.md` (backgrounds, wrappers, spotlights), `docs/demo-engine.md` (actions, hooks, meters) and the two reference sections `content/sections/d3-support-form.ts` and `d6-variant-picker.ts`. Where this spec changes one of them, it says so.

## Evidence and its limits

- **Support data.** Checked on 28 October 2026 against the installed `web-features` 3.44.0, MDN's Firefox 159 release notes (27 October 2026), web.dev's Interop 2026 post, WebKit's Grid Lanes posts and Matuzović's Grid Lanes posts. Web sources are listed per demo under citations.
- **Data lag.** `web-features` 3.44.0 predates Firefox 159. It still shows Firefox missing for scroll-driven animations and scoped registries. See section 3.4.
- **Scenarios.** No audience research exists. The scenarios follow the deck's Ridgeline world and the product names already in the fixtures (Ridgeline Trail, Trail Runner 2, Rain shell, Day pack 22 L). They are assumption-based. Validate them in the same timed rehearsal the CX doc proposes.
- **Code and counts.** This spec names the code each step highlights. It does not write that code. Every meter value comes from `pnpm meters` once the builds exist. In bullets, `{n}` marks the count to fill in.

## Decisions at a glance

| Topic | Decision |
|---|---|
| Structure | Five new sections, M1 to M5, each with intro, used-to and now pages. The F1 tile page stays as a 0.5 minute opener. |
| Order | F1 opener, M1 anchor positioning, M2 Grid Lanes, M3 scoped registries, M4 scroll-driven animations, M5 cross-document view transitions, then F2. M5 lands on a storefront product page, which F2 picks up. |
| Budget per demo | Intro 0.25, used-to 0.5, now 1.25. Total 2.0 minutes. Now pages have 3 steps after s0, with the key step last. |
| Backgrounds | Each new section gets its own file, `m1.jpg` to `m5.jpg`. F1 keeps `f1.jpg`. This follows the v5 rule: one file per section, never shared. |
| Wrappers | Five new contextual wrappers, one per section. They follow every rule in PRD v5 2.1. |
| Split | M1, M2 and M5 use `split: "60/40"` (768 by 628 viewport), like D4 and D5, because the photo is the point. M3 and M4 keep 50/50 (640 by 628). Both pages of a section use the same split. |
| Talk browser | Chrome for all five. M2 needs Chrome's "CSS Grid Lanes Layout" flag on the talk laptop, or its Safari plan B. |
| Timing | The demo pages end at 40.0, not 30.5. The section ends at 40.5. The talk ends at 43.25, not 33.75. That adds 9.5 minutes. Section 10 has the cut order. |

## 1. The group

### 1.1 Ids and order

| Order | Section id | Label | Feature (eyebrow) | Demo folder | Background | Wrapper |
|---|---|---|---|---|---|---|
| 7 | `f1-still-in-motion` | Still in motion | none (single page) | `demos/08-fast-follows` | `f1` | `watch-list` |
| 8 | `m1-shop-the-look` | Shop the look | Anchor positioning | `demos/12-anchor-hotspots` | `m1` | `lookbook` |
| 9 | `m2-trail-photos` | Trail photos | Grid Lanes | `demos/13-grid-lanes` | `m2` | `product-photos` |
| 10 | `m3-pricing-app` | Pricing app | Scoped custom element registries | `demos/14-scoped-registries` | `m3` | `editor-pricing` |
| 11 | `m4-return-guide` | Return guide | Scroll-driven animations | `demos/15-scroll-driven` | `m4` | `help-center` |
| 12 | `m5-trail-gear-pages` | Trail gear pages | Cross-document view transitions | `demos/16-cross-document-vt` | `m5` | `storefront-catalog` |
| 13 to 16 | F2 to F5 | unchanged | | | | |

Why this order:

- **M1 first.** The room met anchoring in D1, where the menu used position area. M1 builds on it with flipping and following, so it is the easiest step from the core demos.
- **M2 and M3 in the middle.** They carry the most "still moving" risk: a flag for M2, and support that landed yesterday for M3.
- **M4 before M5.** Both are about motion. M4 is motion on one page. M5 is motion between pages.
- **M5 last.** It is the most visual of the five, and the CX doc's peak-end rule says the last demo is remembered best. It ends on a storefront product page, the page F2 opens on.

The fictional world: three storefront scenes (M1, M2, M5), the admin product editor (M3) and the support help center (M4). The order admin is not used. The D1 and D4 frames already live there.

### 1.2 Opener: F1 "Still in motion" (kept, shortened)

The tile page stays as the group's opener and its safety net. When a demo is cut, its tile still names it. Budget 0.5 minutes, down from 1.0. Page and frame are unchanged (`single`, 1304 by 628, `watch-list` wrapper). Steps drop from four to two.

**Tiles**, in demo order. Each tile has a feature name, a use and a wait signal. Update `demos/08-fast-follows/static/index.html`:

| Tile id | Feature | Use | Wait for |
|---|---|---|---|
| `tile-anchor` | Anchor positioning | Hotspots and tooltips | Arrow and visibility details |
| `tile-grid-lanes` | Grid Lanes | Masonry walls | Chrome and Firefox |
| `tile-scoped-registries` | Scoped custom element registries | Two component versions | Older browsers to age out |
| `tile-scroll-driven` | Scroll-driven animations | Progress and reveals | Older browsers to age out |
| `tile-xdoc-vt` | Cross-document view transitions | Page-to-page motion | Firefox |

The heading stays "Worth a prototype, not yet a default". The rule stays "Prototype. Verify. Promote." The watch-list wrapper's date comes from `fixtures/portal-context.json` as now.

**Copy.** Title "Still in motion". Badge "A wait signal on each tile".

- Intro: "The six demos so far are safe to ship. The next five are close, but still moving. We will try each one."
- s0 "Empty grid". Actions: hook `reset`. No bullets.
- s1 "Reveal the tiles". Actions: reveal the five tiles in table order, with a 150 ms wait between them. No spotlight, because five targets exceed the cap of two.
  - "Each tile names a use and what we are waiting for."
- s2 "The rule" `key`. Actions: reveal `#rule`. Spotlight `#rule`.
  - "Prototype now. Check Baseline and Interop before you ship."
  - "Baseline means all major browsers support it. Interop is their shared yearly test plan."

56 words. The budget at 0.5 minutes is 65. The F1 citations keep the Interop 2026 and Baseline links. Move the Grid Lanes links to M2.

## 2. Backgrounds

Recommendation: five new files. Do not share `f1.jpg`.

- PRD v5 1.3 rule 4 says no file is used by two sections. Each new demo is its own `DemoSection`, so sharing would break the rule and the validator.
- Distinct backgrounds also help the room. A change of field marks a new demo, which matters when six similar pages run back to back.

Generate them with Higgsfield (Soul v2), to the PRD v5 1.1 delivery rules: 1920 by 1080 JPEG, fine grain baked in, light tone, the band from y 0 to 168 pale and low in chroma. Neighbors never share a lead hue. F1 leads with chartreuse, F2 with warm grey.

| Id | File | Palette direction (lead hue first) | Tone | Registry entry |
|---|---|---|---|---|
| `m1` | `m1.jpg` | Lavender upper left, pale yellow center, soft cyan lower right, cream base. | light | `section("m1.jpg", "lavender", ["yellow", "cyan", "cream"])` |
| `m2` | `m2.jpg` | Pale yellow and cream field, orange glow lower left, lilac haze on the right. | light | `section("m2.jpg", "yellow", ["cream", "orange", "lilac"])` |
| `m3` | `m3.jpg` | Blush pink upper right, pale blue on the left, peach along the bottom. | light | `section("m3.jpg", "pink", ["pale-blue", "peach"])` |
| `m4` | `m4.jpg` | Pale cyan top, mint center, cobalt haze along the bottom. | light | `section("m4.jpg", "cyan", ["mint", "cobalt"])` |
| `m5` | `m5.jpg` | White top band, coral glow upper left, peach center, purple along the bottom. | light | `section("m5.jpg", "coral", ["peach", "purple"])` |

All hues already exist in `Hue`. The registry grows from 21 to 26 entries. Update every count that says 21: PRD v5 4.7, the validator's uniqueness rule and `public/backgrounds/README.md`. Add the prompts to the README. Then rerun `pnpm backgrounds` and `pnpm test:contrast`.

## 3. Shared engineering changes

These come first. Each demo below names the ones it needs.

### 3.1 Schema and content

- `content/sections/index.ts`: import M1 to M5 and place them after F1 in the order of 1.1. Set `DEMO_SECTION_END` to 40.5.
- `lib/validate/timing.ts`: change F1 to `[0.5]`. Add M1 to M5 at `[0.25, 0.5, 1.25]` each. Set `LAST_PAGE_BY` to 40.5. Replace the cut order comment with section 10.
- `order` fields: F2 becomes 13, F3 14, F4 15, F5 16.
- `cutPriority` (on each page of a section): F5 1, F4 2, M1 3, M3 4, M2 5, M4 6. M5 and the F1 opener get none.
- Walk counts: 7 opening slides, 42 demo pages and 3 closing slides, 52 in all. Today it is 37.

### 3.2 Support tiles read one compat key set (M1)

`lib/support-data.ts` builds tiles from `feature.status.support`. For `anchor-positioning`, 3.44.0 lists Safari 27 only. That is because two `position-visibility` values ship only in Safari 27. The intro slide would show Chrome, Edge and Firefox as "Not yet", which is wrong for the parts M1 uses.

Add an optional field to the web-features `SupportSource`:

- `compatKeys?: string[]`. When set, each browser's tile shows the highest version across those keys in `status.by_compat_key`. The since sentence uses the latest `baseline_low_date` among them.
- M1 sets `["css.properties.anchor-name", "css.properties.position-area", "css.properties.position-try-fallbacks"]`. That gives Chrome 129, Edge 129, Firefox 147 and Safari 26, with a since date of January 2026.
- `test:support` gets one fixture for the new field. Put the whole-feature status in M1's Reference drawer, so leads can see it.

### 3.3 Cross-document navigation in a frame (M5)

Every walk step so far ran in one document. M5 navigates between two real pages.

- **Both pages are composed.** `nativeBuild` and `folderBuild` gain a `pages` list (for example `["index.html", "product.html"]`). Each page gets the theme, the wrapper, the runtime and instrumentation, exactly like the entry page. The wrapper markup must be identical on both pages.
- **`Step.route?: string`** (new, optional): the document a step ends on. Instant replay mounts that route, with no transition, then runs the step's non-navigating actions. The forward run keeps the real navigation, so the transition plays.
- **Runtime continuation.** When a step's last action is a navigation, the runtime in the new document reads the pending step from `sessionStorage`, then posts `step-done`. The presenter must not treat that load as a fresh mount.
- **Back.** `navigate` with `history: "back"` already exists. The frame's own entry count covers real loads.
- **Spike first** (section 9, S0): confirm a cross-document view transition plays inside the deck's sandboxed, cross-origin frame, in Chrome and Safari. If it does not, plan B is in M5.

### 3.4 Support data refresh (M3, M4)

Firefox 159 shipped scroll-driven animations and scoped custom element registries on 27 October 2026. Both are now Baseline Newly available.

- Bump `web-features` in the talk week to the first release that records Firefox 159. Then run `pnpm support`.
- Until then, M3 and M4 need `fallback` entries so the validator passes. Remove them after the bump. M3: `{ missing: ["firefox"], text: "the iframe version" }`. M4: `{ missing: ["firefox"], text: "the article with no animation" }`.
- Decision for the speaker: if no release lands before the talk, show the tiles as generated, or allow a one-line override with a citation (section 11).

### 3.5 Runtime and walk

- **`animating` ignores scroll timelines (M4).** Animations on a `ScrollTimeline` or `ViewTimeline` report as running for as long as they exist. If they count, `animating` never turns off, every spotlight is forced after 2000 ms and the walk fails. Count only animations whose timeline is the document timeline, or a view transition.
- **No scroll action.** Scrolling stays a hook, to keep the action vocabulary fixed. M4's hooks are in its section. Instant replay sets `scrollTop` with no smooth scroll.
- **Inner scroll panes are fine.** `scripts/walk-wrapper.mts` checks only the document's scroll size. M4 scrolls a pane inside the shown markup, so no `scrolls` exception is needed.
- **Grid Lanes in the Chromium walk (M2).** Launch Chromium with the switch behind the "CSS Grid Lanes Layout" flag. Look up the exact switch in the talk week's Chrome and record it in the walk scripts. The walk asserts `CSS.supports("display", "grid-lanes")` inside the M2 now frame.
- **Meters with no JavaScript.** M1, M4 and M5 now pages ship no JavaScript. `pnpm meters` must write `"0 lines"` for an empty file set. The CX rule puts the now-page meter on the JavaScript step. These pages have none, so their meter goes on the key step.
- **Nested frame (M3 used-to).** The used-to page shows an iframe inside the demo frame. Compose the inner `app.html` with the theme only: no runtime, no wrapper, no flag scripts. Hooks reach it through `contentDocument`, which works because it shares the frame's origin.

### 3.6 Imagery

Real product UI needs real-looking photos. Only D6's Trail Runner 2 color images exist so far (`public/wrappers/trail-runner-2-*.webp`). Brief the design agent (design-imagery) for one set made with Higgsfield. Use no logos, no readable text and no faces in focus.

- M1: one lifestyle photo, 3 to 2, a hiker on a ridge in a rain shell, a day pack and trail shoes.
- M2: 18 customer photos in mixed shapes (tall, square, wide): trails, camps, boots on rock, a pack on a summit cairn.
- M5: six product photos on a plain light field: Ridgeline Trail shoe, Trail jacket, Rain shell, Day pack 22 L, Trekking poles, Headlamp.

Store them under `public/demo-assets/`. Product names, prices and ratings come from fixtures, never typed into wrappers (PRD v5 2.1 rule 7). Add `fixtures/storefront-catalog.json` (the six products) and `fixtures/trail-photos.json` (18 photo entries: file, alt text, caption, reviewer first name).

## 4. M1 Anchor positioning: "Shop the look"

### Scenario

The storefront home page has a "Shop the look" photo of a hiker. Three round pins sit on the rain shell, the day pack and the trail shoes. Pressing a pin opens a product card beside it, with a photo, name, price and an "Add to cart" button. The shoe pin sits near the right edge, so its card has to open on the left. The photo narrows on small screens, and the open card must stay with its pin.

D1 placed a menu below its button. M1 shows the hard part teams paid for: flipping at an edge, and following when the layout changes.

### Wrapper `lookbook`

A storefront home page. Store header strip with the name, static nav words (Packs, Jackets, Footwear) and a cart count. A season line, "Fall 2026: built for the ridge". The shown look. A static row of three "More looks" thumbnails. Must never use: `anchor-name`, `position-anchor`, `position-area`, `position-try`, `anchor()`, `popover`, `command`, `commandfor`, or any positioning script.

### Support, as of 28 October 2026

- **Core.** Chrome 125 (position area 129), Edge 125, Firefox 147, Safari 26. Baseline Newly available since 13 January 2026, when Firefox 147 shipped. An Interop 2026 focus area that carries the 2025 tests forward.
- **Still moving.** `web-features` marks the whole feature "not yet Baseline". Two `position-visibility` values ship only in Safari 27. It records `position-anchor` support from Chrome 151, Firefox 151 and Safari 27, later than the rest. Safari 26.2 renamed the self-alignment keywords. The arrow flip in this demo uses anchored container queries, which only Chrome has (143 and later). Widely available is expected around July 2028.
- **Talk browser.** Chrome. The arrow flip needs Chrome 143 or later.
- **Fallback in the frame.** All anchor rules sit inside `@supports (anchor-name: --a)`. Without support, each card opens as a plain popover in the center of the photo. It still opens, closes with Escape and returns focus. In Safari and Firefox, the card is placed and flips, but has no arrow.
- **Intro tiles.** Use `compatKeys` (3.2). `alsoUses: ["popover", "invoker-commands"]`.

### Intro page (0.25 min)

- Intro: "Next is a storefront photo you can shop. Each pin opens a product card beside it. Near an edge, the card has to move."
- Description: "Anchor positioning places an element beside another one and moves it when space runs out."
- Visual: capture `m1-now` s2, the shoe card open on the left. Alt: "The shop the look photo with a product card open to the left of the shoe pin."

### Used to (0.5 min)

The today build matches what teams commonly ship with a positioning library: a `computePosition` with offset, flip and shift, and an auto-update that listens for scroll and resize. Write it by hand, modeled on Floating UI's API, so the meter counts code we can show. Put the library's real size in the Reference drawer.

Frame `demos/12-anchor-hotspots/today`, `split: "60/40"`, viewport 768 by 628, hooks `reset`. Files, as excerpts:

- `index.html`: the three pin buttons with `aria-expanded` and `aria-controls`, and the empty `#t-float-root` at the end of the body.
- `styles.css`: the card's `position: absolute`, top and left at 0, `z-index`, and one arrow class per side.
- `position.js`: the measure, flip and shift logic and the auto-update listeners.
- `hotspots.js`: open, close, outside click, Escape and focus return.

Intro: "Each pin opens a product card. Script decides where it fits."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | The scripted look | none | `index.html`, no lines | none |
| s1 | Open the shell card | pointer to `#t-pin-shell`, click it, assert `#t-card-shell` visible | `index.html`: the pin buttons and the empty float root (12 lines at most) | `#t-pin-shell`, `#t-card-shell` |
| s2 | Open the shoe card | pointer to `#t-pin-shoe`, click it, assert `#t-card-shoe` has `data-side=left` | `styles.css`: the absolute card, the z-index and the per-side arrow classes | `#t-pin-shoe`, `#t-card-shoe` |
| s3 `key` | Narrow the photo | resize `#t-look` to `72%` | `position.js`: the flip check and the scroll and resize listeners | `#t-pin-shoe`, `#t-card-shoe` |

Bullets:

- s1: "The shell pin opens its card. The card sits in a box at the page end."
- s2: "The shoe pin is near the edge, so the card flips left. CSS keeps a class per side."
- s3: "The photo narrows, and the card follows." / "Script checks each edge and reacts to every scroll and resize: {n} lines."

Meter on s3: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in /demos/12-anchor-hotspots/today/*.js". 65 words, at the budget of 65.

### Now (1.25 min)

The cards are popovers opened by `command="toggle-popover"` buttons. Each pin has an `anchor-name`. Each card has a `position-anchor`, a `position-area` on the inline end, and `position-try-fallbacks: flip-inline, flip-block`. An `inset: auto` reset comes first. The arrow lives in a `@supports (container-type: anchored)` block. It uses an anchored container query to point the right way after a flip. No JavaScript.

Frame `native`, `split: "60/40"`, viewport 768 by 628, flags `{ "enhance-css": true }`, hooks `reset`. Files: `index.html`, `look.css`. Two files are enough, and no JavaScript file exists.

Intro: "This is the same photo with no positioning script. Each card is a popover tied to its pin."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | Same look | none | `index.html`, no lines | none |
| s1 | Open the shell card | pointer to `#pin-shell`, click it, assert `#card-shell` `:popover-open` | `look.css`: `anchor-name` on the pins, `position-anchor` and `position-area` on the card (10 lines at most) | `#pin-shell`, `#card-shell` |
| s2 | Open the shoe card | pointer to `#pin-shoe`, click it, assert `#card-shoe` `:popover-open` | `look.css`: `position-try-fallbacks` and the anchored arrow block | `#pin-shoe`, `#card-shoe` |
| s3 `key` | Narrow the photo | resize `#look` to `72%`, assert `#card-shoe` `:popover-open` | `look.css`: the card rule as a whole, showing no listener and no script | `#pin-shoe`, `#card-shoe` |

Bullets:

- s1: "The shell pin opens its card on the right." / "Anchor name marks the pin. Position anchor ties the card to it." / "Position area picks the side of the pin."
- s2: "The shoe pin is near the edge, so the card opens on the left." / "Position try fallbacks lists other sides to try when one does not fit." / "Chrome flips the arrow too. Other browsers hide it for now."
- s3: "The photo narrows. The open card stays beside its pin." / "The browser places it again after every layout change." / "We wrote no measuring code and no listeners."

Meter on s3: `JavaScript`, `0 lines`, source "non-blank, non-comment lines in content/sections/m1-shop-the-look/files/*.js".

`ifKeyboard` on s1 and s2: "Click the pin. Then press Next once to sync the frame." 112 words, budget 162.

**Cautions** (speaker window, last step):

- "Without support, the card opens centered over the photo. Check that it still works."
- "Test zoom and small screens. A card with no room can cover its pin."
- "Arrow flips and position visibility still differ by browser. Check each one."

**Citations:** Comeau, Getting started with anchor positioning (6 Jul 2026, updated 20 Oct 2026); Yitbarek, A gentle introduction to anchor positioning (WebKit, Aug 2025); web.dev, January 2026 platform update (Firefox 147); Chrome, Anchored container queries (29 Oct 2025); Interop 2026 (anchor positioning focus area); Floating UI docs for `computePosition` and `autoUpdate`; Bundlephobia for `@floating-ui/dom`, pulled the week of the talk; webstatus.dev anchor positioning, showing the whole-feature status.

## 5. M2 Grid Lanes: "From the trail"

### Scenario

The Ridgeline Trail product page has a "From the trail" section. Customers post photos and short quotes. Photos are tall, square or wide, and quotes are short. The wall should pack them with no ragged gaps. "Show more" adds six more. The page must reflow when the window narrows.

### Wrapper `product-photos`

The top of the Ridgeline Trail product page. Image, name, price and rating summary from `fixtures/portal-context.json` and `trail-photos.json`, a static "Add to cart" look-alike (no control), then the heading "From the trail" over the shown wall. Must never use: `grid-lanes`, `masonry`, multi-column layout, or any layout script.

### Support, as of 28 October 2026

- **Stable.** Safari 26.4 and later (24 March 2026). Not Baseline. Not an Interop 2026 focus area.
- **Behind a flag.** Chrome and Edge, as "CSS Grid Lanes Layout" in `chrome://flags`. Chromium first tried an older syntax in Chrome 140. Matuzović reported in June 2026 that flagged Chromium renders Grid Lanes.
- **Firefox.** Firefox 159 removed its old masonry syntax. `web-features` 3.44.0 lists no Firefox support for `display: grid-lanes`.
- **Still moving.** The CSS Working Group settled the name in January 2026. Safari 27.2 renamed `flow-tolerance` to `fit-tolerance`. Keyboard focus order across lanes is an open accessibility problem.
- **Talk browser.** Chrome with the flag on, checked in rehearsal (S0). Plan B, if the flagged build misrenders: a `showSafari` hook. It swaps the frame for a capture of the same steps from Safari 27.2, like D6's Firefox capture. Record it with `pnpm walk m2 --browser=webkit --capture` if Playwright's WebKit has the feature. If not, record it from Safari by hand.
- **Fallback in the frame.** The wall declares `display: grid` and then `display: grid-lanes`, so browsers without support keep a regular grid. An `@supports not (display: grid-lanes)` block crops every photo to one height, with `object-fit: cover` and quotes clamped to four lines, so the fallback grid stays tidy.
- **Intro tiles.** `support: { kind: "web-features", id: "grid-lanes", fallback: { missing: ["chrome", "edge", "firefox"], text: "a regular grid" } }`. The generated sentence will name Safari only. The speaker says the flag part aloud.

### Intro page (0.25 min)

- Intro: "Next is a product page with customer photos. Photos and quotes have different heights. We want them packed with no gaps."
- Description: "Grid Lanes packs items of different heights into columns, like a masonry wall."
- Visual: capture `m2-now` s2. Alt: "A packed wall of customer trail photos and quotes in three lanes."

### Used to (0.5 min)

The today build matches the Masonry.js pattern. Every item is absolutely positioned. Script waits for images, measures each item, puts it in the shortest column and sets the wall's height. It runs again on resize, debounced, and after "Show more".

Frame `demos/13-grid-lanes/today`, `split: "60/40"`, viewport 768 by 628, hooks `reset`, `loadPhotos`. `loadPhotos` releases the 12 starting images with short delays, so the room sees the stack before the layout runs. Files:

- `index.html`: the wall of figures and the script tags.
- `styles.css`: the relative wall, the absolute items and the fixed item width.
- `masonry.js`: the shortest-column loop, the height bookkeeping and the debounced resize listener.
- `app.js`: "Show more", which appends and calls layout again.

Intro: "Customer photos sit in a packed wall. Script places every item."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | The scripted wall | none (items unplaced) | `index.html`, no lines | none |
| s1 | Place the photos | hook `loadPhotos`, wait 600, assert `#t-wall` has `data-laid-out` | `index.html`: the figures and the script tags | `#t-wall` |
| s2 | Show more photos | pointer to `#t-more`, click it, wait 500 | `styles.css`: the absolute items and the fixed width | `#t-more`, `#t-wall` |
| s3 `key` | Narrow the page | resize `#t-wall` to `66%`, wait 400 | `masonry.js`: the column loop and the resize listener | `#t-wall` |

Bullets:

- s1: "The photos load in a stack. Then script moves each one into place."
- s2: "Show more adds six photos. Every item is absolute, so CSS cannot place it."
- s3: "The page narrows. The wall rebuilds after a pause." / "Script measures every item and tracks each column: {n} lines."

Meter on s3: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in /demos/13-grid-lanes/today/*.js". 57 words.

### Now (1.25 min)

Like D6, the page starts plain. s0 shows the fallback every browser without Grid Lanes gets. s1 turns the enhancement on.

The wall CSS: `display: grid` then `display: grid-lanes`, `grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr))` and a gap. Put the Grid Lanes lines in the enhancement block, so the `enhance-css` flag toggles them. Do not use `fit-tolerance` or `flow-tolerance` in the shown code. Their names are still moving. `app.js` fetches six more figures as an HTML fragment and appends them.

Frame `native`, `split: "60/40"`, viewport 768 by 628, flags `{ "enhance-css": false, "enhance-js": true }`, hooks `reset`, `showSafari`. Files: `index.html`, `wall.css`, `app.js`.

Intro: "This is the same wall with no layout script. It starts as a regular grid. Most browsers show that."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | Regular grid | none | `index.html`, no lines | none |
| s1 | Turn on Grid Lanes | toggle `enhance-css` on, assert `#wall` style `display=grid-lanes` | `wall.css`: the two display lines and the column template | `#wall` |
| s2 | Show more photos | pointer to `#more`, click it, wait 400, assert `#wall figure` count 18 | `app.js`: the fetch and append (12 lines at most) | `#more`, `#wall` |
| s3 `key` | Narrow the page | resize `#wall` to `66%` | `wall.css`: `repeat(auto-fill, minmax(...))` and the gap | `#wall` |

Bullets:

- s1: "One display value packs the photos into lanes. The gaps close." / "Browsers that do not know grid lanes keep display grid." / "Each photo goes to the lane with the most room."
- s2: "Show more adds six photos. They fill the shortest lanes." / "The only script fetches the photos. It never measures them."
- s3: "The page narrows, and the wall reflows with no pause." / "Auto fill picks the number of lanes from the width." / "The browser does the packing. We deleted the layout script."

Meter on s2, the JavaScript step: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in content/sections/m2-trail-photos/files/*.js". 100 words.

Figures are not focusable. That keeps the tab order to "Show more" alone and avoids the open focus-order problem on stage.

**Cautions:**

- "Focus moves in source order across lanes. Test with a keyboard first."
- "Safari 27.2 renamed flow tolerance to fit tolerance. Expect more renames."
- "Crop items to one height in the fallback, so the regular grid stays tidy."

**Citations:** Simmons, Etemad and Stewart, Introducing CSS Grid Lanes (19 Dec 2025); Simmons, When will CSS Grid Lanes arrive? (22 Jan 2026); WebKit features for Safari 27.2 (26 Oct 2026, the tolerance rename); Matuzović, Progressively enhancing Grid Lanes (30 Jun 2026); Matuzović, Your Grid Lanes will likely fail WCAG 2.4.3 (24 Jun 2026); Keith, Enhancing with CSS Grid Lanes (16 Jun 2026); MDN, Firefox 159 release notes (old masonry syntax removed); Masonry.js documentation. Move the Grid Lanes links from D6 and F1 here.

## 6. M3 Scoped custom element registries: the pricing app

### Scenario

The admin product editor for Trail Runner 2 has a Pricing tab. The editor is built on Ridgeline's design system, Ridge UI, version 2, with its `<ridge-price-field>`. The merchandising team built a "Tiered pricing" app on Ridge UI version 3. It defines its own `<ridge-price-field>`, with a currency chip. Both must run on the Pricing tab. A tag name can be defined only once per page, so the second define throws, and the app stays blank.

### Wrapper `editor-pricing`

The D6 product editor, on a different tab. Editor header with Trail Runner 2, the Draft chip and SKU from `fixtures/portal-context.json`. A static tab strip (Details, Pricing active, Variants, Media) and a static "Sales channels" card. Must never use: `customElements`, `CustomElementRegistry`, `attachShadow`, an `iframe`, or any wrapper script.

Ridge UI v2 and v3 are unshown modules (`native-extra/ridge-ui-v2.js`, `ridge-ui-v3.js`), loaded as instrumentation in both builds. Version 2 renders its input in light DOM, so the `type` action can reach `#base-price input`. Version 3 shows a small "v3" badge and a currency chip, so the room can see which version is which.

### Support, as of 28 October 2026

- **Shipped.** Chrome 146, Edge 146, Safari 26, Firefox 159 (27 October 2026). Baseline Newly available since 27 October 2026. An Interop 2026 focus area. Widely available is expected around April 2029.
- **Still moving.** Firefox shipped it yesterday, so many users still run browsers without it. Component libraries and the declarative shadow DOM path are still catching up. Check your library before you rely on it. `web-features` 3.44.0 does not yet record Firefox 159 (3.4).
- **Talk browser.** Chrome 146 or later.
- **Fallback in the frame.** `pricing-app.js` tries `new CustomElementRegistry()`. Older browsers throw "Illegal constructor". In that case the host loads the iframe build from the used-to page. The app still works, with the iframe's fixed height.

### Intro page (0.25 min)

- Intro: "Next is the product editor's pricing tab. Another team's pricing app plugs into it. Both use our price field, in different versions."
- Description: "Scoped registries let two versions of the same custom element run on one page."
- Visual: capture `m3-now` s1. Alt: "The product editor pricing tab with the tiered pricing app inline below the base price."

### Used to (0.5 min)

Teams had two ways out: rebuild one version with a renamed tag prefix, or put the app in an iframe. The today build uses the iframe, because the room can see its costs: a fixed height, styles loaded twice and a message bridge.

Frame `demos/14-scoped-registries/today`, viewport 640 by 628, hooks `reset`, `loadApp`, `addTier`. `addTier` presses "Add tier" inside the iframe. Files:

- `index.html`: the editor's base price field and the sandboxed iframe with a fixed height.
- `styles.css`: the iframe's fixed height and the border reset.
- `bridge.js`: `postMessage` out, the message listener, the origin check and the resize message the app sends.
- `app-bridge.js`: the app side of the same bridge.

Intro: "The editor and a pricing app both use the price field. They need different versions."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | The framed app | none | `index.html`, no lines | none |
| s1 | Load the pricing app | hook `loadApp`, wait 400, assert `#t-app-frame` visible | `index.html`: the iframe element | `#t-app-frame` |
| s2 | Add a tier | hook `addTier`, wait 300 | `styles.css`: the fixed height | `#t-app-frame` |
| s3 `key` | Change the base price | type `148` into `#t-base-price input`, wait 300 | `bridge.js`: the post, the listener and the origin check | `#t-base-price`, `#t-app-frame` |

Bullets:

- s1: "A tag name can be defined once per page. So the app runs in an iframe."
- s2: "Add tier grows the app. The iframe keeps its fixed height and scrolls."
- s3: "A new base price reaches the app as a message." / "Script sends messages both ways and checks each origin: {n} lines."

Meter on s3: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in /demos/14-scoped-registries/today/*.js". Count the bridge only. The design-system modules are the same in both builds. 65 words, at the budget.

### Now (1.25 min)

`pricing-app.js` defines `<pricing-app>` in the global registry. In its constructor it creates `new CustomElementRegistry()`, defines Ridge UI v3's price field there, and attaches its shadow root with `customElementRegistry` set to that registry. It listens for the editor's `price-change` event on the document and updates the tiers.

Frame `native`, viewport 640 by 628, flags `{ "enhance-js": true }`, hooks `reset`, `loadApp`, `addTier`. `addTier` presses the button in the app's open shadow root. Files: `index.html`, `pricing-app.js`.

Intro: "This is the same editor with no iframe. The app brings its own registry."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | Same editor | none | `index.html`, no lines | none |
| s1 | Load the pricing app | hook `loadApp`, wait 300, assert `#pricing-app` visible | `pricing-app.js`: `new CustomElementRegistry()` and the define call | `#pricing-app` |
| s2 | Add a tier | hook `addTier`, wait 300 | `pricing-app.js`: `attachShadow` with `customElementRegistry` | `#pricing-app` |
| s3 `key` | Change the base price | type `148` into `#base-price input`, wait 300, assert `#pricing-app` contains `148` | `pricing-app.js`: the event listener | `#base-price`, `#pricing-app` |

Bullets:

- s1: "The pricing app loads inside the page with version 3 fields." / "A registry maps tag names to components. The app creates its own." / "The editor's price field is still version 2."
- s2: "Add tier grows the app, and the page makes room." / "A shadow root is a component's private markup." / "This one uses the app's registry. Both versions work side by side."
- s3: "A new base price updates every tier." / "The app hears a normal DOM event. No messages, no origin checks." / "Two versions share one page. We deleted the iframe and the bridge."

Meter on s3: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in content/sections/m3-pricing-app/files/*.js". 106 words.

New terms in this demo: registry, shadow root. Custom element is assumed known. Define it on the intro slide if the rehearsal shows otherwise.

**Cautions:**

- "Older browsers throw on the registry constructor. Keep the iframe build as a fallback."
- "Each version ships its own code. Two versions make a heavier page."
- "Use this to buy time. Plan to move both teams to one version."

**Citations:** MDN, Firefox 159 release notes (scoped registries, 27 Oct 2026); Interop 2026 (scoped custom element registries focus area); Chrome for Developers, Scoped custom element registries; WebKit features for Safari 26.0; Binvisions, Firefox just caught up (22 Aug 2026); webstatus.dev scoped custom element registries.

## 7. M4 Scroll-driven animations: the return guide

### Scenario

The Ridgeline help center has an article, "How to return an item", with five numbered steps and the 30-day window from `fixtures/portal-context.json`. A thin bar at the top of the article shows how far you have read. Each step card fades and slides up as it enters the pane. Help centers also load chat widgets and analytics, so the page is often busy while people scroll.

### Wrapper `help-center`

The customer help center. Header with "Ridgeline Help" and a static search look-alike (no form control). A breadcrumb in plain text, "Help, Orders, Returns". The shown article pane. A "Still need help?" card with support hours. Must never use: `animation-timeline`, `scroll-timeline`, `view-timeline`, `animation-range`, scroll listeners, `IntersectionObserver`, or any wrapper script.

### Support, as of 28 October 2026

- **Shipped.** Chrome 115, Edge 115, Safari 26, Firefox 159 (27 October 2026). Baseline Newly available since 27 October 2026. An Interop 2026 focus area covering `animation-timeline`, `scroll-timeline` and `view-timeline`. Widely available is expected around April 2029.
- **Still moving.** Firefox shipped it yesterday. Related features, such as scroll-triggered animations and scroll-state queries, are still Chrome first. `web-features` 3.44.0 does not yet record Firefox 159 (3.4).
- **Talk browser.** Chrome.
- **Fallback in the frame.** All motion sits inside `@supports (animation-timeline: scroll())` and `@media (prefers-reduced-motion: no-preference)`. Without support, the bar is hidden and the step cards show at rest. The article reads the same.

### Hooks

- `scrollArticle(fraction)`: smooth-scrolls `#article` (or `#t-article`) to that fraction of its scroll range. Instant replay jumps there.
- `busyScroll(fraction, blockMs)`: shows an unshown "Busy page" chip in the frame and waits one frame so it paints. Then it starts the smooth scroll and blocks the main thread for `blockMs` (1200) with a busy loop. The chip goes away after.
- Instrumentation, in `native-extra/hooks.js` and the today folder's hook file. Never shown.

### Intro page (0.25 min)

- Intro: "Next is a help article about returns. A bar shows how far you have read. Each step slides in as it arrives."
- Description: "Scroll-driven animations link an animation to scrolling, so progress bars and reveals need no script."
- Visual: capture `m4-now` s2. Alt: "The return guide with the reading bar part way and step 3 sliding in."

### Used to (0.5 min)

The today build matches common code: a passive scroll listener that schedules `requestAnimationFrame`, reads `scrollTop` and the scroll height, and sets the bar's `transform`. An `IntersectionObserver` adds an `is-visible` class to each step.

Frame `demos/15-scroll-driven/today`, viewport 640 by 628, hooks `reset`, `scrollArticle`, `busyScroll`. Files:

- `index.html`: the bar, the step cards with `data-reveal`, and the script tags.
- `styles.css`: the hidden step state and the `is-visible` transition.
- `progress.js`: the listener, the frame request and the scale math.
- `reveal.js`: the observer.

Intro: "This help article tracks reading progress. Script listens to every scroll."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | The scripted article | none | `index.html`, no lines | none |
| s1 | Scroll the article | hook `scrollArticle` with `[0.4]`, wait 700 | `index.html`: the bar and the `data-reveal` cards | `#t-progress` (the track) |
| s2 | Reveal a step | hook `scrollArticle` with `[0.7]`, wait 700 | `styles.css`: the hidden state and the class transition | `#t-step-3` |
| s3 `key` | Scroll a busy page | hook `busyScroll` with `[1, 1200]`, wait 1600 | `progress.js`: the listener and the scale math | `#t-progress` |

Bullets:

- s1: "The bar grows as we scroll. Script sets its width on every scroll event."
- s2: "Step 3 fades in. CSS waits for script to add a class."
- s3: "Now the page is busy. The bar stalls, then jumps." / "Every frame of progress waits for script: {n} lines."

Meter on s3: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in /demos/15-scroll-driven/today/*.js", counting `progress.js` and `reveal.js`. Keep the hook file out of the count. 56 words.

### Now (1.25 min)

`article.css` gives the bar `animation: grow linear both` and `animation-timeline: scroll()`, with keyframes that scale it from 0 to 1 on the inline axis. Each step card gets `animation-timeline: view()` and an `animation-range` from entry to about 30 percent cover. It animates `opacity` and `translate` only, so the browser can run it off the main thread. Everything sits in the guards described under Fallback. No JavaScript.

Frame `native`, viewport 640 by 628, flags `{ "enhance-css": true }`, hooks `reset`, `scrollArticle`, `busyScroll`. Files: `index.html`, `article.css`.

Intro: "This is the same article with no scroll script. CSS links each animation to the scroll position."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | Same article | none | `index.html`, no lines | none |
| s1 | Scroll the article | hook `scrollArticle` with `[0.4]`, wait 700 | `article.css`: the bar's animation, timeline and keyframes | `#progress` (the track) |
| s2 | Reveal a step | hook `scrollArticle` with `[0.7]`, wait 700 | `article.css`: `view()`, `animation-range` and the reduced-motion guard | `#step-3` |
| s3 `key` | Scroll a busy page | hook `busyScroll` with `[1, 1200]`, wait 1600 | `article.css`: the bar rule again, with no script tab to show | `#progress` |

Bullets:

- s1: "The bar grows as we scroll." / "Animation timeline scroll ties the bar to the article's scroll position." / "The top of the article is 0 percent. The bottom is 100."
- s2: "Step 3 fades in as it enters the pane." / "The view function tracks one element. Animation range sets the start and end." / "With reduced motion, the steps appear without moving."
- s3: "The page is busy again. The bar keeps up." / "The browser can run this animation apart from page script. Busy script cannot stall it." / "We wrote no scroll code."

Meter on s3: `JavaScript`, `0 lines`, source "non-blank, non-comment lines in content/sections/m4-return-guide/files/*.js". 105 words.

**Proof risk.** s3 depends on Chrome continuing a smooth scroll, and the scroll-linked animation, while the frame's main thread is blocked. The frame runs on 127.0.0.1 and the presenter on localhost. They are different sites, so Chrome gives the frame its own process, and blocking it does not freeze the slides. Verify it in S0. If the scroll stops during the block, keep s3 as "Scroll to the end" with no busy loop. Change the first two bullets to "The bar reaches the end." and "No scroll listener runs at any point." Then drop used-to s3's stall bullet to match.

**Cautions:**

- "Animate transform and opacity. Other properties can stall when the page is busy."
- "Wrap motion in a reduced motion query. Keep the content readable without it."
- "Firefox shipped this on 27 October. Older Firefox users see no animation."

**Citations:** MDN, Firefox 159 release notes (scroll-driven animations on by default); Interop 2026 (scroll-driven animations focus area); Comeau, Scroll-driven animations (28 Apr 2026); Yitbarek, A guide to scroll-driven animations with just CSS (WebKit, 20 Jun 2025); Van Damme, scroll-driven-animations.style, Cover Flow and its "Add jank" switch, the source of the busy-page proof.

## 8. M5 Cross-document view transitions: trail gear pages

### Scenario

The storefront "Trail gear" category page shows six products from `fixtures/storefront-catalog.json` in a grid. Pressing Ridgeline Trail opens its product page. The card photo grows into the product hero, and the name slides into the title. Back shrinks it into the grid again. The same works for Day pack 22 L.

For years, teams built the whole store as a single-page app to get this one animation. D4 made a router better. M5 removes the router.

### Wrapper `storefront-catalog`

A store header strip (name, static nav words, cart count) and a footer strip with the free shipping note. It renders identically on both pages, so the root crossfade does not show it. Must never use: `view-transition-name`, `@view-transition`, `startViewTransition`, `pageswap`, `pagereveal`, or `href` on any wrapper element.

### Support, as of 28 October 2026

- **Shipped.** Chrome 126, Edge 126, Safari 18.2. Not in Firefox. Not Baseline.
- **Still moving.** Interop 2026 names cross-document view transitions inside its view transitions focus area, so Firefox work is expected this year. Same-document view transitions have been Baseline since October 2025. `view-transition-name: match-element` works within one page only, so each card needs its own name. Prerendering with speculation rules, which makes the load instant, is Chrome only.
- **Talk browser.** Chrome.
- **Fallback in the frame.** Firefox, and any browser without support, ignores the `@view-transition` rule and loads the page normally. That is a working store with no animation.
- **Intro tiles.** `support: { kind: "web-features", id: "cross-document-view-transitions", fallback: { missing: ["firefox"], text: "a normal page load" } }`.

### Intro page (0.25 min)

- Intro: "Next is a store category page. Pick a product, and its photo grows into the product page. These are two separate pages."
- Description: "Cross-document view transitions animate the move between pages, with no single-page app."
- Visual: capture `m5-now` s1, the Ridgeline Trail product page. Alt: "The Ridgeline Trail product page with its large hero photo."

### Used to (0.5 min)

The today build is a small single-page store. A click handler intercepts links, calls `pushState`, fetches product JSON and renders the product view. A FLIP helper measures the card photo, renders, measures the hero and plays the difference. On `popstate` it renders the grid, restores the scroll position, moves focus and sets the title.

Frame `demos/16-cross-document-vt/today`, `split: "60/40"`, viewport 768 by 628, hooks `reset`. Files:

- `index.html`: the single app root, the links with `data-route` and the script tags.
- `styles.css`: the view classes and the transform transition FLIP relies on.
- `router.js`: the click intercept, `pushState`, `popstate`, focus and title.
- `flip.js`: measure, invert, play.

Intro: "Picking a product grows its photo into the product page. We built a single-page app for that."

| Step | Label | Actions | Code focus | Spotlight |
|---|---|---|---|---|
| s0 | The single-page store | none | `index.html`, no lines | none |
| s1 | Open Ridgeline Trail | pointer to `#t-card-trail`, click it, wait 600, assert `#t-hero` visible | `index.html`: the app root and the routed links | `#t-hero` |
| s2 | Go back | navigate `history: "back"`, wait 600, assert `#t-card-trail` visible | `styles.css`: the view classes and the transform transition | `#t-card-trail` |
| s3 `key` | Open Day pack 22 L | pointer to `#t-card-pack`, click it, wait 600 | `router.js`: intercept, push, popstate, focus and title | `#t-hero` |

Bullets:

- s1: "The photo grows into the product page. The whole store is one HTML page."
- s2: "Back shrinks the photo into its card. CSS animates moves that script measures."
- s3: "A second product works the same way." / "Script routes, fetches, renders and moves focus: {n} lines."

Meter on s3: `JavaScript`, `{n} lines`, source "non-blank, non-comment lines in /demos/16-cross-document-vt/today/*.js". 60 words.

### Now (1.25 min)

Two plain HTML pages, served by the build: `index.html` (the category grid, real links to `product.html?id=...`) and `product.html` (the product template). Each card image carries an inline `view-transition-name` for its product, such as `trail-photo`. The product hero carries the same name. `transitions.css` holds `@view-transition { navigation: auto; }`, a 300 ms group duration and a reduced-motion block that turns the animation off. Both pages link it. No JavaScript.

Frame `native`, `split: "60/40"`, viewport 768 by 628, flags `{ "enhance-css": true }`, hooks `reset`. Files: `index.html`, `product.html`, `transitions.css`. Needs 3.3.

Intro: "These are two plain HTML pages with no router. One CSS rule asks for a transition between them."

| Step | Label | Actions | Code focus | Spotlight | `route` |
|---|---|---|---|---|---|
| s0 | Category page | none | `index.html`, no lines | none | `index.html` |
| s1 | Open Ridgeline Trail | pointer to `#card-trail`, click it, wait 600, assert `#hero` visible | `transitions.css`: the `@view-transition` rule | `#hero` | `product.html?id=trail` |
| s2 | Go back | navigate `history: "back"`, wait 600, assert `#card-trail` visible | `index.html`: the cards' `view-transition-name` values | `#card-trail` | `index.html` |
| s3 `key` | Open Day pack 22 L | pointer to `#card-pack`, click it, wait 600 | `product.html`: the hero with its matching name | `#hero` | `product.html?id=daypack` |

Bullets:

- s1: "The photo grows into the product page. This is a real page load." / "A view transition animates between two states. This rule opts both pages in." / "The browser captures the old page and animates to the new one."
- s2: "Back shrinks the photo into its card." / "Both pages give the photo the same name. That pairs old and new." / "Back and forward work, because these are real pages."
- s3: "A second product works the same way." / "Without support, the page loads with no animation." / "We deleted the router. We wrote no JavaScript."

Meter on s3: `JavaScript`, `0 lines`, source "non-blank, non-comment lines in content/sections/m5-trail-gear-pages/files/*.js". 108 words.

**Plan B**, if the S0 spike shows no transition inside the frame: record the same three steps at the top level with Playwright as one short video. Play it in a `static` build, with a hook that seeks to each step's segment. The code panel and bullets stay as written. Add one bullet to s1: "This run was recorded. The browser blocks this inside our slide frame." Say so on stage. Do not fake a live run.

**Cautions:**

- "Give each paired element a unique name. A duplicate name skips the transition."
- "Keep transitions short and honor reduced motion. Slow pages make long transitions worse."
- "Both pages must opt in and share an origin."

**Citations:** Chrome for Developers, Cross-document view transitions for multi-page applications; Interop 2026 (view transitions, cross-document); web.dev, Same-document view transitions are Baseline Newly available (Oct 2025); Van Damme, view-transitions.chrome.dev Profiles and Stack Navigator MPA demos; Archibald, simple-vt-demos; Keith, Reasoning (14 Oct 2025). That last one is already in D4. Say it aloud in only one of the two demos.

## 9. Build order

Each milestone ends with `pnpm validate` green and `pnpm walk` in Chromium with no failures. Run the WebKit walk at S3 and S6.

- **S0, spikes (half a day, before any build).** (a) A cross-document view transition plays inside the sandboxed cross-origin frame in Chrome and Safari. (b) The Grid Lanes flag in the talk week's Chrome renders `display: grid-lanes`, and the Chromium walk can turn it on. (c) The busy-page scroll in Chrome keeps the bar moving. (d) A `web-features` release with Firefox 159 data exists. Each result picks plan A or B in the demo's section.
- **S1, engine.** 3.1 to 3.5: timing table, order and cut priorities, `compatKeys`, `Step.route` and multi-page builds, the `animating` filter, zero-line meters, the nested-frame compose.
- **S2, M1 and M4.** They need no new engine piece beyond hooks.
- **S3, M3.** Ridge UI v2 and v3 modules, both builds, the fallback path.
- **S4, M2.** Imagery, fixtures, both builds, the Safari capture for plan B.
- **S5, M5.** Both builds on the multi-page compose.
- **S6, backgrounds, wrappers and opener.** Five Higgsfield files, five wrappers (add their rows to PRD v5 2.2), the F1 tile and step changes, `pnpm visuals` and `pnpm capture`.
- **S7, rehearsal.** One full run with both windows on the talk laptop. The group from F1 to the end of M5 should run within 0.5 minutes of 10.5 minutes.

## 10. Timing

### Per page

The section starts at 6.5. D1 to D6 are unchanged and end at 22.0.

| Section | Intro | Used to | Now | Total | Ends at |
|---|---|---|---|---|---|
| F1 opener | | | 0.5 (single) | 0.5 | 22.5 |
| M1 Anchor positioning | 0.25 | 0.5 | 1.25 | 2.0 | 24.5 |
| M2 Grid Lanes | 0.25 | 0.5 | 1.25 | 2.0 | 26.5 |
| M3 Scoped registries | 0.25 | 0.5 | 1.25 | 2.0 | 28.5 |
| M4 Scroll-driven animations | 0.25 | 0.5 | 1.25 | 2.0 | 30.5 |
| M5 Cross-document view transitions | 0.25 | 0.5 | 1.25 | 2.0 | 32.5 |
| F2 Caching | 0.25 | 0.75 | 2.25 | 3.25 | 35.75 |
| F3 Package trust | 0.25 | 0.5 | 2.25 | 3.0 | 38.75 |
| F4 Vite 8 locally | | | 0.5 (single) | 0.5 | 39.25 |
| F5 What you can delete | | | 0.75 (single) | 0.75 | 40.0 |

Why 1.25 on the now pages. The CX pace model gives a step about 20 seconds. Three steps plus a 15 second intro come to 75 seconds. Every now page has 112 spoken words at most. The budget at 1.25 minutes is 162.

### Total impact

| | Today | With the five demos |
|---|---|---|
| Group (F1 alone, or F1 plus M1 to M5) | 1.0 | 10.5 |
| Last demo page ends | 30.5 | 40.0 |
| Section end, with 0.5 buffer | 31.0 | 40.5 |
| What changed (1.5) ends | 32.5 | 42.0 |
| People to follow (1.0) ends | 33.5 | 43.0 |
| Closing slide (0.25) ends | 33.75 | 43.25 |

The talk grows by 9.5 minutes. The repo does not record the slot length. If the slot is 45 minutes with questions inside it, the full plan leaves 1.75 minutes for questions.

### Cut order

Cut from the top. Each cut saves the time shown. A cut demo stays on the F1 tile grid, so the room still hears its name and wait signal.

| Cut | What goes | Saves | Talk ends at | Why this position |
|---|---|---|---|---|
| 1 | F5 What you can delete | 0.75 | 42.5 | Already first in the existing cut order |
| 2 | F4 Vite 8 locally | 0.5 | 42.0 | Already second |
| 3 | M1 Anchor positioning | 2.0 | 40.0 | The room saw anchoring in D1. Its core is already Baseline. |
| 4 | M3 Scoped registries | 2.0 | 38.0 | Narrowest audience: design systems and micro-frontends. Least visual. |
| 5 | M2 Grid Lanes | 2.0 | 36.0 | Needs a flag on stage. Safari only in stable. |
| 6 | M4 Scroll-driven animations | 2.0 | 34.0 | Visual, and Baseline since 27 October. Keep it if you can. |
| 7 | D2's last proof step | 0.25 | 33.75 | Existing cut |
| Keep | M5 Cross-document view transitions | | | Most visual, broadest use, and the segue into F2 |

Two cuts inside a demo also work: drop the M-demos' used-to pages for the fastest cut. That saves 0.5 each but breaks the three-beat flow. Not recommended.

## 11. Open questions for the speaker

1. **Slot length.** The full plan ends at 43.25. How long is the slot, and does it include questions? That sets how far down the cut list we go.
2. **Grid Lanes on stage.** Turn on Chrome's "CSS Grid Lanes Layout" flag on the talk laptop (recommended), or show the Safari capture as plan B from the start?
3. **Support tiles after Firefox 159.** If no `web-features` release records Firefox 159 before the talk, show the generated tiles with Firefox missing for M3 and M4, or allow a one-line override with a cited source?
4. **M1 overlap with D1.** Keep M1 as a full demo, or fold "flip and follow" into the F1 tile and start the group with M2?
5. **Order.** M5 last, then F2 on the same storefront (recommended). Or open the group with M5 for impact?
6. **Imagery.** Generate the M1, M2 and M5 photos with Higgsfield (recommended, matches the backgrounds), or use licensed stock?
7. **Opener line.** "The six demos so far are safe to ship." D6 shows Firefox a plain select. Is "safe to ship" the claim you want?

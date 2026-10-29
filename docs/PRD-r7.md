# PRD r7: titles, cover, navigation, links, social and fixes

This PRD covers round 7 of the presenter app. The speaker's requests are quoted in section 1 and are fixed. Everything in `docs/PRD-demos-v5.md`, `docs/PRD-demos-v4.md`, `docs/demo-engine.md` and `docs/design/still-in-motion-demos.md` still holds unless this document changes it.

Start from `a372e20` (round 6). The tree is clean. Every workstream branches from it and merges in the order of section 12.

Visual detail for the cover, the drawer, the fade and the select lives in this PRD (sections 4, 8, 9 and 7.2). The design agent may refine values in `docs/design/r7-spec.md`. Where that spec and this PRD disagree on visuals, the spec wins. On behavior, data, contrast, timing and tests, this PRD wins.

## Decisions at a glance

| Topic | Decision |
|---|---|
| Walk-page titles | "What we used to do" and "What we can do today", everywhere the old titles live. |
| Cover | Eyebrow, title and name plus job title as one left-aligned group, vertically centered. The title stays 192 px but breaks into three lines, so no white text reaches the orange glow. |
| F1 "Still in motion" | Removed with its build, wrapper, background and posters. M1 to M5 intro slides carry a small "Still in motion" chip. The M1 intro takes over F1's framing line. |
| Grid Lanes now page | The shown fallback becomes CSS columns inside `@supports not (display: grid-lanes)`, so browsers without lanes still show a packed wall of varied heights. The enhancement-off state (s0) drops every `@supports` block and shows the cropped regular grid. |
| Links | The site pill, both Slalom wordmarks, the speaker's name on the cover, the LinkedIn line and the QR code become real links that open in a new tab. They never take the clicker's keys. |
| Slide changes | The next and previous slides are prefetched in full. Slides crossfade with a same-document view transition in the audience window and reader mode. The fade turns off under reduced motion, capture and automation. |
| Navigation drawer | A modal `dialog` opened with invoker commands, styled as dark glass. It lists the opening, each demo by feature name in four groups, and the closing. |
| Social | One shared Open Graph image, captured from the new cover and committed. Every page gets Open Graph and Twitter metadata. `/s/[id]` pages get a canonical URL and per-slide JSON-LD. |
| Robots | A host-aware `robots.txt`, a sitemap of the presenter's slide pages, and `X-Robots-Tag: noindex` on every frame response. |
| Slide 9 bug | Not reproduced under automation. Evidence and the leading hypothesis are in section 6. The fixes there ship either way, and the engineer confirms them with a new walk check. |
| D4 select chevron | The theme draws its own chevron on native selects (`appearance: none`), with room on the right. The D6 customizable select stays exempt. |

## 1. The speaker's requests (fixed)

Overall: "How we used to do it" becomes "What we used to do". "How we do it now" becomes "What we can do today".

Cover: the eyebrow, the title and the speaker's name plus job title are vertically centered on the slide.

Others:
- Remove slide 26, "Still in motion".
- Slide 32, Grid Lanes, still appears as a masonry grid with images of different heights.
- "thefutureiscomposable.com", the Slalom logos and the speaker's LinkedIn are hyperlinks.
- Prefetch the next slide. Fade subtly when moving to the previous or next slide.

Bugs:
- Slide 9, step 4: after the actions play on the visual, the slide no longer advances, by keyboard or by the navigation button.
- D4 (Navigation API): the status select's chevron is misaligned.

Navigation: a hamburger menu with a drawer that links only to the main sections. The drawer uses the glass style with some transparency.

Social sharing: Open Graph images from the new cover. Every page can share one image plus its own metadata. Each slide has its own JSON-LD in the head.

## 2. Writing rules for all new copy

Every string a slide, the drawer or the metadata shows follows PRD v4 5.2 and the validator: no em or en dashes, sentence case, sentences of 15 words or fewer, no fluff, no "!". All copy in this PRD already passes. Engineers type it as written.

## 3. Walk-page titles

### 3.1 Where the old titles live

| Place | What changes |
|---|---|
| `content/demo-schema.ts` line 78 | `title: "What we used to do" \| "What we can do today"` |
| `lib/validate/rules.ts` line 115 | `TITLES = { "used-to": "What we used to do", now: "What we can do today" }` |
| 13 section files, 26 page entries | `d1` to `d6`, `m1` to `m5`, `f2`, `f3` (`content/sections/*.ts`). F1 and F4 have no walk pages. |
| `scripts/validator-fixtures.mts` lines 45, 68, 168 | The fixture titles and the "title" broken fixture. |
| `README.md` line 7, `docs/demo-engine.md` lines 18 and 19, `docs/design/demo-glass-spec.md` line 176 | Living docs. Historical PRDs, reviews and feedback files stay as written. |

No speaker notes, page intros, aria-labels or captures quote the old titles. The page's aria-label (`${eyebrow}: ${title}`), the iframe title (`Live demo: ${title}`), the speaker header and the "Next page" line all read `page.title`, so they follow. Posters and intro stills never show the title.

### 3.2 Search titles

Thirteen pages now share each title, so `<title>` and the JSON-LD name for walk pages use `${eyebrow}: ${title}`, for example "Dialog element: What we used to do". Section 10 owns this.

### 3.3 Acceptance

- `rg -n "How we used to do it|How we do it now"` finds hits only in historical docs.
- `pnpm check` passes. The "title" fixture in `test:validator` still fails for the right reason.
- `pnpm walk` in Chromium: every walk page's `.page__title` reads one of the two new strings, with no wrap at 1920 by 1080, clear of the meter.

## 4. Cover

### 4.1 The constraint

`title.jpg` has a bright orange glow in the top right, from about x 1150 and y 0 to 560. Round 6 moved the text to the bottom left because a centered 192 px title in two lines ("2026 advances" is 1373 px wide) runs into the glow. I measured the brightest pixel under candidate zones, with the existing navy scrim at 0.24, in Chromium:

| Layout | Text right edge | White on worst pixel |
|---|---|---|
| Current, bottom left | 1448 | 6.15:1 |
| 192 px, two lines, centered | 1437 | 3.43:1 (fails) |
| 160 px, two lines, centered | 1208 | 4.76:1 (too close to the limit) |
| 144 px, two lines, centered | 1094 | 6.27:1 |
| 192 px, three lines, centered | 993 | 6.15:1 |

### 4.2 Decision

Keep the 192 px title the speaker asked for in round 6, and break it into three lines: "2026", "advances", "in the web". The widest line is 929 px, so the group never leaves the navy and magenta field. The fallback, if the speaker dislikes the three-line rag, is 144 px in two lines. It needs no other change.

The name and job title are plain text, not a card. They come from `content/deck.ts` (`speaker.name`, `speaker.title`, `speaker.org`), so the cover, the closing slide and the metadata share one source. See open question 1 on the job title.

### 4.3 Layout

On the 1920 by 1080 canvas. The group is centered as one flex column, so a change in line count recenters it.

```text
Region        x     y     w     h     Contents
------------  ----  ----  ----  ----  ---------------------------------------------------
Background    0     0     1920  1080  title.jpg, grain (audience), navy scrim 0.24 to x 1480
Group         64    158   960   764   flex column, justify center in the slide's height
  Eyebrow     64    158   560   36    "FITC Web Unleashed 2026, Toronto", 28/36 Bold cyan
  Title       64    218   960   552   "2026" / "advances" / "in the web", 192/184 Bold white
  Name        64    818   900   50    "Bermon Painter", 36/50 Bold white, a link (section 5)
  Role        64    872   900   50    "<title>, Slalom", 36/50 Regular white
Wordmark      right 64, bottom 64     "slalom", 48/56 Bold white, a link (section 5)
```

- Gaps: the title keeps its -8 px top margin (a 32 px visual gap under the eyebrow), 48 px after the title, 4 px between name and role.
- The role is white, not `#D6DCEC`. `#D6DCEC` on the worst pixel measures about 4.4:1.
- `content/backgrounds.ts`: replace the `title` text zones with four zones (eyebrow, title, name, role) at the coordinates above, all `on: "field"`, `ink: "white"`, scrim navy 0.24.
- `content/slides/01-title.ts`: `lines: ["2026", "advances", "in the web"]`. Notes: drop "Your name is not on the slide." Keep the rest.
- `GlassContent` gains no field. The title layout reads `deck.speaker`.

### 4.4 Acceptance

- `pnpm backgrounds` then `pnpm test:contrast` pass for all four zones.
- The walk at 1920 by 1080: the group's center is within 4 px of y 540. No title glyph box crosses x 1100.
- Open Graph crop (section 10.2): the whole group sits inside the 1200 by 630 crop.

## 5. Links

### 5.1 Where they go

| Place | Element today | Link | Rel and target |
|---|---|---|---|
| Glass footer, left pill, on every `glass-grid`, `glass-quotes`, `glass-statement` and `glass-people` slide (`GlassSlide.tsx` `Footer`) | `<p class="sg-pill">` with `deck.site.label` | `deck.site.url` | `rel="noopener"`, `target="_blank"` |
| Cover wordmark (`GlassSlide.tsx` `Wordmark`) | `<p class="sg-wordmark">` | `https://www.slalom.com` | `rel="noopener"`, `target="_blank"`, accessible name "Slalom" |
| Closing wordmark (`GlassClosing.tsx`) | `<p class="sg-wordmark sg-closing__wordmark">` | `https://www.slalom.com` | as above |
| Cover name (new) | none | `https://www.linkedin.com/in/bermonpainter` | `rel="me noopener"`, `target="_blank"` |
| Closing LinkedIn line (logo and text) | `<p class="sg-closing__link">` | `content.url` | `rel="me noopener"`, `target="_blank"` |
| Closing QR code | `<img>` in `.sg-qr__frame` | `content.url` | as above; the image alt stays |

- Add `deck.speaker.linkedin` and `deck.org.url` to `content/deck.ts` and the `Deck` type, so the cover, the closing, the footer and the JSON-LD read one value. `34-closing.ts` keeps its `url` for the QR generator, and the validator checks the two are equal.
- Every new-tab link has visually hidden text ", opens in a new tab".
- Unchanged: people-to-follow names (no URLs in the data), the right footer pill and the old `SlideFooter` in `SlideShell.tsx`, which no deck slide uses.

### 5.2 Behavior per mode

- **Reader** (`/`, `/s/[id]`): normal links in the tab order, with a visible focus ring (cyan on dark, `--glass-focus` on light) and an underline on hover.
- **Audience** (`/present`): links work with a pointer but carry `tabIndex={-1}`. After a click, the stage takes focus back (`focusStage()`), so the clicker keeps working. The Stage's keydown handler already prevents Space and the arrows, so a focused link can never be activated by the clicker.
- **Speaker previews** (`stage--embedded`): links are `tabIndex={-1}` with `pointer-events: none`. A preview is a picture.
- **Captures and walks**: links add no paint at rest. Same color, no underline, same box, so stills and posters do not change.

### 5.3 Acceptance

- The walk: each slide in 5.1 has an `a[href]` with the expected URL, `target="_blank"` and the rel values. The closing's three text lines still match PRD v5 4.6.
- With `/present` focused on the closing slide: click the LinkedIn link, return to the window, press ArrowRight. The stage handles the key (`document.activeElement` is `#stage`).
- `pnpm axe --presenter` (section 9.6) passes on `/s/title` and `/s/closing`.

## 6. Bug: slide 9, step 4 stops advancing

Slide 9 is `d1-used-to`. Step 4 is `s3`, "Close with Escape": the runtime dispatches Escape to the hand-rolled modal, which closes and returns focus to `#t-actions` inside the frame.

### 6.1 What I ran (none reproduced the stop)

Playwright against the running dev server, and against production for the first and last runs:

| Setup | Result |
|---|---|
| `/present?s=d1-used-to`, ArrowRight with 3.5 s gaps, Chromium, WebKit and Firefox | Advances to `d1-now` after s3 in all three. |
| Same, production | Advances. |
| `/s/d1-used-to` reader mode, the Next button (hovered, then clicked) and keys, Playwright Chromium, real Chrome (`channel: chrome`, headed), WebKit | Advances. |
| Reader mode, click inside the frame at s3, then key and button | Advances. |
| Audience and speaker windows together, keys in either window | Advances. |
| Arriving from `d1-intro`, or backward from `d1-now` | Advances. |
| A second press 450 to 1800 ms into s3's playback | Advances. One run stayed on s2 because the s2 run was still playing at 3.5 s, so the press finished it. |

Two observations matter:

- In WebKit, `document.activeElement` is the presenter `BODY` through s0 to s2 and becomes the frame's `IFRAME` exactly at s3. s3 is the only step on the page that moves focus into the cross-origin frame. From then on, every key reaches the stage only through the runtime's forward (`demo-runtime.js` `onKeydown`, `FORWARD_ALWAYS` and `FORWARD_SCRIPTED`).
- The speaker says both the keyboard and the button stop. A button click does not depend on focus. Only shared playback state can stop both.

### 6.2 Leading hypothesis (engineer to confirm)

**H1, most likely: a stale "playing" run swallows every Next.** `Stage.perform("advance")` calls `playback.finish()` whenever `playback.isPlaying()` is true. `PageFrame` answers `run.current?.playing()`. Three code paths can leave that true forever:

1. `FrameHandle.dispose()` (`lib/engine/frame.ts`) resolves the run's promise but never sets `run.playing = false`. Any step run whose document was disposed reports `playing` forever.
2. `PageFrame`'s animated branch returns early on `gen !== generation.current` without clearing `run.current` or calling `reportPlaying(false)`.
3. The runtime posts `step-done` only after `quiescence()`. That awaits `finished` on every document-timeline animation, including paused ones, which never settle. It then awaits two `requestAnimationFrame` calls, which never fire while the window is hidden or occluded. `finish` cannot end a paused animation either.

Each press then posts `finish` to a run that cannot finish. The keyboard and the reader, speaker and on-stage buttons all stop together. That matches the report. The speaker's laptop reaches these paths in ways automation does not: real focus changes, a window behind the speaker view, a press during playback.

**H2, contributing: keys lost after focus enters the frame.** After s3, any key outside the forward lists dies in the frame. Lost keys include Home, End, Backspace, `g`, `s`, `o`, `?` and Enter. Some clickers send these. This explains a keyboard-only stop, not the button.

### 6.3 Related defects found (verified)

- **Back lands on step 0 instead of the last step** when the previous page has more steps than the current one. Repro: `/present?s=d2-intro`, ArrowLeft lands on `d1-now` with no `step` (s0). Cause: `-1` ("last step") is resolved by the outgoing Stage's effect, using the outgoing page's step count, before the new page mounts. Going back from `d1-now` (6 steps) into `d1-used-to` (4 steps) writes `step=5` into the URL for the same reason.
- **A press during the 400 ms code lead skips the step.** `run.current` is null during the lead, so `isPlaying()` is false and the press advances. On a last step, the page is left before its step plays.
- **Reader controls hide while the frame has the input.** `data-idle` wakes on `pointermove` and `keydown` in the top window only. Events inside the frame never reach it, so the controls fade and lose pointer events during frame focus. Moving the pointer onto them wakes them, so this is minor.

### 6.4 Fixes (ship regardless of the speaker's answer)

| Fix | File |
|---|---|
| `dispose()` sets `run.playing = false` before resolving. `cancel()` already does. | `lib/engine/frame.ts` |
| Every early return in the animated branch clears `run.current` (when it is still this run's) and calls `reportPlaying(false)`. `isPlaying()` also requires the run's handle to be the shown handle. | `components/page/PageFrame.tsx` |
| The code lead registers a "leading" run. A press during the lead cancels the lead and plays the step at once, as a press during playback finishes it. | `components/page/PageFrame.tsx` |
| Watchdog: when `finish` was posted for a run and the run still reports playing 1500 ms later, the next press advances anyway. Rehearsal mode logs "Stuck playback on <page> <step>". | `components/stage/Stage.tsx` |
| `quiescence()` ignores paused and infinite animations and gives up after 2000 ms. The two frame waits use `requestAnimationFrame` or a 50 ms timeout, whichever comes first. | `public/runtime/demo-runtime.js` |
| Forward Home, End, Backspace, Enter, `g`, `s`, `o` and `?` in scripted mode as well. Hands-on mode keeps them in the frame. | `public/runtime/demo-runtime.js` |
| Resolve `stepIndex: -1` only in the Stage whose `slideId` equals `presenter.state.slideId`. | `components/stage/Stage.tsx` |
| Wake the reader controls on any forwarded key (`dispatchKey`) and on `pointerenter` of the controls. | `components/stage/Stage.tsx` |

### 6.5 Acceptance

A new walk check, `pnpm walk --advance` (section 11), runs in Chromium and WebKit on every page with a frame:

- On the last step, after playback: ArrowRight with focus in the frame, then the reader Next button (in `/s/`), then the speaker window's Next button. Each moves to the next slide within 1500 ms.
- The same with a press 200 ms into the code lead, and a press mid-playback.
- ArrowLeft from each page's next slide lands on the last step (`?step=` equals the step count minus 1).
- A fault injection: dispose the shown handle mid-run. The next press still advances.

The engineer confirms H1 by adding the watchdog's rehearsal log line and asking the speaker to rehearse slide 9 once with `?rehearse=1` before the fixes merge. See open question 3.

## 7. Demo fixes

### 7.1 Grid Lanes now page (current slide 32, `m2-now`, slide 31 after F1 goes)

**Why it looks uniform.** The speaker's Chrome lacks `display: grid-lanes` (Chrome ships it behind `chrome://flags/#css-grid-lanes-layout`; Safari 26.4 ships it). At s1 the runtime restores both `@supports` blocks. Without lanes, the `@supports not` block crops every photo square. At s0, enhancement off, the runtime applies the body of every `@supports not` block on purpose (`demo-runtime.js` around line 311, review r6 motion H1). So both states show the same square grid.

**Decision.** Keep the demo live and honest. The shown fallback becomes what a team would ship: CSS columns. They pack photos of varied heights with no layout script. The talk laptop still runs Chrome with the flag (plan A in `m2-trail-photos.ts`), so the room sees real lanes. The public site shows lanes in Safari and columns elsewhere. The Safari plan B capture stays as it is, for the laptop only.

New `content/sections/m2-trail-photos/files/wall.css` (37 lines, 44 columns):

```css
/* Every browser: a regular grid */
.wall {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: 0.5rem;
}
.wall img {
  aspect-ratio: 1;
  object-fit: cover;
}

/* Lanes where the browser has them */
@supports (display: grid-lanes) {
  .wall {
    display: grid-lanes;
  }
  .wall img {
    aspect-ratio: auto;
  }
}

/* No lanes yet: columns */
@supports not (display: grid-lanes) {
  .wall {
    display: block;
    columns: 6.5rem;
    column-gap: 0.5rem;
  }
  .wall > * {
    break-inside: avoid;
    margin-block-end: 0.5rem;
  }
  .wall img {
    aspect-ratio: auto;
  }
}
```

- **Runtime.** `supports-blocks` off now removes every `@supports` block, positive and negative, and inserts nothing. s0 is the base rules only: the cropped regular grid, in every browser. D3, the other `supports-blocks` user, has positive blocks only and is unaffected. Update the runtime comment and `docs/demo-engine.md`.
- **Captions.** The four-line clamp moves out of the shown file into `public/portal/13-grid-lanes.css` (unshown layout of shown markup) as `.wall figcaption`, so cropped squares at s0 never overflow.
- **Steps** (`m2-trail-photos.ts`, WS-A types them):
  - Now page intro: "This is the same wall with no layout script. It starts as a regular grid. Browsers without lanes get columns."
  - s1 code lines `[[14, 17], [24, 29]]`. Bullets: "One display value packs the photos into lanes. The gaps close." / "Browsers without lanes get CSS columns. Still packed, read top to bottom." / "Each photo goes to the lane with the most room."
  - s3 code lines `[[4, 5], 27]`. Bullets unchanged.
  - Caution 3 becomes: "Without lanes, columns stand in. They read top to bottom, not across."
  - `support.fallback.text`: "CSS columns". Run `pnpm support` and commit `support.json`.
- **Contrast with used-to.** The used-to page is unchanged: script places every item (Masonry.js style) and the meter counts its JavaScript. The now page's meter still counts 7 lines, none of them layout.
- **Lint.** The `product-photos` wrapper ban on multi-column layout applies to wrapper files only. Confirm the shown-file scan does not inherit it.

**Acceptance.**
- Chromium with the flag: s1 asserts `style:display=grid-lanes`, as now.
- Firefox, and Chromium without the flag (`pnpm walk m2 --browser=firefox`, `pnpm walk m2 --no-lanes`): at s0 every figure has the same height. At s1, `.wall` computes `column-width: 104px` and the figures show at least four distinct heights. At s2 there are 18 figures. At s3 the column count drops.
- `pnpm check`: excerpt fidelity, highlight caps and the 44 by 40 limit pass.
- `pnpm capture m2` reruns. The posters are captured with the flag, so they should not change.

### 7.2 D4 status select chevron

**Cause.** The theme (`styles/glass-tokens.css`, `@layer portal-theme`, around line 738) gives native selects a field fill, border and `padding: 7px 12px`, but leaves `appearance: auto`. Each engine then draws its own arrow:

- Chromium: 36 px tall. The arrow sits about 4 px from the right border while the text has 12 px on the left, so it reads off-center.
- WebKit: ignores the padding. The box is 23 px tall against a 36 px Apply button, with an up and down arrow.
- Firefox: close to right.

D4's today and now builds share the markup, so both pages show it. D6's select at s0 (enhancement off, a normal select in Chromium) has the same crowding. D6's customizable select at s1 and later is drawn by `appearance: base-select` and is correct. F2's admin bar selects live in the separate F2 apps, which import the same theme copy.

**Fix** (design agent, `styles/glass-tokens.css`):

```css
:where(:root[data-build]) :where(select:not([multiple], [size]):not(:has(> button))) {
  appearance: none;
  padding-inline-end: 36px;
  line-height: 20px;
  background-image: url("data:image/svg+xml,…chevron-down, stroke #0F1C41, 1.75…");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px 16px;
}
```

- The `:has(> button)` guard leaves D6's select (it has a `<button><selectedcontent>` child) to its shown CSS. Without the guard, base-select would draw two chevrons. D6 at s0 therefore keeps the browser's own select. That is the honest "before" state of a customizable select demo, and the speaker did not flag it.
- 7 + 20 + 7 + 2 = 36 px, the Apply button's height, with no sizing property. The theme lint bans sizing on element selectors.
- The frame CSP allows `data:` images (`img-src ORIGIN data:`).
- `pnpm theme:sync` copies it into `public/theme/portal-glass.css` and both F2 apps.

**Acceptance.** In all three engines at 768 by 628: the select is 36 px tall (within 1 px). The chevron's center is 20 px from the right border edge and on the text's vertical center (within 1 px). The walk measures both. `pnpm theme:lint` passes. D6 s1 shows one chevron in Chromium. Recapture the D4 posters and the D4 intro still.

## 8. Removing F1 "Still in motion"

### 8.1 Timing

| Value | Now | After |
|---|---|---|
| Slides | 51 | 50 |
| Demo pages | 41 | 40 |
| Last demo page ends | 39.25 | 38.75 |
| `DEMO_SECTION_END` (`content/sections/index.ts`) | 39.75 | 39.25 (0.5 buffer kept) |
| `LAST_PAGE_BY` (`lib/validate/timing.ts`) | 39.75 | 39.25 |
| what-changed, people-to-follow, closing (computed) | 41.25, 42.25, 42.5 | 40.75, 41.75, 42.0 |

- Remove `"f1-still-in-motion": [0.5]` from `TIMING_TABLE`. Rewrite its header comment: the cut order stays F4, M1, M3, M2, M4, then D2's last proof step. M5 stays. Delete "the F1 opener stay. A cut demo keeps its tile on the F1 grid."
- The typed `index` and `timing.cumulative` in `32-what-changed.ts`, `33-people-to-follow.ts` and `34-closing.ts` are stale (the deck recomputes both). Set them to 48, 49, 50 and the values above, so nobody trusts the wrong numbers.
- `docs/design/still-in-motion-demos.md` 1.2 and 10: add a one-line note that r7 removed the opener.

New slide numbers from 26: m1 26 to 28, m2 29 to 31, m3 32 to 34, m4 35 to 37, m5 38 to 40, f2 41 to 43, f3 44 to 46, f4 47, what-changed 48, people-to-follow 49, closing 50.

### 8.2 Files

| Remove | Owner |
|---|---|
| `content/sections/f1-still-in-motion.ts`, `content/sections/f1-still-in-motion/` (empty `files/`), its import and list entry in `content/sections/index.ts` | WS-A |
| `demos/08-fast-follows/` (build and static), `d08` in `lib/frames/registry.ts`, `"08-fast-follows"` in `BACKGROUND_BY_DEMO` (`lib/frames/compose.ts`) | WS-B |
| `lib/frames/wrappers/watch-list.ts`, its entry in `wrappers/index.ts`, `"watch-list"` in `wrappers/types.ts`, and the `.wrap--watch` and `.wrap-chip--wait` rules in `public/wrappers/report.css` (the file stays for `advisory-feed` and `ci-report`) | WS-B |
| `public/backgrounds/v5/f1.jpg`, its row in `public/backgrounds/README.md`, `public/posters/f1-single/` | WS-B |
| The `f1` entry in `content/backgrounds.ts` | WS-F |
| `content/.generated/backgrounds.json` | WS-B reruns `pnpm backgrounds` after WS-F lands |

The section and the registry entry must merge together. The `bg-unused` rule fails when either lands alone.

### 8.3 Keeping "still in motion" in the room

The speaker does not need the opener. The room still needs to hear that these five are not ship-ready. Recommendation: one small chip and one line, nothing more.

- `DemoSection.group?: "still-in-motion"` (`content/demo-schema.ts`), set on M1 to M5.
- `IntroSlide.tsx` renders `<p class="intro__group">Still in motion</p>` above the feature title in the dark panel, 28/36 Bold cyan, the eyebrow style on dark. Walk pages are unchanged.
- The M1 intro page's `intro` (said on arrival) takes over F1's framing: "The next five features are still in motion. Prototype now, and check Baseline before you ship. First, a store photo where each pin opens a product card." That is 3 sentences and 34 words.
- No other copy refers to F1. `what-we-cover`, `what-changed`, the people notes and the D6 now page do not mention the tiles. I checked with `rg`.

### 8.4 Acceptance

`pnpm validate` passes: timing table, `LAST_PAGE_BY`, background registry use, writing rules. `pnpm walk` walks 50 slides. `/_health` reports `slides: 50, pages: 40`. `rg "f1-still|08-fast-follows|watch-list|f1\.jpg"` finds only historical docs. The M1 to M5 intros show the chip, and the intro panel still fits 952 px (the walk's intro checks).

## 9. Navigation: prefetch, fade and the drawer

### 9.1 How slides change today

- `/present` and `/speaker` are `force-dynamic` pages. `PresenterProvider` mirrors state into the URL. When `state.slideId` differs from the rendered slide, it calls `router.replace("/present?s=<id>")`, a server round trip. `SlidePage` keys `Stage` on the slide id, so the whole stage remounts.
- Reader mode calls `router.push("/s/<id>")`. These pages are prerendered (`generateStaticParams`).
- `Stage` calls `router.prefetch()` for its neighbors, but on a dynamic route the default (`PrefetchKind.AUTO`, PPR) fetches almost nothing. Next 16.4's `prefetchRoute` only fetches a full payload with `kind: "full"`. It also builds `?s=` URLs without the window's other parameters (`glass`, `capture`, `rehearse`), so the cache keys miss.
- The audience window decodes the neighbors' backgrounds. Intro slides warm the next frame with `FrameWarm`.

### 9.2 Prefetch

- One helper, `slideHref(id)` in `lib/presenter/url.ts`, builds the URL both the mirror and the prefetch use, with the window's other parameters kept in a fixed order.
- `Stage` prefetches the next and previous slides with `router.prefetch(slideHref(id), { kind: "full" })`. `PrefetchKind` is internal to Next. Pass `"full"` with a typed cast, and leave a comment that names the Next file.
- Assets for the next slide, audience window only, through the same module cache as the backgrounds: the intro still (`page.visual.src`) and the next page's s0 poster. The speaker window decodes the posters its next preview shows.
- Frames: no new warm-ups. `FrameWarm` stays the only one, and it already skips F2. Frame documents are `no-store`, so a link prefetch would not help.

**Acceptance** (production build, `pnpm build && pnpm start` on 3200): on every slide, two seconds after arrival, ArrowRight starts no new page or RSC request. The next slide's canvas shows within 150 ms of the key on localhost. Measure with Playwright's request log and `data-background`.

### 9.3 Fade

**Mechanism.** React's `<ViewTransition>` (exported by Next 16.4's bundled React) uses the same-document View Transitions API, which fits the talk. Router navigations run in a transition, so the swap animates with no hand-written `startViewTransition`.

- `SlidePage` wraps the stage canvas in `<ViewTransition name="deck-slide" share="deck-fade" enter="none" exit="none" update="none" default="none">`. The old and new slides share the name, so React pairs them as one crossfade. Step changes are plain state updates, never transitions, so they never fade.
- If the transition does not run on `router.replace` in Next 16.4, set `experimental.viewTransition: true` in `next.config.ts` (WS-E applies the line).
- `styles/components/stage-transition.css`:

```css
::view-transition-group(.deck-fade) { animation-duration: 200ms; }
::view-transition-old(.deck-fade) { animation: 140ms var(--glass-ease) both deck-out; }
::view-transition-new(.deck-fade) { animation: 200ms var(--glass-ease) both deck-in; }
@keyframes deck-out { to { opacity: 0; } }
@keyframes deck-in { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(.deck-fade),
  ::view-transition-old(.deck-fade),
  ::view-transition-new(.deck-fade) { animation: none; }
}
```

**Where it runs.** The audience window and reader mode. The speaker window swaps at once: it is a control surface, and an instant swap keeps the notes readable.

**Off switch.** `SlidePage` renders no `<ViewTransition>` when `navigator.webdriver` is true, when `<html data-capture="1">` is set (`GlassMode` sets it for `?capture=1`), or with `?fade=0`. `?fade=1` forces it on under automation, for the one walk check that tests it. Walks, `pnpm visuals` and `pnpm capture` stay byte for byte as today.

**What must not change.**
- Sync: the state message is sent on the press, before any fade. Both windows still follow within one frame of the RSC payload.
- Frames: the new page's `PageFrame` mounts in its effect after commit, as now. Its s0 replay, the settle gate (boxes wait for `step-done` and 120 ms of quiet) and step playback start no later than without the fade. The view transition snapshots the old frame as an image, and the overlay is part of the snapshot.
- Keys: the transition never takes focus. The stage's focus claim (0, 450 and 1200 ms) still runs. A press during the 200 ms fade is handled. React skips the rest of the fade and the next navigation starts.
- Pointer: during the fade, clicks hit the document. A click on the reader controls in those 200 ms is lost. That is accepted.
- Unsupported browsers swap at once.

**Acceptance.**
- `pnpm walk transitions --fade=1` (Chromium, WebKit): a view transition runs on next and previous (count `document.startViewTransition` calls through an init script). None runs on a step change. Two presses 50 ms apart land two slides on. The frame's s0 `step-done` arrives within 300 ms of the no-fade baseline.
- With reduced motion emulated, no frame between the swap shows opacity strictly between 0 and 1 on `::view-transition-new`.
- The default walk logs no view transition.

### 9.4 Drawer: where the button goes

| Window | Button | Why |
|---|---|---|
| Reader (`/`, `/s/[id]`) | First button in the existing `ReaderControls` pill, bottom right: menu, previous, counter, next, keyboard help. It fades with the pill. | No new collisions with slide content. The top left holds walk-page eyebrows. |
| Speaker (`/speaker`) | First button in `.speaker__controls`, labeled "Slides" with the menu icon. | The speaker's control surface. `g` still opens the go-to dialog. |
| Audience (`/present`) | The same pill position, shown only while the cursor is visible (`AudienceView`'s 2 s idle state). Never under automation or capture. | A mouse fallback. Nothing shows on the projector at rest. |

The button and the drawer sit outside `.stage__canvas`, so no capture, poster, still or Open Graph image includes them.

### 9.5 Drawer: behavior

Platform first, which fits the talk:

```html
<button type="button" commandfor="deck-nav" command="show-modal" aria-haspopup="dialog">…</button>
<dialog id="deck-nav" closedby="any" aria-labelledby="deck-nav-title">
  <h2 id="deck-nav-title">Sections</h2>
  <nav aria-label="Sections"> … </nav>
  <button type="button" commandfor="deck-nav" command="close">Close</button>
</dialog>
```

- A modal `dialog` gives the focus trap (everything else is inert), Escape (`cancel`) and focus return to the invoker on close. `closedby="any"` closes on a backdrop click.
- Fallback where invoker commands or `closedby` are missing: the button's click calls `showModal()`, and a backdrop click handler calls `close()`. Feature-detect with `"command" in HTMLButtonElement.prototype` and `"closedBy" in HTMLDialogElement.prototype`. If React 19.3 drops the attributes, set them through a ref.
- Links are real `<a href="/s/<id>">`, so middle click and new tab work in reader mode. In the audience and speaker windows, a click is intercepted: `presenter.update({ slideId, stepIndex: 0 })`. Both windows follow through the existing sync. In reader mode it is `router.push`. After a jump the dialog closes and focus goes to the stage (`focusStage`), not back to the button.
- The current section's link has `aria-current="true"`.
- **Keys.** While the dialog is open, `Stage`'s keydown handler ignores every key, as it does for the go-to dialog. The dialog handles Escape. PageUp and PageDown, the keys clickers send, close the drawer without navigating, so a speaker can recover with the clicker. No key opens the drawer. Clickers send arrows, PageUp, PageDown, `b`, `.`, F5 and Escape, so they can never open it by accident.

### 9.6 Drawer: content

`lib/nav.ts` derives the list from `slides` and `sections`. No numbers are typed. Group headings are text, not links.

| Group | Links (feature name, slide number) |
|---|---|
| (none) | Opening, 1 |
| HTML, CSS, and JavaScript | Dialog element 8, Container queries 11, Field sizing 14, Navigation API 17, Trusted Types 20, Customizable select 23 |
| Still in motion | Anchor positioning 26, Grid Lanes 29, Scoped custom element registries 32, Scroll-driven animations 35, Cross-document view transitions 38 |
| Frameworks and metaframeworks | Cache Components 41 |
| Build tools and package managers | Package trust 44, Vite 8 locally 47 |
| (none) | Closing, 48 (what-changed) |

M1 to M5 appear one by one under "Still in motion". The opener is gone, so this is where a reader finds them, and it mirrors the intro chip. The group names come from `what-we-cover`'s cards plus "Still in motion". The validator checks that every demo section appears exactly once and every link target exists.

### 9.7 Drawer: visual (design agent, `styles/components/nav-drawer.css`)

- Right-side sheet, full height, `inline-size: min(420px, 100vw)`, 16 px from the top, right and bottom edges. Radius 24. `glass-dark` tokens: `--glass-dark-surface-float` (navy 0.82), `backdrop-filter: blur(24px) saturate(140%)`, `--glass-dark-border-color`, `--glass-dark-highlight`, `--glass-dark-shadow`. Navy 0.82 keeps visible transparency and holds white above 4.5:1 over any slide (PRD v5 1.5 rule for strong dark glass).
- `::backdrop`: `--glass-scrim` (navy 0.36).
- Type: group headings 20/28 Bold `#B8C0D9`. Links 24/32 white, 12 by 16 padding, radius 12. Slide number right-aligned, 20/28 `#D6DCEC`. Current link: cyan at 0.16 fill with a 3 px cyan inline-start bar. Hover: white at 0.08. Focus: 3 px `--glass-dark-focus` cyan ring, 2 px offset. Every target at least 44 px tall.
- Motion: opens with `translateX(24px)` to 0 and opacity 0 to 1 over 200 ms; closes with opacity to 0 over 140 ms. `--glass-ease`, `@starting-style`, `transition-behavior: allow-discrete` on `display` and `overlay`. Reduced motion: opacity only.
- Fallbacks per glass spec 11: with no `backdrop-filter`, `prefers-reduced-transparency` or `data-glass="off"`, the sheet is solid `--glass-dark-solid`. Forced colors: system colors.
- The menu button matches the reader pill's 44 px buttons. Lucide `Menu` icon.

### 9.8 Acceptance

- `pnpm axe --presenter` (new mode in `scripts/axe-frames.mts`): no violations on `/s/d1-intro` with the drawer open and closed, and on `/speaker` with it open.
- Keyboard: Tab reaches the button. Enter opens the drawer and focus lands on the first link. Tab stays inside. Escape closes and focus returns to the button. Choosing a link moves both windows (audience and speaker open together) and focuses the stage.
- Clicker keys with the drawer open do not move the deck. PageDown closes it.
- The walk's default run (automation) finds no visible menu button in the audience window.

## 10. Social sharing and GEO

### 10.1 Metadata on every route

`lib/seo.ts` (new) exports `siteMetadata()`, `slideMetadata(slide)` and `slideJsonLd(slide)`. Every `generateMetadata` spreads the base, so no route depends on Next's shallow merge of `openGraph`.

| Field | Value |
|---|---|
| `metadataBase` | `new URL(PRESENTER_ORIGIN)` |
| `title` | Root: `deck.title`. `/s/[id]`: `${slideTitle} · ${deck.title}`, where walk pages use `${eyebrow}: ${title}` (3.2) and intro pages the feature name. |
| `description` | Root: "A tour of what browsers shipped in 2026, with live demos. FITC Web Unleashed 2026, Toronto." Slides: `slideDescription(slide)`, 160 characters at most. Intro pages use the section's `description`. Walk pages use the page intro. Glass slides use the lede or the first card titles. |
| `openGraph` | `type: "website"`, `siteName: deck.title`, `locale: "en_CA"`, `url` (the canonical), `title`, `description`, `images: [{ url: "/og/cover.jpg", width: 1200, height: 630, type: "image/jpeg", alt }]` |
| `twitter` | `card: "summary_large_image"`, same title, description, image and alt |
| `alternates.canonical` | `/` for `/`, `/s/<id>` for each slide page |
| `authors` | `{ name, url: linkedin }` |

- Image alt: "Cover slide: 2026 advances in the web. FITC Web Unleashed 2026, Toronto. Bermon Painter, <title>, Slalom."
- `/present` and `/speaker` keep `robots: { index: false, follow: true }`. They take the same Open Graph data, and a canonical pointing to `/s/<id>` for the slide in `?s=`. They get no JSON-LD.
- Production guard: `next build` fails when `VERCEL_ENV === "production"` and `NEXT_PUBLIC_PRESENTER_ORIGIN` is unset. Without it, every canonical would point to localhost.

### 10.2 The shared Open Graph image

- **Committed, not generated on Vercel.** `scripts/og.mts` (`pnpm og`, Playwright) opens `/s/title?capture=1` on a dev or production server at a 1200 by 675 viewport. The stage scales to exactly 0.625. It waits for fonts and the background decode, hides the reader pill and clips `x 0, y 22, w 1200, h 630`. It writes `public/og/cover.jpg` (quality 88, under 300 KB).
- **Why not `ImageResponse`.** Satori would need a second copy of the cover layout, which would drift. Vercel builds also have no browser.
- **Kept in sync.** The script also writes `public/og/cover.json` with a SHA-256 of the inputs: the title slide's data, `deck.speaker`, `deck.event`, the bytes of `title.jpg`, the `.sg--title` rules in `slides-glass.css`, the title branch of `GlassSlide.tsx`, and the two Slalom Sans files. `pnpm check` recomputes the hash and fails with "The cover changed; run pnpm og". Every image URL carries `?v=<first 8 of the hash>`, so social caches refresh.

### 10.3 Per-slide JSON-LD

**Placement.** The App Router has no per-page `<head>` slot for scripts, and React 19 does not hoist inline scripts. Next's documented pattern renders `<script type="application/ld+json">` in the page. It lands at the top of `<body>`. Google, Bing and LLM crawlers read JSON-LD anywhere in the document. Treat this as meeting the speaker's "in the head" request. The page escapes `<` as `<`.

**Which routes.** `/s/[id]` carries the per-slide graph. `/` carries the talk graph. `/present` and `/speaker` carry none, and neither do frame documents (route handlers, no layout).

`/s/[id]` graph (one `@graph`, `@context: https://schema.org`):

```json
{
  "@type": "CreativeWork",
  "@id": "<origin>/s/<id>#slide",
  "url": "<origin>/s/<id>",
  "name": "Dialog element: What we used to do",
  "description": "<slideDescription>",
  "position": 9,
  "inLanguage": "en-CA",
  "isPartOf": { "@id": "<origin>/#talk" },
  "author": { "@id": "<origin>/#speaker" },
  "image": "<origin>/og/cover.jpg?v=<hash>",
  "about": [{ "@type": "Thing", "name": "Dialog element", "sameAs": "https://webstatus.dev/features/dialog" }],
  "keywords": ["dialog", "popover", "invoker-commands", "Baseline"],
  "citation": [{ "@type": "CreativeWork", "name": "<citation text>", "url": "<citation url>" }]
}
```

The same graph also includes the talk, the speaker and the session nodes, so each page stands alone:

- `PresentationDigitalDocument` `#talk`: `name: deck.title`, `url: "/"`, `author #speaker`, `inLanguage`, `image`, `numberOfPages: 50`, `about` (the 14 features), `hasPart` (on `/` only: every slide `@id` in order).
- `Person` `#speaker`: `name`, `jobTitle`, `worksFor: { "@type": "Organization", "name": "Slalom", "url": "https://www.slalom.com" }`, `sameAs: [linkedin, "https://thefutureiscomposable.com"]`.
- `Event` `#session`: `name: deck.title`, `eventAttendanceMode: OfflineEventAttendanceMode`, `location: { "@type": "Place", "name": "<venue>", "address": { "addressLocality": "Toronto", "addressRegion": "ON", "addressCountry": "CA" } }`, `performer #speaker`, `workPerformed #talk`, `superEvent: { "@type": "Event", "name": "FITC Web Unleashed 2026", "organizer": { "@type": "Organization", "name": "FITC", "url": "https://fitc.ca" } }`, `startDate` (open question 2).

Mapping rules: `about` and `keywords` come from the section's `support` (`id`, `alsoUses`, tooling package names). `citation` comes from `slide.citations` (demo pages take their section's). `position` is `slide.index`. Glass slides with no citations omit the field. Event data lives in `content/deck.ts` (`event: { name, venue, city, region, country, startDate?, organizer }`), and the existing `event` string is derived from it.

### 10.4 Robots and sitemap

- `app/robots.txt/route.ts` (force-dynamic) reads the `host` header. On the demo host it returns `User-agent: *` and `Disallow: /`. On the presenter host it allows `/` and `/s/`, disallows `/present`, `/speaker`, `/demos/`, `/demo/`, `/orders`, `/cases`, `/cms/`, `/api/`, `/fixtures/` and `/_health`, and adds `Sitemap: <origin>/sitemap.xml`.
- `app/sitemap.ts`: `/` and the 50 `/s/<id>` URLs on `PRESENTER_ORIGIN`, `lastModified` set to the build time.
- `X-Robots-Tag: noindex, nofollow`: in `frameResponse` and on every response from the frame and file route handlers (`lib/frames/compose.ts`, owner WS-B). Also in `next.config.ts` `headers()` for `/:path*` with `has: [{ type: "host", value: <demo host> }]`, the host taken from `NEXT_PUBLIC_DEMO_ORIGIN` at build. Today frame documents carry no robots signal at all.

### 10.5 Validator (`lib/validate/seo.ts`, wired into `pnpm check`)

- `slideJsonLd(slide)` for all 50 slides: `JSON.parse` round-trips. The required fields are present. `position` equals `slide.index`. `url` equals the canonical. Every `@id` reference resolves inside the graph. Every citation URL is `https:`. The description has 160 characters or fewer and follows the writing rules.
- `slideMetadata`: every title is unique.
- `public/og/cover.jpg` is 1200 by 630 and matches its input hash.
- Warning (not an error) while `deck.event.startDate` is unset.

### 10.6 Production checks (after deploy, WS-E)

```sh
curl -s https://2026-advances-in-the-web.vercel.app/s/d1-used-to | rg 'og:image|twitter:card|rel="canonical"|application/ld\+json'
curl -s https://2026-advances-in-the-web.vercel.app/robots.txt
curl -s https://2026-advances-in-the-web-demos.vercel.app/robots.txt        # Disallow: /
curl -sI "https://2026-advances-in-the-web-demos.vercel.app/demos/01-layered-ui/today" | rg -i x-robots-tag
curl -s https://2026-advances-in-the-web.vercel.app/sitemap.xml | rg -c '<loc>'   # 51
```

Then run the Rich Results Test on `/s/d1-used-to` and `/`, and preview a share on LinkedIn (Post Inspector) and Slack.

## 11. Test plan

Every merge keeps `pnpm validate` green and `pnpm walk` (Chromium) at 0 failures. WebKit and Firefox walks run at integration (section 12, step 4).

| Command | New or changed in r7 |
|---|---|
| `pnpm validate` | New titles, timing without F1, 25 backgrounds, nav coverage, SEO and OG hash checks, `test:validator` fixtures for each new rule. |
| `pnpm test:contrast` | The four cover zones. |
| `pnpm walk` | 50 slides. New titles. Links (5.3). The cover group's center. The select's height and chevron position. Chip on M1 to M5 intros. No menu button and no view transition under automation. |
| `pnpm walk --advance` | Section 6.5, Chromium and WebKit. |
| `pnpm walk transitions --fade=1` | Section 9.3. |
| `pnpm walk m2 --browser=firefox`, `pnpm walk m2 --no-lanes` | Section 7.1 fallback. |
| `pnpm axe`, `pnpm axe --presenter` | Frames as before. The drawer and links on presenter pages. |
| `pnpm capture` | Rerun after all merges: D4 (select), M1 intro chip does not touch stills, M2 posters, every walk-page poster is unaffected by the title (posters show the frame only). Commit what changes. |
| `pnpm og` | After the cover lands. Commit `public/og/*`. |
| Production | Section 10.6, plus the prefetch measurement in 9.2 against `pnpm build && pnpm start` on 3200. |
| Rehearsal | A full run with both windows and the clicker on the talk laptop (Chrome, grid lanes flag on). The rehearsal log shows no "Stuck playback" and no forced spotlight. |

## 12. Workstreams

Each file has one owner. A workstream that needs a line in another's file asks the owner. The table names the handoffs.

| WS | Owner | Scope | Files owned |
|---|---|---|---|
| WS-A Content and validator | Engineer | Titles (3), F1 content removal and timing (8.1, 8.2), M1 intro, M2 copy (7.1), `group` field, `deck.ts` additions (5.1, 10.3), cover lines (4.3), validator wiring, living docs | `content/schema.ts`, `content/demo-schema.ts`, `content/deck.ts`, `content/sections/*.ts`, `content/sections/index.ts`, `content/slides/*.ts`, `content/.generated/support.json`, `lib/validate/rules.ts`, `lib/validate/timing.ts`, `lib/validate/v5.ts`, `scripts/validate.mts`, `scripts/validator-fixtures.mts`, `README.md`, `docs/demo-engine.md`, `docs/design/still-in-motion-demos.md` |
| WS-B Slides markup and F1 teardown | Engineer | F1 engine and asset removal (8.2), cover markup (4), links (5), intro chip markup, frame `X-Robots-Tag` (10.4) | `components/layouts/glass/*`, `components/page/IntroSlide.tsx`, `demos/08-fast-follows/**`, `lib/frames/registry.ts`, `lib/frames/compose.ts`, `lib/frames/wrappers/{watch-list,index,types}.ts`, `public/wrappers/report.css`, `public/backgrounds/**`, `public/posters/f1-single/**`, `content/.generated/backgrounds.json` |
| WS-C Engine, demos and test harness | Engineer | Slide 9 fixes in the frame layer (6.4), M2 fallback (7.1), every walk and axe check in this PRD | `public/runtime/demo-runtime.js`, `components/page/PageFrame.tsx`, `lib/engine/*`, `demos/13-grid-lanes/**`, `content/sections/m2-trail-photos/files/wall.css`, `public/portal/13-grid-lanes.css`, `scripts/walk-demos.mts`, `scripts/axe-frames.mts` |
| WS-D Navigation | Engineer | Stage fixes (6.4), prefetch (9.2), fade (9.3), drawer behavior (9.4 to 9.6), link behavior per mode (5.2) | `components/stage/Stage.tsx`, `components/stage/SlidePage.tsx`, `lib/presenter/context.tsx`, `lib/presenter/url.ts` (new), `lib/nav.ts` (new), `lib/keys.ts`, `components/chrome/ReaderControls.tsx`, `components/chrome/NavDrawer.tsx` (new), `components/presenter/AudienceView.tsx`, `components/presenter/SpeakerView.tsx` |
| WS-E SEO, social and robots | Engineer | Section 10, the OG pipeline, deploy doc | `lib/seo.ts` (new), `lib/validate/seo.ts` (new), `app/layout.tsx`, `app/page.tsx`, `app/s/[id]/page.tsx`, `app/present/page.tsx`, `app/speaker/page.tsx`, `app/robots.txt/route.ts` (new), `app/sitemap.ts` (new), `next.config.ts`, `scripts/og.mts` (new), `public/og/*`, `package.json`, `docs/deploy.md` |
| WS-F Design | Design agent | Cover styles and zones (4.3), link styles (5.2), chip style, drawer styles (9.7), fade CSS (9.3), select chevron (7.2), optional `docs/design/r7-spec.md` | `styles/components/slides-glass.css`, `styles/components/intro.css`, `styles/components/nav-drawer.css` (new), `styles/components/stage-transition.css` (new), `styles/components/reader-controls.css`, `styles/app.css`, `styles/glass-tokens.css`, `content/backgrounds.ts` |

Handoffs:
- WS-A to WS-B: `deck.speaker.linkedin`, `deck.org.url` and `DemoSection.group` land first (step 1), because WS-B's markup and WS-E's metadata read them.
- WS-E to WS-A: `lib/validate/seo.ts` is written by WS-E. WS-A adds the one import line to `scripts/validate.mts`.
- WS-D to WS-E: the `experimental.viewTransition` line in `next.config.ts`, if 9.3 needs it.
- WS-D to WS-F: class names for the drawer, the menu button and the transition.
- WS-C implements the walk checks other workstreams specify (5.3, 6.5, 7.1, 7.2, 8.4, 9.3, 9.8). Each owner sends the selectors it renders.

## 13. Order and dependencies

1. **Step 1 (parallel).** WS-A: titles, schema and deck fields, timing, F1 content. WS-F: `content/backgrounds.ts` (f1 out, title zones in) and the select chevron. WS-B: F1 teardown. These three merge together, because the validator's background and timing rules need all of them.
2. **Step 2 (parallel).** WS-B: cover markup and links. WS-F: cover, link, chip and drawer styles. WS-C: slide 9 frame-layer fixes and the M2 fallback. WS-D: Stage fixes, prefetch, drawer. WS-E: metadata, JSON-LD, robots, sitemap.
3. **Step 3.** WS-D: the fade, after the drawer and prefetch, so the walk can isolate regressions. WS-E: `pnpm og` once the cover is final.
4. **Step 4, integration.** WS-C runs the full walk in Chromium, WebKit and Firefox, `--advance`, `transitions`, axe, then `pnpm capture`. WS-E deploys and runs 10.6.
5. **Step 5.** Rehearsal on the talk laptop (section 11).

## 14. Risks

| Type | Item | Owner | Response |
|---|---|---|---|
| Risk | The slide 9 stop is not H1, and the fixes miss it. | WS-C, WS-D | The watchdog in 6.4 advances anyway, whatever the cause. The rehearsal log names the page and step. Open question 3 gets the exact setup. |
| Risk | React `ViewTransition` does not run on Next 16.4's `router.replace`, or it delays the frame's first replay. | WS-D | The experimental flag. Then a fallback: wrap `router.replace` in `document.startViewTransition` in `PresenterProvider`. The 9.3 timing check catches delay. |
| Risk | A view transition snapshots an iframe differently in WebKit, so a frame flashes. | WS-D | The WebKit run in 9.3. If it flashes, exclude `.page-frame__iframe` with its own `view-transition-name` and no animation. |
| Risk | Full prefetch of a `force-dynamic` page renders shiki and reads files on every neighbor, costing Vercel function time. | WS-D, WS-E | Two prefetches per slide change are cheap. If cold starts show, cache `renderCodeFiles` per page in module scope. |
| Risk | The column fallback misleads viewers about Grid Lanes. | WS-A | The s1 bullet and caution say columns stand in. The intro support row shows Safari only. |
| Risk | The theme chevron rule hits a select a demo depends on. | WS-F | Only D4 and D6 have selects. D6 is excluded by `:has(> button)`. The walk measures both. |
| Risk | An Open Graph image goes stale after a cover tweak. | WS-E | The input hash in `pnpm check`, and `?v=` on the URL. |
| Risk | A canonical points at localhost on a misconfigured deploy. | WS-E | The production build guard in 10.1. |
| Assumption | `deck.speaker.title` is the title the speaker wants on the cover and in metadata. | Speaker | Open question 1. |
| Issue | The deck runs to 42.0 minutes against `targetMinutes: 35`. | Speaker | Not in r7 scope. Noted so nobody reads the timer as broken. |
| Dependency | Event date and venue for the Event JSON-LD. | Speaker | Open question 2. The validator warns until set. |

## 15. Open questions for the speaker

1. **Job title.** `content/deck.ts` says "Senior Director". The closing slide and the title notes say "Head of DXP and Commerce". Which goes on the cover, the closing and the metadata? **Recommendation:** "Head of DXP and Commerce", set once in `deck.ts` and read everywhere.
2. **Event date and venue.** The Event JSON-LD needs the session's date, start time and venue. **Recommendation:** send them. Until then, the Event ships without `startDate` and the validator warns.
3. **Slide 9.** Which browser and window were you in (the public site, `/present` or `/speaker`), and did you use the clicker, the keyboard or the mouse? **Recommendation:** no need to wait. The fixes in 6.4 ship either way. Rehearse slide 9 once with `?rehearse=1` after they land.

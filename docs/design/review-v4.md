# Design review: v4 demo section

Reviewed 28 October 2026 against `docs/design/demo-glass-spec.md`, `styles/glass-tokens.css`, `docs/design/feedback-2026-10-28.md`, `docs/PRD-demos-v4.md` (sections 1, 5, 6), `docs/design/demo-flow-cx.md` and the two inspiration images.

Method: headless Chromium (Playwright), audience window at 1920 by 1080, speaker window at 1440 by 900, against the running dev server. Each page was opened at step 0, then advanced with ArrowRight (2.5 s per press, plus a wait for the step result). Computed styles and bounding boxes were read from the chrome and from inside each frame. Timed bursts caught the keycaps and the ghost cursor during playback.

Screenshots are in the scratchpad, not the repo:
`/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/design-review/shots/`
File names are `<page-id>--s0.png`, `<page-id>--mid-s<n>.png`, `<page-id>--last-s<n>.png`, `speaker-<page-id>--s<n>.png` and `burst-<page-id>-s<n>-<ms>ms.png`. One crop is in `../crops/d1-now-s2-dialog.png`.

## Summary

| Severity | Count |
|---|---|
| Blocker | 4 |
| High | 10 |
| Medium | 13 |
| Low | 9 |

The slide chrome, the intro slide and the D1 to D6 portal shell match the spec closely. Most of the work left is in three places:

1. The follow-ups (F1 to F5) were never moved onto the glass system.
2. A few demos hide or clip the thing the step is about (D4 evidence panel, D6 picker, F5 last row, code highlights past the panel edge).
3. Placeholders and dev chrome are still on screen.

## What already matches the spec

Measured values, so nobody reworks them by mistake:

- **Walk-page chrome.** Eyebrow at 64, 48: 28/36 Bold `#002FAF`. Title at 64, 88: 64/72 navy. Frame and code cards are 880 by 864 at x 64 and x 976, y 176, radius 24, border white 0.7. The card shadow is exactly `--chrome-card-shadow`. The code card is white at 0.96. Tabs are 56 px with 20 px tab text, and the active tab has an inset 3 px Slalom Blue bar. Code is 24/36. The meter label is 20 px ink-soft and the value is 40 Bold dark blue. The step indicator segments follow the spec.
- **Intro slide geometry** is exact for D1:
  - Visual card 64, 64, 880 by 952; capture 832 by 816 at y 132, radius 16.
  - Title at y 202, 88/96. Description 36/50 `#D6DCEC`.
  - Support row at y 586, tiles 196 by 196, radius 20, fill navy 0.56, border white 0.16.
  - Tile content: logo 72, version 48 Bold, name 24 `#B8C0D9`. The also-uses line is 24/32.
  - The "Not yet" tile (D6 Firefox) has a dashed edge, a grayscale logo and the words "Not yet". Versions are correct (D1: 37, 79, 98, 15.4. D6: 135, 135, Not yet, 27).
- **Portal theme in D1 to D6:**
  - Body has a 40 percent white wash over the background image.
  - The pane is `.portal::before` with `blur(24px) saturate(1.4)`, fill white 0.32, radius 16 and the pane shadow. The nav rail is 56 px.
  - Dialog: fill 0.78, blur 24, padding 24. Popover: blur 16, radius 10, padding 6.
  - Fields: fill 0.85, navy 0.5 edge, radius 8. Buttons: strong fill, 36 tall, 15 Bold.
  - The used-to frames read grayer than the now frames, as intended.
- **Keycaps** are navy with the chartreuse keyline and read clearly from a distance (`burst-d1-now-s3-1100ms.png`, `burst-d6-used-to-s3-1000ms.png`).
- **Callouts:** no step in the content uses callouts. That matches the CX default, so there is nothing to review there.
- **Speaker window at 1440 by 900:**
  - The intro paragraph is 32 px and bullets are 40 px.
  - The key point has a chartreuse chip and its bullet is set in bold (`speaker-d6-used-to--s3.png`). Proof steps have a chip.
  - "Next" is pinned at 24 px and the Reference drawer is collapsed.
  - The header, bullets and Next line fit without scrolling on every captured step, including D1 s5 with three cautions.

## The four checks

- **Swap test.**
  - D1 to D6: pass. Slalom Sans, the rail and the frosted pane would be missed.
  - F1, F4, F5: fail. They already render in system-ui on white, so swapping in a generic template changes nothing.
- **Squint test.**
  - Chrome: pass. Title, then the frame and the code highlight.
  - D4: fail. A wall of underlined links outweighs the toolbar.
  - D5: fail. An empty navy bar is the heaviest shape in the frame.
- **Signature test** ("frosted where it floats"). Present in four of the five places: pane (all D frames), dialog (D1), popover menu (D1), select picker (D6). No toast was captured. It is absent in F1 to F5.
- **Token test.** The chrome and D tokens read as this brief. The F2 app and the static F pages use their own values: `#0A5BD3`, `#D9DEE5`, `#16202B`, radius 6, `#fff` body.

## Findings

Ordered by severity. "Stage px" means on the 1920 by 1080 canvas; frame px are multiplied by 1.375.

### Blocker

| # | Page, step | What is wrong | Spec or feedback | Fix | Screenshot |
|---|---|---|---|---|---|
| B1 | f2-intro s0; f2-now all steps; every slide | The Next.js dev "1 Issue" pill sits inside the F2 frame, over the log rows, and is baked into the F2 intro capture. The presenter's own "N" dev badge shows bottom left on every slide and in the speaker window. | Feedback: demos looked rough. PRD 1.1: the visual is a capture of the real state. | Set `devIndicators: false` in `next.config.ts`, `demos/06-framework-cache/next.config.ts` and `demos/06-framework-cache-today/next.config.ts`. Present from production builds (`pnpm build && pnpm start`, `pnpm start:framework`, `pnpm start:framework-today`). Fix the reported issue, then re-run `pnpm visuals f2`. | f2-intro--s0.png, f2-now--s0.png, f2-now--mid-s2.png, f2-now--last-s4.png |
| B2 | f3-now s0 | The terminal shows "# ILLUSTRATIVE: replace with the recording" to the audience. | PRD 5.3 (no TODO left); feedback: no fluff. | Record the session and replace `demos/07-package-workflow/recordings/session.json`, or delete line 15 and its `#` lines. | f3-now--s0.png |
| B3 | f4-single all steps | Every cell, both column subheads and the header meta read "Not measured". A fifth line says "Values arrive from pnpm measure:vite at rehearsal." | The page has nothing to show. | Run the measurement before rehearsal so the cells fill. If there are no numbers on the day, drop F4 from the run order. Remove the footnote once values exist. | f4-single--s0.png, f4-single--last-s3.png |
| B4 | d4-now s0, s2, s5 | The Navigation API evidence panel (Address, Title, Focus, Scroll) is below the fold at s0 and s5 and cut off at s2. The order list runs off the bottom of the frame because `.portal` grows to 1404 px (document 1428 px tall in a 628 px viewport). The panel text is 12 px (16.5 stage px). The room cannot see the proof the code describes. | Spec 8: pane 604 tall, main scrolls; frame body text at least 13 px (18 stage px). | Pin the panel in view: in the build's unshown CSS, `aside.demo-panel { position: sticky; inset-block-end: 0; }` with a `--glass-surface-strong` fill and the card radius. Set its font to `15px/20px ui-monospace, "SF Mono", Menlo, monospace`. Keep document scroll, because the scroll restore is part of the demo. Show 8 to 10 rows per page, or render the list in a `.glass-card` with `.glass-table` rows so it reads as the portal. | d4-now--s0.png, d4-now--mid-s2.png, d4-now--last-s5.png |

### High

| # | Page, step | What is wrong | Spec or feedback | Fix | Screenshot |
|---|---|---|---|---|---|
| H1 | f1-single, f4-single, f5-single, all steps | The static frames ignore the glass theme. The body is solid `#fff` in system-ui at 20 px. There is no pane, wash or Slalom Sans. Headers are uppercase and tracked (MEASURE, EXISTING SETUP, TODAY PLUMBING, WEEKLY, NOT YET, KEEP). Slalom Blue is used as a text color ("Wait for:", "VITE 8", every weekly number). | Feedback: glassmorphism for each demo. Spec 1: no uppercase tracked labels. Spec 5 rule 2: Slalom Blue is never a text color on glass; links and eyebrows use `#002FAF`. | In `demos/08-fast-follows/static/styles.css`, `09-vite-8/static/styles.css` and `10-delete/static/styles.css`: delete the `body { background: #fff; font: ... system-ui }` block so the theme's body applies. Put content in `.glass-card` and tables in `.glass-table`. Headers become sentence case, 13 Bold ink-soft, `text-transform: none; letter-spacing: 0`. Change every `#0C62FB` text to `#002FAF`. | f1-single--last-s4.png, f4-single--last-s3.png, f5-single--last-s5.png |
| H2 | f2-now all steps; f2-intro capture | The F2 app does not use the portal shell. There is no pane: the background swirl shows sharply behind "Ridgeline Outfitters" and the controls. Its own CSS overrides the theme (button radius 6 `#0A5BD3`, field border `#D9DEE5`, ink `#16202B`). The log headers are uppercase mono at 12 px (16.5 stage px). The copy input clips its text ("for lc"). The log table runs past the bottom of the frame from s2 on. | Spec 8 shell; spec 2: F2 apps import the theme; text at least 18 stage px. | In `demos/06-framework-cache/app/layout.tsx` (and `-today`), wrap the page in `.portal` > `nav.portal__nav` + `header.portal__top` + `main.portal__main`. Remove the app's global color, border, radius and button rules so the synced theme wins. Log headers: sentence case, 13 Bold. Show the newest 4 log rows (`tbody tr:nth-child(n+5) { display: none }` in unshown CSS). Make the copy field `inline-size: 100%` on its own row. | f2-now--s0.png, f2-now--mid-s2.png, f2-now--last-s4.png |
| H3 | f3-now all steps | The terminal is a solid navy slab from edge to edge, with no frame padding and no pane, so it looks like a different product. The title wraps to 3 lines between the window dots and the pill. "RECORDED" is uppercase and tracked. | Spec 2: terminal frames get the now background. Spec 1: no uppercase tracked labels. Variance dial 3: one consistent product. | Keep the `body` frame background and 12 px frame padding. Render the terminal as a `glass-dark` surface, radius 16, `--glass-dark-shadow`. Title on one line at 15 px: "pnpm 12.11 and npm 11.15, test registry". Pill: "Recorded 26 Oct 2026", `text-transform: none; letter-spacing: 0`, placed on its own row under the title. | f3-now--s0.png, f3-now--mid-s2.png |
| H4 | d1-used-to s3, d1-now s2 and s3, d2-now s2, d3-used-to s3, d5-now s4, d6-used-to s1 and s3, f2-now s2, f3-now s5 | The code panel scrolls to fractional positions, so a half line is cut under the tabs and another at the bottom edge. Highlighted ranges that span more than the panel fall past the edge: D2 s2 cuts the `@container` rule, and D1 used-to s3 leaves the focus-return line on the last row. | Spec 6: 21 full lines in 760 px with 24 px top and bottom padding. CX: highlight 10 lines at most on now pages and 12 on used-to pages. | In `components/page/PageCodePanel.tsx`, snap the scroll to whole lines: `const lh = 36; pre.scrollTo({ top: Math.max(Math.round(target / lh) * lh, 0) })`. Keep the 24 px top padding visible with `scroll-padding-block: 24px` on `.code__pre`. Add a validator rule (`scripts/validate.mts`): from the first to the last highlighted line, at most 20 lines including gaps. Fold longer gaps into an elision line. | d1-used-to--last-s3.png, d2-now--mid-s2.png, d3-used-to--last-s3.png, d5-now--last-s4.png, burst-d1-now-s3-1100ms.png |
| H5 | d6-now s2; d6-intro capture | The open select picker covers "Trail Runner 2", the "Color" label and the select button itself, instead of opening below the button. The Save button shows through the lower edge of the picker, so the frost is not hiding it. The room cannot see the trigger the highlighted `<button><selectedcontent>` lines describe. | Spec 9: picker uses float fill and 16 px frost, and anchors to its select. | Check that nothing sets `inset`, `top` or `position-area` on `::picker(select)`. The theme lint bans it, so look in `select.css` and the build CSS. Open the same page unscaled at 640 by 628 to rule out the 1.375 transform. If the transform causes it, capture and present this step with the frame unscaled at 1x inside the slot. Raise the picker fill to `rgb(255 255 255 / 0.9)` if blur does not apply to `::picker`. Re-run `pnpm visuals d6`. | d6-now--mid-s2.png, d6-intro--s0.png |
| H6 | d6-now s5 | The Firefox proof is a thumbnail of the whole portal, about 430 by 470 stage px. Its text renders at about 8 to 10 stage px, so the plain select is not readable. Its spotlight ring also collides with the status line "Saved. The server got color=moss". | The proof step must show the fallback. CX risk 5: test at projector scale. | Crop `public/posters/d6-firefox.png` (or the capture source) to the Color field and the Save row, about 320 by 140 capture px. Show it at 2x below the status line, with 16 px between. Caption it "Firefox: a normal select" at 15 px. | d6-now--last-s5.png |
| H7 | speaker window, every walk page | The current-slide and next-slide previews show an empty white frame card with only the step label. No step posters exist (`public/` has only `d6-firefox.png`), so the speaker cannot glance at what the room sees. | Feedback and PRD 5.1: previews on the left. | Extend `scripts/visuals.mts` to save one poster per step to `public/posters/<page-id>/<step-id>.png` and set `step.poster`. `DemoPageSlide.tsx` already shows a poster when the file exists. | speaker-d1-now--s0.png, speaker-d1-now--s2.png, speaker-d6-used-to--s3.png |
| H8 | f5-single s5; s0 to s5 | At the last step the table runs past the frame. The "Beyond the demos" row and its spotlight are cut off at the bottom edge. Columns jump between steps as rows appear: "Today plumbing" moves from x 381 to x 413. | The spotlighted target must be visible. CX word list bans "today" for the old way and "plumbing". | In `demos/10-delete/static/styles.css`, use `table { table-layout: fixed }` with a `<colgroup>` (16, 20, 28, 10, 26 percent). Row padding 12 to 8 px. Show the top two packages per demo so 7 rows fit in 628 px. Rename the header to "Code it replaces". | f5-single--s0.png, f5-single--last-s5.png |
| H9 | d5-now s0 to s4 | Before any violation, an empty navy bar 723 by 44 stage px sits under the prose and is the heaviest shape in the frame. At s4 the log renders in the browser's default monospace (Courier) at 12.8 px (17.6 stage px), in a navy slab that is not part of the glass system. | Spec 9 has no dark surface in the portal. Text at least 18 stage px. Code font is `ui-monospace, "SF Mono"`. | In the build's unshown CSS: `.log:empty { display: none; }`. Style the log as a `.glass-card` with `box-shadow: inset 3px 0 0 #FF4D5F`, ink text, and `font: 15px/22px ui-monospace, "SF Mono", Menlo, monospace`. | d5-now--s0.png, d5-now--last-s4.png |
| H10 | f1-single s0; f5-single s0 | F1 arrives on a completely empty white box. F5 arrives on headers only. | CX section 2: every step must change something, and the arrival state carries the scenario. | F1 s0: show all five tiles at 40 percent opacity and light each one on its step, or show the first tile. F5 s0: show the first row (Order actions). | f1-single--s0.png, f5-single--s0.png |

### Medium

| # | Page, step | What is wrong | Spec or feedback | Fix | Screenshot |
|---|---|---|---|---|---|
| M1 | d1-now s2, s5 (and the D1 intro capture) | The dialog is cramped. The title is 15 px with 0 px between it and the buttons, and the focus ring on Keep order overlaps the title. Actions are left aligned. The destructive "Cancel order" looks the same as "Keep order". | Spec 9 dialog: title 18/24, actions right aligned 8 apart, primary last. The danger button is coral with navy text. | Theme (`@layer portal-theme`, allowed on headings): `dialog h2 { font-size: var(--glass-text-lg); line-height: 24px; margin: 0 0 var(--glass-space-7); }`. For alignment and danger, either add `class="glass-dialog__actions"` around the two buttons and `class="glass-btn--danger"` on the confirm button (shown HTML grows by one line), or accept the current layout. Speaker's call. | d1-now--mid-s2.png, crops/d1-now-s2-dialog.png |
| M2 | d1-used-to s1, d1-now s2, d4-now s2 | The spotlight radius is fixed at 4 px. On the D1 dialog (22 stage px radius) the scrim shows in the four corners between the halo and the dialog. On the D4 list it draws a square box past the pane edge. | Spec 6: spotlight radius = target radius + 4. | In `components/page/Overlay.tsx`, read `getComputedStyle(target).borderTopLeftRadius` when measuring rects and set `borderRadius: (r + 4) * scale`. In `styles/components/page.css`, change `.overlay__spotlight` to `border-radius: var(--spot-radius, 4px)`. | crops/d1-now-s2-dialog.png, d4-now--mid-s2.png |
| M3 | d1-used-to s1, f4-single s1 and s3, f5-single s2 | Adjacent spotlights stack into doubled blue lines or a tangled outline: Actions plus menu, and neighbouring table rows. | CX: spotlight 2 elements at most, so the eye lands once. | In `Overlay.tsx`, merge spotlight rects that are within 12 frame px of each other into one union rect. For table rows, spotlight the rows as one group. | d1-used-to--mid-s1.png, f4-single--mid-s1.png, f5-single--mid-s2.png |
| M4 | d4-now s2 | Three spotlights: the filter form, the whole list and the address field. | CX: spotlight 2 elements at most, the control pressed and the surface it changed. | In `content/sections/d4-dashboard-navigation.ts`, drop the list from `spotlight` on this step. | d4-now--mid-s2.png |
| M5 | d2-now s5 | When the frame narrows to 560 px, a 110 px strip of slide background shows inside the frame card, with a hard vertical seam at x 835. It reads as a rendering fault, not as a container edge. | Spec 6: the frame card shows the frame background. | Give `.page-frame` the frame background (`background: linear-gradient(rgb(255 255 255 / 0.4), rgb(255 255 255 / 0.4)), url(/backgrounds/glass-fan.jpg) center / cover`). Draw a 2 px dashed `rgb(15 28 65 / 0.3)` line at the slot's right edge. CX allows one 3-word callout for a state the room cannot see, so add "Container edge". | d2-now--last-s5.png |
| M6 | d1-*, d3-*, d6-* | The panes are 60 to 75 percent empty frosted glass below a single row or field. Next to the inspiration's dense dashboard, the frames still read as wireframes. | Feedback: demos looked rough. Spec dial: density 5. | Speaker's decision, because it adds shown markup. Option A: D1 shows three order rows (418, 419, 420) with status chips, and only 418 has the menu. Option B: keep the shown files as they are and let `lib/frames/compose.ts` inject an unshown context card (order summary, recent activity) into `.portal__main` after the shown markup. | d1-now--s0.png, d3-now--s0.png, d6-used-to--s0.png |
| M7 | d3-used-to and d3-now, all steps | "Details" (label) and "Steps, order number, and what you expected." (hint) are both 15 px Regular ink, so the label does not read as a label. | Spec 9 field: label 13 Bold ink, hint 13 ink-soft. | Theme: `label { font-weight: 700; }`. Hint: add `class="glass-field__hint"` to the hint `<p>` (one attribute in shown HTML), or in the build's unshown CSS: `#details-hint, #t-details-hint { color: var(--glass-ink-soft); font-size: var(--glass-text-sm); }`. | d3-now--s0.png |
| M8 | d3-now s5 | With form.css off, Subject shows only a red 2 px edge. There is no icon and no message, so color is the only signal. | Spec 5 rule 6 and spec 9: invalid adds an icon and a message. | Theme (`portal-theme`, background is allowed on inputs): `input:user-invalid, [aria-invalid="true"] { background: var(--glass-surface-field) url(/theme/icons/alert-circle.svg) no-repeat right 10px center / 16px; padding-inline-end: 34px; }`. The message needs markup, so accept the icon alone or add the shown `<p>` from used-to. | d3-now--last-s5.png |
| M9 | d6-now s0 compared with d6-used-to s0 | On the now page the label, a 192 px plain select and Save sit in one row. On the used-to page the label is stacked above a 300 px field with a swatch, with Save below. The room is told it is the same field, but it looks different. | CX beat 5: the frame looks the same as before. | In the build's unshown CSS: `.variant { display: grid; justify-items: start; gap: 6px; }` and `select { min-inline-size: 300px; }` to match used-to. | d6-now--s0.png, d6-used-to--s0.png |
| M10 | d1-now s5; speaker-d1-now s5 | The bullet says "The menu and the dialog look plain", but the dialog on screen keeps the full glass theme, because the theme stays on by design. Nothing on screen looks plain. | Spec 11: the theme stays on with the enhancement off. CX: the first bullet says what is on screen. | Rewrite the bullet in `content/sections/d1-order-actions.ts`: "The CSS file is off. The menu loses its place and its fade." Make the step end with the menu open, so the unpositioned popover is what the room sees. | d1-now--last-s5.png, speaker-d1-now--s5.png |
| M11 | speaker window, every step with bullets | Bullets have no markers (Tailwind preflight sets `list-style: none`), so a wrapped bullet and the next one blur together at 40 px. The three cautions run together with no gap. | Feedback: notes as an intro paragraph plus bullets, easy to scan. | In `styles/components/speaker.css`: `.notes__bullets, .notes__cautions ul { list-style: disc outside; }`, `.notes__bullet::marker { color: var(--color-slalom-blue); }`, and `.notes__cautions ul { display: flex; flex-direction: column; gap: 0.4em; }`. | speaker-d1-now--s2.png, speaker-d1-now--s5.png |
| M12 | d1-intro, d6-intro (captures) | The D1 still sits under the 36 percent scrim, with the menu still open behind the dialog, so the hero visual is muddy gray beside the bright card. The D6 still is mostly empty pane, with the picker covering the field (see H5). | PRD 1.1: the most telling state. | D1: capture the step where the dialog has just opened, and lower the scrim to `--glass-scrim` 0.24 for captures only through a `capture` flag, or capture the menu-open step. D6: re-capture after H5 is fixed. | d1-intro--s0.png, d6-intro--s0.png |
| M13 | f2-now, f3-now, f4-single, f5-single | Uppercase tracked labels remain across the follow-ups ("REQUEST QUERY CACHED?", "RECORDED", table headers, "KEEP"). | Spec 1 rejects uppercase tracked labels. | Covered by H1 to H3. Also check the F2 app's log header CSS and the F5 "KEEP" emphasis: use Bold sentence case "Keep". | f2-now--s0.png, f5-single--last-s5.png |

### Low

| # | Page, step | What is wrong | Spec or feedback | Fix | Screenshot |
|---|---|---|---|---|---|
| L1 | all now pages with an "Off" chip | The "Off" chip text is 14 px, under the 18 px floor for the back of the room. | Spec 6 says 14 px. This review suggests raising it. | `styles/components/page.css` `.code__off-chip`: `font-size: 18px; padding: 2px 12px;`. | d1-now--last-s5.png |
| L2 | d1-now s2, d4-now s2, d6-now s2 | The ghost cursor lands on the button label and hides letters ("Ap|ly", "Cancel order"). | CX: eyes read the cause, then the effect. | In `Overlay.tsx`, aim the cursor tip at `right - 12, bottom - 8` of the target rect instead of its center. | d4-now--mid-s2.png, d1-now--mid-s2.png |
| L3 | d1-now s3, d6-used-to s3 | Keycaps fade out before the step ends, so the speaker cannot point at the key while saying the bullet. | CX beat 7: pause and say the key point. | Keep the last keycap of a step until the next step starts: no `capTimer` for the final cue in `Overlay.tsx`. | burst-d1-now-s3-1100ms.png, d6-used-to--last-s3.png |
| L4 | f1, f4, f5 | The single-page title sits at y 68, while walk-page titles sit at y 88. The title jumps between pages. | Spec 6: title at y 88. | `.page[data-stage="single"] .page__header { padding-block-start: 40px; }`, or keep the 36 px eyebrow row empty. | f1-single--s0.png |
| L5 | d1-used-to s0 | The `index.html` excerpt opens with "<!-- ... 1 more line -->", which hides one line behind a line. | Elision exists to save space. | In `scripts/excerpt.mts`, only elide gaps of 3 or more lines; show shorter gaps in full. | d1-used-to--s0.png |
| L6 | f1-single s4 | Five tiles in a 3 plus 2 grid leave an empty cell. "Wait for" lines misalign when a title wraps. | Pre-delivery: alignment. | `grid-template-columns: repeat(6, 1fr)` with tiles spanning 2, and the last row centered (`grid-column: 2 / span 2` and `4 / span 2`). Pin the "Wait for" line with `margin-block-start: auto` in a flex column. | f1-single--last-s4.png |
| L7 | d6-intro | "It works in Chrome, Edge and Safari since September 2026" mixes tenses. | Writing rules: plain, correct sentences. | Change the partial-support template in the generator (PRD 3.3) to "It has been available in Chrome, Edge and Safari since September 2026." | d6-intro--s0.png |
| L8 | all pages with spotlights | `.overlay__spotlight` transitions `left`, `top`, `width` and `height`. | Spec 10: animate only opacity and transform. | Position with `transform: translate()` and size once per step, or drop the transition. | n/a |
| L9 | all walk pages | `.page-frame__slot` is 880 px wide at x 65 inside an 880 px card with a 1 px border, so it overflows by 1 px on the right. | Spec 6 geometry. | Size the slot to the card's content box (878 by 862) or use `inset: 0` inside the bordered card. | n/a |

## Contradictions with the speaker's feedback

- **"Glassmorphism for each demo."** F1, F4 and F5 are white static pages. F2 has no pane. F3 is a solid slab (H1 to H3).
- **"The demos visually look really rough."** D4's raw link list and the hidden evidence panel, D5's empty bar, and the F placeholders still look unfinished (B2 to B4, H9, H10).
- **"Visual walkthrough and code at the same time."** This holds on every walk page. It breaks only where the highlight is cut off at the panel edge (H4) or the changed element is hidden (B4, H5, H8).
- **Speaker notes "readable" with "previews on the left".** The type is large and the structure is right. Bullets lack markers (M11), previews are blank for walk pages (H7), and one D1 bullet describes something the screen does not show (M10).
- **Writing rules.** F5's header "Today plumbing" uses two words the CX list bans for this talk (H8).

## Open questions for the speaker

1. Sparse panes (M6): add shown context rows, or let the composer inject an unshown context card?
2. D1 dialog (M1): accept one extra class in the shown HTML for right-aligned actions and a coral confirm button?
3. F4 (B3): if Vite numbers are not measured by rehearsal, cut F4 or show it as a single "to be measured" slide?

## Checks not run

- No projector check. All contrast judgments are on a laptop render, and CX risk 5 says glass washes out on projectors.
- No reduced-motion, `?glass=off` or `forced-colors` pass.
- No axe run.
- Toasts were not captured, so the fifth signature surface is unverified.
- `design-taste` was not re-run, because the direction exists in the spec. This was a `design-critique` pass only.

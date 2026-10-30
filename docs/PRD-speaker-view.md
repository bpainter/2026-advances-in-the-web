# PRD: speaker view in dark glass

Round 8 of the presenter app, speaker window only (`/speaker`). The speaker's requests are quoted in section 1 and are fixed. Everything in `docs/PRD-r7.md`, `docs/PRD-demos-v5.md`, `docs/PRD-demos-v4.md` and `docs/demo-engine.md` still holds unless this document changes it.

Start from `aa84356`. Status: ready for build, 29 October 2026.

This PRD carries the visual spec as well as the behavior, so the design agent and the engineering agent work from one page. The tokens build on `docs/design/demo-glass-spec.md` (section 4.5, dark variant) and the drawer and pill values in `docs/design/r7-spec.md` (sections 4 and 7). The design agent may refine visual values inside `styles/components/speaker.css`, within the contrast floors in section 6. On behavior, markup, contrast and tests, this PRD wins.

A second workstream (performance and accessibility across the app) runs at the same time. It may touch `components/stage/*`, `components/page/*`, `public/runtime/demo-runtime.js`, `next.config.ts` and image assets, and it may move `app/speaker/page.tsx` to `app/speaker/[id]/page.tsx` (`docs/perf/platform-review.md`, item 3). This PRD stays out of those files. Section 10 has the rules.

## Decisions at a glance

| Topic | Decision |
|---|---|
| Look | Dark glass on a near-black navy background. Panels are clear navy glass with a hairline edge. The two slide previews are the only bright surfaces. |
| Left column | Current slide, at today's size. Under it, a small "Next slide" panel: preview, number and title, short description. Nothing else. |
| Right column | One glass panel. Top: the title and steps block (counter, section, page title, step label, status, step progress, a quiet next-step hint, text size). Below it: the notes, which are the only thing that scrolls, ending in a collapsed, styled References disclosure. |
| Status row | Removed. Each item moves (section 4). "frame ready" and the "Ready" pill merge into one status pill beside the step label. |
| "Next: ..." callout | Removed. A one-line "Next step: label" hint stays inside the steps block, in small soft text, only when the current slide has another step. The next slide stays on the left only. |
| Footer | Two dark glass pills in the style of the reader controls. Left: the controls, Previous and Next in Slalom Blue. Right: the timer (elapsed, pace, start or pause). |
| Timer bar | The expanding timing bar and its "Timer" toggle are removed. The footer timer is always shown. |
| BroadcastChannel label | Removed. Recommended follow-on (P1): a presence ping so the Audience button shows a coral dot when no audience window is connected. Nothing shows when all is well. |
| Accessibility | One `main`, the next preview `inert` and `aria-hidden`, new-tab links announced, the page title tracks the slide, cyan focus rings. Keyboard map unchanged. |
| Floating widget | Not part of the app. See section 3.3. |

## 1. The speaker's requests (fixed)

1. Redesign to use a dark glassmorphism design. Important to keep this dark for the stage.
2. Left side. It should only contain:
   1. The current slide (primary, sizing is fine as-is)
   2. The next slide (secondary, keep it small with the short description)
3. Right side. It should only contain:
   1. Title & steps
   2. The notes (primary)
   3. References (secondary, collapsed, make sure they're styled)
   4. Remove the callout for what's next. No need to duplicate what's already on the left side
4. Footer / Bottom: We can mimic a similar control style as the present controls
   1. Controls (left side)
   2. Timer (right side)
   3. Remove the broadcast channel

## 2. Writing rules for all new copy

Every string the speaker view shows follows PRD r7 section 2: no em or en dashes, sentence case, short plain words, no "!". All copy in this PRD already passes. Engineers type it as written. The flags on the preview change from "BLANK" and "HANDS-ON" to "Blank" and "Hands-on", and the region labels from "NOTES" and "NEXT" to sentence case (the glass spec rejects uppercase tracked labels).

## 3. What exists today

Measured in Playwright Chromium against `pnpm dev`, two windows in one context, `/speaker?s=d1-used-to&step=1`.

### 3.1 Inventory

| Element | Source | Notes |
|---|---|---|
| Current preview | `SlidePage mode="speaker-preview" embedded` in `.speaker__current` | 633 by 356 at 1440 by 900, 851 by 479 at 1920 by 1080, 1142 by 642 at 2560 by 1440. Its `Stage` also renders the drawer dialog, the go-to dialog (`g`), keyboard help (`?`), the polite announcer and the rehearsal overlay. |
| Status row | `.speaker__status` | Counter, "section n of m · stage · step n of m", `frame <health>`, `TimerBadge`, the "Timer" toggle. Wraps to two lines at 1440. |
| Next | `.speaker__next` | Preview at 45 percent of the column, "10. What we can do today", the section's `scenario` on demo pages. |
| Notes head | `.speaker__notes-head` | "NOTES" label, minus and plus (28 to 56 px, step 4, `deck:notes-size`). |
| Notes header | `.notes__header` | Eyebrow and title, "Step n of m: label", Key point and Proof chips, Playing or Ready pill (`.notes__play`). |
| Notes body | `.speaker__notes-body` | Hands-on box (`ifKeyboard`), page intro on step 0, bullets, cautions on the now page's last step, `details.notes__reference` (support line, proof, citations, step jump list, action summaries). Unstyled. |
| Next callout | `.notes__next` | "Next: step label", "Next page: ...", or "End of deck". `d` adds the next step's actions. |
| Controls | `.speaker__controls` | Slides (drawer), Previous, Next, Blank, Hands-on, Reset step, Audience window, Open frame, Export rehearsal log (`?rehearse=1`). |
| Transport | `.speaker__transport` | "BroadcastChannel · n windows". |
| Timer bar | `Timer` in `Timer.tsx` | Shown on demand: elapsed, target by end of slide, over or under, remaining, Start, Reset, Hide. |
| Toast | `.speaker__toast` | "Timer started", chartreuse, bottom center. |

### 3.2 Problems found

1. **The window count is wrong at rest.** `peers` counts windows heard from in the last 5 s, and windows only send on a change. With the audience window open and idle, the label reads "1 window" after 5 s. It cannot be trusted as a lost-peer signal.
2. **"Ready" shows with no audience window.** The pill reads Ready whenever no playback message says otherwise, including when the audience window is closed.
3. **Health is not replayed.** A speaker window opened or reloaded after the audience window shows "frame not reported" until the frame reloads, because health is only sent on change.
4. **The rehearsal overlay and the toast collide with the controls.** `.stage__rehearsal` is fixed bottom right over the transport label; the toast sits over the Audience and Open frame buttons (`?rehearse=1`, after `t`).
5. **Bright surfaces.** The go-to dialog is solid white, the toast and pressed toggles are chartreuse fills, and the global focus ring is Slalom Blue at 2 px, which measures about 2.5:1 on navy (`docs/perf/a11y-review.md` M4).
6. **Accessibility (a11y review L4).** No `main` landmark; two h1s (both previews); the next preview is exposed to screen readers, so the duplicate `region "Code"` fails axe `landmark-unique`; notes links open new tabs without saying so; the title never changes.
7. **Dead CSS.** These classes in `speaker.css` match nothing: `speaker__action`, `speaker__cautions`, `speaker__chip`, `speaker__chip-id`, `speaker__chips`, `speaker__citations`, `speaker__eyebrow`, `speaker__gotcha`, `speaker__health`, `speaker__next-layout`, `speaker__next-press`, `speaker__next-press-label`, `speaker__notes-step`, `speaker__notes-text`, `speaker__proof`, `speaker__support-note`.

### 3.3 The floating widget on the right edge

The round widget on the right edge of the screenshot (a person icon over a list icon, with blue dots) is not part of the app. In a clean Playwright Chromium at 1440, 1920 and 2560 wide, nothing renders there, and `body` holds only the app root, `.speaker`, Next's scripts and `next-route-announcer`. The only fixed element in the DOM is the drawer dialog. It is injected by the browser the screenshot came from, either an extension or the built-in pane's own tooling. No work in this PRD. On talk day, run the speaker window in a Chrome profile with no extensions.

## 4. Where everything goes

| Today | New home | Notes |
|---|---|---|
| Counter "9 / 50" | Steps block, meta line | "9 / 50", read as "9 of 50". |
| "section 1 of 14" | Steps block, meta line | "Section 1 of 14". |
| Stage name ("used-to") | Dropped | The page title already says it ("What we used to do", "Intro slide: ..."). |
| "step 2 of 4" | Steps block, step label | Already in "Step 2 of 4: Open the menu". Plus the progress segments. |
| "frame ready" and the "Ready" pill | One status pill, right of the step label | Merged (section 8.2). Where the eye already goes after a press. |
| Elapsed and over or under | Footer, timer pill | |
| "Timer" toggle | Removed | The timer is always shown. Start and pause move into the timer pill. |
| Timing bar (target, remaining, Reset, Hide) | Removed | Reset moves into the timer pill, shown only while paused. Target and remaining are dropped (open question 4). |
| Native slide section ("cold-open") | Dropped | A raw id. Native slides show the counter only. |
| "NOTES" label and minus, plus | Steps block, meta line, right | Two icon buttons. The notes region keeps an accessible name. |
| "NEXT" label | Left, next panel header | "Next slide". |
| "Next: Open the confirm box" callout | Steps block, small hint | "Next step: Open the confirm box", only when the slide has another step. "Next page" and "End of deck" go: the left side shows them. |
| `d` action summaries under Next | Under the next-step hint | Rehearsal only, as today. |
| Reference | End of the notes body | Renamed "References", styled, collapsed on every slide change. |
| BroadcastChannel label | Removed | P1 presence dot on the Audience button (section 8.6). |
| Export rehearsal log | Footer controls, last | "Export log", `?rehearse=1` only. |

## 5. Layout

### 5.1 Grid

The grid columns, padding and gaps stay exactly as today, so the current preview keeps its size. Only the rows change: the status row, next callout and transport line go, and the footer becomes one 50 px row of pills.

```css
.speaker {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(380px, 6fr); /* unchanged */
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas: "slides main" "footer footer";
  gap: 16px;                                               /* unchanged */
  padding: 16px;                                           /* unchanged */
  block-size: 100dvh;
  overflow: hidden;
}
.speaker[data-rehearse="true"] { grid-template-columns: minmax(0, 6fr) minmax(380px, 5fr); } /* unchanged */
```

```text
+------------------------------------------+  +-----------------------------------------------+
| CURRENT SLIDE (16:9, bright)              |  | 9 / 50 · Section 1 of 14                [A-][A+] |
|                                           |  | Dialog element: What we used to do              |
|                                           |  | Step 2 of 4: Open the menu  [Key point] (o Ready)|
|                                           |  | == == -- --                                     |
+------------------------------------------+  | Next step: Open the confirm box                 |
                                              |-------------------------------------------------|
+------------------------------------------+  |  * The Actions button opens the menu.          |
| Next slide                                |  |    Script builds it in an empty box at the     |
| +-----------+  10 · Dialog element: What  |  |    end of the page.                            |
| | preview   |  we can do today            |  |                                    (scrolls)   |
| +-----------+  An order row has an ...    |  |  > References                                  |
+------------------------------------------+  +-----------------------------------------------+
(Slides|< Previous|Next >|Blank|Hands-on|Reset step|Audience|Open frame)       (24:06  16:36 over  ||)
```

### 5.2 Sizes

Padding 16, gaps 16, footer row 50 (40 px buttons, 4 px pill padding, 1 px edge).

| Viewport | Left column | Current preview | Next preview | Right panel | Main row height | Notes body (approx.) |
|---|---|---|---|---|---|---|
| 1440 by 900 | 633 | 633 by 356 | 270 by 152 | 759 by 802 | 802 | 569 tall, about 707 wide |
| 1920 by 1080 | 851 | 851 by 479 | 369 by 207 | 1021 by 982 | 982 | 749 tall |
| 2560 by 1440 | 1142 | 1142 by 642 | 500 by 281 | 1370 by 1342 | 1342 | 1109 tall |
| 1440 by 900, `?rehearse=1` | 759 | 759 by 427 | 328 by 185 | 633 by 802 | 802 | 569 tall |

The tallest notes measured today (all 135 steps at 1440 by 900, 40 px) are 464 px of bullets (`d4-now` step 2). The new body has room for that plus one wrapped line. A windowed Chrome on the 1440 by 900 laptop leaves about 790 px of viewport; the body then drops to about 459, so the longest steps scroll a little. Press `f` (fullscreen) on the speaker window, as the runbook already does.

### 5.3 Left column (`.speaker__slides`)

A plain flex column, gap 16, aligned to the top. It holds exactly two children. The space below the next panel stays empty.

- **Current slide** (`.speaker__current`). Full column width, 16:9 (`.stage--embedded`, unchanged). Radius 12, `overflow: hidden`, 1 px edge white 0.12, shadow `0 24px 64px rgb(0 0 0 / 0.5)`. No glass panel around it. Flags in its top corners, as today: "Blank" (coral fill, navy text) top left and "Hands-on" (chartreuse fill, navy text) top right, 12/16 bold, sentence case, pill, 4 by 10 padding. While blank is on, the preview also gets a 2 px coral outline at a 2 px offset, so the state reads from across the laptop.
- **Next slide** (`.speaker__next`). A glass panel (`--speaker-panel`), radius 16, padding 16. Header "Next slide", 15/20 bold, soft ink, 8 below. Then a row, gap 16: the preview at 45 percent of the panel's inner width (radius 8, edge white 0.12), and the meta:
  - Title, 17/24 bold white: "10 · Dialog element: What we can do today". It uses the same name as today's `nextPageName` (eyebrow and title for framed walk pages, else the slide title).
  - Description, 15/22 regular, body ink, at most 4 lines (`line-clamp: 4`): `next.demoSection.scenario` on demo pages. Native slides have no short description field and show the title only (open question 3).
  - At the end of the deck the panel shows "End of deck" in the title style and no preview.

Never put `backdrop-filter`, `filter`, `transform`, `perspective` or `contain: paint` on `.speaker`, `.speaker__slides` or `.speaker__current`. Any of them makes the element the containing block for the `position: fixed` rehearsal overlay rendered inside the preview's stage. The next panel draws its glass on a `::before` pseudo-element (the pattern `.portal::before` uses), so the passive stage inside it is never inside a filtered box either.

### 5.4 Right column (`.speaker__main`)

One glass panel (`--speaker-panel`), radius 20, padding 20 20 0, flex column, `min-block-size: 0`. Two parts: the title and steps block (fixed height, never scrolls) and the notes (fill the rest, scroll).

#### Title and steps block (`.speaker__heading`)

Top to bottom, left aligned:

1. **Meta line** (`.speaker__meta`), flex, space between, 32 tall.
   - Left, 15/20 regular, soft ink: "9 / 50 · Section 1 of 14" on demo pages, "1 / 50" on native slides. The counter is bold white. The slash is drawn the way the reader pill draws it, and screen readers hear "9 of 50".
   - Right: the text size control (`.speaker__size`), a mini pill: two 32 by 32 icon buttons, Lucide `AArrowDown` and `AArrowUp` at 18 px, `aria-label` "Smaller notes text" and "Larger notes text". Fill white 0.06, edge white 0.12. Each is disabled at its bound (28 and 56).
2. **Page title** (`h2.speaker__title`), 20/28, body ink, 8 above. Eyebrow in bold white, then ": " and the title in regular: "**Dialog element:** What we used to do". Intro pages: "**Intro slide:** Dialog element". Native slides: the slide title alone, bold white.
3. **Step row** (`.speaker__step-row`), flex, gap 12, align center, 4 above. Demo pages only.
   - `p.notes__step`, 28/36 bold white: "Step 2 of 4: Open the menu". Its text must start with that string (the walk reads it). The Key point and Proof chips sit inside it after the label: 15/20 bold, pill, 2 by 10. Key point: chartreuse fill, navy text. Proof: white 0.12 fill, white text.
   - The status pill, `p.notes__play`, `margin-inline-start: auto`, on framed pages only (section 8.2): 32 tall, pill, padding 0 12 0 10, 15/20 bold white, an 8 px dot 8 before the text. Fill and dot per state: Ready cyan 0.16 and cyan; Playing chartreuse 0.16 and chartreuse; Loading white 0.08 and `#B8C0D9`; Frame error and Poster shown coral 0.18 with a 1 px coral edge and a coral dot; No audience white 0.08 and `#B8C0D9`.
4. **Progress** (`ol.speaker__progress`, `aria-hidden="true"`), 10 above, only when the page has 2 or more steps. One `li` per step: 6 tall, radius 3, `flex: 1 1 0`, `max-inline-size: 56px`, gap 4. Done: white 0.56. Current: cyan. Upcoming: white 0.2. The step label carries the meaning; the segments are decoration.
5. **Next-step hint** (`p.notes__then`), 17/24 regular, soft ink, 10 above, only when a next step exists on this slide: "Next step: Open the confirm box", with "Next step:" in bold. With `d` on, the next step's action summary follows on its own line (`span.notes__then-actions`, 15/22, soft ink). On the last step the hint is not rendered; nothing replaces it.

Under the block: a 1 px rule (white 0.12) with 16 above and 0 below.

#### Notes (`section.speaker__notes`)

`aria-label="Notes"`, flex 1, `min-block-size: 0`. The body (`.speaker__notes-body`) is the only scroller in the window: `overflow-y: auto`, `scrollbar-gutter: stable`, `scrollbar-width: thin`, `scrollbar-color: rgb(255 255 255 / 0.24) transparent`, padding 16 4 24 0. It scrolls to the top on every slide or step change, as today. A 24 px fade mask at the bottom edge (`mask-image: linear-gradient(to bottom, #000 calc(100% - 24px), transparent)`) hints there is more; under forced colors the mask is off.

Order inside the body (unchanged from demo-engine "Speaker window", minus the header, which moved up):

1. Hands-on box (`.notes__hands-on`), when hands-on is on and the step has `ifKeyboard`: `calc(var(--notes-size) * 0.8)` (32 px at 40), line height 1.3, white, padding 12 16, radius 12, 2 px chartreuse edge, chartreuse 0.10 fill, 16 below.
2. Page intro on step 0 (`.notes__intro`): `calc(var(--notes-size) * 0.8)`, line height 1.35, white. On native slides `slide.speakerNotes` renders here, as today.
3. Bullets (`ul.notes__bullets`): `var(--notes-size)` (default 40, range 28 to 56, step 4, saved in `deck:notes-size`), line height 1.35, white, regular, `gap: 0.4em`, padding-left 1.1em, disc markers in cyan. The key step's last bullet is bold, as today.
4. Cautions (`section.notes__cautions`) on the now page's last step: label "Cautions", 20/28 bold chartreuse; items `calc(var(--notes-size) * 0.7)` (28 at 40), body ink.
5. References (below).

At the 40 px default, a laptop at arm's length (about 60 cm) shows a cap height near 5.5 mm, which reads at a glance. The size control stays because room light and distance change on the day.

#### References (`details.notes__reference`)

- Collapsed by default and again on every slide change (key the element by `slide.id`). 24 above, a 1 px rule (white 0.12) on top.
- Summary (`summary`): a 44 tall row, flex, gap 8. Lucide `ChevronRight` at 18 px, rotating 90 degrees when open over 160 ms (`--glass-ease`; none under reduced motion), then "References" 17/24 bold, body ink. The default marker is hidden (`list-style: none` and `::-webkit-details-marker { display: none }`). Hover: white 0.06 fill, radius 8. Focus: the cyan ring (section 6.3).
- Open content: an inner card, white 0.04 fill (no blur: cards never blur, glass spec 4.1), radius 12, padding 16, 16/24 regular, body ink. Groups, each with a 14/20 bold soft label, 12 apart, shown only when they have content:
  - "Support": the support line and "Proof item: ..." (today's `supportLine` and `step.proof`).
  - "Sources": the citations as a list. Links in cyan (`#1BE1F2`), underline 1 px at a 3 px offset, 2 px on hover, `target="_blank" rel="noopener"`, each ending in a visually hidden ", opens in a new tab".
  - "Jump to step": the step buttons, flex wrap, gap 6. Each 32 tall, pill, padding 0 12, 14/20 bold, white 0.08 fill, edge white 0.12, text "1. Same row". The current one: cyan 0.16 fill, cyan edge, `aria-current="step"`.
  - "Actions": "This step: ..." and "Next step: ..." (the `summarize()` lines), 14/20, soft ink. Selector text stays inside References only (the walk checks this).

### 5.5 Footer (`footer.speaker__bottom`)

`grid-area: footer`, flex, `justify-content: space-between`, align center, gap 16, `flex-wrap: wrap`. Two pills that copy the reader pill's look (`reader-controls.css`) without reusing its class, which is fixed-positioned and fades when idle: navy 0.85 fill, 1 px edge `--glass-dark-border-color`, `--glass-blur`, `--glass-dark-highlight`, radius pill, padding 4, opacity always 1. Shared button base (`.speaker__button`): 40 tall, pill, padding 0 14 0 12, gap 8, 14/20 bold white, transparent fill, Lucide icon 18 px stroke 1.75 `aria-hidden`. Hover white 0.10. Disabled opacity 0.4. Dividers between groups (`.speaker__divider`, `aria-hidden`): 1 by 24, white 0.16, margin 0 6.

**Controls pill** (`nav.speaker__controls`, `aria-label="Presenter controls"`), left, in this order:

| Group | Button | Icon | Visible label | State |
|---|---|---|---|---|
| Deck | Drawer | `Menu` | Slides | `NavTrigger`, unchanged behavior |
| Move | Previous | `ChevronLeft` | Previous | Primary: Slalom Blue fill, hover `#0A4EC9`, min width 112 |
| | Next | `ChevronRight` (after the label) | Next | Primary, as Previous. Text content stays exactly "Next" (walk r7). |
| Stage | Blank | `EyeOff` | Blank | `aria-pressed` |
| | Hands-on | `Hand` | Hands-on | `aria-pressed` |
| | Reset step | `RotateCcw` | Reset step | disabled when the slide has no page |
| Windows | Audience | `MonitorUp` | Audience | opens or focuses `/present` (`deck-audience`). P1 presence dot, section 8.6. |
| | Open frame | `ExternalLink` | Open frame | disabled without a frame |
| Rehearsal | Export log | `Download` | Export log | `?rehearse=1` only |

Pressed toggles (`aria-pressed="true"`): chartreuse 0.16 fill, 1.5 px inset chartreuse edge (`box-shadow: inset 0 0 0 1.5px`), white text, chartreuse icon. No solid chartreuse fill: nothing bright on the laptop but the slides.

"Audience window" shortens to "Audience" so the footer fits at 1440 in rehearsal mode (about 1080 px of controls plus 270 of timer in 1408). Its `title` is "Open or focus the audience window".

**Timer pill** (`div.speaker__timer`, `role="group"`, `aria-label="Timer"`), right. Padding 4 4 4 16, gap 12, align center:

- Elapsed: `time.speaker__elapsed`, 22/28 bold white, `font-variant-numeric: tabular-nums` (the glass spec's warning is about commas and periods; a clock needs stable digits), min width 64, right aligned. "0:00" before start.
- Pace: `span.speaker__pace`, 15/20 bold. "16:36 over" in coral text `#FF7A87` (`data-pace="over"`); "9:30 under" in body ink; "Not started" in soft ink. While paused it reads "Paused, 9:30 under". The word carries the meaning; color is the second signal.
- Start or pause: a 40 by 40 icon button, Slalom Blue fill when not started, else transparent. `Play` with `aria-label` "Start timer" or "Resume timer"; `Pause` with "Pause timer". It calls `perform({ type: "toggle-timer" })`, the same as `t`.
- Reset: a 40 by 40 icon button, `TimerReset`, `aria-label` "Reset timer", only while paused. Sets `startedAt` and `pausedAt` to null, as the old bar's Reset did. Hiding it while running prevents a mid-talk slip.

No live region on the clock: it ticks every 500 ms and would talk over the speaker's screen reader.

### 5.6 Overlays

- **Drawer** (`#deck-nav`): unchanged, styled by `nav-drawer.css`. It is already dark glass.
- **Keyboard help** (`?`): unchanged, already dark glass.
- **Go-to dialog** (`g`, `.goto`, styled in `speaker.css`): becomes dark glass like keyboard help: navy 0.3 tint over `blur(16px) saturate(170%) brightness(0.58)`, edge `--glass-dark-border-color`, radius 20, padding 20 24, white text. Label "Go to slide" 17 bold. Input: 96 wide, 44 tall, white 0.08 fill, edge white 0.5, radius 8, 20 px white, `color-scheme: dark`. "Go" is a primary button (Slalom Blue, 44 tall). Backdrop `--glass-scrim`. Markup in `GotoDialog.tsx` does not change.
- **Rehearsal overlay** (`.stage__rehearsal`, rendered by `Stage`, styled in `speaker.css`): in the speaker window only (`.speaker .stage__rehearsal`), fixed at left 16 and bottom 78 (above the controls pill), `max-inline-size` the left column width, navy 0.85 fill, edge `--glass-dark-border-color`, radius 8, 12/16 mono white. The audience window's rule is unchanged.
- **Toast** (`.speaker__toast`, "Timer started"): fixed, right 16, bottom 78, so it sits over the timer it describes. Dark glass pill (navy 0.85, edge, blur), 15/20 bold white, an 8 px chartreuse dot. Fades in over 200 ms and out over 160 ms; opacity only under reduced motion.

### 5.7 Responsive behavior

- **1280 px and wider:** the two-column layout above. Only the notes body scrolls; the page never scrolls.
- **1280 to 1439:** the footer may wrap. The timer pill drops to a second line, right aligned, and the main row shrinks by 58 px. No horizontal overflow.
- **Below 1280** (unchanged breakpoint): one column in this order: current slide, next slide, title and steps, notes, footer. The page scrolls; the notes body has no max height. The footer is `position: sticky; bottom: 0` so the controls stay in reach.
- **Short windows (under 760 tall, 1280 and wider):** layout unchanged; the notes body gets less room and scrolls.

## 6. Dark glass tokens

### 6.1 Tokens

Defined on `.speaker` in `styles/components/speaker.css`. Do not edit `styles/glass-tokens.css`: frames load a copy of it, `pnpm check` hashes it, and the other workstream may touch it. The speaker tokens alias the dark glass tokens where they exist.

| Token | Value | Use |
|---|---|---|
| `--speaker-bg` | `#05091A` | Window background, a near-black navy |
| `--speaker-bg-glow` | `radial-gradient(1200px 800px at 15% 0%, rgb(12 98 251 / 0.14), transparent 70%), radial-gradient(900px 700px at 90% 100%, rgb(199 185 255 / 0.06), transparent 70%)` | Static, painted on `.speaker` with `background-attachment: fixed`. Gives the glass something to frost. Brightest point `rgb(6 21 58)`. |
| `--speaker-panel` | `rgb(255 255 255 / 0.05)` | Next panel and right panel fill |
| `--speaker-panel-filter` | `blur(24px) saturate(140%)` | Same as `--glass-filter-pane` |
| `--speaker-edge` | `var(--glass-dark-border-color)` (white 0.16) | Panel and pill edges |
| `--speaker-highlight` | `var(--glass-dark-highlight)` | Inner top highlight |
| `--speaker-shadow` | `var(--glass-dark-shadow)` | Panels |
| `--speaker-pill` | `rgb(15 28 65 / 0.85)` | Footer pills, toast, rehearsal overlay (the reader pill's fill) |
| `--speaker-rule` | `rgb(255 255 255 / 0.12)` | Rules, card edges |
| `--speaker-ink` | `var(--glass-dark-ink)` (`#FFFFFF`) | Notes, titles, labels on buttons |
| `--speaker-ink-body` | `var(--glass-dark-ink-body)` (`#D6DCEC`) | Page title, descriptions, references |
| `--speaker-ink-soft` | `var(--glass-dark-ink-soft)` (`#B8C0D9`) | Meta line, hints, region labels |
| `--speaker-link` | `var(--cyan)` | Links in References |
| `--speaker-over` | `#FF7A87` | "over" pace text (coral `#FF4D5F` is only 4.48:1 on the strongest panel) |
| `--speaker-primary` | `var(--slalom-blue)`, hover `var(--slalom-blue-hover)` | Previous, Next, Start, Go |
| `--speaker-focus` | `var(--glass-dark-focus)` (cyan) | Focus ring |
| `--speaker-solid` | `var(--glass-dark-solid)` (`#16234D`) | Panels and pills when glass is off |

Blur budget: the next panel, the right panel and the two footer pills (4). The current preview is never blurred or under a blur.

### 6.2 Contrast (computed, WCAG 2.x)

Composited over `--speaker-bg` and over the glow's brightest point, as the glass spec does. "Panel" is white 0.05 over the glow; "strong" is white 0.08 (hover).

| Text | Bg | Panel | Strong | Solid `#16234D` | Floor |
|---|---|---|---|---|---|
| White | 19.8 | 15.8 | 14.5 | 15.2 | 4.5 |
| `#D6DCEC` body | 14.4 | 11.5 | 10.6 | 11.1 | 4.5 |
| `#B8C0D9` soft | 10.9 | 8.7 | 8.0 | 8.4 | 4.5 |
| Cyan link | 12.4 | 9.9 | 9.1 | 9.5 | 4.5 |
| `#FF7A87` over | 7.9 | 6.3 | 5.8 | 6.1 | 4.5 |
| White on Slalom Blue button | 5.05 | | | | 4.5 |
| Navy on chartreuse (Key point chip, Hands-on flag) | 14.7 | | | | 4.5 |
| White on cyan 0.16, chartreuse 0.16, coral 0.18 pills | 10.9, 10.1, 13.0 | | | | 4.5 |
| Cyan ring vs panel; vs Slalom Blue button | 9.9; 3.15 | | | | 3.0 |

Coral `#FF4D5F` is not a text color here (4.48 to 4.88). It stays for fills, dots and edges.

### 6.3 Focus

Every focusable element in `.speaker`: `outline: 3px solid var(--speaker-focus); outline-offset: 2px`, radius following the element. On the footer pills' buttons the ring sits outside the button at a 2 px offset, so it lands on navy (9.9:1), never only on Slalom Blue. The `summary` and step buttons take the same ring. Never `outline: none` without this replacement.

### 6.4 Fallbacks

| Condition | Result |
|---|---|
| `prefers-reduced-transparency: reduce`, `:root[data-glass="off"]` (`?glass=off`), `@supports not (backdrop-filter: blur(1px))` | Panels and pills become `--speaker-solid`, filters `none`, inner highlight dropped, edges white 0.16 stay. The background glow stays (it is not transparency). The go-to dialog becomes solid `--speaker-solid`. |
| `forced-colors: active` | Filters and the notes fade mask off. Panels `Canvas` with a 1 px `CanvasText` edge; text `CanvasText`; buttons `ButtonFace`, `ButtonText`, 1 px `ButtonText` edge; pressed toggles and the current step button `Highlight` and `HighlightText`; links `LinkText`; focus `Highlight`; status dots and progress segments `CanvasText` (current segment `Highlight`). Every state still has its text label. |
| `prefers-reduced-motion: reduce` | No chevron rotation, toast fades only, no transitions over 160 ms. |
| `color-scheme` | `.speaker { color-scheme: dark; }` so scrollbars and the go-to input match. |

## 7. Markup contract

The class names below are the contract. The engineering agent renders them; the design agent styles only them. A new class goes through this table first. Classes the walk reads are marked (W).

```html
<div class="speaker" data-rehearse data-blank data-hands-on>
  <section class="speaker__slides" aria-label="Slide previews">
    <div class="speaker__current" data-blank>
      <p class="speaker__flag" data-flag="blank">Blank</p>            <!-- when blank -->
      <p class="speaker__flag" data-flag="hands-on">Hands-on</p>      <!-- when hands-on -->
      <!-- SlidePage, embedded: stage, drawer, go-to, keyboard help, rehearsal overlay -->
    </div>
    <section class="speaker__next" aria-labelledby="speaker-next-label">
      <h2 class="speaker__label" id="speaker-next-label">Next slide</h2>
      <div class="speaker__next-row">
        <div class="speaker__next-preview" inert aria-hidden="true"><!-- passive SlidePage --></div>
        <div class="speaker__next-meta">
          <p class="speaker__next-title">10 · Dialog element: What we can do today</p>
          <p class="speaker__next-desc">An order row has an Actions menu. ...</p>
        </div>
      </div>
    </section>
  </section>

  <main class="speaker__main" aria-labelledby="speaker-title">
    <header class="speaker__heading notes__header">                       <!-- (W) .notes__header -->
      <div class="speaker__meta">
        <p class="speaker__position"><b>9</b><span class="visually-hidden"> of </span><span class="speaker__total">50</span> · Section 1 of 14</p>
        <div class="speaker__size" role="group" aria-label="Notes text size">
          <button class="speaker__icon-button" aria-label="Smaller notes text">…</button>
          <button class="speaker__icon-button" aria-label="Larger notes text">…</button>
        </div>
      </div>
      <h2 class="speaker__title" id="speaker-title"><b class="notes__eyebrow">Dialog element:</b> What we used to do</h2>
      <div class="speaker__step-row">
        <p class="notes__step">Step 2 of 4: Open the menu <span class="notes__chip notes__chip--key">Key point</span></p>  <!-- (W) -->
        <p class="notes__play" role="status" data-status="ready">Ready</p>                                                   <!-- (W) -->
      </div>
      <ol class="speaker__progress" aria-hidden="true"><li data-state="done"></li><li data-state="current"></li>…</ol>
      <p class="notes__then"><b>Next step:</b> Open the confirm box<span class="notes__then-actions">…</span></p>
    </header>
    <section class="speaker__notes" aria-label="Notes" style="--notes-size: 40px">
      <div class="speaker__notes-body">                                     <!-- (W) -->
        <p class="notes__hands-on">…</p>                                    <!-- (W) -->
        <p class="notes__intro">…</p>
        <ul class="notes__bullets"><li class="notes__bullet" data-key>…</li></ul>   <!-- (W) -->
        <section class="notes__cautions" aria-label="Cautions">…</section>          <!-- (W) -->
        <details class="notes__reference">                                           <!-- (W) -->
          <summary>References</summary>
          <div class="notes__reference-body">
            <div class="notes__group"><p class="notes__group-label">Support</p><p class="notes__support">…</p></div>
            <div class="notes__group"><p class="notes__group-label">Sources</p><ul class="notes__citations"><li><a>…<span class="visually-hidden">, opens in a new tab</span></a></li></ul></div>
            <div class="notes__group"><p class="notes__group-label">Jump to step</p><ol class="speaker__steps"><li><button class="speaker__step-button" aria-current="step">2. Open the menu</button></li></ol></div>
            <div class="notes__group"><p class="notes__group-label">Actions</p><p class="notes__actions">This step: …</p></div>
          </div>
        </details>
      </div>
    </section>
    <p class="speaker__toast" role="status">Timer started</p>              <!-- when shown -->
  </main>

  <footer class="speaker__bottom">
    <nav class="speaker__controls" aria-label="Presenter controls">         <!-- (W, walk r7) -->
      <button class="speaker__button nav-drawer-trigger">…Slides</button>
      <span class="speaker__divider" aria-hidden="true"></span>
      <button class="speaker__button speaker__button--primary">…Previous</button>
      <button class="speaker__button speaker__button--primary">Next…</button>
      …
      <button class="speaker__button" data-connected="false">…Audience</button>  <!-- P1 -->
    </nav>
    <div class="speaker__timer" role="group" aria-label="Timer" data-running data-pace="over">
      <time class="speaker__elapsed" datetime="PT1446S">24:06</time>
      <span class="speaker__pace">16:36 over</span>
      <button class="speaker__icon-button speaker__icon-button--primary" aria-label="Pause timer">…</button>
    </div>
  </footer>
</div>
```

Removed classes: `speaker__left`, `speaker__status`, `speaker__counter`, `speaker__section`, `speaker__engines`, `speaker__status-timer`, `speaker__region-label`, `speaker__notes-head`, `speaker__notes-size`, `speaker__button--quiet`, `speaker__transport`, `speaker__blank-eyebrow` (and `--hands`), `notes__next`, `notes__next-actions`, `notes__page`, `timer`, `timer__*`, `timer-badge`, `timer-badge__*`, plus the dead classes in 3.2 item 7. Kept in `speaker.css` and not changed in meaning: `.stage--embedded`, `.stage__rehearsal` (the audience rule), `.goto*`.

## 8. Behavior (engineering)

### 8.1 Counter, section and title

- Meta line: `slide.index` and `total`; "Section n of m" from `sectionPosition` when the slide has a page. Native slides: the counter alone.
- Title: the existing `heading` logic (eyebrow and title, or "Intro slide" and the feature). Native slides: `slide.title`.
- `document.title`: `Speaker · 9/50 · Dialog element: What we used to do` (native: `Speaker · 1/50 · <slide title>`), set in an effect on `slide.id`. This covers a11y L4 and L7 for `/speaker` and works whether the page stays dynamic or the perf workstream makes it static.

### 8.2 One status pill

Shown on framed pages only (`hasFrame(page)`), beside the step label. One function, first match wins:

| Condition | `data-status` | Text |
|---|---|---|
| P1 only: no audience window heard for 5 s since this window mounted | `offline` | No audience |
| `demoHealth[page.id] === "error"` | `error` | Frame error |
| `demoHealth[page.id] === "fallback"` | `fallback` | Poster shown |
| `demoHealth[page.id] === "loading"` | `loading` | Loading |
| playback is for this slide and step and `playing` | `playing` | Playing |
| otherwise (including health not reported) | `ready` | Ready |

"Ready" and "Playing" keep their exact text (the walk waits for "Ready"). Health not reported falls through to Ready, as the pill does today, so a late speaker window never shows a false alarm. The `.speaker__engines` text goes away.

### 8.3 Steps

- Progress `data-state`: `done` for indices below `stepIndex`, `current`, `upcoming`.
- Next-step hint: `steps[stepIndex + 1]` when it exists. The `d` key (`showActions`) appends `summarize(nextStep.actions)`. The "Next page" and "End of deck" strings are deleted.
- Step jump buttons: `update({ stepIndex: i })`, as today; label `${i + 1}. ${s.label}`; `aria-current="step"` on the current one.

### 8.4 Notes and text size

- Size state, bounds, step and `deck:notes-size` unchanged. The minus and plus buttons get `disabled` at 28 and 56.
- `--notes-size` stays on `.speaker__notes`; the hands-on box, intro and cautions scale from it (section 5.4), which reproduces today's 32, 32 and 28 at the default.
- References: `<details key={slide.id}>`, so it closes on every slide change. Citation links get the visually hidden ", opens in a new tab" (same pattern as `NewTabLink`; do not import it, it lives in `components/layouts/glass`).

### 8.5 Timer

- `Timer.tsx`: delete `Timer` (the bar) and `TimerBadge`; add `SpeakerTimer({ state, targetMinutes, onToggle, onReset })` that renders section 5.5's pill. Keep `formatClock`, `elapsedMs` and `useNow` (500 ms).
- `SpeakerView`: remove `timerShown`, `toggleTimerBar`, `TIMER_KEY` and `data-timer`. Leave `localStorage["deck:timer-shown"]` alone; nothing reads it.
- `onToggle` is `perform({ type: "toggle-timer" })`; `onReset` is `update({ startedAt: null, pausedAt: null })`. Both sync to the audience window as today.
- The "Timer started" toast logic is unchanged; only its position and look change.

### 8.6 Sync signal (P1, recommended)

P0 removes the label and adds nothing. P1, a small change that makes a lost audience window visible where the fix is:

- `lib/presenter/types.ts`: add `{ type: "presence"; writer: string; mode: PresenterMode }` to `SyncMessage`.
- `lib/presenter/context.tsx`: every window sends `presence` every 2000 ms over the channel. Track the last time an `audience` presence arrived; expose `audienceConnected: boolean | null` on `Presenter` (`null` until 5 s after mount or under the storage transport, then `true` if heard within 5 s, else `false`). On a `hello`, the audience window also re-sends its `demo-health` for every page it knows and its last `playback`, which fixes problem 3 in section 3.2. Fix the `peers` count with the same presence messages; nothing renders it after this PRD.
- Speaker view: when `audienceConnected === false`, the Audience button gets `data-connected="false"` (an 8 px coral dot before the icon) and its accessible name becomes "Audience, not connected" (visible label plus visually hidden text), and the status pill reads "No audience". When connected, nothing shows.

If P1 is cut, the status pill never shows "No audience" and the Audience button never shows a dot.

### 8.7 Keys and focus

- Keyboard map unchanged (`lib/keys.ts` is not touched): arrows, PageUp, PageDown, Space, Backspace, Shift with arrows, Home, End, `b` and `.`, `h`, `l`, `r`, `t`, `d`, `o`, `s`, `g`, `f`, `?`, Escape. `d` still toggles both the rehearsal overlay (`Stage`) and the action summaries (`SpeakerView`).
- Tab order follows the DOM: the text size buttons, the References summary and, when open, its links and step buttons, then the controls pill left to right (Slides first), then the timer buttons. The previews hold no tab stops: preview links are `tabIndex={-1}` already, and the next preview is `inert`.
- Do not make `.speaker__current` `inert`: it contains the drawer, go-to and help dialogs, which an inert ancestor would disable.

## 9. Accessibility

Folds in `docs/perf/a11y-review.md` L4 (and L7 for this window).

| Item | Fix |
|---|---|
| No `main` | `main.speaker__main` wraps the title, steps and notes. The left column is a named region ("Slide previews"); the footer is `contentinfo` with a named `nav` and a named timer group. All content sits in a landmark (axe `region`). |
| Two h1s | The next preview is `inert` and `aria-hidden="true"`, so the tree has one h1, the current slide's. The speaker's own headings are h2 ("Dialog element: What we used to do", "Next slide"). The slide markup in `components/page/*` is not changed. |
| `landmark-unique` (two "Code" regions) | Gone with the next preview hidden. The audit's relabel ("Current slide code") lives in `components/page/*`, the other workstream's files; not needed here. |
| New-tab links | Visually hidden ", opens in a new tab" on every References link. |
| Page title | Section 8.1. |
| Focus visible | Cyan 3 px ring, section 6.3. |
| Target size | Footer buttons 40 tall, text size and step buttons 32, summary 44. All above 24 (2.5.8). |
| State | `aria-pressed` on Blank and Hands-on, `aria-current="step"` on the step button, `disabled` where an action does nothing. Status pill text carries the state; color is second. |
| Status messages | The status pill and the toast are `role="status"`. The clock is not a live region. |
| Label in name | Every visible label is the start of its accessible name ("Audience, not connected"). |

## 10. Files and parallel work

Each file has one owner. A workstream that needs a line in another's file asks the owner.

| WS | Owner | Scope | Files |
|---|---|---|---|
| WS-S1 Speaker markup and logic | Engineering agent | Sections 7, 8 and 9: the new markup, status logic, timer pill, title, references, a11y; the walk and axe updates in section 11 | `components/presenter/SpeakerView.tsx`, `components/presenter/Timer.tsx`, `scripts/walk-demos.mts` (`checkSpeaker` and the speaker lines of `checkHandsOn` only), `scripts/axe-frames.mts` (one target line, see below), `docs/demo-engine.md` ("Speaker window" section only). P1 only: `lib/presenter/types.ts`, `lib/presenter/context.tsx`. |
| WS-S2 Speaker styles | Design agent | Sections 5 and 6: every rule for the speaker window, the go-to dialog, the speaker's rehearsal overlay and toast; delete dead CSS | `styles/components/speaker.css`, `scripts/contrast-test.mts` (an appended "Speaker view" block only) |

Read only for both (other owners, or shared): `components/stage/*`, `components/page/*`, `components/chrome/*` (NavDrawer, GotoDialog, KeyboardHelp, ReaderControls), `components/layouts/**`, `app/speaker/page.tsx`, `app/speaker/layout.tsx`, `lib/keys.ts`, `styles/glass-tokens.css`, `styles/app.css`, `styles/components/reader-controls.css`, `nav-drawer.css`, `keyboard-help.css`, `stage.css`, `next.config.ts`, `public/**`.

Rules for working beside the performance and accessibility workstream:

- `SpeakerView`'s `Props` do not change. If that workstream moves the page body to `app/speaker/[id]/page.tsx`, the same props pass through and nothing here conflicts.
- `scripts/axe-frames.mts` and `scripts/contrast-test.mts` may also be edited by that workstream (a11y review H1 and M5). Make append-only edits in clearly marked blocks and rebase on theirs; do not reformat the files.
- If a fix here seems to need `Stage.tsx` (for example the rehearsal overlay's markup), solve it in `speaker.css` instead, or hand the request to that workstream's owner.

Handoffs:
- WS-S1 to WS-S2: section 7 is fixed, so both start at once. WS-S1 posts any extra class it needs before using it.
- WS-S2 to WS-S1: the token block's values for the contrast test.

## 11. Acceptance criteria

Layout
1. At 1440 by 900, 1920 by 1080 and 2560 by 1440, `.speaker__current` measures 633 by 356, 851 by 479 and 1142 by 642, within 1 px (today's sizes). With `?rehearse=1` at 1440 by 900: 759 by 427.
2. The left column contains only `.speaker__current` and `.speaker__next`. The next preview is 45 percent of its panel's inner width, beside its title and description.
3. The right column contains only the title and steps block and the notes (with References inside). No `.notes__next` and no `.speaker__status` exist.
4. The footer holds the controls pill (left edge at x 16) and the timer pill (right edge at the viewport width less 16) on one line at 1440 wide and up, in both normal and rehearsal mode. No horizontal scrollbar at 1280.
5. The document does not scroll at 1280 wide and up; only `.speaker__notes-body` does.
6. No element other than the two previews has a computed background with luminance above 0.2, except the small flags on the current preview and the Key point chip.
7. `.speaker__transport` does not exist, and no text containing "BroadcastChannel" or "window" counts renders.

Behavior
8. Pressing Next in either window updates the step label, progress and notes in the speaker window within 500 ms, and the status pill returns to "Ready" after playback.
9. The status pill shows exactly one state; "frame ready" text no longer exists anywhere.
10. "Next step: label" shows when a next step exists on the slide and is absent on the last step and on native slides.
11. References are collapsed on load and after every slide change, and their links carry ", opens in a new tab".
12. Minus and plus change the bullets by 4 px between 28 and 56, persist across a reload, and disable at the bounds.
13. The timer pill shows "0:00" and "Not started"; Start (button or `t` in either window) runs it in both windows; Pause shows "Paused, ..." and the Reset button; Reset returns it to "0:00". "over" uses `#FF7A87`.
14. Blank, Hands-on, Reset step, Audience, Open frame, Slides, Previous, Next and Export log (`?rehearse=1`) do what they do today.
15. The rehearsal overlay (`d`) and the "Timer started" toast overlap no button.

Accessibility
16. `pnpm axe --presenter` passes on `/speaker` with the drawer open (existing target) and closed (new target).
17. The accessibility tree of `/speaker` has one `main`, one h1, and no content from the next preview.
18. Every focusable element shows the cyan ring; Tab never lands inside either preview.
19. Under emulated `prefers-reduced-transparency`, `?glass=off` and forced colors, every panel is solid or system-colored and every text item stays at 4.5:1 or better.

## 12. Test plan

### 12.1 Automated (WS-S1 and WS-S2 update the checks)

| Command | Change |
|---|---|
| `pnpm walk` (Chromium, speaker at 1440 by 900) | `checkSpeaker` in `scripts/walk-demos.mts`: keep the sync check on `.notes__step` and the "Ready" wait on `.notes__play`. The header check becomes "`.notes__header` is fully inside the viewport" (it is no longer inside the notes body). Bullets stay "inside `.speaker__notes-body` and the viewport". Replace the `.notes__next` check with: `.notes__then` is visible when the page has a next step and absent on the last step. The selector scan covers the body (without `details`) plus `.notes__header`. Add once per run: `.speaker__current` size per criterion 1, no `.speaker__transport`, one `main`, `.speaker__next-preview` has `inert`. `checkHandsOn` keeps reading `.notes__hands-on`. |
| `pnpm walk --advance` | Unchanged; it clicks `.speaker__controls button` with text "Next". |
| `pnpm walk drawer` | Unchanged; it uses `.speaker__controls .nav-drawer-trigger`. |
| `pnpm axe --presenter` | Add `{ where: "/speaker", path: "/speaker?s=d1-used-to", viewport: { width: 1440, height: 900 } }` beside the existing drawer-open target. |
| `pnpm test:contrast` | Appended block: `--speaker-ink`, `-ink-body`, `-ink-soft`, `--speaker-link` and `--speaker-over` over `--speaker-panel` composited on `--speaker-bg` and on the glow's brightest point, and over `--speaker-solid`, at 4.5:1. It reads the `.speaker {` block of `speaker.css`. |
| `pnpm validate` | Green (typecheck, lint, tests, check). |

### 12.2 Manual steps (Chrome on the talk laptop, then 1920 and 2560)

1. `pnpm dev`. Open `http://localhost:3000/speaker?s=d1-used-to`, then press Audience. Put the audience window on the second display.
2. Check the layout against section 5 at 1440 by 900 (fullscreen with `f`), then resize to 1920 by 1080 and 2560 by 1440 (Chrome DevTools device toolbar). The current preview keeps its size (criterion 1).
3. Press the clicker (PageDown) in the audience window through d1-used-to: the steps block, progress, hint and notes follow; the pill goes Playing then Ready.
4. Press Next and Previous in the speaker footer; press `h` (box shows, button pressed), `h` again; `r` and Reset step (the frame replays); `b` and Blank (audience goes black, coral outline and "Blank" flag on the preview); `o` and Open frame (new tab); Audience (focuses the audience window).
5. Press Slides: the drawer opens over the speaker view, Tab stays inside, Escape returns focus to Slides. Choose a section: both windows move.
6. Press `g`, type 12, Enter: both windows go to slide 12. The dialog is dark glass.
7. Press `t` in the audience window: the speaker timer starts and the toast shows above the timer pill. Pause with the button, check "Paused, ...", Reset.
8. Press minus and plus; reload; the size persists.
9. Open References on d1-now: groups, cyan links, step buttons. Jump to step 1. Go to the next slide: References is closed again.
10. `?rehearse=1`: press `d`. The overlay sits above the controls on the left; the next-step hint shows action summaries; Export log downloads `rehearsal-log.json`.
11. Close the audience window (P1): within 5 s the Audience button shows the coral dot and the pill reads "No audience". Reopen it: both clear.
12. Emulate `prefers-reduced-transparency: reduce` and forced colors in DevTools (Rendering), and load `?glass=off`: panels turn solid, everything stays readable.
13. VoiceOver quick pass: landmarks list shows main, navigation "Presenter controls", the slide previews region; the headings list shows one h1; the next slide's content is not read.

### 12.3 Regression checklist

Two-window sync (both directions, `localStorage` fallback included); the drawer (open, trap, Escape, jump moves both windows, PageUp and PageDown close it); the go-to dialog; keyboard help (`?`); rehearsal overlay and log export; hands-on (`h`, `ifKeyboard` box, replay on exit); reset step (`r`); blank (`b`, `.`); open frame (`o`); audience window (`s` from the audience, Audience from the speaker); timer (`t`, start, pause, resume, reset, over and under, toast); text size and its storage; the full keyboard map in section 8.7; cautions on the now page's last step; the page intro on step 0; native slide notes; End of deck on the closing slide; `pnpm walk`, `pnpm walk --advance`, `pnpm walk drawer`, `pnpm axe --presenter`.

## 13. Order

1. **Parallel.** WS-S1 rewrites `SpeakerView.tsx` and `Timer.tsx` to section 7 and updates the walk and axe targets. WS-S2 rewrites `speaker.css` to sections 5 and 6 against section 7, and adds the contrast block.
2. **Merge together** (the markup and the CSS change class names at once), then run section 12.1.
3. **P1** (presence) as a separate commit on top, so it can be dropped without touching the redesign.
4. **Rehearsal** on the talk laptop with both windows and the clicker (section 12.2).

## 14. Risks

| Type | Item | Mitigation |
|---|---|---|
| Risk | A blur or transform on a preview ancestor moves the rehearsal overlay or clips the preview. | Section 5.3 rule; the walk checks the preview size. |
| Risk | Windowed Chrome at 1440 by about 790 makes the longest notes scroll. | Present the speaker window fullscreen (`f`); the body scrolls to top on every step. |
| Risk | Walk selectors drift (`.notes__step`, `.notes__play`, `.notes__hands-on`, `.speaker__controls`). | Kept as is in section 7; the walk changes ship in the same merge. |
| Dependency | The other workstream edits `scripts/axe-frames.mts`, `scripts/contrast-test.mts` and may move `app/speaker/page.tsx`. | Append-only edits, stable props (section 10). |
| Assumption | The talk laptop is 1440 by 900 at default scaling. | The layout holds at 1280 and up; the speaker confirms the display setting. |

## 15. Open questions for the speaker

1. **Lost audience window signal.** Should the speaker view warn when the audience window is not connected? **Recommendation:** yes, P1 (section 8.6): a coral dot on the Audience button and "No audience" in the status pill, nothing when connected. It costs one small message type and fixes the stale "Ready".
2. **Next-step hint.** You asked to remove the "what's next" callout. The left side shows the next slide, but not the next step inside the current slide, and walk pages take 3 to 6 presses each. **Recommendation:** keep a quiet one-line "Next step: label" in the steps block, gone on the last step. If you would rather not have it, it is one element to remove.
3. **Short description for native slides.** Demo pages have a one-sentence `scenario`; the 10 opening and closing slides have no short description field, so their next panel shows the title only. **Recommendation:** leave it. Adding a field means new content for 10 slides.
4. **Target and remaining time.** The old timing bar also showed "target by end of slide" and "remaining". The footer timer keeps elapsed and over or under only. **Recommendation:** drop them; over or under already folds in the target.

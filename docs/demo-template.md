# Writing a demo

How to author or rewrite one demo so it plays from the clicker alone, in three beats, with the code
panel spotlighting the live view. Start from `content/demos/_template/` (copy the folder, rename the
id in `demo.ts`, import `demo` from the slide). The rules every demo follows are in
`docs/demo-contract.md`; this page is the working order and the checklist.

## The three beats

| Beat | `phase` | What the audience sees | Code panel | Files |
|---|---|---|---|---|
| Today, with a pile of JS | `before` | The legacy document (`/demos/[id]/legacy`): the same card driven by the old script, one interaction per press | The legacy files, highlighted per step so the volume of script is visible | `legacy/index.html`, `legacy/styles.css`, `legacy/app.js` |
| Now, native | `after` | The native document (`/demos/[id]`), one interaction per press | No highlight (`highlight: []`); the previous lines stay, dimmed | `index.html`, `styles.css`, `app.js` |
| The code | `code` | The native document with the targeted element spotlit; the state replays whatever the code triggers | Highlighted lines, HTML then CSS then JS | same |

Order the steps before, after, code. `phase` defaults to `code` when a step has a highlight and
`after` when it does not, so only `before` steps must say so.

## The steps table

One row per press. Fill it in `demo.ts` `steps[]`; keep `phase` and `target` after `caption`.

| Field | Rule |
|---|---|
| `id` | `b1…` for before, `a1…` for after, `s1…` for code. Unique within the demo. |
| `file` | Which file the panel shows; a `before` step names a file in the legacy set. Defaults to the first file of the set. |
| `highlight` | Line ranges in that file, counting blank lines. `[]` on live-only steps. |
| `caption` | One sentence, true to the lines it points at. Shown under the panel and in the speaker window. |
| `action` | What the audience sees happen on this press (or the one real click the presenter must make). Shown in the speaker window. |
| `liveState` | The state the demo switches to. Always set it on the first step; later steps inherit the nearest earlier state when left out. |
| `phase` | `before`, `after` or `code` (see above). |
| `target` | A selector in the html of that phase. The element is outlined in the live view. Only on code (or before) steps. |

State names are kebab case and name the result, not the gesture: `open`, `dismissed`, `saved`,
`typed`, `scrolled`. List every one in `Demo.liveStates`.

## Making states reachable without a pointer

- Visual-only states need no script: `html[data-state="open"] .menu { … }` in `styles.css`.
- Anything that needs a real API goes in the `demostate` listener in `app.js`: `showPopover()` /
  `togglePopover(force)`, `details.open = true`, `el.focus()`, typing into a field, `scrollTo()`,
  `document.startViewTransition()`, `navigation.navigate()`.
- The listener is idempotent (the stage re-posts the current state on every press, and the presenter
  will double-press) and never throws mid-transition. Guard with `matches(":popover-open")`,
  `details.open`, and the like.
- Hover is never required. Force hover-only effects open with a state.
- Programmatic focus does not always paint `:focus-visible`; add a `[data-focus="true"]` rule for
  the focus-return moment.
- The legacy document listens to the same state names, so one steps table covers both documents.

## Checklist

1. Write the native `index.html`, `styles.css`, `app.js` for the product card: 56 columns, Prettier,
   standard CSS, `system-ui`, no network. Centre the card for a 520 x 428 viewport.
2. List the interactions the audience must see, in order, and name a state for each. Put them in
   `Demo.liveStates`.
3. Make every state reachable from `demostate` (CSS or the listener). Never from hover or a click.
4. Write `legacy/index.html`, `legacy/styles.css`, `legacy/app.js`: the same card, same ids and
   classes, driven by the old script, reacting to the same states. Shared files (`card.css`) are
   listed again in `legacy.code` and referenced as `../card.css`.
5. Fill `steps[]`: before steps pointing at legacy lines, after steps with `highlight: []`, code
   steps with `highlight` and `target`. Captions true to the lines; actions true to the screen.
6. `npx prettier --write content/demos/<id>`, then `npx tsx scripts/check-demos.mts <id>` and read
   the printed lines back against the captions.
7. `pnpm check <id>`: zero errors, zero warnings.
8. `pnpm walk <slide-id>` with the dev server running: every step echoes its state, every target is
   spotlit and visible, no `demo:error`, no reload on the phase switch.
9. Open `/speaker?s=<slide-id>` and `/present` side by side and press Next through every step, then
   Previous. The "Next press" line must describe what the next press will do.
10. Open `/demos/<id>` and `/demos/<id>/legacy` standalone in Safari and Firefox and drive the states
    from the console; record any snap in the slide's `support.note` and the demo's `gotcha`:

```js
document.documentElement.dataset.state = "open";
document.dispatchEvent(new CustomEvent("demostate", { detail: { state: "open" } }));
```

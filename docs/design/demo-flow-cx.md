# Demo flow: CX review and recommendations

Audience and speaker review of one demo (intro slide, "How we used to do it", "How we do it now"). The engineer follows sections 2 and 4. The writer follows section 3. Read with `docs/design/feedback-2026-10-28.md` (fixed requirements) and `docs/PRD-demos-v4.md`. Where this doc differs from the PRD, it says so and names the PRD section. The speaker decides those differences.

## Evidence and its limits

- **What this rests on.** The speaker's verbatim feedback, the v3 content in `content/sections/d1-order-actions.ts` and `d4-dashboard-navigation.ts`, and the engine in `docs/demo-engine.md`.
- **What it does not rest on.** No audience research exists. The audience journey below is inferred from the content and the speaker's account. It is assumption-based.
- **How to validate.** One timed rehearsal with two or three developers of mixed seniority. After each demo, ask each one to say the single point in one sentence. Note where each person looked away from the screen. Compare page times with section 2.

### What the v3 content shows (D1, D4 match)

| Measure | D1 v3 | D4 v3 | Effect on the room |
|---|---|---|---|
| Steps, three pages | 17 (4, 6, 7 including s0) | 17 | Too many clicks to follow one idea |
| Note words | 740 in 24 fields | 527 in 25 fields | D1 needs about 5.7 min of speech at 130 words a minute. Its budget was 3.5. |
| Longest note | 53 words | 46 words | Speaker reads instead of watching the screen |
| Callouts | 24 labels, up to 3 per step | similar | Eyes jump between labels; labels are jargon ("Portal root", "Light dismiss") |
| Same interaction played | 3 times (today, now, code) | 3 times | The audience waits through repeats |
| Undefined terms in one demo | 12 or more (top layer, light dismiss, invoker commands, returnValue, implicit anchor, Baseline Newly, portal) | similar (popstate, pushState, intercept, event.signal) | Juniors lose the thread; seniors already know the terms |
| Behavior and its code | 1.25 min apart | same | The audience must recall the behavior when the code appears |

Other v3 problems:

- **Code without context.** The today page showed no code, so "399 lines" was a number with nothing behind it.
- **Steps with nothing to watch.** Some steps changed nothing in the frame: D4 "What we leave alone", both "Production cautions" steps.
- **A key run too long for one click.** D1's keyboard step runs 13 actions on one press, and its note lists 9 keys in a row.
- **Sources read out mid-step.** Coyier, Shopify, Vercel and Primer all appear inside one step note.
- **Labels that work against the meaning.** "Today" named the old way, which sounds like the current way.

## 1. The audience journey through one demo

Two audience needs, inferred from the attendee mix:

- **Newer developers** need each term said once in plain words. They also need to see what changes for the person using the page.
- **Seniors and leads** need proof the old way is a fair picture of real code. They also need browser support and the production cautions.
- **The speaker** needs to glance once, know what is on screen, say it and press Next.

| Beat | The audience must leave knowing | Eyes go to | Speaker does | Where they got lost in v3 |
|---|---|---|---|---|
| 1. Intro slide | The feature name, the one thing it lets you do, and that it works in all four browsers | Title, then the browser tiles | Says the scenario in two or three sentences. Does not read the slide. | The support badge said "Widely + Newly (Dec 2025)". Nobody outside the web platform team knows those words. |
| 2. Used to: arrival | The scenario (one row, one risky action) and how to watch: the code lights up as the demo plays | The frame, then the code tabs | Names the task. In D1 only, says how to watch the page. | v3 opened on a demo with no code beside it. |
| 3. Used to: steps (HTML, CSS, JS) | Each language carries part of the cost | Highlighted lines, then the outlined element | One bullet per step. Points at the highlight. | Three callouts per step named concepts the audience had not met. |
| 4. Used to: meter | How much code a team writes and tests for this | The meter, top right | Says the number once and where it comes from | The number came without seeing any of the code |
| 5. Now: arrival | Same task, built from parts the browser provides | The frame looks the same as before | Says which element does which job (the menu is a popover, the box is a dialog) | The feature title said "Dialog element", but a popover moved first, and nothing explained it |
| 6. Now: steps | Each piece of behavior comes from a few lines of HTML | Highlight, then the frame | First bullet while it plays, second bullet on the code | The behavior was on one page and its code 1.25 min later |
| 7. Now: key point and proof | The one thing to remember. In D1: focus goes back, and we wrote no code. | Focus ring, keycaps, the "Off" chip | Pauses after the playback and says the key point once | It was buried in a 50-word note among nine key names |

**Moments of truth.** These four beats carry the most weight. Polish them first.

- Beat 2 of D1. The room learns how every demo works, so a confused start costs all six demos.
- Beat 4. The meter makes the cost concrete, and seniors judge whether it is fair.
- Beat 7. This is the takeaway.
- The last now page before the follow-ups, D6. Peak-end: the room remembers the last demo best.

## 2. Pacing

### Pace model

A step costs about 20 seconds:

- 3 to 6 seconds of playback, while the speaker says the first bullet.
- About 2 seconds for eyes to find the highlight.
- 10 to 15 seconds on the code.

Speech is planned at 130 words a minute, slower than normal, because the speaker also points. People hold about four new items at once. So a demo may introduce four new terms at most, one per step.

### Step caps (step 0 does not count)

| Page | Steps | Bullets per step | Words per step | Words per page (intro plus bullets) | Minutes |
|---|---|---|---|---|---|
| Intro slide | 0 | intro only | n/a | 50 at most | 0.25 |
| How we used to do it | 3, one per language | 1, a second only on the meter step | 20 at most, 30 on the meter step | 75 at most (100 in D1) | 0.5 (0.75 in D1) |
| How we do it now | 4 target, 5 cap | 2 typical, 3 at most | 40 at most | 220 at most | 1.5 to 2.0 |

Rules:

- **Every step must change something in the frame.** A step that only moves the code highlight gets merged into its neighbor. A cautions-only step is not allowed. Cautions show on the last step, in the speaker window only.
- **Proofs count toward the cap.** One proof per demo. D1 may have two because it teaches the pattern.
- **Prefer a proof the room has not seen yet.** After D1, styles off only appears where it shows something new (D3 fallback, D6 Firefox).
- **One step, one press, one idea.** A step that needs more than four keys gets split, or moves to hands-on mode.
- **Differs from PRD 1.5.** The PRD caps the now page at 6 steps. This doc caps it at 5 and moves the full keyboard replay to hands-on mode (see the D1 example). The PRD allows 25 words a bullet. This doc caps the step at 40 words, so three long bullets cannot stack up.

### Time budget per core demo

| Demo | Intro | Used to | Now | Total | PRD 7.4 total |
|---|---|---|---|---|---|
| D1 Dialog element | 0.25 | 0.75 | 2.0 | 3.0 | 3.0 |
| D2 Container queries | 0.25 | 0.5 | 1.75 | 2.5 | 2.5 |
| D3 Field sizing | 0.25 | 0.5 | 1.75 | 2.5 | 2.5 |
| D4 Navigation API | 0.25 | 0.5 | 2.0 | 2.75 | 3.0 |
| D5 Trusted Types | 0.25 | 0.5 | 1.75 | 2.5 | 2.75 |
| D6 Customizable select | 0.25 | 0.5 | 1.5 | 2.25 | 2.25 |
| Core total | | | | 15.5 | 16.0 |

- **Why D1's used-to page gets 0.75.** D1 is where the room learns the format. A strong start pays back across all six demos. Its now page drops from 2.25 to 2.0, so D1 stays at 3.0.
- **Where the extra time goes.** The 0.5 minutes saved in D4 and D5 goes to the section buffer. Do not spend it on extra steps.
- **What 0.5 minutes buys.** A used-to page that short works only if each step has one bullet of about 15 words. The highlight should show the cost, such as a `z-index: 1030` or a keydown handler. It should not teach the old code.

## 3. Speaker-note pattern

### Template

```
Intro (said on arrival; 2 or 3 sentences; 50 words at most)
  Sentence 1: the task on screen, in user terms.
  Sentence 2: what is different on this page.
  Sentence 3, optional: how to watch (D1 only) or which element does which job.

Step N: <label, 2 to 4 words, starts with a verb>        [Key point] [Proof]
  - On screen: what just happened, named by its visible label.
  - Meaning: what the highlighted code does, in plain words.
  - Optional: why it matters to the person using the page or to the team.
```

### Rules

- **Sentences.** About 12 words, 15 at most. One claim each. Two sentences per bullet at most.
- **First bullet.** It always says what the audience sees. The speaker can say it while the step plays, without looking at the code.
- **Naming.** Name things by their visible text and role: "the Actions button", "the menu", "the dialog", "Keep order", "the status line". Never use ids, selectors or tag syntax aloud. Name attributes as words: "the popover attribute", "the command attribute".
- **No line numbers.** Do not read line numbers aloud. The highlight is the pointer.
- **Code words.** Method names are fine when they are highlighted ("showModal"). Drop the parentheses in notes.
- **New terms.** Define each new term once per demo, in the same sentence, in plain words. Example: "A popover is a layer that shows above the rest of the page." Four new terms per demo at most.
- **Avoid these words.** Just, simply, easily, basically, actually, obviously, of course, as you can see, magic, powerful, seamless, robust, out of the box, under the hood, for free, plumbing, fight, own (for "handles"), today (for the old way), native (unless defined as "built into the browser").
- **Avoid these terms unless defined.** Top layer, light dismiss, portal, invoker, returnValue, implicit anchor, Baseline Newly or Widely, hydration.
- **Format.** Sentence case. No em or en dashes. No exclamation points. "X, not Y" once per page at most.
- **Sources.** Citations, vendor examples and support detail go in the Reference drawer. Say at most one source per demo aloud, and only on the step it proves.
- **Key point.** Mark exactly one step per page. In the schema this is `key: true` on the step, a proposed addition to PRD section 4. The speaker window shows a "Key point" chip, like the "Proof" chip, and sets the key bullet in bold. On stage, the speaker lets the playback finish, pauses one beat, and says the key bullet once. On used-to pages the key point is the meter step. On now pages it is the step that replaces the most old code.

### Worked example: D1 "How we used to do it"

Eyebrow "Dialog element". Title "How we used to do it". Frame: today build. Tabs, as 44-column excerpts: `index.html`, `styles.css`, `menu.js`, `modal.js`. 92 spoken words, 0.75 min.

**Intro.** "This is an order list. Cancel order asks you to confirm first. Here is how teams commonly build it. The code lights up as the demo plays."

**s1 Open the menu.** Click the Actions button. Code: `index.html`, the button with its `aria-` attributes and the empty `overlay-root` div. Spotlight: the button and the menu.
- "The Actions button opens the menu. Script builds it in an empty box at the end of the page."

**s2 Open the confirm box.** Click Cancel order. Code: `styles.css`, the four `z-index` rules (1000 to 1030). Spotlight: the modal and the backdrop.
- "Cancel order opens a confirm box over a dark backdrop. The CSS needs four z-index numbers to stack it."

**s3 Close with Escape** `[Key point]`. Press Escape (keycap). Code: `modal.js`, the Escape listener, the loop that makes the page inert, and the focus return. Meter: "JavaScript, 399 lines".
- "Escape closes the box, and focus goes back to Actions."
- "Script handles Escape, keeps Tab inside the box and returns focus. That is 399 lines to maintain."

### Worked example: D1 "How we do it now"

Eyebrow "Dialog element". Title "How we do it now". Frame: native build. Tabs: `index.html`, `enhance.css`, `app.js`. 5 steps, 204 spoken words, 2.0 min. Line ranges are from the current files. Recheck them after the CSS trim (PRD 6.3).

**Intro.** "This is the same order row, built from HTML the browser understands. The menu is a popover. The confirm box is a dialog."

**s1 Open the menu.** Click Actions. Code: `index.html` 6 to 10. Spotlight: the button and the menu.
- "The Actions button opens the menu again."
- "A popover is a layer that shows above the page. The popover attribute makes this menu one."
- "We need no z-index and no empty box at the end of the page."

**s2 Open the dialog.** Click Cancel order. Assert that focus is on Keep order. Code: `index.html` 11 to 16 and 28. Spotlight: Cancel order and the dialog.
- "Cancel order opens the dialog. Focus lands on Keep order, the safe choice."
- "The command attribute tells the button what to do. Here it opens the dialog."
- "The page behind waits until you answer. That is what modal means."

**s3 Close with the keyboard** `[Key point]` `[Proof]`. Press Enter on Keep order, then Escape on the menu (two keycaps). Assert focus on Cancel order, then on Actions. Code: `index.html` 17 to 27. Spotlight: the form and the Actions button.
- "Enter picks Keep order. Escape closes the menu. Focus is back on the Actions button."
- "The form uses method dialog, so its buttons close the dialog."
- **"The browser moves focus back for us. We wrote no code for it."**

**s4 Confirm the cancel.** Click Actions, Cancel order, then Cancel order in the dialog. Code: `app.js` 7 to 14 and 26 to 28. Spotlight: the status line. Meter: "JavaScript, 25 lines" (same counting rule as `pnpm meters`; `app.js` has 25 non-blank lines today).
- "This time we confirm. The status line says Order 418 was canceled."
- "This is the only JavaScript on the page. It waits for the dialog to close."
- "If the answer is confirm, it calls the server. That is 25 lines."

**s5 Styles off** `[Proof]`. Toggle the enhancement CSS off, then open the menu and the dialog. Code: `enhance.css`, dimmed, with the "Off" chip.
- "The CSS file is off. The menu and the dialog look plain."
- "They still open, close and move focus. The CSS only sets the look."

**Cautions** (last step, speaker window only, as PRD 5.4):
- "Use a dialog when the user must answer. Use a popover when they can ignore it."
- "Check permission on the server. The dialog does not protect your data."
- "Test with a screen reader. Browser support does not prove the page is accessible."

**ifKeyboard on s3.** "Press Enter, then Escape. Press Next once to sync the frame."

**Differs from PRD 5.4.**

- **Keyboard proof.** The PRD's s5 "Keyboard only" replays the whole flow on one press, with nine keys. Here the keyboard proof is s3: two keys, with the focus return visible. The full keyboard run stays in rehearsal (`pnpm walk`) and in hands-on mode.
- **Proof wording.** If the speaker wants the full run on stage, keep the PRD's step and budget 2.25 min. Otherwise change the plan's proof text to "Close and return focus with the keyboard only".
- **Meter on the now page.** s4 adds a now-page meter. Section 4 gives the reason.

## 4. On-screen guidance

### Intro slide description

The description says one benefit and gives one date.

- **Write.** One sentence, 20 words at most, saying what the feature lets you build, in user terms. D1: "The dialog element gives you a confirm box with focus and Escape handled by the browser." The generated date sentence follows (PRD 3.3).
- **Do not write.**
  - Version numbers. The tiles carry them.
  - The word Baseline, unless the slide defines it.
  - A second benefit, or a comparison with libraries. That is the used-to page's job.
  - The demo scenario. The speaker says it.
  - API names the room has not met yet ("showModal", "invoker").
- **"Also uses" line.** Keep it (PRD 1.1). It fixes the mismatch between a "Dialog element" title and a popover menu that moves first. The speaker repeats it in the now page's intro.
- **Spoken intro.** About 40 words, said over the slide. D1: "Our first demo is an order list. Each order has an Actions menu. Cancel order asks you to confirm first. We will build it the old way, then the way browsers allow now."

### Callouts and spotlights

Now that code and demo play together, the code highlight plus the spotlight carries the explanation.

- **Order inside a step.** First the code highlight appears. About 400 ms later the playback starts. The spotlight stays on until the next step. Eyes read the cause first, then see the effect.
- **Used-to pages.** No callouts (PRD 1.2 agrees).
- **Now pages.** No callouts by default. Allow 1 callout, of 3 words at most, only for a state the room cannot see. Examples: "Page is inert", or "Focus is here" when the ring is small at projector scale. The PRD allows 2 per step. Use 1.
- **Spotlight size.** Spotlight 2 elements at most: the control pressed and the surface it changed.
- **Highlight size.** Highlight 10 lines at most on now pages and 12 on used-to pages. The PRD allows 20. Twenty highlighted lines means nothing stands out.
- **Code tabs.** When the code moves to another file, the tab changes before the playback starts, so the room is not reading a tab switch and an interaction at once.

### Lines-of-code meter

Recommendation: keep it, and make it a pair.

- **Used-to page.** The meter appears on the last step, after the room has seen three excerpts of that code. It reads "JavaScript, 399 lines". The speaker says once where it comes from: "We built this to match what teams commonly ship. The count is from that build."
- **Now page.** Show the matching meter in the same slot on the JavaScript step: "JavaScript, 25 lines". The room compares two numbers it can see, instead of recalling one from a minute ago. This differs from PRD 1.2 and 4, which allow the meter on used-to pages only.
- **Counting.** Both numbers come from the same counting rule and script. Keep the library sizes (Headless UI, Radix) in the Reference drawer for questions from leads. They are not on screen.

## 5. Risks to comprehension and how to avoid them on stage

1. **Split attention, with code and demo moving at once.** Keep the order fixed: highlight, then playback. Say the first bullet while it plays. Then point at the code for the second.
2. **Pressing Next before the playback ends.** The speaker window shows "Playing" until `step-done` arrives, then "Ready". In rehearsal, never press Next on "Playing".
3. **Feature name does not match what moves first (D1).** The now page's intro says which element does which job. The "Also uses" line shows it on the intro slide.
4. **Seniors read the used-to build as unfair.** Say once that it matches common production code, and keep sources one tap away in the Reference drawer. Do not mock the old way; teams shipped it for good reasons.
5. **Focus is invisible on the projector.** The focus ring needs at least 3 px and high contrast against the glass, and keycaps must be readable from the back. Test both on the venue projector. Glass panels wash out on projectors, so check contrast there, not on the laptop.
6. **Too many new terms.** Four per demo at most, each defined once. If a fifth is needed, it goes in the Reference drawer, not in speech.
7. **Six demos, same shape, fatigue.** Keep the structure fixed, because a predictable shape helps the room. Vary only the proof. Hold each demo's time; a slow D1 squeezes D6, the demo the room remembers.
8. **The speaker reads instead of watching.** The first bullet is always "what is on screen", so a glance is enough. Bullets are at 40 px by default (PRD 5.1). If a bullet needs a second look, it is too long.
9. **A frame stalls.** Press `r` to replay to the current step. Say: "Let me reset that step." Keep going. Do not explain the engine.

## Open questions for the speaker

- Keyboard proof in D1: two keys in s3 (this doc), or the full nine-key replay (PRD)?
- Now-page meter: show "JavaScript, 25 lines" beside the used-to page's 399?
- Key point chip: add `key: true` to the schema, or mark the key bullet in the text only?

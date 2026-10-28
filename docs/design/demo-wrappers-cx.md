# Demo wrappers: CX guidance

This doc says what each demo's wrapper should show, so the room knows where it is before the feature moves. The design agent turns it into layout in `docs/design/demo-wrappers-spec.md`. Read it with `docs/design/feedback-2026-10-28-v5.md`, `docs/PRD-demos-v5.md` section 2 and `docs/design/demo-flow-cx.md`. Where this doc differs from PRD 2.2, the last section lists it. The speaker decides those.

## Evidence and its limits

- **What this rests on.** The speaker's v5 feedback, the v4 frame in `inspiration/v5/current-d1-frame.webp`, each section's scenario, steps and shown files, the today builds and the fixtures.
- **What it does not rest on.** No audience research. The "instant recognition" claims are assumptions about a developer audience.
- **How to validate.** Show each frame at s0 for two seconds to three developers. Ask "Where are we?" and "What would you click?" A wrapper passes when all three name the place and point at the demonstrated element.

## Why the v4 frame failed

The v4 shell put every demo in the same app with a mostly empty pane. One row floated in a large blank area. The room saw "an app" but not which app, and the empty pane made the demo look like a toy. A wrapper fixes both. It names the place, and it fills the frame with quiet, believable context.

## Cross-cutting rules

### The two-second test

- A developer should name the place in one word before reading any text: "orders", "store", "help desk", "editor", "terminal".
- Shape carries the place, not words. A product image and a price say "store". A row list with status chips says "admin". A dark window with a prompt says "terminal".
- If the place needs a sentence to explain, the wrapper is wrong.

### Density

- Five wrapper blocks at most per frame. A header counts as one.
- About 40 words of wrapper text at most, not counting the shown markup.
- Numbers only where they name a thing: order numbers, prices, versions, dates. No metrics, charts, sparklines or percentages in a wrapper.
- Fill space with large quiet shapes, such as an image or a card with one line. Do not fill it with more rows.
- Repeat rather than vary. Four sibling rows that say the same kind of thing read faster than four different widgets.
- Wrapper text is one step smaller and lighter than the shown element's text. It is never below 14 frame px, which is about 19 stage px.
- Nothing in a wrapper looks like a control the demo might use. No input look-alikes, no carets, no selectable chips, no strong buttons.
- Nothing in a wrapper uses alarm styling. Red, warning icons and toasts belong to the shown markup only (D5's banner, status lines).

### Where the demonstrated element sits

- In the top two thirds of the frame. In most rooms, heads block the bottom of the screen.
- Docked drawers (D5 console, F2 request log) stay at the bottom, as real tools do. Their newest row sits at the top of the drawer, so the line that matters is at mid-height.
- In the first column of a two-column layout, where eyes land first.
- With room to grow. Wrapper blocks sit beside a growing element, not below it (D3 details box, D2 slot).

### How the spotlight lands on a mostly-context frame

- Spotlights target shown elements only. Never outline a wrapper element. When the context is the point, the speaker names it.
- The shown element sits on the strongest glass surface. Wrapper surfaces are quieter, so the outline does not fight the context.
- The spotlight blue is reserved. No wrapper border, outline, ring or fill uses it. Wrapper borders stay thin and low contrast.
- Keep 16 frame px of clear space between a target's edge and any wrapper edge. The 4 px offset outline then reads as one shape, not a line touching a card.
- The wrapper never moves during a step. No transitions, no animations, no reflow beyond content directly below a growing element. Any movement keeps the boxes hidden longer under PRD 3.2, and the fade-in lands late.
- On a viewport resize (D2 "Narrow the page"), the header keeps one row at every width. A header that wraps shifts the card down and delays the settle.
- Callouts follow `demo-flow-cx.md`: none by default, one of three words at most.

### Fixture copy and naming

The retailer is Ridgeline Outfitters: trail shoes and outdoor gear. Use the same words in every wrapper, so the room meets one company, not eleven demos.

| Thing | Use | Avoid |
|---|---|---|
| Store name | "Ridgeline Outfitters", in full, in every header | "Ridgeline" alone, which collides with the product name |
| Admin areas | Orders, Support, Products | "Portal", "Dashboard", "Admin" as page titles |
| Hero product | Ridgeline Trail, a trail shoe, $129 (D2, D5, F2) | "hiking shoe" (the D5 CMS copy says it; align it to "trail shoe") |
| Editor product | Trail Runner 2, $140, colors Black, Moss and Sand (D6) | other color names |
| Recurring order | Order 418, a base layer, $162 (D1, D3, D4) | a different order number per demo |
| Order status | "Awaiting shipment" in D1, which D4's "Open" means | mixing "Pending" or "Processing" in |
| Signed-in staff | "BP" avatar in the admin wrappers (D1, D3, D4, D6) | a full name or a photo |
| Dates | 28 Oct 2026 | numeric dates, which read differently in Canada and the US |
| Money | $129, whole dollars on the storefront | cents beside whole dollars on one screen |
| Recorded or measured | "Recorded 28 Oct 2026", "Measured 28 Oct 2026" | "Live" anywhere |

Order 418 gives the deck a thread. D1 cancels it. D3's agent types "Refund missing for order 418". D4 opens it. Keep the number, item and total identical wherever they appear.

Copy rules: sentence case, short labels, no lorem ipsum, no jokes. Every value is plausible for a small outdoor retailer. Every number comes from `fixtures/` or generated files (PRD 2.1 rule 7).

### Same wrapper on used-to and now

Recommendation: yes, for every section except F3. The room sees the same place twice, so the only difference left is the code. The used-to wash stays grayer, as in v4. Where the shown markup differs between pages (D2, D5), the wrapper still stays the same and only the shown part changes.

### Intro slide visual

- Default: a full-frame still of the now page at its key moment, wrapper included. The visual area is 832 by 816, about the frame's aspect, so the whole place fits.
- Show the payoff, not the start. When the moment plays later, the room thinks "there it is".
- Never use a used-to still. It would show the old way as the promise.
- No spotlight boxes, callouts or cursor in the still.
- Use an illustrative composition only when one still cannot show the idea (D2). Build it from real captures, not drawn mockups.

## Per demo

### D1 Order actions: order queue

- **Context.** The fulfillment queue in a store admin. Every developer has built a row with an Actions menu and a Cancel that asks first.
- **Why it works.** Cancel is destructive, so a confirm step is expected. A list of similar rows shows why focus must return to the right row's Actions button.
- **Show.** Header strip: wordmark, "Orders", BP avatar. One line of queue summary, such as "5 awaiting shipment". The shown 418 row first, then four sibling rows: order number, item, total and an "Awaiting shipment" chip. Siblings carry a muted, static "Actions" label, so every row reads as having one, but 418's is the only real button.
- **Do not show.** Stat tiles, filters, search, pagination, bulk-select boxes, overflow icons, a second menu, any toast area. Customer names (see open question 1).
- **Used-to and now.** Identical.
- **Intro visual.** Now s2: the dialog "Cancel order 418?" open, with the queue visible behind the backdrop. Keep the current choice.

### D2 Product card: storefront merchandising page

- **Context.** A storefront landing page: a featured slot, a search results grid and a "Recommended" rail. Every front-end team has shipped one card into three containers.
- **Why it works.** The same card at three widths makes the point plain. The card should depend on its slot, not on the window.
- **Show.** Store header: wordmark, a static search bar shape, a cart icon with no count. On used-to, the shown markup already holds the three headed slots, so the wrapper adds only the header. On now, one live slot with a context label above it. The label uses the used-to headings, "Featured", "Search results" or "Recommended", so the two pages share words.
- **Do not show.** Other product cards. Static neighbors that do not respond would look broken while the slot moves. No promo banners, sort controls or second prices.
- **Used-to and now.** Same header and label style. The body differs only because the shown markup differs.
- **Intro visual.** A composition: the now card at rail, grid and featured widths side by side, each from a real capture of now s1 to s3, each under its context label. The current single wide card looks like any card.

### D3 Support form: support desk new case

- **Context.** A help desk "New case" screen. Agents type short subjects and paste long customer emails. Everyone has met the tiny textarea that scrolls on paste.
- **Why it works.** Both extremes sit in one form. The order 418 thread makes the case believable: the order was canceled, and the refund has not arrived.
- **Show.** Case header strip: "New case", "Order 418, canceled", a "Normal" priority chip, BP as assignee. One side card with order 418's item and total. The form gets the wide first column.
- **Do not show.** A reply composer, notes field, conversation thread or search box. Each is a second text field or a block of text that competes with the pasted details. No wrapper content below the form.
- **Used-to and now.** Identical.
- **Intro visual.** Now s2: the subject filled and the details box grown to twelve lines, with the case header in frame.

### D4 Dashboard navigation: Ridgeline portal

- **Context.** An admin app with a list, a filter, a detail view and Back. This is the one demo where app chrome is correct, because moving inside an app is the feature.
- **Why it works.** Developers know the single-page dashboard and its Back button bugs.
- **Show.** Icon rail with Orders active, top bar with the wordmark and BP avatar, the shown toolbar and list, and the evidence panel. The panel (address, title, focus, scroll, request log) is the real subject. Give it room and full contrast.
- **Do not show.** A breadcrumb or page path in the wrapper. It would compete with the address readout and would not change. No notification badges. The rail's active item never changes.
- **Used-to and now.** Identical.
- **Intro visual.** Now s1: order 418 open, with the address readout "/orders/418" inside the crop.

### D5 Rich content: storefront product page

- **Context.** A product page whose description comes from a CMS, next to reviews and a promo. Rich text from many authors is the familiar script-injection path.
- **Why it works.** The room sees ordinary store content and understands that marketing writes it, not developers.
- **Show.** Store header, product image, "$129", a rating line in plain text such as "4.5 out of 5, 2 reviews". The shown article holds the name and description. The console docks as a browser developer tools drawer on dark glass, so it reads as the developer's view, not the store.
- **Do not show.** Red, warning or alert styling, so the injected banner and console errors are the only alarms. No Add to cart button. No review text in the wrapper, because reviews are a shown sink on the used-to page.
- **Used-to and now.** Identical. The used-to shown markup holds three sinks. The wrapper stays the same around both.
- **Intro visual.** Now s4: the page with the console drawer showing the blocked write. Check that the console line reads at 832 px.

### D6 Variant picker: admin product editor

- **Context.** The variants section of a product editor. A color field with swatches is the common request that pushed teams to custom selects.
- **Why it works.** Three color thumbnails beside a text-only color list make the need for swatches obvious.
- **Show.** Editor header: "Products", "Trail Runner 2", a "Draft" chip. Title, price "$140" and SKU as read-only text. An image strip of the shoe in Black, Moss and Sand. Sizes as one plain line, such as "Sizes 7 to 13". The shown Color field inside a "Variants" card.
- **Do not show.** Size chips, carets, input boxes or anything else that looks selectable. No second Save button and no "Unsaved changes" bar.
- **Used-to and now.** Identical, including the Firefox step.
- **Intro visual.** Now s2: the picker open with a swatch beside each color, with the Variants card and the image strip in frame.

### F1 Still in motion: platform watch list

- **Context.** A team's tech radar or watch list in the engineering wiki. Leads keep one.
- **Show.** Header "Platform watch list" with the date, a legend for "Try now" and "Wait for", the five shown tiles and a source line with the web-features version. At s0 the tiles are hidden. Five faint, numbered empty slots behind the grid say "five things coming".
- **Do not show.** Support percentages, browser logos, version numbers per tile or any motion.
- **Pages.** Single page. No intro slide.

### F2 Caching: storefront product page

- **Context.** The same Ridgeline Trail product page as D5. A product page with shared copy and per-user stock is the classic caching question.
- **Why it works.** The room recognizes the store from D2 and D5, so the only new thing is the log.
- **Show.** The same storefront header as D2 and D5, the shown product page, and the request log docked on dark glass with the newest four rows at the top.
- **Do not show.** Cart counts, "Hi, name", a region picker, recently viewed items or personal recommendations. Any per-user data in the layout invites "Is that cached?" The layout must not read cookies anyway.
- **Used-to and now.** Identical. Both apps render one storefront shell.
- **Intro visual.** Now s1: the page above the log, where only inventory queries repeat. Crop so the log rows read.

### F3 Package trust: advisory feed, then terminal

- **Context, used-to.** A security advisories feed, the page teams read during an npm incident.
- **Context, now.** A terminal window, where package managers live.
- **Why two wrappers.** The used-to page is history and the now page is a session. Forcing one place on both would make one of them false. This is the one exception.
- **Show, used-to.** Header "npm security advisories", filter labels as plain text, the shown timeline and a source footer. One accent color for incident markers.
- **Show, now.** Title bar, one session tab, the working directory, a status bar with the registry and the pnpm and npm versions, and the "Recorded" chip.
- **Do not show.** Severity scores, advisory ids or dense tables on used-to. A blinking cursor, clock or "Live" label on now.
- **Intro visual.** The now page at the moment pnpm holds the install script back. If that frame shows only `ls .marker` failing, it reads to experts only. Then use the frame where pnpm names the blocked script, or s2 with the one-line approval.

### F4 Vite 8 locally: CI run report

- **Context.** A CI benchmark summary, like a job summary page.
- **Show.** Run header from `fixtures/vite-measurements.json`: "Fixture app", the two Vite versions, the machine, "Median of five runs" and the measured date. Then the shown table.
- **Do not show.** Pass badges or green checks, which imply a test result. No charts, no full plugin list, no repository name that implies a production app.
- **Pages.** Single page. No intro slide.

### F5 What you can delete: dependency review

- **Context.** A pull request that removes dependencies. "What you can delete" becomes a change a team could open on Monday.
- **Show.** Header: a title such as "Remove UI libraries the browser now covers", a "Draft" chip and a generated package count. Then the shown table.
- **Do not show.** Diff lines, file trees, reviewers, checks, a merge button or comments. Do not imply Ridgeline merged it. The Draft chip keeps it a proposal.
- **Pages.** Single page. No intro slide.

## Differences from PRD 2.2

1. **D1.** One summary line instead of "queue summary stats". Pick sibling rows by status, not by ids 419 to 422: in `orders.json`, order 420 is Shipped and would not sit in an awaiting-shipment queue.
2. **D2.** No sibling cards. The now-page label reuses the used-to headings.
3. **D3.** One side card for order 418, not a customer card plus a recent orders card. At 640 px the form needs the width.
4. **D6.** Sizes as plain text, not static chips. Chips look selectable next to the picker.
5. **F1.** Five empty slots at s0, to meet the fill rule while the tiles are hidden.
6. **F5.** The pull request is a Draft.
7. **Intro visuals.** D2 becomes a composition. F3's capture moment needs a check.

## Open questions for the speaker

1. The orders fixture uses famous computer scientists as customers. Order 418 is Donald Knuth. Developers will read the names and smile, which pulls eyes off the demo. Keep them, or switch to plain fictional names? Recommendation: switch, or leave names out of the wrappers.
2. Order 418 is canceled in D1 and gets a refund case in D3. Do you want to say that link aloud, or leave it for people who notice?
3. Is a Draft pull request the right frame for F5, or would you rather show a plain report?

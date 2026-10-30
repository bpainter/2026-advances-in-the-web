# 2026 Advances in the Web
## Rewritten speaker notes

Support and citations reviewed for October 29, 2026. Reference lines are not spoken copy.

## Slide 1
**2026 Advances in the Web**  
Slide ID: `title`

### Step 1
While everyone was watching AI, the web kept moving.

Browsers can handle more of the work we used to hand to libraries. Frameworks are changing how we load pages and cache data. Even installing a package deserves another look.

We're going to look at those changes through things we actually build: forms, product pages, navigation, and the tools behind them.

But first, a little context.

## Slide 2
**The mandate**  
Slide ID: `the-mandate`

### Step 1
I work at a large digital consultancy with somewhere north of 3,000 software engineers. I've lost count.

Like a lot of large organizations, we have a mandate from the executive team: use AI.

Use it for what? That part can be less clear. Sometimes the training hasn't caught up. Sometimes the licenses haven't either. Apparently, the first thing we're automating is the purchase request.

I'm not against the tools. But handing someone a tool and telling them to be more productive isn't much of a plan.

And the reactions are pretty interesting.

## Slide 3
**Three reactions**  
Slide ID: `three-reactions`

### Step 1
I've started thinking about these reactions in three groups. These are people I've worked with, not a scientific study. You may recognize more than one.

First, the Greybeards. They've seen a few revolutions already. Their question is, "Why? What problem are we solving?" They're not against a new tool. They just want a reason beyond the fact that we bought it.

Then we have the Line Toers. Their question is, "How?" Leadership wants AI, so they're working out where it can help and how to fit it into the job.

And then the New Luddites. They're asking, "Should we?" They're worried about the effects on jobs, society, and the environment. The hesitation isn't always about the technology. It's about what comes with it.

Why, how, and should we. Honestly, we need all three questions.

## Slide 4
**Two perspectives**  
Slide ID: `two-perspectives`

> **Reference, not spoken:** The Tim Berners-Lee quotation matches the indexed original op-ed. The direct Web Foundation URL could not be verified, so it is not included as a passed link here. The W3C source is a Strategy Team discussion paper, not a new web standard. [W3C Strategy Team: the web in the AI era](https://www.w3.org/2026/10/w3c-and-state-of-web-in-ai-era.html)

### Step 1
Tim Berners-Lee described what he wanted the web to be:

> "I aimed to create a neutral space where everyone could create, share, debate, innovate, learn and dream."

That's a much bigger idea than a place to consume content. It's a place where any of us can contribute.

The W3C perspective on this slide brings us back to people as AI becomes part of the web. The tools should work for us. They shouldn't decide what the web is allowed to become.

Those ideas belong together. Keep the web open to new tools, but keep people in control.

## Slide 5
**Keep humanity at the center**  
Slide ID: `keep-humanity`

### Step 1
For me, that means keeping room for people to make things, learn things, and make their own choices.

AI can help us write code or work through an idea. It doesn't take responsibility for whether the result is useful, accessible, or safe.

We still have to understand what we're shipping. We still have to test it. And we still need a web where people can build something without asking a platform for permission.

## Slide 6
**Why the open web matters**  
Slide ID: `open-web`

> **Reference, not spoken:** [W3C Ethical Web Principles](https://www.w3.org/TR/ethical-web-principles/)

### Step 1
There are six reasons I care about this.

- **Choice.** A website shouldn't require everyone to use one company's browser, app, or assistant.
- **Control.** People should understand what a service does and have a say in what it can access.
- **Lasting access.** A link should take you to something you can read, share, and return to. It shouldn't depend on one feed deciding to show it.
- **Access for more people.** Good HTML gives us a starting point for different devices, keyboards, and assistive tools.
- **Trust.** Open standards give us shared rules we can inspect, test, and improve.
- **Room to create.** You can publish a useful tool, a strange little experiment, or something nobody has thought of yet.

Open standards don't guarantee every site does those things well. But they give us a foundation that isn't controlled by one product.

## Slide 7
**What we'll cover**  
Slide ID: `what-we-cover`

### Step 1
That's enough AI for now.

We'll start with HTML, CSS, and JavaScript. For each demo, we'll look at what we used to build ourselves, what the browser can handle now, and the code behind it.

Then we'll look at features that still need more care around support. After that, we'll get into caching, package installs, and build tools.

Some of these features are new. Others have been around for a while and have become more useful as support has improved.

The point isn't to stop using libraries. It's to know what we're choosing. AI is another tool in that mix. It isn't a reason to stop learning how the web works.

## Slide 8
**Dialog element: introduction**  
Slide ID: `d1-intro`

> **Reference, not spoken:** Core dialog and popover support do not cover every enhancement. show-modal/close commands: Chrome 135, Edge 135, Firefox 144, Safari 26.2. :open: Chrome 133, Edge 133, Firefox 136, Safari 26.5. closedby is not stable in Safari. display/overlay exit transitions are not a four-browser guarantee. [MDN compatibility: button commands](https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/button.json); [MDN compatibility: :open](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/selectors/open.json); [MDN compatibility: dialog](https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/dialog.json); [MDN compatibility: discrete transitions](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/transition-behavior.json); [MDN compatibility: overlay](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/overlay.json)

### Step 1
Let's start with an order screen. Open the actions, choose cancel, and ask the user to confirm.

Nothing unusual. But a custom version needs positioning, keyboard handling, focus management, and rules for what happens behind the dialog.

The dialog element, popovers, and declarative button commands can take over a lot of that work. They're separate features, so their support needs to be checked separately too.

## Slide 9
**Dialog element: what we used to do**  
Slide ID: `d1-used-to`

### Step 1
Here's the order. The actions are hidden until we need them.

The interaction looks small. The work behind it is less small.

### Step 2
Open the actions.

Our code moves the menu outside the table so it doesn't get clipped. Then it has to keep the menu lined up with the button.

We haven't canceled anything yet. We're still working on where the menu goes.

### Step 3
Now choose cancel.

We need a backdrop, a dialog, and the right stacking order. The dialog has to sit above the menu and the rest of the page.

That's where the increasingly large `z-index` numbers tend to appear.

### Step 4
Now add the keyboard behavior. Escape should close the right thing. Focus should stay in the modal, then return to a useful place when it closes.

The background shouldn't remain interactive either.

The demo counts 404 lines of JavaScript in this version. That's a count for this example, not every dialog. But it shows how much code can sit behind a familiar interaction.

## Slide 10
**Dialog element: what we can do today**  
Slide ID: `d1-now`

### Step 1
Same order. Same task. We're changing how the interaction is built, not what the user has to learn.

Start with the HTML.

### Step 2
The button points to a popover with `popovertarget`.

The browser puts the open popover in the top layer, above normal page content. We don't need to move it to the end of the document just to escape a clipped container.

A popover still isn't a complete menu pattern by itself. We need the right content and keyboard behavior for the control we're building.

### Step 3
The cancel button uses `commandfor` and `show-modal` to open the dialog.

The browser handles the modal behavior. The rest of the page becomes inert, and we choose the initial focus. Here, "Keep order" is the safer first choice.

We still provide the label and clear actions.

### Step 4
Now keep the order, then close the actions.

Watch where focus goes. The interaction should leave you somewhere useful, not at the top of the page wondering what happened.

Native behavior gives us a better starting point. We still test the full keyboard path.

### Step 5
The JavaScript that's left handles the actual cancellation request and the response.

The demo counts 22 lines here. We removed interface plumbing, not the business rules. The server still checks whether this user can cancel this order.

### Step 6
Now remove the styling.

It isn't winning a design award, but the controls still have their basic behavior.

That's the useful part. The interaction doesn't depend on us rebuilding every detail in JavaScript.

## Slide 11
**Container queries: introduction**  
Slide ID: `d2-intro`

> **Reference, not spoken:** Container queries and cqi: Chrome/Edge 105, Firefox 110, Safari 16. @scope: Chrome/Edge 118, Firefox 146; Safari first shipped 17.4, regressed for form fields in 26.0 through 26.3, and fixed that in 26.4. :has(): Chrome/Edge 105, Firefox 121, Safari 15.4. [MDN compatibility: container-type](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/container-type.json); [MDN compatibility: container units](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/types/length.json); [MDN compatibility: @scope](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/scope.json); [MDN compatibility: :has()](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/selectors/has.json)

### Step 1
Here's a product card we want to reuse in a wide section, a search result, and a narrow sidebar.

The browser window might be the same size in all three cases. The space around the card isn't.

Container queries let the card respond to that space. We'll also use `@scope` and `:has()` to keep the styles easier to manage.

## Slide 12
**Container queries: what we used to do**  
Slide ID: `d2-used-to`

### Step 1
We've got the same card in a few different slots.

Each slot needs a slightly different layout, so the parent starts telling the card how to look.

### Step 2
Now we have variants: compact, wide, sidebar, and whatever comes next.

The card isn't just receiving product data. It's receiving instructions about the page around it.

### Step 3
Those variants turn into more CSS and more breakpoints.

A viewport query tells us how wide the browser is. It doesn't tell us how much of that width the card actually gets.

### Step 4
Shrink the page and watch the mismatch.

We can patch it with `ResizeObserver`, measure the card, and switch classes ourselves. The demo counts 126 lines of layout JavaScript in this version.

It works, but we're writing code to tell CSS how much room it has.

## Slide 13
**Container queries: what we can do today**  
Slide ID: `d2-now`

### Step 1
The wrapper is now a named container with `container-type: inline-size`.

That gives the card a useful question to ask: how much horizontal space do I have?

### Step 2
Make the slot narrow.

The card stacks its content because its container is narrow. We don't need the parent to pass a compact-layout flag.

### Step 3
Now give it more room.

Once the container reaches the breakpoint, the card switches to three columns. The same component handles both layouts.

Container units also let us size parts of the card relative to the space around it.

### Step 4
Here's `@scope`.

It limits where these rules apply, so we can write simpler selectors for the card.

It doesn't create a sealed box. Outside styles can still affect elements inside it. Think of it as a way to target rules, not complete style isolation.

### Step 5
Remove the stock message.

The `:has()` rule responds to what's in the card. We don't need JavaScript to add another class just to say the stock element exists.

### Step 6
Now change the page width again.

The card follows its own container, not a guess based on the whole window. We've removed the layout JavaScript from this version.

The form is still a form. Layout changes don't have to change how the user buys the product.

## Slide 14
**Field sizing: introduction**  
Slide ID: `d3-intro`

> **Reference, not spoken:** field-sizing: content: Chrome 123, Edge 123, Firefox 152, Safari 26.2. [MDN compatibility: field-sizing](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/field-sizing.json)

### Step 1
A support form needs a short subject and a longer description.

We want the fields to grow as someone types, without taking over the page.

That's a common reason to add a small JavaScript helper. `field-sizing` gives CSS a way to handle it instead, where it's supported.

## Slide 15
**Field sizing: what we used to do**  
Slide ID: `d3-used-to`

### Step 1
Here's the form with our resizing code attached.

The user sees two fields. We see a few extra jobs.

### Step 2
Type a subject.

A hidden copy measures the text so we can set the input's width. Now that copy has to match the real field's font, spacing, and padding.

### Step 3
Paste a longer description.

For the textarea, we read `scrollHeight` and set the height ourselves. We also need limits so it doesn't keep growing down the page.

### Step 4
Reset the form. The fields need to shrink again too.

The demo counts 113 lines of JavaScript for this version. None of that helps us resolve the customer's problem. It's just keeping the fields the right size.

## Slide 16
**Field sizing: what we can do today**  
Slide ID: `d3-now`

### Step 1
The HTML is still a normal form with labels, required fields, and a submit button.

The sizing enhancement lives in CSS. Browsers that don't support it keep a usable form.

### Step 2
Type the subject again.

`field-sizing: content` lets the input grow with its content. A minimum width keeps it usable when it's empty, and a maximum stops it spilling out of the form.

### Step 3
Paste the description.

The textarea grows within the limits we've set: six to twelve line heights in this example. After that, it scrolls.

No hidden measuring element. No height calculation in our JavaScript.

### Step 4
Submit and reset.

The fields resize with their content. The remaining JavaScript sends the request and handles the result.

The demo counts nine lines for that request handling, with no resizing code.

### Step 5
Try submitting without the required information.

Browser validation still helps the user fix the form. We still validate on the server, because browser checks aren't a security boundary.

### Step 6
Turn off the sizing enhancement.

The form is less polished, but it still works. That's the fallback we want: a different presentation, not a broken task.

## Slide 17
**Navigation API: introduction**  
Slide ID: `d4-intro`

> **Reference, not spoken:** The intercept() / canIntercept API used here requires Chrome 105, Edge 105, Firefox 147, Safari 26.2. Chrome/Edge 102 had older names. [MDN compatibility: NavigateEvent](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/NavigateEvent.json)

### Step 1
Now an order list. Open an order, filter the list, go back, and keep your place.

A client-side router can do that, but we often end up managing clicks, history, canceled requests, focus, and scroll in separate places.

The Navigation API gives us a more direct way to handle supported navigations. It doesn't remove the need for good routing decisions.

## Slide 18
**Navigation API: what we used to do**  
Slide ID: `d4-used-to`

### Step 1
Here's the list with a small custom router.

It starts with normal links. Then our code takes over when someone clicks one.

### Step 2
Open order 418.

We stop the link, load content, update the page, and push a history entry. We also need to update the title and move focus somewhere useful.

### Step 3
Now go back.

That's a different event path. We need to load the right view and restore the user's place, not just change the URL.

### Step 4
Open a slow order, then quickly open another.

Without cancellation, the first response can arrive last and replace the page with the wrong order.

This example uses 134 lines of routing JavaScript. A lot of it coordinates work the browser already knows is navigation.

## Slide 19
**Navigation API: what we can do today**  
Slide ID: `d4-now`

### Step 1
The server still provides a complete order list. The links work before we add the enhancement.

That gives us a fallback instead of an empty screen waiting for the router.

### Step 2
Open an order.

The `navigate` handler checks whether this is a navigation we should intercept. Downloads, different origins, and other special cases shouldn't be pulled into our page loader.

We then load the content and handle the title and focus. The demo's routing code is down to 33 lines.

### Step 3
Use the filter.

It's a GET form, so the filter state belongs in the URL. That makes the result easier to share and revisit.

We're demonstrating this navigation path, not claiming every form submission should be intercepted.

### Step 4
Go back through the list and detail views.

The goal is to preserve the user's place. A back button that returns you to the top of a long list technically works, but it doesn't feel finished.

### Step 5
Try the slow-order case again.

We pass the navigation's abort signal to the fetch. When that navigation is canceled, the request can be canceled too.

We still handle errors. The API helps coordinate the work; it doesn't write the error screen for us.

### Step 6
Remove the enhancement.

The links load full pages. The GET form still submits. The task still works.

That's the difference between enhancing navigation and making navigation depend on our JavaScript.

## Slide 20
**Trusted Types: introduction**  
Slide ID: `d5-intro`

> **Reference, not spoken:** Trusted Types policy creation and CSP enforcement: Chrome 83, Edge 83, Firefox 148, Safari 26. Sanitization remains a separate responsibility. [MDN compatibility: TrustedTypePolicyFactory](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/TrustedTypePolicyFactory.json); [MDN compatibility: Content-Security-Policy](https://raw.githubusercontent.com/mdn/browser-compat-data/main/http/headers/Content-Security-Policy.json)

### Step 1
A CMS gives us rich text. Reviews and promotions may bring in more HTML.

Somewhere, that content gets inserted into the page. The question is whether every path goes through the same checks.

Trusted Types can help us enforce a rule at those insertion points. It doesn't clean the content by itself.

## Slide 21
**Trusted Types: what we used to do**  
Slide ID: `d5-used-to`

### Step 1
We have a product description, a review, and a promotion.

They look like three bits of content. In the code, they may be three different routes into the page.

### Step 2
Here's one call to `innerHTML`, then another.

Maybe we have a sanitizing helper. But everyone has to remember to use it, every time, including the person who adds a feature next month.

### Step 3
Now try content with an unwanted event handler.

The problem isn't whether the text came from a familiar system. It's what the browser is being asked to interpret as HTML.

One missed path can undo the care we took elsewhere.

### Step 4
The demo identifies seven places where strings are inserted as HTML.

That's seven places to review and keep consistent. A comment saying "sanitize first" is useful, but it isn't enforcement.

## Slide 22
**Trusted Types: what we can do today**  
Slide ID: `d5-now`

### Step 1
Start in report-only mode.

We want to see where the application breaks the proposed rule before we enforce it for users.

### Step 2
Exercise the content paths and look at the reports.

Report-only mode tells us about violations. It doesn't block them. And it only tells us about the paths we've actually run.

That makes it a discovery step, not a clean bill of health.

### Step 3
Once those paths are ready, enforce the policy through Content Security Policy.

Now the protected HTML insertion points require the right trusted value instead of an ordinary string. We also limit which policies the page can create.

### Step 4
Our policy uses DOMPurify to clean the content before producing that value.

Trusted Types makes the application follow the policy. DOMPurify does the sanitizing. We still need both jobs done correctly.

We're removing scattered checks, not removing the sanitizer.

### Step 5
Try inserting a raw string at a protected insertion point.

With enforcement active, the browser rejects it. That's stronger than hoping every caller remembers the helper.

It doesn't solve every kind of cross-site scripting. It gives us an enforceable rule for an important set of risky operations.

## Slide 23
**Customizable select: introduction**  
Slide ID: `d6-intro`

> **Reference, not spoken:** Customizable single select: Chrome 135, Edge 135, Safari 27. No stable full Firefox support. Firefox 149's appearance preferences are not a production support claim, and selectedcontent remains unsupported there. [MDN compatibility: base-select](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/appearance.json); [MDN compatibility: selectedcontent](https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/selectedcontent.json)

### Step 1
A customer needs to choose a color. We'd like to show the color name and a small image.

That design request often sends us straight to a custom dropdown. Then we inherit all the behavior of a select control too.

Customizable select lets us keep more of the native control while changing its appearance. Support still needs care, so the ordinary select remains important.

## Slide 24
**Customizable select: what we used to do**  
Slide ID: `d6-used-to`

### Step 1
Here's the custom color picker.

It looks like a select, but underneath it, we've built our own control.

### Step 2
We have a combobox, a list of options, and a hidden input to carry the selected value into the form.

Now those pieces have to agree about what's selected.

### Step 3
Open the picker.

We handle its position, size, open state, and what happens when it gets close to the edge of the screen.

### Step 4
Choose a color with the keyboard.

Arrow keys, Enter, focus, and typing to find an option all need attention. The demo counts 128 lines of JavaScript in this version.

The picture in the option was the easy part.

## Slide 25
**Customizable select: what we can do today**  
Slide ID: `d6-now`

### Step 1
Start with a real `select` and real options.

Without the enhanced styling, the user still has a working color field. The form still has a value to submit.

### Step 2
Now opt into the customizable appearance with `base-select`.

We can style the control and its picker rather than replacing the whole interaction with separate elements.

### Step 3
The options can include the color image and label. `selectedcontent` displays the chosen option's content in the button.

The text still needs to make sense on its own. The image shouldn't be the only way someone can tell the options apart.

### Step 4
Choose Moss and watch the selected content update.

The browser manages the selection. We still test actual keyboard and assistive-technology behavior on the browsers we support.

A scripted selection in a demo isn't a substitute for that test.

### Step 5
Check the submitted form data.

We get the value `moss`, just as we'd expect from a normal select. We don't need a hidden field to keep a separate custom control in sync.

The remaining JavaScript handles the request, not the picker.

### Step 6
*Show the Firefox capture identified in the deck.*

Here's the Firefox capture for this example, rather than a live browser switch.

The important fallback is still the ordinary select. We can add the richer appearance where it works without making color selection depend on it.

## Slide 26
**Anchor positioning: introduction**  
Slide ID: `m1-intro`

> **Reference, not spoken:** Basic named-anchor patterns shipped before the latest position-anchor initial-value semantics. The current semantics are Chrome/Edge 151, Firefox 151, Safari 27. position-area is Chrome/Edge 129, Firefox 147, Safari 26, with value-specific caveats. The optional anchored-query arrow is Chrome/Edge 143 only. These are feature records, not a tested minimum for the entire demo. [MDN compatibility: position-anchor](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/position-anchor.json); [MDN compatibility: position-area](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/position-area.json); [MDN compatibility: container-type](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/container-type.json)

### Step 1
Now we're into features where we need to pay closer attention to the exact parts supported by each browser.

Here's a product photo with clickable hotspots. Each one opens a card beside the item.

Keeping that card close to its hotspot, and inside the visible area, has usually meant a positioning library or our own measurements. CSS anchor positioning takes over much of that work.

## Slide 27
**Anchor positioning: what we used to do**  
Slide ID: `m1-used-to`

### Step 1
The photo has a few product hotspots.

Each card needs to follow its hotspot as the layout changes.

### Step 2
Open the shell jacket.

Our code measures the hotspot and the card, then decides where to place the card. Moving it elsewhere in the document can avoid clipping, but now the connection is something we maintain ourselves.

### Step 3
Open the shoe near the edge.

The card doesn't fit on the usual side, so our code moves it to the other side. The arrow needs to follow that decision too.

### Step 4
Make the photo narrower.

Now we measure again. Resize listeners and observers keep the card in place. The demo counts 71 lines of positioning JavaScript.

It's a familiar problem, which is exactly why it's useful for the platform to handle more of it.

## Slide 28
**Anchor positioning: what we can do today**  
Slide ID: `m1-now`

### Step 1
Same photo and hotspots.

In CSS, we name the anchor and tell the card which anchor it belongs to.

### Step 2
Open the jacket.

`position-anchor` connects the card to the hotspot. `position-area` describes where we'd like it to go.

We describe the relationship instead of calculating the coordinates ourselves.

### Step 3
Now open the shoe.

The preferred position doesn't fit, so the browser tries the fallback positions we've supplied.

The arrow is an extra enhancement in this demo. Support for that part is narrower than support for the basic anchored card.

### Step 4
Make the photo narrower again.

The browser updates the position without our positioning listeners. In a browser without the needed anchor support, this example uses a simpler centered card.

The card still opens. It just loses the more precise placement.

## Slide 29
**Grid Lanes: introduction**  
Slide ID: `m2-intro`

> **Reference, not spoken:** grid-lanes: Safari 26.4. No stable default support in Chrome, Edge, or Firefox in the checked records. Do not count flags or the removed legacy masonry syntax. [MDN compatibility: display / grid-lanes](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/display.json); [Firefox 159 release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159)

### Step 1
Here's a wall of customer photos and quotes. They aren't all the same height, and we'd rather not crop them into identical boxes.

Grid Lanes is aimed at layouts like this, where items can pack into lanes without sharing every row boundary.

Treat the native layout as an enhancement here. The fallback still needs a sensible reading order.

## Slide 30
**Grid Lanes: what we used to do**  
Slide ID: `m2-used-to`

### Step 1
We start with a set of photos and quotes from the server.

JavaScript takes over their positions after the page loads.

### Step 2
For each item, the script finds a short column and places the item there.

That means measuring the items and keeping track of how tall each column has become.

### Step 3
Load six more items.

The new content has to go through the same process. If an image changes size after loading, that may mean more work too.

### Step 4
Now narrow the wall.

The script waits briefly, measures again, and places everything for the new width. The demo counts 55 lines of layout JavaScript.

We're maintaining our own layout system alongside the browser's.

## Slide 31
**Grid Lanes: what we can do today**  
Slide ID: `m2-now`

### Step 1
Start with a regular layout that keeps the content readable.

The photos and quotes shouldn't disappear just because the browser doesn't support the newer option.

### Step 2
Where supported, `display: grid-lanes` lets the browser handle the variable-height layout.

The fallback in this example uses columns. That's not identical: columns read down before they read across. The content needs to make sense in that order.

### Step 3
Load six more items again.

The JavaScript adds the content. CSS handles its placement. The demo counts seven lines of request handling rather than another layout routine.

We still need to handle loading errors and any untrusted content we insert.

### Step 4
Narrow the wall.

The layout responds without our measuring loop. The benefit is less positioning code, not a promise that every browser will arrange every item the same way.

Use the supported layout, then check reading order and keyboard access in the fallback too.

## Slide 32
**Scoped custom element registries: introduction**  
Slide ID: `m3-intro`

> **Reference, not spoken:** Scoped registries: Chrome 146, Edge 146, Firefox 159, Safari 26. Firefox support shipped October 27, 2026. [MDN compatibility: scoped registry constructor](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/CustomElementRegistry.json); [Firefox 159 release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159)

### Step 1
A product editor uses one version of a price-field component. An embedded pricing tool uses another version with the same element name.

A single global registry makes that awkward. Both versions want to register the same name.

Scoped registries let a part of the page use its own component definitions. That can help when teams or products can't upgrade everything at once.

## Slide 33
**Scoped registries: what we used to do**  
Slide ID: `m3-used-to`

### Step 1
Here's the product editor and its embedded pricing tool.

We've put the tool in an iframe so it can use its own component definitions.

### Step 2
That separates the registries, but it also gives us a separate document to manage.

Now the host and the tool need a way to share state and coordinate their sizes.

### Step 3
Add a pricing tier.

The tool grows, but the iframe doesn't automatically grow with its contents. We either get nested scrolling or write more code to resize it.

### Step 4
Change the price.

The editor sends the new base price to the embedded tool with `postMessage`. The tool checks the message origin and source, then updates its pricing tiers. A ready message travels back the other way. The demo counts 26 lines of integration code.

An iframe can be the right boundary. But sometimes we're using it mainly to avoid a naming conflict.

## Slide 34
**Scoped registries: what we can do today**  
Slide ID: `m3-now`

### Step 1
The editor and pricing tool are now part of the same page.

We still have two component versions. We're changing where their definitions apply.

### Step 2
The pricing tool gets its own `CustomElementRegistry` attached to its shadow root.

Inside that root, the shared tag name points to the tool's version. Outside it, the host keeps its version.

### Step 3
Add another tier.

The tool grows with the page layout. We don't need an iframe-height message just to make room for the new field.

### Step 4
Change the price again.

The editor's price field fires a DOM event. The pricing tool listens for it and updates its tiers. We no longer need the cross-document message bridge. The demo's integration code is down to nine lines.

One important limit: a shadow root is not a security boundary. This is for code we trust, not a replacement for isolating an untrusted application.

## Slide 35
**Scroll-driven animations: introduction**  
Slide ID: `m4-intro`

> **Reference, not spoken:** scroll(), view(), and animation-range: Chrome 115, Edge 115, Firefox 159, Safari 26. Firefox support shipped October 27, 2026. [MDN compatibility: animation-timeline](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/animation-timeline.json); [MDN compatibility: animation-range](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/animation-range.json); [Firefox 159 release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159)

### Step 1
Here's a help article with a reading-progress bar and a few small reveals.

The animation follows how far we've scrolled, not how many seconds have passed.

CSS scroll-driven animations let us describe that relationship directly. The article still needs to work with no animation at all.

## Slide 36
**Scroll-driven animations: what we used to do**  
Slide ID: `m4-used-to`

### Step 1
The article loads, and our script starts watching the scroll position.

It has one job for the progress bar and another for the content reveals.

### Step 2
Scroll partway down.

For the progress bar, we calculate how far the user has traveled through the scrollable area. Then we update the bar through an animation frame.

### Step 3
Keep scrolling.

An intersection observer adds classes when the article sections enter view. We also decide when to stop observing each one.

### Step 4
Now give the main thread some extra work.

The scripted updates can fall behind. The demo counts 33 lines of scroll-related JavaScript, and all of it depends on our code getting time to run.

## Slide 37
**Scroll-driven animations: what we can do today**  
Slide ID: `m4-now`

### Step 1
The base page is readable, with the content visible.

We add animation only when the browser supports it and the user's motion preferences allow it.

### Step 2
Scroll down again.

`animation-timeline: scroll()` connects the progress animation to scrolling. We describe the start and end states in CSS instead of updating the bar on every scroll.

### Step 3
The reveals use a view timeline, so each animation follows the element's position in the viewport.

Reduced-motion handling is part of the design. Removing movement shouldn't remove the information.

### Step 4
Add the extra main-thread work again.

Animations using suitable properties can keep running more smoothly because they don't depend on our scroll callback. In this version, we've removed the scroll JavaScript.

That isn't a guarantee that CSS animation can never stall. The properties, browser, and rest of the page still matter.

## Slide 38
**Cross-document view transitions: introduction**  
Slide ID: `m5-intro`

> **Reference, not spoken:** Cross-document transitions: Chrome 126, Edge 126, Safari 18.2. No stable Firefox support in the checked records. Same-document transitions are a different support row. [MDN compatibility: @view-transition](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/view-transition.json); [Chrome: cross-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)

### Step 1
Let's go from a product list to a product page and keep the image visually connected between them.

We often associate that effect with a single-page app. Cross-document view transitions let supporting browsers animate between separate pages too.

The navigation can stay a normal link. The movement is the enhancement.

## Slide 39
**Cross-document transitions: what we used to do**  
Slide ID: `m5-used-to`

### Step 1
This version keeps the list and product view inside one document.

Our code decides which view is visible and handles the movement between them.

### Step 2
Open the trail shoe.

The animation measures the image before and after the layout change. It then uses those measurements to move and scale between the two positions.

### Step 3
Go back.

We do the process again in reverse. We also need the URL, title, focus, and history to match the view the user sees.

### Step 4
Now open the daypack.

The demo counts 63 lines of JavaScript for this approach. It's a valid technique, but the animation has brought navigation work along with it.

It wasn't the only way to build the site. It was one way to get this effect.

## Slide 40
**Cross-document transitions: what we can do today**  
Slide ID: `m5-now`

### Step 1
Now the category and product are separate pages connected by real links.

Both pages opt into view transitions. The relevant elements have matching, unique transition names.

### Step 2
Open the trail shoe.

The browser captures the outgoing and incoming views and animates between them. We're navigating to another document, not swapping a hidden panel into place.

### Step 3
Go back.

The matching names help connect the product image across the two pages. History remains browser history.

We also honor reduced-motion preferences rather than making the effect mandatory.

### Step 4
Open the daypack.

The demo uses no JavaScript for this transition. A browser without support follows the link normally.

A smooth transition doesn't fix a slow response, though. Page performance still matters underneath the effect.

## Slide 41
**Cache Components: introduction**  
Slide ID: `f2-intro`

> **Reference, not spoken:** Cache Components shipped as opt-in in Next.js 16. The 16.4 announcement still describes the Next.js 17 default as a future change. [Next.js 16 release](https://nextjs.org/blog/next-16); [Next.js 16.4 release](https://nextjs.org/blog/next-16-4); [Cache Components migration guide](https://nextjs.org/docs/app/guides/migrating-to-cache-components)

### Step 1
Let's move from browser features to framework decisions.

A product page has information everyone shares, like the name and description. Stock may depend on the user's region or account. Those pieces don't need the same caching rules.

We'll use Next.js Cache Components to make that difference explicit. The useful question isn't just, "Can we cache this page?" It's, "Which work can we safely reuse?"

## Slide 42
**Cache Components: what we used to do**  
Slide ID: `f2-used-to`

### Step 1
Here's the page with Cache Components turned off.

The request log will show which queries run each time. We'll watch the work, not just whether the page looks fast.

### Step 2
The route has an hourly revalidation setting and an automatic rendering setting.

Those are useful controls, but they don't explain the whole page on their own. We also need to look at what the data functions do.

### Step 3
Load the page again.

The stock function reads cookies, so the route needs request-time rendering. The catalog is a plain database read without its own cache, so that query runs again too.

Reading a cookie doesn't erase every possible data cache. The repeated work here comes from this particular combination.

### Step 4
The demo counts five freshness settings across four files.

To understand what gets reused, we have to follow those settings through the application.

The problem isn't that caching was impossible before. It's that the intended behavior can be hard to see where the data is loaded.

## Slide 43
**Cache Components: what we can do today**  
Slide ID: `f2-now`

### Step 1
Now Cache Components is enabled.

We'll mark the shared catalog read for caching and leave the request-specific stock read outside that shared cache.

### Step 2
Load the page a couple more times and watch the log.

`use cache` marks the catalog function for reuse. `cacheLife` sets its cache policy, and `cacheTag` gives us a way to target that cached result later.

In this example, the catalog query stops repeating while the stock query still runs for each request. The three controls are together where we can find them.

### Step 3
Slow the stock request down.

The product name and description can appear first. The stock section shows its fallback until the result is ready.

`Suspense` lets us wait for that part without holding back the whole page.

### Step 4
Save a new product description.

The save action calls `updateTag` for the product's cache tag. The next read gets fresh catalog data instead of waiting for the normal cache policy.

That doesn't mean every already-open page updates itself. Cache invalidation and updating an existing screen are separate jobs.

### Step 5
Switch the user and region.

The stock result changes, while the shared catalog can stay cached.

Keeping user-specific reads out of a shared cache helps avoid mixing results between users. It isn't the whole privacy story. We still need authorization and careful cache keys wherever private data is involved.

## Slide 44
**Package trust: introduction**  
Slide ID: `f3-intro`

> **Reference, not spoken:** The permissions/approve example is documented by pnpm 12.11.0. npm 11.15.0 introduced the cited source-control flags with permissive defaults; stricter settings are opt-in for that version. Do not generalize those defaults to npm 12. [pnpm 12.11.0 release](https://pnpm.io/blog/releases/12.11.0); [npm staged publishing and source controls](https://github.blog/changelog/2026-05-29-staged-publishing-and-new-install-time-controls-for-npm/)

### Step 1
Now let's look at something we do without much ceremony: install a package.

That can bring code into our project and run code on our machine or build server. Publishing has its own risks too.

This section uses a recorded workflow so we can look at the decisions without publishing anything from the stage.

## Slide 45
**Package trust: what we used to do**  
Slide ID: `f3-used-to`

### Step 1
The timeline illustrates the risk: a package release appears, an automated update picks it up, and the new code reaches our build.

The incident list gives us examples of that risk. Keep the dates and counts tied to each source. A vulnerable package isn't the same as a package that was actually compromised.

### Step 2
We can turn off install scripts globally.

That blocks a useful path for unwanted code, but it can also break packages that need a build step. The application may install successfully and still not work.

### Step 3
Now we're making an explicit exception for the packages we've reviewed, then rebuilding those packages. Leaving `ignore-scripts=true` in effect would still block their lifecycle scripts.

The exceptions need review too. Otherwise, "block everything" slowly turns into "allow whatever made the build fail."

### Step 4
Publishing often adds a long-lived registry token to the mix.

If that credential leaks, someone may be able to publish as us. A token hidden in a build setting is still a credential we have to protect and rotate.

## Slide 46
**Package trust: what we can do today**  
Slide ID: `f3-now`

> **Reference, not spoken:** npm staging, inspection, approval, and authorization are separate steps. Provenance identifies origin/build information; it is not a safety guarantee. [npm stage reference, v11](https://docs.npmjs.com/cli/v11/commands/npm-stage/); [Snyk: TanStack compromise](https://snyk.io/blog/tanstack-npm-packages-compromised/)

### Step 1
Start with a policy in the repository.

Pin the package manager, keep the lockfile, and make install-script permissions explicit. The team should be able to review the policy alongside the dependency change.

### Step 2
Now an unapproved build script is blocked.

That doesn't tell us the package is malicious. It tells us the package is asking to run something we haven't approved.

### Step 3
Inspect the package and its build step before approving it.

Then commit the decision and rerun the install. Clicking approve isn't the review. It's the result of the review.

These controls also don't sandbox the package when our application runs it later.

### Step 4
The release-age rule holds back versions that are less than a day old in this example.

That gives us a delay before adopting a brand-new release. It can reduce exposure to some quickly discovered problems, but age doesn't prove a package is safe.

Urgent fixes still need a deliberate exception process.

### Step 5
For publishing, the recorded workflow uses trusted publishing and a short-lived identity rather than a stored, long-lived registry token.

It also shows a staged release for inspection before promotion. In npm, staging and approval are separate actions. `npm stage publish` stages the package. `npm stage approve` publishes it after the required human authentication.

We're reviewing the recorded process here, not sending a new package to the registry.

### Step 6
Finally, look at provenance.

It can help show where a package came from and how it was built. It doesn't prove the code is correct or harmless.

Lockfiles, script controls, release delays, trusted publishing, and provenance do different jobs. None of them removes the need to understand what we're adding.

## Slide 47
**Vite 8 locally**  
Slide ID: `f4-single`

> **Reference, not spoken:** Vite 8's Rolldown change is verified. The local benchmark, bundle sizes, plugin results, and line counts elsewhere in this talk were not independently rerun or recounted in this review. [Vite 8 release](https://vite.dev/blog/announcing-vite8.html)

### Step 1
Here's a local build-tool comparison using the same project.

The useful question is what changes for this codebase, not which tool has the biggest number on its website.

### Step 2
Look at the recorded cold and warm runs.

The newer setup is faster in this fixture. That's a result for this project and machine, not a promise that every build will improve by the same amount.

### Step 3
Now compare the output.

The bundle size is about the same in this example. Faster build tooling doesn't automatically mean less JavaScript for the user.

Those are separate measurements.

### Step 4
The three plugins in this fixture complete without warnings.

That's useful, but it isn't a compatibility test for every plugin. A practical upgrade still checks the project's plugins, tests, output, and deployment.

The win is less waiting without changing what the application is meant to do.

## Slide 48
**What changed in 2026**  
Slide ID: `what-changed`

> **Reference, not spoken:** [Baseline definitions](https://web.dev/baseline); [Interop 2026](https://web.dev/blog/interop-2026)

### Step 1
Across these examples, a few things keep coming up.

Browsers can handle more of the behavior we've been rebuilding ourselves. That can mean less code to maintain, provided we understand the support and the fallback.

Baseline makes support easier to check. Interop gives browser teams a shared set of problems to work on. Neither replaces testing the experience we're shipping.

Frameworks are giving us more direct ways to separate shared work from request-specific work. Build tools can shorten the wait while we develop. Package managers give us more controls over what we install and run.

And every dependency still comes with upkeep.

The answer isn't "never use a library." It's "know why you're using it, and notice when the browser can do that job well."

## Slide 49
**People to follow**  
Slide ID: `people-to-follow`

### Step 1
None of this progress happened on its own.

These are some of the people I keep learning from: Chris Coyier, Dave Rupert, Tab Atkins, Lea Verou, Aaron Gustafson, Val Head, Jen Simmons, Miriam Suzanne, Tim Berners-Lee, Rachel Andrew, Eric Meyer, and Jeremy Keith.

They contribute in different ways, from standards and browser work to teaching, writing, and showing what the web can do.

You don't have to follow every proposal or read every specification. But staying close to people who explain the work makes it much easier to keep learning.

*Pause so the audience can read or photograph the names.*

## Slide 50
**Thank you**  
Slide ID: `closing`

### Step 1
I'll leave you with one ask: go build something.

Try one of these features on a real problem. Look at the code. Test it. Publish what you learn.

Use AI when it helps. But don't let it replace your judgment or your curiosity. You're still responsible for understanding what you ship.

I don't want to experience everything the web has to offer through a chat window. I still enjoy finding a site and seeing how someone else thinks. The design, the writing, the strange little interaction they didn't have to add but did anyway.

That's part of what makes the web worth keeping open.

Go make something worth visiting.

*Leave the closing slide visible during questions.*

import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/02-container-card/today";

/** D2: viewport media queries, variant props and a resize observer, then a size container, container query units, @scope and :has(). */
export const section: DemoSection = {
  id: "d2-product-card",
  background: "d2",
  order: 2,
  label: "Product card",
  feature: "Container queries",
  scenario: "One product card sits in a featured slot, a search grid and a narrow rail.",
  support: { kind: "web-features", id: "container-queries", alsoUses: ["scope"] },
  pages: [
    {
      id: "d2-intro",
      stage: "intro",
      intro:
        "Here’s a product card we want to reuse in a wide section, a search result, and a narrow sidebar.\n\nThe browser window might be the same size in all three cases. The space around the card isn’t.\n\nContainer queries let the card respond to that space. We’ll also use `@scope` and `:has()` to keep the styles easier to manage.",
      description:
        "Container queries let a component change its layout based on the space it is given.",
      visual: {
        src: "/intro/d2-product-card.png",
        alt: "The same product card at three widths: featured, search results and recommended.",
        capture: { pageId: "d2-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d2-used-to",
      stage: "used-to",
      eyebrow: "Container queries",
      title: "What we used to do",
      intro: "We’ve got the same card in a few different slots.\n\nEach slot needs a slightly different layout, so the parent starts telling the card how to look.",
      frame: {
        build: "today",
        route: "/demos/02-container-card/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "setViewportWidth"],
        poster: "/posters/d2-today.png",
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [
          [14, 19],
          [32, 37],
          [49, 52],
        ]),
        excerpt(`${TODAY}/styles.css`, "css", [
          [19, 21],
          [122, 155],
        ]),
        excerpt(`${TODAY}/card.js`, "js", [[17, 35]]),
        excerpt(`${TODAY}/resize-classes.js`, "js", [[1, 35]]),
      ],
      steps: [
        {
          id: "s0",
          label: "Three slots",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Fill the slots",
          actions: [{ type: "pointer", to: "#t-rail .c-product-card" }],
          code: {
            file: "index.html",
            lines: [
              [3, 6],
              [10, 13],
              [16, 19],
            ],
          },
          spotlight: [
            "#t-merch .c-product-card",
            "#t-grid .c-product-card",
            "#t-rail .c-product-card",
          ],
          bullets: [
            "Now we have variants: compact, wide, sidebar, and whatever comes next.",
            "The card isn’t just receiving product data. It’s receiving instructions about the page around it.",
          ],
        },
        {
          id: "s2",
          label: "Style the variants",
          actions: [{ type: "pointer", to: "#t-merch .c-product-card" }],
          code: {
            file: "styles.css",
            lines: [
              [21, 25],
              [34, 36],
            ],
          },
          spotlight: ["#t-merch .c-product-card"],
          bullets: [
            "Those variants turn into more CSS and more breakpoints.",
            "A viewport query tells us how wide the browser is. It doesn’t tell us how much of that width the card actually gets.",
          ],
        },
        {
          id: "s3",
          label: "Narrow the page",
          key: true,
          actions: [
            { type: "hook", name: "setViewportWidth", args: [560] },
            { type: "wait", ms: 600 },
            {
              type: "assert",
              target: "#t-merch .c-product-card",
              expect: "attr:data-layout=stacked",
            },
          ],
          code: { file: "resize-classes.js", lines: [[13, 24]] },
          spotlight: ["#t-merch .c-product-card", "#t-grid .c-product-card"],
          meter: {
            label: "JavaScript",
            value: "126 lines",
            source: "non-blank, non-comment lines in /demos/02-container-card/today/*.js",
          },
          bullets: [
            "Shrink the page and watch the mismatch.",
            "We can patch it with `ResizeObserver`, measure the card, and switch classes ourselves. The demo counts 126 lines of layout JavaScript in this version.",
            "It works, but we’re writing code to tell CSS how much room it has.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d2-now",
      stage: "now",
      eyebrow: "Container queries",
      title: "What we can do today",
      intro:
        "The wrapper is now a named container with `container-type: inline-size`.\n\nThat gives the card a useful question to ask: how much horizontal space do I have?",
      frame: {
        build: "native",
        route: "/demos/02-container-card/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-js": true },
        hooks: ["reset", "setViewportWidth", "setStock"],
        poster: "/posters/d2-now.png",
      },
      files: [
        sectionCode("d2-product-card", "index.html", "html"),
        sectionCode("d2-product-card", "card.css", "css"),
        sectionCode("d2-product-card", "app.js", "js"),
      ],
      steps: [
        {
          id: "s0",
          label: "Same card",
          actions: [{ type: "resize", target: ".product-slot", inlineSize: "22rem" }],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Narrow the slot",
          actions: [
            { type: "resize", target: ".product-slot", inlineSize: "15rem" },
            { type: "assert", target: ".product-card", expect: "columns=1" },
          ],
          code: {
            file: "index.html",
            lines: [
              [3, 4],
              [18, 19],
            ],
          },
          spotlight: [".product-card"],
          bullets: [
            "Make the slot narrow.",
            "The card stacks its content because its container is narrow. We don’t need the parent to pass a compact-layout flag.",
          ],
        },
        {
          id: "s2",
          label: "Widen the slot",
          key: true,
          actions: [
            { type: "resize", target: ".product-slot", inlineSize: "32rem" },
            { type: "assert", target: ".product-card", expect: "columns=3" },
          ],
          code: { file: "card.css", lines: [4, [21, 23]] },
          spotlight: [".product-card"],
          bullets: [
            "Now give it more room.",
            "Once the container reaches the breakpoint, the card switches to three columns. The same component handles both layouts.",
            "Container units also let us size parts of the card relative to the space around it.",
          ],
        },
        {
          id: "s3",
          label: "Scope the styles",
          actions: [
            { type: "resize", target: ".product-slot", inlineSize: "22rem" },
            { type: "assert", target: ".product-card", expect: "columns=1" },
          ],
          code: {
            file: "card.css",
            lines: [
              [6, 9],
              [12, 17],
            ],
          },
          spotlight: [".product-card", ".product-card .name"],
          bullets: [
            "Here’s `@scope`.",
            "It limits where these rules apply, so we can write simpler selectors for the card.",
            "It doesn’t create a sealed box. Outside styles can still affect elements inside it. Think of it as a way to target rules, not complete style isolation.",
          ],
        },
        {
          id: "s4",
          label: "Remove the stock line",
          actions: [
            { type: "hook", name: "setStock", args: [false] },
            { type: "wait", ms: 300 },
          ],
          code: { file: "card.css", lines: [[10, 11]] },
          spotlight: [".product-card"],
          bullets: [
            "Remove the stock message.",
            "The `:has()` rule responds to what’s in the card. We don’t need JavaScript to add another class just to say the stock element exists.",
          ],
        },
        {
          id: "s5",
          label: "Narrow the page",
          actions: [
            { type: "resize", target: ".product-slot", inlineSize: "28rem" },
            { type: "hook", name: "setViewportWidth", args: [560] },
            { type: "wait", ms: 700 },
            { type: "assert", target: ".product-card", expect: "columns=3" },
          ],
          code: { file: "app.js", lines: [[1, 5]] },
          spotlight: [".product-card"],
          // The one state the room cannot see: where the container ends (design review M5).
          callouts: [{ target: ".product-slot", text: "Container edge", side: "bottom" }],
          proof:
            "Switch page width while keeping the card container fixed to prove the query belongs to the component.",
          meter: {
            label: "JavaScript",
            value: "0 lines",
            source: "non-blank, non-comment lines in content/sections/d2-product-card/files/*.js",
          },
          bullets: [
            "Now change the page width again.",
            "The card follows its own container, not a guess based on the whole window. We’ve removed the layout JavaScript from this version.",
            "The form is still a form. Layout changes don’t have to change how the user buys the product.",
          ],
        },
      ],
      timing: { minutes: 1.75 },
    },
  ],
  citations: [
    {
      text: "Container size queries Widely 14 Aug 2025; @scope Newly 24 Mar 2026 (web-features 3.44.0)",
      url: "https://unpkg.com/web-features/data.json",
    },
    {
      text: ":has() Baseline Widely 19 Jun 2026 (date from the merge brief; confirm at freeze)",
      url: "https://webstatus.dev/features/has",
    },
    {
      text: 'Coyier, Scope in CSS (CSS Day 2025 write-up): "CSS is naturally scoped. That might be all you need."',
      url: "https://blog.master.dev/scope-in-css/",
    },
    {
      text: "Suzanne and Coyier, Winging It 28, 22 Jan 2026: @scope available across all major browsers",
      url: "https://www.oddbird.net/2026/01/22/winging-it-28/",
    },
    {
      text: "Suzanne, web.dev Container Queries and Units in Action, 18 Feb 2026",
      url: "https://www.oddbird.net/2026/02/18/queries-units-actions/",
    },
    {
      text: "Shadeed, Smart Layouts (CSS Day 2025): layout zones with :has() and container queries",
      url: "https://ishadeed.com/article/smart-layouts-talk-css-day",
    },
    {
      text: "MDN: Container queries",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries",
    },
    {
      text: "MDN: @scope",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope",
    },
    {
      text: "MDN compatibility: container-type",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/container-type.json",
    },
    {
      text: "MDN compatibility: container units",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/types/length.json",
    },
    {
      text: "MDN compatibility: @scope",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/scope.json",
    },
    {
      text: "MDN compatibility: :has()",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/selectors/has.json",
    },
  ],
  cautions: [
    "Size containment needs an outside width. A container with no set size can collapse to zero.",
    "Keep source order the same as reading order. CSS placement must not scramble keyboard focus.",
    "Treat @scope as an enhancement if you support browsers older than March 2026.",
  ],
};

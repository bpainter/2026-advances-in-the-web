import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

const TODAY = "demos/02-container-card/today";

/** D2: viewport media queries, variant props and a resize observer, then a size container, container query units, @scope and :has(). */
export const section: DemoSection = {
  id: "d2-product-card",
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
        "Our second demo is a product card. The same card sits in a featured slot, a search grid and a narrow rail. Each place needs a different layout.",
      description:
        "Container queries let a component change its layout based on the space it is given.",
      visual: {
        src: "/intro/d2-product-card.png",
        alt: "The product card laid out horizontally in a wide slot.",
        capture: { pageId: "d2-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d2-used-to",
      stage: "used-to",
      eyebrow: "Container queries",
      title: "How we used to do it",
      intro: "One card sits in three places. Each place tells it how to look.",
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
          [121, 153],
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
          bullets: ["Script fills three empty slots with the same card and a different prop."],
        },
        {
          id: "s2",
          label: "Style the variants",
          actions: [{ type: "pointer", to: "#t-merch .c-product-card" }],
          code: {
            file: "styles.css",
            lines: [
              [23, 27],
              [34, 36],
            ],
          },
          spotlight: ["#t-merch .c-product-card"],
          bullets: ["The wide layout uses a viewport query. CSS cannot ask about the slot."],
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
            "The page narrowed, and the featured card stacked in a slot that kept its width.",
            "Props, classes and a resize observer take 126 lines of script.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d2-now",
      stage: "now",
      eyebrow: "Container queries",
      title: "How we do it now",
      intro:
        "This is the same card with no layout script. Its slot is a container the card can measure. Watch the card as the slot changes width.",
      frame: {
        build: "native",
        route: "/demos/02-container-card/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-js": true },
        hooks: ["reset", "setViewportWidth", "setStock"],
        poster: "/posters/d2-now.png",
      },
      files: [
        { file: "index.html", lang: "html", source: sectionFile("d2-product-card", "index.html") },
        { file: "card.css", lang: "css", source: sectionFile("d2-product-card", "card.css") },
        { file: "app.js", lang: "js", source: sectionFile("d2-product-card", "app.js") },
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
          spotlight: [".product-slot", ".product-card"],
          bullets: [
            "The slot shrinks to rail width, and the card stays stacked.",
            "The slot is the part the page controls. The card markup never changes.",
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
          spotlight: [".product-slot", ".product-card"],
          bullets: [
            "The slot widens, and the card turns horizontal.",
            "The container line makes the slot something the card can measure.",
            "A container query asks how wide the slot is, not how wide the page is.",
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
            "Back to grid width. The product name shrinks with the card.",
            "The @scope rule limits these short selectors to the card. Page styles cannot reach them.",
            "The cqi unit sizes the name by the card's width.",
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
            "The low-stock line goes away, and the warning border goes with it.",
            "The has selector checks whether the card holds a stock line. No state class is needed.",
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
          proof:
            "Switch page width while keeping the card container fixed to prove the query belongs to the component.",
          meter: {
            label: "JavaScript",
            value: "0 lines",
            source: "non-blank, non-comment lines in content/sections/d2-product-card/files/*.js",
          },
          bullets: [
            "The page gets narrower, but the slot keeps its width. The card stays horizontal.",
            "No script measures anything. The JavaScript file holds only a comment.",
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
  ],
  cautions: [
    "Size containment needs an outside width. A container with no set size can collapse to zero.",
    "Keep source order the same as reading order. CSS placement must not scramble keyboard focus.",
    "Treat @scope as an enhancement if you support browsers older than March 2026.",
  ],
};

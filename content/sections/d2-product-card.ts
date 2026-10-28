import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./d2-product-card/files/. */
export const section: DemoSection = {
  id: "d2-product-card",
  order: 2,
  label: "Product card",
  feature: "Container queries",
  scenario:
    "TODO rewrite: The same product card appears in a search grid, a narrow recommendation rail, and a wide merchandising slot without viewport-specific component props.",
  support: {
    kind: "web-features",
    id: "container-queries",
    alsoUses: ["scope"],
  },
  pages: [
    {
      id: "d2-intro",
      stage: "intro",
      intro: "TODO rewrite",
      description: "TODO description",
      visual: {
        src: "/intro/d2-product-card.png",
        alt: "TODO alt",
        capture: {
          pageId: "d2-now",
          stepId: "s1",
        },
      },
      steps: [
        {
          id: "s0",
          label: "Title and support",
          actions: [],
          bullets: [],
        },
      ],
      timing: {
        minutes: 0.25,
      },
    },
    {
      id: "d2-used-to",
      stage: "used-to",
      eyebrow: "Container queries",
      title: "How we used to do it",
      intro:
        "TODO rewrite: Next, one component in many layout contexts. Here is what teams commonly maintain.",
      frame: {
        build: "today",
        route: "/demos/02-container-card/today",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset", "setViewportWidth"],
        poster: "/posters/d2-today.png",
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "Three slots, three variants",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: One card, three places on the page: a search grid, a recommendation rail, and a merchandising slot.",
            "TODO rewrite: Today each placement tells the card how to look.",
          ],
        },
        {
          id: "s1",
          label: "Props carry layout",
          actions: [
            {
              type: "pointer",
              to: "#t-rail .c-product-card",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Compact, horizontal, and promotional props duplicate layout knowledge in templates and JavaScript.",
            "TODO rewrite: Every new slot means a new prop or a new class.",
          ],
        },
        {
          id: "s2",
          label: "Measuring in script",
          actions: [
            {
              type: "pointer",
              to: "#t-grid .c-product-card",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: In the grid, ResizeObserver code measures the card and sets classes.",
            "TODO rewrite: Long selectors and naming conventions protect the component's styles from the rest of the page.",
          ],
        },
        {
          id: "s3",
          label: "The viewport moves",
          actions: [
            {
              type: "hook",
              name: "setViewportWidth",
              args: [880],
            },
            {
              type: "wait",
              ms: 600,
            },
            {
              type: "assert",
              target: "#t-merch .c-product-card",
              expect: "attr:data-layout=stacked",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: The merchandising slot kept its width.",
            "TODO rewrite: The viewport narrowed, and the card stacked anyway.",
            "TODO rewrite: Viewport media queries work on the page where the component was first built.",
            "TODO rewrite: The meter counts the script this layout needs.",
          ],
          meter: {
            label: "JavaScript",
            value: "125 lines",
            source: "non-blank, non-comment lines in /demos/02-container-card/today/*.js",
          },
        },
      ],
      timing: {
        minutes: 0.5,
      },
    },
    {
      id: "d2-now",
      stage: "now",
      eyebrow: "Container queries",
      title: "How we do it now",
      intro:
        "TODO rewrite: Same card. What the browser can own now: a size container, container query units, @scope, and :has().",
      frame: {
        build: "native",
        route: "/demos/02-container-card/native",
        viewport: {
          width: 640,
          height: 628,
        },
        flags: {
          "enhance-js": true,
        },
        hooks: ["reset", "setStock", "setViewportWidth", "setProductName", "setTextScale"],
        poster: "/posters/d2-code.png",
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d2-product-card", "index.html"),
        },
        {
          file: "card.css",
          lang: "css",
          source: sectionFile("d2-product-card", "card.css"),
        },
        {
          file: "app.js",
          lang: "js",
          source: sectionFile("d2-product-card", "app.js"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Grid width",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "24rem",
            },
          ],
          code: {
            file: "index.html",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Plain HTML, one stylesheet, and a JavaScript file with nothing in it.",
          ],
        },
        {
          id: "s1",
          label: "A slot and a card",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "15rem",
            },
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
            "TODO rewrite: The slot is the parent the page controls.",
            "TODO rewrite: The card inside it is the same article everywhere.",
          ],
        },
        {
          id: "s2",
          label: "Container and query",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "44rem",
            },
          ],
          code: {
            file: "card.css",
            lines: [
              [3, 5],
              [21, 27],
            ],
          },
          spotlight: [".product-slot", ".product-card"],
          bullets: [
            "TODO rewrite: container: product / inline-size makes the slot a size container.",
            "TODO rewrite: The @container rule switches to three columns when the card has 34rem to work with, and only then.",
          ],
        },
        {
          id: "s3",
          label: "@scope and container units",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "15rem",
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "24rem",
            },
          ],
          code: {
            file: "card.css",
            lines: [
              [6, 9],
              [12, 20],
            ],
          },
          spotlight: [".product-card", ".product-card .name"],
          bullets: [
            "TODO rewrite: @scope limits these selectors to the card subtree and keeps their weight low, so plain img and .name are safe here.",
            "TODO rewrite: Chris Coyier's line from his CSS Day talk fits:",
            'TODO rewrite: "CSS is naturally scoped.',
            'TODO rewrite: That might be all you need." The cqi unit sizes the name against the card.',
          ],
        },
        {
          id: "s4",
          label: ":has(.stock)",
          actions: [
            {
              type: "hook",
              name: "setStock",
              args: [false],
            },
            {
              type: "wait",
              ms: 600,
            },
            {
              type: "hook",
              name: "setStock",
              args: [true],
            },
          ],
          code: {
            file: "card.css",
            lines: [[10, 11]],
          },
          spotlight: [".product-card", ".product-card .stock"],
          bullets: [
            "TODO rewrite: The border reacts to meaningful content, the low-stock message, without a template-only state class.",
            "TODO rewrite: The server decides whether that message exists.",
          ],
        },
        {
          id: "s5",
          label: "JavaScript off",
          actions: [
            {
              type: "toggle",
              flag: "enhance-js",
              on: false,
            },
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "44rem",
            },
          ],
          code: {
            file: "app.js",
            lines: [[1, 5]],
          },
          spotlight: [".product-card form"],
          bullets: [
            "TODO rewrite: None for layout.",
            "TODO rewrite: The application still owns inventory state and the add-to-order action.",
            "TODO rewrite: With JavaScript disabled the card looks and responds the same.",
          ],
          proof: "Inspect the card with JavaScript disabled.",
        },
        {
          id: "s6",
          label: "Production cautions",
          actions: [],
          code: {
            file: "card.css",
            lines: [[3, 5], 6],
          },
          spotlight: [".product-slot"],
          bullets: [
            "TODO rewrite: Choose containment deliberately: size containment can collapse a container that has no external size.",
            "TODO rewrite: Keep source order aligned with reading and focus order, so CSS placement never turns keyboard navigation into a puzzle.",
            "TODO rewrite: Treat @scope as an enhancement if your browser policy reaches further back than Baseline 2026.",
          ],
        },
        {
          id: "s7",
          label: "TODO cut: Merchandising slot",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "44rem",
            },
            {
              type: "assert",
              target: ".product-card",
              expect: "columns=3",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: ".product-card",
              text: "Container query",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: Widen it to the merchandising slot and it turns horizontal at 34rem of its own width.",
            "TODO rewrite: No props, no ResizeObserver.",
          ],
          proof:
            "Drag the same component between three parent widths without changing its markup or props.",
        },
        {
          id: "s8",
          label: "TODO cut: Page changes, card does not",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "20rem",
            },
            {
              type: "hook",
              name: "setViewportWidth",
              args: [1280],
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "hook",
              name: "setViewportWidth",
              args: [720],
            },
            {
              type: "wait",
              ms: 600,
            },
            {
              type: "assert",
              target: ".product-card",
              expect: "columns=1",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: ".page",
              text: "Page narrowed",
              side: "bottom",
            },
            {
              target: ".product-card",
              text: "Card unchanged",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: Now fix the slot at 20rem and change the page width.",
            "TODO rewrite: The card does not move, which proves the query belongs to the component.",
          ],
          proof:
            "Switch page width while keeping the card container fixed to prove the query belongs to the component.",
        },
        {
          id: "s9",
          label: "TODO cut: Long name, larger text",
          actions: [
            {
              type: "hook",
              name: "setViewportWidth",
              args: [1280],
            },
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "640px",
            },
            {
              type: "hook",
              name: "setProductName",
              args: ["Ridgeline Trail GTX Waterproof Wide Fit Running Shoe"],
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "assert",
              target: ".product-card",
              expect: "columns=3",
            },
            {
              type: "hook",
              name: "setTextScale",
              args: [1.5],
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "assert",
              target: ".product-card",
              expect: "columns=1",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: ".product-card .name",
              text: "Wraps cleanly",
              side: "right",
            },
            {
              target: ".product-card",
              text: "Stacks at 150%",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: A long product name wraps, and the document order stays the reading order.",
            "TODO rewrite: At 150 percent text the same 640-pixel slot picks the stacked layout, because the query is written in rem.",
          ],
          proof:
            "Increase text size and use a long product name to show that the document order and layout remain sound.",
        },
      ],
      timing: {
        minutes: 1.75,
      },
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
    "TODO rewrite: Choose containment deliberately. Size containment can affect intrinsic sizing and can collapse a container that has no external size.",
    "TODO rewrite: Keep source order aligned with reading and focus order. CSS placement must not turn keyboard navigation into a puzzle.",
    "TODO rewrite: Treat @scope as an enhancement if the supported browser policy reaches further back than Baseline 2026.",
  ],
};

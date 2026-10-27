import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./d2-product-card/files/. */
export const section: DemoSection = {
  id: "d2-product-card",
  order: 2,
  label: "Product card",
  scenario:
    "The same product card appears in a search grid, a narrow recommendation rail, and a wide merchandising slot without viewport-specific component props.",
  support: {
    tier: "baseline-widely",
    summary: "Widely + Newly (Mar 2026)",
    detail:
      "Container size queries are Baseline Widely available (14 Aug 2025). @scope is Baseline 2026 (Newly, 24 Mar 2026: Chrome 143, Firefox 146, Safari 26.4). :has() is Widely available. The base card remains usable when a newer selector is unavailable.",
  },
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
    "Choose containment deliberately. Size containment can affect intrinsic sizing and can collapse a container that has no external size.",
    "Keep source order aligned with reading and focus order. CSS placement must not turn keyboard navigation into a puzzle.",
    "Treat @scope as an enhancement if the supported browser policy reaches further back than Baseline 2026.",
  ],
  pages: [
    {
      id: "d2-today",
      stage: "today",
      title: "Product card: today",
      frame: {
        build: "today",
        route: "/demos/02-container-card/today",
        viewport: {
          width: 1280,
          height: 720,
        },
        hooks: ["reset", "setViewportWidth"],
        poster: "/posters/d2-today.png",
      },
      steps: [
        {
          id: "s0",
          label: "Three slots, three variants",
          actions: [],
          notes:
            "One card, three places on the page: a search grid, a recommendation rail, and a merchandising slot. Today each placement tells the card how to look.",
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
          callouts: [
            {
              target: "#t-rail .c-product-card",
              text: "Compact prop",
              side: "right",
            },
            {
              target: "#t-merch .c-product-card",
              text: "Promo prop",
              side: "top",
            },
          ],
          notes:
            "Compact, horizontal, and promotional props duplicate layout knowledge in templates and JavaScript. Every new slot means a new prop or a new class.",
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
          callouts: [
            {
              target: "#t-grid .c-product-card",
              text: "ResizeObserver",
              side: "bottom",
            },
            {
              target: "#t-grid .c-product-card__title",
              text: "BEM selectors",
              side: "right",
            },
          ],
          notes:
            "In the grid, ResizeObserver code measures the card and sets classes. Long selectors and naming conventions protect the component's styles from the rest of the page.",
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
          callouts: [
            {
              target: "#t-merch .c-product-card",
              text: "Viewport query",
              side: "top",
            },
          ],
          meter: {
            label: "JavaScript",
            value: "computed at build",
            source: "non-blank, non-comment lines in /demos/02-container-card/today/*.js",
          },
          notes:
            "The merchandising slot kept its width. The viewport narrowed, and the card stacked anyway. Viewport media queries work on the page where the component was first built. The meter counts the script this layout needs.",
        },
      ],
      notes: {
        open: "Next, one component in many layout contexts. Here is what teams commonly maintain.",
        bridge: "Now the card answers to its container instead.",
      },
      timing: {
        minutes: 0.75,
        cumulative: 9.25,
      },
    },
    {
      id: "d2-now",
      stage: "now",
      title: "Product card: now",
      frame: {
        build: "native",
        route: "/demos/02-container-card/native",
        viewport: {
          width: 1280,
          height: 720,
        },
        hooks: ["reset", "setViewportWidth", "setProductName", "setTextScale", "setStock"],
        poster: "/posters/d2-now.png",
      },
      steps: [
        {
          id: "s0",
          label: "Search grid width",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "24rem",
            },
          ],
          notes:
            "One card in one slot, at search-grid width. The markup never changes from here on.",
        },
        {
          id: "s1",
          label: "Recommendation rail",
          actions: [
            {
              type: "resize",
              target: ".product-slot",
              inlineSize: "15rem",
            },
            {
              type: "assert",
              target: ".product-card",
              expect: "columns=1",
            },
          ],
          callouts: [
            {
              target: ".product-slot",
              text: "Same markup",
              side: "left",
            },
            {
              target: ".product-card .name",
              text: "Container units",
              side: "right",
            },
          ],
          notes:
            "Narrow it to a recommendation rail. A size container lets the card respond to the space its parent gives it, and container query units scale the name against the component's own width.",
        },
        {
          id: "s2",
          label: "Merchandising slot",
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
          callouts: [
            {
              target: ".product-card",
              text: "Container query",
              side: "top",
            },
          ],
          notes:
            "Widen it to the merchandising slot and it turns horizontal at 34rem of its own width. No props, no ResizeObserver.",
          proof:
            "Drag the same component between three parent widths without changing its markup or props.",
        },
        {
          id: "s3",
          label: "Page changes, card does not",
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
          callouts: [
            {
              target: ".page",
              text: "Page narrowed",
              side: "top",
            },
            {
              target: ".product-card",
              text: "Card unchanged",
              side: "right",
            },
          ],
          notes:
            "Now fix the slot at 20rem and change the page width. The card does not move, which proves the query belongs to the component.",
          proof:
            "Switch page width while keeping the card container fixed to prove the query belongs to the component.",
        },
        {
          id: "s4",
          label: "Long name, larger text",
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
          callouts: [
            {
              target: ".product-card .name",
              text: "Wraps cleanly",
              side: "right",
            },
            {
              target: ".product-card",
              text: "Stacks at 150%",
              side: "top",
            },
          ],
          notes:
            "A long product name wraps, and the document order stays the reading order. At 150 percent text the same 640-pixel slot picks the stacked layout, because the query is written in rem.",
          proof:
            "Increase text size and use a long product name to show that the document order and layout remain sound.",
        },
        {
          id: "s5",
          label: "Content drives state",
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
          callouts: [
            {
              target: ".product-card .stock",
              text: "No state class",
              side: "bottom",
            },
          ],
          notes:
            ":has(.stock) reacts to the low-stock message itself, without a template-only state class. Remove the message and the warning border goes with it.",
        },
      ],
      notes: {
        open: "Same card. What the browser can own now: a size container, container query units, @scope, and :has().",
        bridge: "Here is the CSS, and the JavaScript file that has nothing to do.",
      },
      timing: {
        minutes: 1,
        cumulative: 10.25,
      },
    },
    {
      id: "d2-code",
      stage: "code",
      title: "Product card: code",
      frame: {
        build: "native",
        route: "/demos/02-container-card/native",
        viewport: {
          width: 896,
          height: 720,
        },
        flags: {
          js: true,
        },
        hooks: ["reset", "setStock"],
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
          notes: "Plain HTML, one stylesheet, and a JavaScript file with nothing in it.",
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
          notes:
            "The slot is the parent the page controls. The card inside it is the same article everywhere.",
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
          notes:
            "container: product / inline-size makes the slot a size container. The @container rule switches to three columns when the card has 34rem to work with, and only then.",
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
          notes:
            '@scope limits these selectors to the card subtree and keeps their weight low, so plain img and .name are safe here. Chris Coyier\'s line from his CSS Day talk fits: "CSS is naturally scoped. That might be all you need." The cqi unit sizes the name against the card.',
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
          notes:
            "The border reacts to meaningful content, the low-stock message, without a template-only state class. The server decides whether that message exists.",
        },
        {
          id: "s5",
          label: "JavaScript off",
          actions: [
            {
              type: "toggle",
              flag: "js",
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
          notes:
            "None for layout. The application still owns inventory state and the add-to-order action. With JavaScript disabled the card looks and responds the same.",
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
          notes:
            "Choose containment deliberately: size containment can collapse a container that has no external size. Keep source order aligned with reading and focus order, so CSS placement never turns keyboard navigation into a puzzle. Treat @scope as an enhancement if your browser policy reaches further back than Baseline 2026.",
        },
      ],
      notes: {
        open: "The HTML is unremarkable on purpose. The CSS does the work.",
        bridge: "Next, a form that has been carrying sizing scripts for years.",
      },
      timing: {
        minutes: 1.25,
        cumulative: 11.5,
      },
    },
  ],
};

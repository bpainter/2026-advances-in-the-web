import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./d4-dashboard-navigation/files/. */
export const section: DemoSection = {
  id: "d4-dashboard-navigation",
  order: 4,
  label: "Dashboard navigation",
  feature: "Navigation API",
  scenario:
    "TODO rewrite: A user moves among an order list, filters, and order details. Links, forms, Back, Forward, focus, and scroll all pass through one navigation path.",
  support: {
    kind: "web-features",
    id: "navigation",
  },
  pages: [
    {
      id: "d4-intro",
      stage: "intro",
      intro: "TODO rewrite",
      description: "TODO description",
      visual: {
        src: "/intro/d4-dashboard-navigation.png",
        alt: "TODO alt",
        capture: {
          pageId: "d4-now",
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
      id: "d4-used-to",
      stage: "used-to",
      eyebrow: "Navigation API",
      title: "How we used to do it",
      intro:
        "TODO rewrite: Links, forms, history, focus, and scroll. Here is what teams commonly maintain.",
      frame: {
        build: "today",
        route: "/demos/04-navigation-api/today",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset", "scrollTo"],
        poster: "/posters/d4-today.png",
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "The hand-rolled router",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: An order list, a filter, and order details, with a small client-side router written by hand.",
          ],
        },
        {
          id: "s1",
          label: "Follow a link",
          actions: [
            {
              type: "pointer",
              to: 'nav a[href="/orders/418"]',
            },
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 400,
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: A document-level click handler finds links and decides whether to prevent navigation.",
            "TODO rewrite: Then it calls history.pushState() and renders.",
          ],
        },
        {
          id: "s2",
          label: "Back",
          actions: [
            {
              type: "navigate",
              history: "back",
            },
            {
              type: "wait",
              ms: 400,
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Back goes through a separate popstate listener.",
            "TODO rewrite: Focus restoration and scroll restoration are custom code.",
          ],
        },
        {
          id: "s3",
          label: "Slow network, two clicks",
          actions: [
            {
              type: "network",
              profile: "slow",
            },
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "click",
              target: 'nav a[href="/orders/419"]',
            },
            {
              type: "wait",
              ms: 2000,
            },
            {
              type: "network",
              profile: "fast",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Cancellation and loading state are custom too.",
            "TODO rewrite: Many teams add a router library even when the application only needs a small client-side enhancement.",
            "TODO rewrite: The meter counts this one.",
          ],
          meter: {
            label: "JavaScript",
            value: "134 lines",
            source: "non-blank, non-comment lines in /demos/04-navigation-api/today/*.js",
          },
        },
      ],
      timing: {
        minutes: 0.5,
      },
    },
    {
      id: "d4-now",
      stage: "now",
      eyebrow: "Navigation API",
      title: "How we do it now",
      intro:
        "TODO rewrite: What the browser can own now: one navigate event for links, forms, Back, Forward, and programmatic navigation.",
      frame: {
        build: "native",
        route: "/orders",
        viewport: {
          width: 640,
          height: 628,
        },
        flags: {
          "enhance-js": true,
        },
        hooks: ["reset", "scrollTo"],
        poster: "/posters/d4-code.png",
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d4-dashboard-navigation", "index.html"),
        },
        {
          file: "app.js",
          lang: "js",
          source: sectionFile("d4-dashboard-navigation", "app.js"),
        },
        {
          file: "app.css",
          lang: "css",
          source: sectionFile("d4-dashboard-navigation", "app.css"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Plain documents first",
          actions: [],
          code: {
            file: "index.html",
            lines: [],
          },
          bullets: [
            "TODO rewrite: The HTML is a normal server-rendered page.",
            "TODO rewrite: The JavaScript is one listener and one fetch.",
          ],
        },
        {
          id: "s1",
          label: "Links, a form, a target",
          actions: [
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 500,
            },
          ],
          code: {
            file: "index.html",
            lines: [[5, 17], 19],
          },
          spotlight: ["nav", ".toolbar form", "#content"],
          bullets: [
            "TODO rewrite: Real links, a real GET form, and a main element that can take focus.",
            "TODO rewrite: Without the script, each of these is a full page load to an address the server renders.",
          ],
        },
        {
          id: "s2",
          label: "Feature detect, one listener",
          actions: [
            {
              type: "key",
              key: "ArrowDown",
              target: "#status",
              via: "selectedIndex = 1 on the select, then input and change events",
            },
            {
              type: "click",
              target: ".toolbar form button",
            },
            {
              type: "wait",
              ms: 500,
            },
          ],
          code: {
            file: "app.js",
            lines: [
              [4, 6],
              [26, 27],
            ],
          },
          spotlight: ["#s-url", ".toolbar form"],
          bullets: [
            "TODO rewrite: Feature detection preserves ordinary document navigation as the fallback.",
            "TODO rewrite: Inside, one navigate event covers links, forms, Back, Forward, and programmatic navigation.",
          ],
        },
        {
          id: "s3",
          label: "What we leave alone",
          actions: [
            {
              type: "navigate",
              history: "back",
            },
            {
              type: "wait",
              ms: 500,
            },
          ],
          code: {
            file: "app.js",
            lines: [[7, 16]],
          },
          spotlight: ["#s-url"],
          bullets: [
            "TODO rewrite: Leave anything we cannot or should not intercept to the browser: hash changes, downloads, and other origins.",
            "TODO rewrite: Back is just another navigation that passes this check.",
          ],
        },
        {
          id: "s4",
          label: "Intercept and render",
          actions: [
            {
              type: "click",
              target: 'nav a[href="/orders/419"]',
            },
            {
              type: "wait",
              ms: 500,
            },
          ],
          code: {
            file: "app.js",
            lines: [
              [17, 22],
              [29, 39],
            ],
          },
          spotlight: ["#content", "#s-title"],
          bullets: [
            "TODO rewrite: event.intercept() provides a defined place for data loading and DOM updates. fetchPartial asks the server for the same page a full load would get, takes the main content, and sets the title.",
            "TODO rewrite: The server stays the source of every address.",
          ],
        },
        {
          id: "s5",
          label: "Focus and stale work",
          actions: [
            {
              type: "network",
              profile: "slow",
            },
            {
              type: "click",
              target: 'nav a[href="/orders"]',
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 2000,
            },
            {
              type: "network",
              profile: "fast",
            },
            {
              type: "assert",
              target: "#request-log",
              expect: "contains:aborted",
            },
          ],
          code: {
            file: "app.js",
            lines: [18, 21, 23],
          },
          spotlight: ["#s-focus", "#request-log"],
          bullets: [
            "TODO rewrite: The event exposes destination, form data, cancellation, focus behavior, and scroll timing.",
            "TODO rewrite: Passing event.signal to fetch aborts the stale request when a newer navigation starts.",
            "TODO rewrite: Focus goes to the content, and scroll restoration is left to the browser.",
          ],
        },
        {
          id: "s6",
          label: "Production cautions",
          actions: [],
          code: {
            file: "app.js",
            lines: [[7, 16], 31],
          },
          spotlight: ["#request-log"],
          bullets: [
            "TODO rewrite: Interception must stay same-origin and respect downloads, target attributes, and navigation that cannot be intercepted.",
            "TODO rewrite: Server-render every address the user can visit, because the client path is an enhancement.",
            "TODO rewrite: Instrument navigation failures and abort stale requests: smooth navigation that displays old data is still a defect.",
          ],
        },
        {
          id: "s7",
          label: "TODO cut: Follow a link",
          actions: [
            {
              type: "hook",
              name: "scrollTo",
              args: [0, 600],
            },
            {
              type: "pointer",
              to: 'nav a[href="/orders/418"]',
            },
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 500,
            },
            {
              type: "assert",
              target: "#s-url",
              expect: "contains:/orders/418",
            },
            {
              type: "assert",
              target: "#content",
              expect: "focused",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#s-url", "#s-title", "#s-focus", "#s-scroll"],
          callouts: [
            {
              target: 'nav a[href="/orders/418"]',
              text: "One navigate event",
              side: "bottom",
            },
          ],
          bullets: [
            "TODO rewrite: One navigate event covers the link.",
            "TODO rewrite: The address and title change, focus moves to the content, and the page starts at the top.",
          ],
          proof:
            "Show the address bar, document title, focus location, and scroll position after each navigation.",
        },
        {
          id: "s8",
          label: "TODO cut: Back and Forward",
          actions: [
            {
              type: "navigate",
              history: "back",
            },
            {
              type: "wait",
              ms: 500,
            },
            {
              type: "navigate",
              history: "back",
            },
            {
              type: "wait",
              ms: 500,
            },
            {
              type: "assert",
              target: "#s-scroll",
              expect: "contains:600",
            },
            {
              type: "navigate",
              history: "forward",
            },
            {
              type: "wait",
              ms: 500,
            },
            {
              type: "navigate",
              history: "forward",
            },
            {
              type: "wait",
              ms: 500,
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#s-url", "#s-scroll", "#s-focus"],
          callouts: [
            {
              target: "#s-scroll",
              text: "Scroll restored",
              side: "left",
            },
          ],
          bullets: [
            "TODO rewrite: Back and Forward use the same path.",
            "TODO rewrite: Back to the list puts the scroll position where we left it.",
          ],
          ifKeyboard:
            "TODO rewrite: Use the real browser buttons or Alt+Left and Alt+Right inside the frame, then press Next to sync.",
          proof: "Navigate with a link, submit the filter form, then use Back and Forward.",
        },
        {
          id: "s9",
          label: "TODO cut: Slow network, change of mind",
          actions: [
            {
              type: "network",
              profile: "slow",
            },
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "click",
              target: 'nav a[href="/orders/419"]',
            },
            {
              type: "wait",
              ms: 2000,
            },
            {
              type: "network",
              profile: "fast",
            },
            {
              type: "assert",
              target: "#request-log",
              expect: "contains:aborted",
            },
            {
              type: "assert",
              target: "#s-url",
              expect: "contains:/orders/419",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#request-log", "#content"],
          callouts: [
            {
              target: "#request-log",
              text: "Stale work aborted",
              side: "left",
            },
          ],
          bullets: [
            "TODO rewrite: Slow the network and quickly choose another order.",
            "TODO rewrite: The first request is aborted, and the page shows order 419, the one we asked for last.",
          ],
          proof:
            "Slow the network and quickly choose another order to show cancellation of stale work.",
        },
        {
          id: "s10",
          label: "TODO cut: Enhancement off",
          actions: [
            {
              type: "toggle",
              flag: "enhance-js",
              on: false,
            },
            {
              type: "click",
              target: 'nav a[href="/orders/418"]',
            },
            {
              type: "wait",
              ms: 800,
            },
            {
              type: "navigate",
              history: "back",
            },
            {
              type: "wait",
              ms: 800,
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#request-log", "#s-url"],
          callouts: [
            {
              target: "#request-log",
              text: "Full page loads",
              side: "left",
            },
          ],
          bullets: [
            "TODO rewrite: Turn the script off and repeat the task.",
            "TODO rewrite: Every step is a full page load, and every step still works.",
          ],
          ifKeyboard:
            "TODO rewrite: Disable JavaScript in DevTools (Command menu, Disable JavaScript) and reload, then click a link and press Back.",
          proof: "Turn off JavaScript and repeat the same task through full page loads.",
        },
      ],
      timing: {
        minutes: 2.0,
      },
    },
  ],
  citations: [
    {
      text: "Rungta, web.dev: Navigation API is Baseline Newly available (before/after with pushState and popstate)",
      url: "https://web.dev/blog/baseline-navigation-api",
    },
    {
      text: "Navigation API Baseline 13 Jan 2026 (Chrome 102, Firefox 147, Safari 26.2)",
      url: "https://webstatus.dev/features/navigation",
    },
    {
      text: "MDN: Navigation API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API",
    },
    {
      text: "Keith, Reasoning, 14 Oct 2025: view transitions plus speculation rules remove most reasons to build an SPA",
      url: "https://adactio.com/journal/22188",
    },
    {
      text: "Keith, The Invisibles, 30 Aug 2025: prerendering accounts for 35% of navigations on The Session",
      url: "https://adactio.com/journal/22100",
    },
    {
      text: "page (page.js) and react-router weekly downloads (mid-2026 window; refresh)",
      url: "https://api.npmjs.org/downloads/point/last-week/react-router",
    },
  ],
  cautions: [
    "TODO rewrite: Interception must stay same-origin and must respect downloads, target attributes, and navigation that cannot be intercepted.",
    "TODO rewrite: Server-render every address the user can visit. The client path is an enhancement, not the only route to the content.",
    "TODO rewrite: Instrument navigation failures and abort stale requests. Smooth navigation that displays old data is still a defect.",
  ],
};

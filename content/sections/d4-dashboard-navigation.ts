import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

const TODAY = "demos/04-navigation-api/today";
const LINK_418 = 'nav a[href="/orders/418"]';
const LINK_419 = 'nav a[href="/orders/419"]';

/** D4: a hand-written router, then one navigate event with intercept. */
export const section: DemoSection = {
  id: "d4-dashboard-navigation",
  order: 4,
  label: "Dashboard navigation",
  feature: "Navigation API",
  scenario:
    "A user moves between an order list, a filter and order details without full page loads.",
  support: { kind: "web-features", id: "navigation" },
  pages: [
    {
      id: "d4-intro",
      stage: "intro",
      intro:
        "Our fourth demo is an order dashboard. Clicking an order should feel instant. Back, focus and scroll still have to work.",
      description:
        "The Navigation API lets one event handle every link, form and Back press in a page.",
      visual: {
        src: "/intro/d4-dashboard-navigation.png",
        alt: "The order dashboard showing order 418 with the address and focus readout below.",
        capture: { pageId: "d4-now", stepId: "s1" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d4-used-to",
      stage: "used-to",
      eyebrow: "Navigation API",
      title: "How we used to do it",
      intro:
        "This dashboard uses a router written by hand. Links, Back and slow networks each need code.",
      frame: {
        build: "today",
        route: "/demos/04-navigation-api/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "scrollTo"],
        poster: "/posters/d4-today.png",
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[8, 22]]),
        excerpt(`${TODAY}/app.css`, "css", [[19, 22]]),
        excerpt(`${TODAY}/router.js`, "js", [
          [160, 171],
          [219, 234],
          [261, 267],
        ]),
      ],
      steps: [
        {
          id: "s0",
          label: "The hand-written router",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Follow a link",
          actions: [
            { type: "pointer", to: LINK_418 },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 400 },
          ],
          code: { file: "index.html", lines: [[2, 6]] },
          spotlight: [LINK_418, "#content"],
          bullets: [
            "These are real links. A click handler stops each one and loads by script.",
          ],
        },
        {
          id: "s2",
          label: "Go back",
          actions: [
            { type: "navigate", history: "back" },
            { type: "wait", ms: 400 },
          ],
          code: { file: "app.css", lines: [[2, 5]] },
          spotlight: ["#content"],
          bullets: [
            "Back fires a separate event. A loading class dims the page while script fetches.",
          ],
        },
        {
          id: "s3",
          label: "Change your mind",
          key: true,
          actions: [
            { type: "network", profile: "slow" },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 300 },
            { type: "click", target: LINK_419 },
            { type: "wait", ms: 2000 },
            { type: "network", profile: "fast" },
          ],
          code: {
            file: "router.js",
            lines: [
              [2, 4],
              [7, 12],
            ],
          },
          spotlight: ["#content"],
          meter: {
            label: "JavaScript",
            value: "134 lines",
            source: "non-blank, non-comment lines in /demos/04-navigation-api/today/*.js",
          },
          bullets: [
            "On a slow network we click two orders. Script cancels the first.",
            "Links, Back, scroll and focus take 134 lines.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d4-now",
      stage: "now",
      eyebrow: "Navigation API",
      title: "How we do it now",
      intro:
        "This is the same dashboard. Every page is a normal server page. One listener makes the moves between them smooth.",
      frame: {
        build: "native",
        route: "/orders",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-js": true },
        hooks: ["reset", "scrollTo"],
        poster: "/posters/d4-now.png",
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d4-dashboard-navigation", "index.html"),
        },
        { file: "app.js", lang: "js", source: sectionFile("d4-dashboard-navigation", "app.js") },
        { file: "app.css", lang: "css", source: sectionFile("d4-dashboard-navigation", "app.css") },
      ],
      steps: [
        {
          id: "s0",
          label: "Server-rendered list",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Follow a link",
          actions: [
            { type: "hook", name: "scrollTo", args: [0, 200] },
            { type: "pointer", to: LINK_418 },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 500 },
            { type: "assert", target: "#s-url", expect: "contains:/orders/418" },
            { type: "assert", target: "#content", expect: "focused" },
          ],
          code: {
            file: "app.js",
            lines: [
              [5, 6],
              [17, 23],
            ],
          },
          spotlight: [LINK_418, "#s-url"],
          meter: {
            label: "JavaScript",
            value: "33 lines",
            source:
              "non-blank, non-comment lines in content/sections/d4-dashboard-navigation/files/*.js",
          },
          bullets: [
            "Order 418 opens without a full page load. The address and the title change.",
            "One navigate event handles every link. Intercept says we render the page.",
            "Focus moves to the new content, where keyboard users need it.",
          ],
        },
        {
          id: "s2",
          label: "Apply a filter",
          actions: [
            {
              type: "key",
              key: "ArrowDown",
              target: "#status",
              via: "selectedIndex = 1 on the select, then input and change events",
            },
            { type: "pointer", to: ".toolbar form button" },
            { type: "click", target: ".toolbar form button" },
            { type: "wait", ms: 500 },
            { type: "assert", target: "#s-url", expect: "contains:status=Shipped" },
          ],
          code: { file: "index.html", lines: [[10, 17]] },
          spotlight: [".toolbar form", "#s-url"],
          ifKeyboard:
            "Choose Shipped in the filter and press Apply. Then press Next once to sync the frame.",
          bullets: [
            "The status filter is a normal form. Apply shows the shipped orders.",
            "The same navigate event handles the form. We added no code for it.",
          ],
        },
        {
          id: "s3",
          label: "Go back twice",
          key: true,
          actions: [
            { type: "navigate", history: "back" },
            { type: "wait", ms: 500 },
            { type: "navigate", history: "back" },
            { type: "wait", ms: 500 },
            { type: "assert", target: "#s-scroll", expect: "contains:200" },
          ],
          code: {
            file: "app.js",
            lines: [
              [17, 19],
              [22, 23],
            ],
          },
          spotlight: ["#s-url", "#s-scroll"],
          ifKeyboard:
            "Press Alt and Left Arrow twice inside the frame. Then press Next once to sync the frame.",
          bullets: [
            "Back returns to order 418, then to the list at the same scroll position.",
            "Back and Forward run through the same navigate event.",
            "The browser restores the scroll position for us.",
          ],
        },
        {
          id: "s4",
          label: "Change your mind",
          actions: [
            { type: "network", profile: "slow" },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 300 },
            { type: "click", target: LINK_419 },
            { type: "wait", ms: 2000 },
            { type: "network", profile: "fast" },
            { type: "assert", target: "#request-log", expect: "contains:aborted" },
            { type: "assert", target: "#s-url", expect: "contains:/orders/419" },
          ],
          code: {
            file: "app.js",
            lines: [
              [20, 21],
              [29, 30],
            ],
          },
          spotlight: ["#request-log", "#content"],
          proof:
            "Slow the network and quickly choose another order to show cancellation of stale work.",
          bullets: [
            "On a slow network we pick order 418, then 419. The first request stops.",
            "The event carries a signal. Passing it to fetch cancels the stale request.",
          ],
        },
        {
          id: "s5",
          label: "Script off",
          actions: [
            { type: "toggle", flag: "enhance-js", on: false },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 800 },
            { type: "navigate", history: "back" },
            { type: "wait", ms: 800 },
          ],
          code: { file: "app.js", lines: [], off: true },
          spotlight: ["#request-log", "#s-url"],
          proof: "Turn off JavaScript and repeat the same task through full page loads.",
          ifKeyboard:
            "Disable JavaScript in DevTools and reload. Then click a link and press Back.",
          bullets: [
            "With the script off, each click is a full page load.",
            "Every address is a real page, so the task still works.",
          ],
        },
      ],
      timing: { minutes: 2.0 },
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
    "Intercept only same-origin moves. Leave downloads, new tabs and other sites to the browser.",
    "Render every address on the server. The script path is an enhancement.",
    "Log failed navigations and cancel stale requests. A smooth move to old data is still a bug.",
  ],
};

import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/04-navigation-api/today";
const LINK_418 = 'nav a[href="/orders/418"]';
const LINK_419 = 'nav a[href="/orders/419"]';

/** D4: a hand-written router, then one navigate event with intercept. */
export const section: DemoSection = {
  id: "d4-dashboard-navigation",
  background: "d4",
  order: 4,
  label: "Dashboard navigation",
  feature: "Navigation API",
  scenario:
    "A user moves between orders, a filter and order details without full page loads.",
  support: { kind: "web-features", id: "navigation" },
  pages: [
    {
      id: "d4-intro",
      stage: "intro",
      intro:
        "Now an order list. Open an order, filter the list, go back, and keep your place.\n\nA client-side router can do that, but we often end up managing clicks, history, canceled requests, focus, and scroll in separate places.\n\nThe Navigation API gives us a more direct way to handle supported navigations. It doesn’t remove the need for good routing decisions.",
      description:
        "The Navigation API lets one event handle every link, form and Back press.",
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
      title: "What we used to do",
      split: "60/40",
      intro:
        "Here’s the list with a small custom router.\n\nIt starts with normal links. Then our code takes over when someone clicks one.",
      frame: {
        build: "today",
        route: "/demos/04-navigation-api/today",
        viewport: { width: 768, height: 628 },
        spotlightClip: { bottom: 488 },
        keycap: "above-drawer",
        hooks: ["reset", "scrollTo"],
        poster: "/posters/d4-today.png",
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[8, 22]]),
        excerpt(`${TODAY}/app.css`, "css", [[7, 10]]),
        excerpt(`${TODAY}/router.js`, "js", [
          [160, 171],
          [222, 237],
          [264, 270],
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
            "Open order 418.",
            "We stop the link, load content, update the page, and push a history entry. We also need to update the title and move focus somewhere useful.",
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
            "Now go back.",
            "That’s a different event path. We need to load the right view and restore the user’s place, not just change the URL.",
          ],
        },
        {
          id: "s3",
          label: "Change your mind",
          key: true,
          actions: [
            { type: "network", profile: "slow" },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 100 },
            { type: "click", target: LINK_419 },
            { type: "wait", ms: 900 },
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
            "Open a slow order, then quickly open another.",
            "Without cancellation, the first response can arrive last and replace the page with the wrong order.",
            "This example uses 134 lines of routing JavaScript. A lot of it coordinates work the browser already knows is navigation.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d4-now",
      stage: "now",
      eyebrow: "Navigation API",
      title: "What we can do today",
      split: "60/40",
      intro:
        "The server still provides a complete order list. The links work before we add the enhancement.\n\nThat gives us a fallback instead of an empty screen waiting for the router.",
      frame: {
        build: "native",
        route: "/orders",
        viewport: { width: 768, height: 628 },
        spotlightClip: { bottom: 488 },
        keycap: "above-drawer",
        flags: { "enhance-js": true },
        hooks: ["reset", "scrollTo"],
        poster: "/posters/d4-now.png",
      },
      files: [
        sectionCode("d4-dashboard-navigation", "index.html", "html"),
        sectionCode("d4-dashboard-navigation", "app.js", "js"),
        sectionCode("d4-dashboard-navigation", "app.css", "css"),
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
            "Open an order.",
            "The `navigate` handler checks whether this is a navigation we should intercept. Downloads, different origins, and other special cases shouldn’t be pulled into our page loader.",
            "We then load the content and handle the title and focus. The demo’s routing code is down to 33 lines.",
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
            "Use the filter.",
            "It’s a GET form, so the filter state belongs in the URL. That makes the result easier to share and revisit.",
            "We’re demonstrating this navigation path, not claiming every form submission should be intercepted.",
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
            "Go back through the list and detail views.",
            "The goal is to preserve the user’s place. A back button that returns you to the top of a long list technically works, but it doesn’t feel finished.",
          ],
        },
        {
          id: "s4",
          label: "Change your mind",
          actions: [
            { type: "network", profile: "slow" },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 100 },
            { type: "click", target: LINK_419 },
            { type: "wait", ms: 900 },
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
            "Try the slow-order case again.",
            "We pass the navigation’s abort signal to the fetch. When that navigation is canceled, the request can be canceled too.",
            "We still handle errors. The API helps coordinate the work; it doesn’t write the error screen for us.",
          ],
        },
        {
          id: "s5",
          label: "Script off",
          actions: [
            { type: "toggle", flag: "enhance-js", on: false },
            { type: "click", target: LINK_418 },
            { type: "wait", ms: 300 },
            { type: "navigate", history: "back" },
            { type: "wait", ms: 300 },
          ],
          code: { file: "app.js", lines: [], off: true },
          spotlight: ["#request-log", "#s-url"],
          proof: "Turn off JavaScript and repeat the same task through full page loads.",
          ifKeyboard:
            "Disable JavaScript in DevTools and reload. Then click a link and press Back.",
          bullets: [
            "Remove the enhancement.",
            "The links load full pages. The GET form still submits. The task still works.",
            "That’s the difference between enhancing navigation and making navigation depend on our JavaScript.",
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
    {
      text: "MDN compatibility: NavigateEvent",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/NavigateEvent.json",
    },
  ],
  cautions: [
    "Intercept only same-origin moves. Leave downloads, new tabs and other sites to the browser.",
    "Render every address on the server. The script path is an enhancement.",
    "Log failed navigations and cancel stale requests. A smooth move to old data is still a bug.",
  ],
};

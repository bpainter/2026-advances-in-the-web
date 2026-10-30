import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/15-scroll-driven/today";

/**
 * M4: a scroll listener and an IntersectionObserver, then scroll-driven animations
 * (docs/design/still-in-motion-demos.md 7). The article scrolls in a pane inside the frame; the
 * hooks scroll it, and busyScroll blocks the main thread to show which bar keeps up.
 */
export const section: DemoSection = {
  id: "m4-return-guide",
  background: "m4",
  order: 10,
  label: "Return guide",
  group: "still-in-motion",
  feature: "Scroll-driven animations",
  scenario: "A help article shows reading progress, and each step slides in as it arrives.",
  // web-features 3.44.0 predates Firefox 159 (27 Oct 2026); remove the fallback after the bump (3.4).
  support: {
    kind: "web-features",
    id: "scroll-driven-animations",
    fallback: { missing: ["firefox"], text: "the article with no animation" },
  },
  pages: [
    {
      id: "m4-intro",
      stage: "intro",
      intro:
        "Here’s a help article with a reading-progress bar and a few small reveals.\n\nThe animation follows how far we’ve scrolled, not how many seconds have passed.\n\nCSS scroll-driven animations let us describe that relationship directly. The article still needs to work with no animation at all.",
      description:
        "Scroll-driven animations link an animation to scrolling, so progress bars and reveals need no script.",
      visual: {
        src: "/intro/m4-return-guide.png",
        alt: "The return guide with the reading bar part way and step 3 sliding in.",
        capture: { pageId: "m4-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
      cutPriority: 6,
    },
    {
      id: "m4-used-to",
      stage: "used-to",
      eyebrow: "Scroll-driven animations",
      title: "What we used to do",
      intro: "The article loads, and our script starts watching the scroll position.\n\nIt has one job for the progress bar and another for the content reveals.",
      frame: {
        build: "today",
        route: "/demos/15-scroll-driven/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "scrollArticle", "busyScroll"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [
          [9, 18],
          [30, 38],
          [47, 54],
          [73, 80],
        ]),
        excerpt(`${TODAY}/styles.css`, "css", [[1, 26]]),
        excerpt(`${TODAY}/progress.js`, "js", [[1, 31]]),
        excerpt(`${TODAY}/reveal.js`, "js", [[1, 25]]),
      ],
      steps: [
        {
          id: "s0",
          label: "The scripted article",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Scroll the article",
          actions: [
            { type: "hook", name: "scrollArticle", args: [0.3] },
            { type: "wait", ms: 700 },
          ],
          code: {
            file: "index.html",
            lines: [
              [7, 10],
              [14, 18],
            ],
          },
          spotlight: ["#t-progress"],
          bullets: [
            "Scroll partway down.",
            "For the progress bar, we calculate how far the user has traveled through the scrollable area. Then we update the bar through an animation frame.",
          ],
        },
        {
          id: "s2",
          label: "Reveal a step",
          actions: [
            { type: "hook", name: "scrollArticle", args: [0.7] },
            { type: "wait", ms: 700 },
          ],
          code: { file: "styles.css", lines: [[8, 19]] },
          spotlight: ["#t-step-3"],
          // Used-to pages take no callouts; the bullet sends eyes to the bar before s3 (review r6 H4).
          bullets: [
            "Keep scrolling.",
            "An intersection observer adds classes when the article sections enter view. We also decide when to stop observing each one.",
          ],
        },
        {
          id: "s3",
          label: "Scroll a busy page",
          key: true,
          actions: [
            // 2000 ms, so the stall lasts long enough to register (review r6 motion H4).
            { type: "hook", name: "busyScroll", args: [1, 2000] },
            { type: "wait", ms: 1600 },
          ],
          code: {
            file: "progress.js",
            lines: [
              [16, 18],
              [21, 29],
            ],
          },
          spotlight: ["#t-progress"],
          meter: {
            label: "JavaScript",
            value: "33 lines",
            source: "non-blank, non-comment lines in /demos/15-scroll-driven/today/*.js",
          },
          bullets: [
            "Now give the main thread some extra work.",
            "The scripted updates can fall behind. The demo counts 33 lines of scroll-related JavaScript, and all of it depends on our code getting time to run.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
      cutPriority: 6,
    },
    {
      id: "m4-now",
      stage: "now",
      eyebrow: "Scroll-driven animations",
      title: "What we can do today",
      intro:
        "The base page is readable, with the content visible.\n\nWe add animation only when the browser supports it and the user’s motion preferences allow it.",
      frame: {
        build: "native",
        route: "/demos/15-scroll-driven/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-css": true },
        hooks: ["reset", "scrollArticle", "busyScroll"],
      },
      files: [
        sectionCode("m4-return-guide", "index.html", "html"),
        sectionCode("m4-return-guide", "article.css", "css"),
      ],
      steps: [
        {
          id: "s0",
          label: "Same article",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Scroll the article",
          actions: [
            { type: "hook", name: "scrollArticle", args: [0.3] },
            { type: "wait", ms: 700 },
          ],
          code: {
            file: "article.css",
            lines: [
              [8, 11],
              [20, 23],
            ],
          },
          spotlight: ["#progress"],
          bullets: [
            "Scroll down again.",
            "`animation-timeline: scroll()` connects the progress animation to scrolling. We describe the start and end states in CSS instead of updating the bar on every scroll.",
          ],
        },
        {
          id: "s2",
          label: "Reveal a step",
          actions: [
            { type: "hook", name: "scrollArticle", args: [0.7] },
            { type: "wait", ms: 700 },
          ],
          code: {
            file: "article.css",
            lines: [
              [4, 6],
              [12, 16],
            ],
          },
          spotlight: ["#step-3"],
          // The room is on the bar before s3 starts the busy scroll (review r6 motion H4).
          callouts: [{ target: "#progress", text: "Watch the bar", side: "bottom" }],
          bullets: [
            "The reveals use a view timeline, so each animation follows the element’s position in the viewport.",
            "Reduced-motion handling is part of the design. Removing movement shouldn’t remove the information.",
          ],
        },
        {
          id: "s3",
          label: "Scroll a busy page",
          key: true,
          actions: [
            { type: "hook", name: "busyScroll", args: [1, 2000] },
            { type: "wait", ms: 1600 },
          ],
          code: { file: "article.css", lines: [[7, 11]] },
          spotlight: ["#progress"],
          meter: {
            label: "JavaScript",
            value: "0 lines",
            source: "non-blank, non-comment lines in content/sections/m4-return-guide/files/*.js",
          },
          bullets: [
            "Add the extra main-thread work again.",
            "Animations using suitable properties can keep running more smoothly because they don’t depend on our scroll callback. In this version, we’ve removed the scroll JavaScript.",
            "That isn’t a guarantee that CSS animation can never stall. The properties, browser, and rest of the page still matter.",
          ],
        },
      ],
      timing: { minutes: 1.25 },
      cutPriority: 6,
    },
  ],
  citations: [
    {
      text: "MDN, Firefox 159 release notes (27 Oct 2026): scroll-driven animations on by default",
      url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159",
    },
    {
      text: "Interop 2026: scroll-driven animations focus area (animation-timeline, scroll-timeline, view-timeline)",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Comeau, Scroll-Driven Animations, 28 Apr 2026 (updated 19 Jun 2026)",
      url: "https://www.joshwcomeau.com/animation/scroll-driven-animations/",
    },
    {
      text: "Yitbarek, A guide to scroll-driven animations with just CSS (WebKit), 20 Jun 2025",
      url: "https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/",
    },
    {
      text: "Van Damme, scroll-driven-animations.style: Cover Flow and its Add Jank switch, the source of the busy-page proof",
      url: "https://scroll-driven-animations.style/demos/cover-flow/css/",
    },
    {
      text: "web-features scroll-driven-animations (3.44.0 predates Firefox 159; the intro uses a fallback until the bump)",
      url: "https://webstatus.dev/features/scroll-driven-animations",
    },
    {
      text: "MDN compatibility: animation-timeline",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/animation-timeline.json",
    },
    {
      text: "MDN compatibility: animation-range",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/animation-range.json",
    },
  ],
  cautions: [
    "Animate transform and opacity. Other properties can stall when the page is busy.",
    "Wrap motion in a reduced motion query. Keep the content readable without it.",
    "Firefox shipped this on 27 October. Older Firefox users see no animation.",
  ],
};

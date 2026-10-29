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
        "Next is a help article about returns. A bar shows how far you have read. Each step slides in as it arrives.",
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
      intro: "This help article tracks reading progress. Script listens to every scroll.",
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
          bullets: ["The bar grows as we scroll. Script sets its width on every scroll event."],
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
          bullets: ["Step 3 fades in. CSS waits for script to add a class.", "Watch the bar next."],
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
            "Now the page is busy. The bar stalls, then jumps.",
            "Every frame of progress waits for script: 33 lines.",
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
        "This is the same article with no scroll script. CSS links each animation to the scroll position.",
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
            "The bar grows as we scroll.",
            "Animation timeline scroll ties the bar to the article's scroll position.",
            "The top of the article is 0 percent. The bottom is 100.",
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
            "Step 3 fades in as it enters the pane.",
            "The view function tracks one element. Animation range sets the start and end.",
            "With reduced motion, the steps appear without moving.",
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
            "The page is busy again. The bar keeps up.",
            "The browser can run this animation apart from page script. Busy script cannot stall it.",
            "We wrote no scroll code.",
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
  ],
  cautions: [
    "Animate transform and opacity. Other properties can stall when the page is busy.",
    "Wrap motion in a reduced motion query. Keep the content readable without it.",
    "Firefox shipped this on 27 October. Older Firefox users see no animation.",
  ],
};

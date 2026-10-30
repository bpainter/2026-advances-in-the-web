import type { Action, DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/13-grid-lanes/today";

/**
 * Plan B for the talk (still-in-motion-demos.md 5 and 11, question 2). Plan A: the talk laptop's
 * Chrome runs with the "CSS Grid Lanes Layout" flag on (chrome://flags/#css-grid-lanes-layout, or
 * the switch --enable-blink-features=CSSGridLanesLayout), and the frame is live. Set this to true
 * if the flagged build misrenders on the laptop: from s1 on, the `showSafari` hook lays the stills
 * recorded in WebKit (`pnpm walk m2 --browser=webkit --capture`, public/posters/m2-safari/) over
 * the live wall, and the asserts that need Grid Lanes drop out.
 */
const SAFARI_PLAN_B = false;
const planB: Action[] = SAFARI_PLAN_B ? [{ type: "hook", name: "showSafari" }] : [];
const needsLanes = (a: Action): Action[] => (SAFARI_PLAN_B ? [] : [a]);

/** M2: a Masonry.js-style wall placed by script, then Grid Lanes (still-in-motion-demos.md 5). */
export const section: DemoSection = {
  id: "m2-trail-photos",
  background: "m2",
  order: 8,
  label: "Trail photos",
  group: "still-in-motion",
  feature: "Grid Lanes",
  scenario: "Customer photos and quotes of different heights pack into a wall with no gaps.",
  support: {
    kind: "web-features",
    id: "grid-lanes",
    // The whole feature lists no browser, because fit-tolerance ships nowhere yet. The demo uses
    // display: grid-lanes only, which Safari ships (spec 3.2).
    compatKeys: ["css.properties.display.grid-lanes"],
    fallback: { missing: ["chrome", "edge", "firefox"], text: "CSS columns" },
  },
  pages: [
    {
      id: "m2-intro",
      stage: "intro",
      intro:
        "Here’s a wall of customer photos and quotes. They aren’t all the same height, and we’d rather not crop them into identical boxes.\n\nGrid Lanes is aimed at layouts like this, where items can pack into lanes without sharing every row boundary.\n\nTreat the native layout as an enhancement here. The fallback still needs a sensible reading order.",
      description: "Grid Lanes packs items of different heights into columns, like a masonry wall.",
      visual: {
        src: "/intro/m2-trail-photos.png",
        alt: "A packed wall of customer trail photos and quotes in six lanes.",
        capture: { pageId: "m2-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
      cutPriority: 5,
    },
    {
      id: "m2-used-to",
      stage: "used-to",
      eyebrow: "Grid Lanes",
      title: "What we used to do",
      intro: "We start with a set of photos and quotes from the server.\n\nJavaScript takes over their positions after the page loads.",
      split: "60/40",
      frame: {
        build: "today",
        route: "/demos/13-grid-lanes/today",
        viewport: { width: 768, height: 628 },
        hooks: ["reset", "loadPhotos", "scrollPhotos"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[1, 17]]),
        excerpt(`${TODAY}/styles.css`, "css", [[1, 21]]),
        excerpt(`${TODAY}/masonry.js`, "js", [
          [21, 31],
          [56, 68],
        ]),
        excerpt(`${TODAY}/app.js`, "js", [[14, 30]]),
      ],
      steps: [
        {
          id: "s0",
          label: "The scripted wall",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Place the photos",
          actions: [
            { type: "hook", name: "loadPhotos" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#t-wall", expect: "attr:data-laid-out" },
          ],
          code: {
            file: "index.html",
            lines: [
              [6, 8],
              [13, 17],
            ],
          },
          spotlight: ["#t-wall"],
          bullets: [
            "For each item, the script finds a short column and places the item there.",
            "That means measuring the items and keeping track of how tall each column has become.",
          ],
        },
        {
          id: "s2",
          label: "Show more photos",
          actions: [
            { type: "pointer", to: "#t-more" },
            { type: "click", target: "#t-more" },
            { type: "wait", ms: 500 },
            { type: "hook", name: "scrollPhotos" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#t-wall figure", expect: "count=18" },
          ],
          code: { file: "styles.css", lines: [[7, 15]] },
          // The wall overflows its scrolling pane, so the box goes on the pane (review r6 motion H2).
          spotlight: [".photos"],
          bullets: [
            "Load six more items.",
            "The new content has to go through the same process. If an image changes size after loading, that may mean more work too.",
          ],
        },
        {
          id: "s3",
          label: "Narrow the page",
          key: true,
          actions: [
            { type: "resize", target: "#t-wall", inlineSize: "66%" },
            { type: "wait", ms: 400 },
          ],
          code: {
            file: "masonry.js",
            lines: [
              [4, 6],
              [17, 23],
            ],
          },
          spotlight: [".photos"],
          meter: {
            label: "JavaScript",
            value: "55 lines",
            source: "non-blank, non-comment lines in /demos/13-grid-lanes/today/*.js",
          },
          bullets: [
            "Now narrow the wall.",
            "The script waits briefly, measures again, and places everything for the new width. The demo counts 55 lines of layout JavaScript.",
            "We’re maintaining our own layout system alongside the browser’s.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
      cutPriority: 5,
    },
    {
      id: "m2-now",
      stage: "now",
      eyebrow: "Grid Lanes",
      title: "What we can do today",
      intro: "Start with a regular layout that keeps the content readable.\n\nThe photos and quotes shouldn’t disappear just because the browser doesn’t support the newer option.",
      split: "60/40",
      frame: {
        build: "native",
        route: "/demos/13-grid-lanes/native",
        viewport: { width: 768, height: 628 },
        flags: { "enhance-css": false, "enhance-js": true },
        hooks: ["reset", "showSafari", "scrollPhotos"],
      },
      files: [
        sectionCode("m2-trail-photos", "index.html", "html"),
        sectionCode("m2-trail-photos", "wall.css", "css"),
        sectionCode("m2-trail-photos", "app.js", "js"),
      ],
      steps: [
        {
          id: "s0",
          label: "Regular grid",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Turn on Grid Lanes",
          actions: [
            ...planB,
            { type: "toggle", flag: "enhance-css", on: true },
            ...needsLanes({ type: "assert", target: "#wall", expect: "style:display=grid-lanes" }),
          ],
          code: {
            file: "wall.css",
            lines: [
              [14, 17],
              [24, 29],
            ],
          },
          spotlight: ["#wall"],
          bullets: [
            "Where supported, `display: grid-lanes` lets the browser handle the variable-height layout.",
            "The fallback in this example uses columns. That’s not identical: columns read down before they read across. The content needs to make sense in that order.",
          ],
        },
        {
          id: "s2",
          label: "Show more photos",
          actions: [
            { type: "pointer", to: "#more" },
            { type: "click", target: "#more" },
            { type: "wait", ms: 400 },
            { type: "hook", name: "scrollPhotos" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#wall figure", expect: "count=18" },
          ],
          code: { file: "app.js", lines: [[8, 17]] },
          // The wall overflows its scrolling pane, so the box goes on the pane, and the pane scrolls
          // to the new photos (review r6 motion H2).
          spotlight: [".photos"],
          meter: {
            label: "JavaScript",
            value: "7 lines",
            source: "non-blank, non-comment lines in content/sections/m2-trail-photos/files/*.js",
          },
          bullets: [
            "Load six more items again.",
            "The JavaScript adds the content. CSS handles its placement. The demo counts seven lines of request handling rather than another layout routine.",
            "We still need to handle loading errors and any untrusted content we insert.",
          ],
        },
        {
          id: "s3",
          label: "Narrow the page",
          key: true,
          actions: [{ type: "resize", target: "#wall", inlineSize: "66%" }],
          // PRD r7 7.1 asked for [[4, 5], 27]; that spans 24 lines, over the cap of 20 (both ends on
          // screen). Lines 4 and 5 set the lane count, which the bullets name.
          code: { file: "wall.css", lines: [[4, 5]] },
          spotlight: [".photos"],
          bullets: [
            "Narrow the wall.",
            "The layout responds without our measuring loop. The benefit is less positioning code, not a promise that every browser will arrange every item the same way.",
            "Use the supported layout, then check reading order and keyboard access in the fallback too.",
          ],
        },
      ],
      timing: { minutes: 1.25 },
      cutPriority: 5,
    },
  ],
  citations: [
    {
      text: "Simmons, Etemad and Stewart, Introducing CSS Grid Lanes, 19 Dec 2025",
      url: "https://webkit.org/blog/17660/introducing-css-grid-lanes/",
    },
    {
      text: "Simmons, When will CSS Grid Lanes arrive? How long until we can use it?, 22 Jan 2026 (WebKit blog)",
      url: "https://webkit.org/blog/17758/when-will-css-grid-lanes-arrive-how-long-until-we-can-use-it/",
    },
    {
      text: "Simmons, WebKit Features for Safari 27.2, 26 Oct 2026: flow-tolerance renamed fit-tolerance",
      url: "https://webkit.org/blog/18515/webkit-features-for-safari-27-2/",
    },
    {
      text: "Matuzović, Progressively enhancing Grid Lanes, 30 Jun 2026",
      url: "https://www.matuzo.at/blog/2026/grid-lanes-progressive-enhancement",
    },
    {
      text: "Matuzović, Your Grid Lanes will likely fail WCAG 2.4.3, 24 Jun 2026",
      url: "https://www.matuzo.at/blog/2026/grid-lanes-accessibility",
    },
    {
      text: "Keith, Enhancing with CSS Grid Lanes, 16 Jun 2026",
      url: "https://adactio.com/journal/22613",
    },
    {
      text: "MDN, Firefox 159 release notes: the old masonry syntax is removed",
      url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159",
    },
    {
      text: "Chrome: the CSS Grid Lanes Layout flag, chrome://flags/#css-grid-lanes-layout (switch --enable-blink-features=CSSGridLanesLayout), checked in Chrome 156",
      url: "https://webstatus.dev/features/grid-lanes",
    },
    {
      text: "Masonry.js documentation: the layout library the used-to page is modeled on",
      url: "https://masonry.desandro.com/",
    },
    {
      text: "MDN compatibility: display / grid-lanes",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/display.json",
    },
  ],
  cautions: [
    "Focus moves in source order across lanes. Test with a keyboard first.",
    "Safari 27.2 renamed flow tolerance to fit tolerance. Expect more renames.",
    "Without lanes, columns stand in. They read top to bottom, not across.",
  ],
};

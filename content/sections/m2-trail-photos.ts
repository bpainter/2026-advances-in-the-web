import type { Action, DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

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
  order: 9,
  label: "Trail photos",
  feature: "Grid Lanes",
  scenario: "Customer photos and quotes of different heights pack into a wall with no gaps.",
  support: {
    kind: "web-features",
    id: "grid-lanes",
    // The whole feature lists no browser, because fit-tolerance ships nowhere yet. The demo uses
    // display: grid-lanes only, which Safari ships (spec 3.2).
    compatKeys: ["css.properties.display.grid-lanes"],
    fallback: { missing: ["chrome", "edge", "firefox"], text: "a regular grid" },
  },
  pages: [
    {
      id: "m2-intro",
      stage: "intro",
      intro:
        "Next is a product page with customer photos. Photos and quotes have different heights. We want them packed with no gaps.",
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
      title: "How we used to do it",
      intro: "Customer photos sit in a packed wall. Script places every item.",
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
          bullets: ["The photos load in a stack. Then script moves each one into place."],
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
          bullets: ["Show more adds six photos. Every item is absolute, so CSS cannot place it."],
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
            "The page narrows. The wall rebuilds after a pause.",
            "Script measures every item and tracks each column: 55 lines.",
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
      title: "How we do it now",
      intro: "This is the same wall with no layout script. It starts as a regular grid. Most browsers show that.",
      split: "60/40",
      frame: {
        build: "native",
        route: "/demos/13-grid-lanes/native",
        viewport: { width: 768, height: 628 },
        flags: { "enhance-css": false, "enhance-js": true },
        hooks: ["reset", "showSafari", "scrollPhotos"],
      },
      files: [
        { file: "index.html", lang: "html", source: sectionFile("m2-trail-photos", "index.html") },
        { file: "wall.css", lang: "css", source: sectionFile("m2-trail-photos", "wall.css") },
        { file: "app.js", lang: "js", source: sectionFile("m2-trail-photos", "app.js") },
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
              [2, 5],
              [10, 14],
            ],
          },
          spotlight: ["#wall"],
          bullets: [
            "One display value packs the photos into lanes. The gaps close.",
            "Browsers that do not know grid lanes keep display grid.",
            "Each photo goes to the lane with the most room.",
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
            "Show more adds six photos. They fill the shortest lanes.",
            "The only script fetches the photos. It never measures them.",
          ],
        },
        {
          id: "s3",
          label: "Narrow the page",
          key: true,
          actions: [{ type: "resize", target: "#wall", inlineSize: "66%" }],
          code: { file: "wall.css", lines: [[4, 6]] },
          spotlight: [".photos"],
          bullets: [
            "The page narrows, and the wall reflows with no pause.",
            "Auto fill picks the number of lanes from the width.",
            "The browser does the packing. We deleted the layout script.",
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
  ],
  cautions: [
    "Focus moves in source order across lanes. Test with a keyboard first.",
    "Safari 27.2 renamed flow tolerance to fit tolerance. Expect more renames.",
    "Crop items to one height in the fallback, so the regular grid stays tidy.",
  ],
};

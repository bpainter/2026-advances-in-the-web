import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "view-transitions",
  live: {
    kind: "route",
    src: "/demos/view-transitions",
    browsers: ["chrome", "firefox", "safari"],
  },
  code: demoCode("view-transitions", [
    {
      file: "index.html",
      lang: "html",
    },
    {
      file: "styles.css",
      lang: "css",
    },
    {
      file: "card.css",
      lang: "css",
    },
    {
      file: "app.js",
      lang: "js",
    },
  ]),
  // The "before" beat: the same list with FLIP by hand and a hand-made detail swap.
  legacy: {
    code: demoCode("view-transitions", [
      {
        file: "legacy/index.html",
        lang: "html",
      },
      {
        file: "legacy/styles.css",
        lang: "css",
      },
      {
        file: "card.css",
        lang: "css",
      },
      {
        file: "legacy/app.js",
        lang: "js",
      },
    ]),
  },
  requires: [
    { id: "view-transition-name", kind: "css-supports", query: "view-transition-name: a" },
    { id: "view-transition-class", kind: "css-supports", query: "view-transition-class: a" },
    { id: "navigation-api", kind: "js", expr: "'navigation' in window" },
  ],
  liveStates: ["sorted", "names", "double", "detail"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[52, 99]],
      caption: "Today a reorder is FLIP by hand: measure every box, mutate, invert each one, play.",
      action: "Price ascending: the hand-rolled FLIP slides each card to its new slot.",
      liveState: "sorted",
      phase: "before",
      target: "#view",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[101, 116]],
      caption:
        "Every sort re-renders and replays the same bookkeeping; a second button is one more listener.",
      action: "Sort by name: the same slide from the same script.",
      liveState: "names",
      phase: "before",
      target: "#name",
    },
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[118, 134]],
      caption:
        "And the router: catch the link, push the URL, swap the view by hand, and again on Back.",
      action: "The Road Racer card stretches into its detail view, a scaled card.",
      liveState: "detail",
      phase: "before",
      target: "#view",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same list with no animation code of our own.",
      action: "The detail morphs back into the list, sorted by price.",
      liveState: "sorted",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Sort by name: one transition, every card tracked by name.",
      action: "The cards slide into alphabetical order.",
      liveState: "names",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption:
        "A second sort 150 ms into the first: the browser drops the old one and starts fresh.",
      action: "Two sorts back to back; the second takes over mid-flight and nothing blocks.",
      liveState: "double",
      phase: "after",
    },
    {
      id: "a4",
      highlight: [],
      caption: "A link runs through the Navigation API and the same transition.",
      action: "The Road Racer card morphs into its detail view.",
      liveState: "detail",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "app.js",
      highlight: [[50, 62]],
      caption:
        "One call wraps the DOM change in startViewTransition; the helper only mutes the ready promise a skipped transition rejects.",
      action: "Back to the list, sorted by price; the Price button is spotlit.",
      liveState: "sorted",
      target: "#sort",
    },
    {
      id: "s2",
      file: "app.js",
      highlight: [[17, 24]],
      caption: "Each card carries a view-transition-name so the browser tracks it between states.",
      action: "Sort by name; every named card slides to its new place.",
      liveState: "names",
      target: "#view",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [[10, 14]],
      caption: "One rule tunes every morph. The root is un-named so the page stays clickable.",
      action: "Two sorts 150 ms apart; the second interrupts the first.",
      liveState: "double",
      target: "#view",
    },
    {
      id: "s4",
      file: "app.js",
      highlight: [[69, 77]],
      caption: "The Navigation API intercepts the link and runs the same transition: the router.",
      action: "The card morphs into the detail view.",
      liveState: "detail",
      target: "#view",
    },
    {
      id: "s5",
      file: "app.js",
      highlight: [[50, 62]],
      caption: "Same sort in Firefox. Same-document transitions are Baseline.",
      action: "The detail morphs back to the sorted list. Switch to Firefox and sort once.",
      liveState: "sorted",
      target: "#sort",
    },
  ],
  fork: ["https://view-transitions.chrome.dev/", "https://chrome.dev/view-transitions-toolkit/"],
  fallback: "https://view-transitions.chrome.dev/",
  wow: "The router is twenty lines and the animation is one.",
  gotcha:
    "It's a screenshot crossfade, not physics. One transition per document; element-scoped transitions are Chrome 147 only. Two elements sharing a name at capture time skip the transition. State-preserving reorders want moveBefore(), which is not in Safari stable. On stage the detail state calls navigation.navigate() so the intercept runs; without the Navigation API it falls back to pushState plus a transition. The Firefox step is a manual sort in the other window.",
};

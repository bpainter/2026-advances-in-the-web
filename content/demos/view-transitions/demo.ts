import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "view-transitions",
  live: {
    kind: "route",
    src: "/demos/view-transitions/",
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
  requires: [
    { id: "view-transition-name", kind: "css-supports", query: "view-transition-name: a" },
    { id: "view-transition-class", kind: "css-supports", query: "view-transition-class: a" },
  ],
  steps: [
    {
      id: "s1",
      file: "app.js",
      highlight: [[44, 46]],
      caption: "One line: wrap the DOM change in startViewTransition.",
      action: "Click Price; every card slides to its new place. Click again.",
    },
    {
      id: "s2",
      file: "app.js",
      highlight: [14, 22],
      caption: "Each card carries a view-transition-name so the browser tracks it between states.",
      action: "Nothing changes; the names are what made the slide possible.",
    },
    {
      id: "s3",
      file: "app.js",
      highlight: [[50, 58]],
      caption: "The Navigation API intercepts the link and runs the same transition: the router.",
      action: "Click a card; the detail morphs in. Press Back; it morphs out.",
    },
    {
      id: "s4",
      file: "styles.css",
      highlight: [[11, 14]],
      caption: "One rule tunes every morph. The root is un-named so the page stays clickable.",
      action: "Sort during a sort; nothing blocks.",
    },
    {
      id: "s5",
      file: "app.js",
      highlight: [],
      caption: "Same sort in Firefox. Same-document transitions are Baseline.",
      action: "Switch to Firefox and sort once.",
    },
  ],
  fork: ["https://view-transitions.chrome.dev/", "https://chrome.dev/view-transitions-toolkit/"],
  fallback: "https://view-transitions.chrome.dev/",
  wow: "The router is twenty lines and the animation is one.",
  gotcha:
    "It's a screenshot crossfade, not physics. One transition per document; element-scoped transitions are Chrome 147 only. Two elements sharing a name at capture time skip the transition. State-preserving reorders want moveBefore(), which is not in Safari stable.",
};

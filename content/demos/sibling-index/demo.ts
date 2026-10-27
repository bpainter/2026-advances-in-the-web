import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "sibling-index",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "firefox", "safari"],
  },
  code: demoCode("sibling-index", [
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
  // The "before" beat: the same stagger written inline by a loop after every DOM change.
  legacy: {
    code: demoCode("sibling-index", [
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
  requires: [{ id: "sibling-index", kind: "css-supports", query: "z-index: sibling-index()" }],
  liveStates: ["entered", "date", "more"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[7, 15]],
      caption: "Today the stagger is a loop that writes an animation-delay inline on every card.",
      action: "The five cards rise in order, 60 ms apart, each delay written by the loop.",
      liveState: "entered",
      phase: "before",
      target: ".grid",
    },
    // prettier-ignore
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[17, 27], [47, 52]],
      caption: "Re-sort and the delays are stale, so clear the animation, force a reflow and run the loop again.",
      action: "Sorted newest first, the cards re-enter in the new order.",
      liveState: "date",
      phase: "before",
      target: ".grid",
    },
    // prettier-ignore
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[29, 39], [54, 57]],
      caption: "Every card added later needs the loop again, so we renumber on click and watch the grid for anyone else.",
      action: "Load more appends a sixth card and the loop renumbers all six.",
      liveState: "more",
      phase: "before",
      target: ".product:nth-child(6)",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same stagger with no loop.",
      action: "The five cards rise in order, 60 ms apart.",
      liveState: "entered",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Re-sort and each card's delay moves with it.",
      action: "Sorted newest first, the cards re-enter in the new order with the same stagger.",
      liveState: "date",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "Add a card and it knows it is sixth.",
      action: "Load more appends a sixth card; it rises 300 ms in, with nothing written on it.",
      liveState: "more",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [5],
      caption: "The delay comes from the card's own index. No inline variable on every item.",
      action: "The cards rise again in order, 60 ms apart.",
      liveState: "entered",
      target: ".grid",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [2],
      caption: "Behind @supports: an older engine skips it and shows every card at once.",
      action: "Nothing changes here; say the August 2026 date.",
      liveState: "entered",
      target: ".grid",
    },
    {
      id: "s3",
      file: "app.js",
      highlight: [[25, 29]],
      caption: "Re-order the DOM and the delays re-order with it; there is no loop to run.",
      action: "Sorted newest first; the cards re-enter in the new order.",
      liveState: "date",
      target: ".sort",
    },
    {
      id: "s4",
      file: "app.js",
      highlight: [[7, 15]],
      caption: "Append a card and it rises last. Its delay comes from where it lands.",
      action: "Load more runs; the sixth card rises 300 ms after the grid would have.",
      liveState: "more",
      target: ".product:nth-child(6)",
    },
  ],
  fork: ["https://codepen.io/web-dot-dev/pen/vEGjGwG"],
  fallback: "https://codepen.io/web-dot-dev/pen/vEGjGwG",
  wow: "Adding an item changes the timing with no code change.",
  gotcha:
    "sibling-index() cannot stagger view-transition groups; snapshots are pixels, so the index never reaches them.",
};

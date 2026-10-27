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
  requires: [{ id: "sibling-index", kind: "css-supports", query: "z-index: sibling-index()" }],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [5],
      caption: "The delay comes from the card's own index. No inline variable on every item.",
      action: "Reload; the cards rise in order, 60ms apart.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [2],
      caption: "Behind @supports: an older engine skips it and shows every card at once.",
      action: "Nothing changes here; say the August 2026 date.",
    },
    {
      id: "s3",
      file: "app.js",
      highlight: [[6, 12]],
      caption: "Append a card and it rises last. Its delay comes from where it lands.",
      action: "Click Load more; the sixth card rises 300ms after the grid would have.",
    },
  ],
  fork: ["https://codepen.io/web-dot-dev/pen/vEGjGwG"],
  fallback: "https://codepen.io/web-dot-dev/pen/vEGjGwG",
  wow: "Adding an item changes the timing with no code change.",
  gotcha:
    "sibling-index() cannot stagger view-transition groups; snapshots are pixels, so the index never reaches them.",
};

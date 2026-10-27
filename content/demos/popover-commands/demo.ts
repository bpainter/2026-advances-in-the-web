import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "popover-commands",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("popover-commands", [
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
    { id: "popover", kind: "html-attr", element: "div", attr: "popover" },
    { id: "command", kind: "html-attr", element: "button", attr: "command" },
    { id: "starting-style", kind: "css-supports", query: "transition-behavior: allow-discrete" },
  ],
  steps: [
    {
      id: "s1",
      file: "index.html",
      highlight: [[8, 14]],
      caption: "A button with commandfor and command. Nothing in JavaScript wires it up.",
      action: "Click the ••• button; the menu opens in the top layer.",
    },
    {
      id: "s2",
      file: "index.html",
      highlight: [[17, 27]],
      caption: "The popover attribute gives you Esc, light dismiss, and focus return.",
      action: "Press Esc. Click outside. Focus returns to the ••• button.",
    },
    // prettier-ignore
    {
      id: "s3",
      file: "styles.css",
      highlight: [[24, 30], [40, 46]],
      caption: "@starting-style sets the entry frame; allow-discrete lets display and overlay animate.",
      action: "Open it again: it fades and slides in. Firefox snaps closed; overlay is Chrome-only.",
    },
    {
      id: "s4",
      file: "index.html",
      highlight: [[19, 25]],
      caption: "A custom command. The name has to start with two dashes.",
      action: "Nothing yet; the handler is on the next step.",
    },
    {
      id: "s5",
      file: "app.js",
      highlight: [[5, 9]],
      caption: "The command event fires on the target: the behaviour lives with the card.",
      action: "Click Save for later; the Saved flag appears on the hero and the menu closes.",
    },
  ],
  fork: [
    "https://codepen.io/web-dot-dev/pen/pvyVyYK",
    "https://codepen.io/web-dot-dev/embed/zxvzyEZ",
    "https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API",
  ],
  fallback: "https://codepen.io/web-dot-dev/pen/pvyVyYK",
  wow: "A working menu on a page with no script for the menu, and DevTools shows it.",
  gotcha:
    "Only <button> invokes, never <a>. Chrome 154 moved light dismiss from pointerdown to click, and exit animations can pop out of the top layer early in Safari and Firefox because overlay is Chrome-only. The menu is placed with anchor positioning, which is the next slide.",
};

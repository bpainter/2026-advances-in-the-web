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
  // The "before" beat: the same card with a hand-rolled menu (docs/demo-plan.md, E3).
  legacy: {
    code: demoCode("popover-commands", [
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
    { id: "popover", kind: "html-attr", element: "div", attr: "popover" },
    { id: "command", kind: "html-attr", element: "button", attr: "command" },
    { id: "starting-style", kind: "css-supports", query: "transition-behavior: allow-discrete" },
  ],
  liveStates: ["open", "dismissed", "saved"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[18, 33]],
      caption: "Today a menu is two functions before it does anything: one to open, one to close.",
      action: "The hand-rolled menu opens under the ••• button.",
      liveState: "open",
      phase: "before",
      target: "#menu",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[40, 57]],
      caption:
        "Esc, click outside, focus return, scroll and resize: a listener each, and each one a bug report.",
      action: "The menu closes and the focus ring lands back on •••.",
      liveState: "dismissed",
      phase: "before",
      target: ".more",
    },
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[8, 16]],
      caption: "And we do the geometry by hand, or ship a positioning library to do it for us.",
      action: "The menu opens again, placed by getBoundingClientRect.",
      liveState: "open",
      phase: "before",
      target: "#menu",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same menu with no script for the menu.",
      action: "The native menu opens from the ••• button, in the top layer.",
      liveState: "open",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Esc and light dismiss are built in, and focus returns to the button.",
      action: "The menu closes; the focus ring is on •••.",
      liveState: "dismissed",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "One custom command adds Save for later; the handler lives on the card.",
      action: "The Saved flag appears on the hero and the menu closes.",
      liveState: "saved",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "index.html",
      highlight: [[8, 14]],
      caption: "A button with commandfor and command. Nothing in JavaScript wires it up.",
      action: "The menu opens; the ••• button is spotlit.",
      liveState: "open",
      target: ".more",
    },
    {
      id: "s2",
      file: "index.html",
      highlight: [[17, 27]],
      caption: "The popover attribute gives you Esc, light dismiss, and focus return.",
      action: "The menu closes and focus returns to •••.",
      liveState: "dismissed",
      target: ".more",
    },
    // prettier-ignore
    {
      id: "s3",
      file: "styles.css",
      highlight: [[24, 30], [40, 46]],
      caption: "@starting-style sets the entry frame; allow-discrete lets display and overlay animate.",
      action: "It opens again: fades and slides in. Firefox snaps closed; overlay is Chrome-only.",
      liveState: "open",
      target: "#menu",
    },
    {
      id: "s4",
      file: "index.html",
      highlight: [[19, 25]],
      caption: "A custom command. The name has to start with two dashes.",
      action: "The Save for later item is spotlit; nothing fires yet.",
      liveState: "open",
      target: "[command='--save']",
    },
    {
      id: "s5",
      file: "app.js",
      highlight: [[5, 9]],
      caption: "The command event fires on the target: the behaviour lives with the card.",
      action: "The Saved flag appears on the hero and the menu closes.",
      liveState: "saved",
      target: ".badge.saved",
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

import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "colour-functions",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("colour-functions", [
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
  // The "before" beat: the same theme computed by a hand-written colour-math helper.
  legacy: {
    code: demoCode("colour-functions", [
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
    { id: "light-dark", kind: "css-supports", query: "color: light-dark(#000, #fff)" },
    { id: "contrast-color", kind: "css-supports", query: "color: contrast-color(red)" },
    { id: "relative-color", kind: "css-supports", query: "color: oklch(from red l c h)" },
    { id: "color-mix", kind: "css-supports", query: "color: color-mix(in oklab, red, blue)" },
  ],
  liveStates: ["yellow", "navy", "dark", "sweep"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[29, 39]],
      caption:
        "Today the button text comes from a luminance formula we copied from WCAG and hope we got right.",
      action: "The brand turns pale yellow and the script flips the button text to black.",
      liveState: "yellow",
      phase: "before",
      target: ".btn",
    },
    // prettier-ignore
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[18, 27], [41, 55]],
      caption: "Hover and hero tints are a hand-written mix() and darken(), written back as inline custom properties.",
      action: "The brand turns navy; the hero tint and the hover colour are recomputed by the script.",
      liveState: "navy",
      phase: "before",
      target: ".hero",
    },
    {
      id: "b3",
      file: "legacy/styles.css",
      highlight: [[16, 25]],
      caption: "Dark mode is a class toggle and a second copy of every token.",
      action: "The page, card and controls go dark; the switch is on.",
      liveState: "dark",
      phase: "before",
      target: ".switch",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same theme with no colour library.",
      action: "The brand turns pale yellow and the button text goes black by itself.",
      liveState: "yellow",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Hover and hero tint derive from the brand in CSS.",
      action: "The brand turns navy; the hero tint follows.",
      liveState: "navy",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "One attribute flips every token.",
      action: "The page, card, picker and switch all go dark.",
      liveState: "dark",
      phase: "after",
    },
    {
      id: "a4",
      highlight: [],
      caption: "Every colour follows the picker, frame by frame.",
      action:
        "The hue sweeps around the wheel for 1.5 s and lands back on blue; the text flips as it goes.",
      liveState: "sweep",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [[41, 45]],
      caption: "contrast-color picks black or white text for whatever the brand is.",
      action: "Pale yellow brand, light scheme; the button text goes black.",
      liveState: "yellow",
      target: ".btn",
    },
    // prettier-ignore
    {
      id: "s2",
      file: "styles.css",
      highlight: [[20, 26], [34, 38]],
      caption: "Relative colour syntax and color-mix: hover and hero tint derive from the brand.",
      action: "Navy brand; the hero tint follows. Standalone, hovering Add to bag darkens it by 0.08 lightness.",
      liveState: "navy",
      target: ".hero",
    },
    // prettier-ignore
    {
      id: "s3",
      file: "styles.css",
      highlight: [[6, 11], [15, 17]],
      caption: "light-dark() swaps with color-scheme. One attribute flips every token and control.",
      action: "Dark flips on; the page, card, picker and switch all follow.",
      liveState: "dark",
      target: ".switch",
    },
    {
      id: "s4",
      file: "app.js",
      highlight: [[5, 7]],
      caption: "The only script: bind the picker to the custom property.",
      action: "The hue sweeps the picker around the wheel and the whole card follows.",
      liveState: "sweep",
      target: "#brand",
    },
  ],
  fork: ["https://una.im/modern-css-theming", "https://daverupert.com/archive/"],
  fallback: "https://una.im/modern-css-theming",
  wow: "A design-system theme with no JavaScript colour library.",
  gotcha:
    "Black or white only, by WCAG 2 ratio, so a mid-tone brand can flip to black text at small sizes. Safari 26.2 changed color-mix()'s default interpolation space to oklab, so write the space explicitly; old screenshots may differ.",
};

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
  requires: [
    { id: "light-dark", kind: "css-supports", query: "color: light-dark(#000, #fff)" },
    { id: "contrast-color", kind: "css-supports", query: "color: contrast-color(red)" },
    { id: "relative-color", kind: "css-supports", query: "color: oklch(from red l c h)" },
    { id: "color-mix", kind: "css-supports", query: "color: color-mix(in oklab, red, blue)" },
  ],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[41, 45]],
      caption: "contrast-color picks black or white text for whatever the brand is.",
      action: "Pick a pale yellow; the button text goes black.",
    },
    // prettier-ignore
    {
      id: "s2",
      file: "styles.css",
      highlight: [[20, 26], [34, 38]],
      caption: "Relative colour syntax and color-mix: hover and hero tint derive from the brand.",
      action: "Pick navy; the hero tint follows. Hover Add to bag; it darkens by 0.08 lightness.",
    },
    // prettier-ignore
    {
      id: "s3",
      file: "styles.css",
      highlight: [[6, 11], [15, 17]],
      caption: "light-dark() swaps with color-scheme. One attribute flips every token and control.",
      action: "Flip Dark; the page, card, picker and switch all follow.",
    },
    {
      id: "s4",
      file: "app.js",
      highlight: [[5, 7]],
      caption: "The only script: bind the picker to the custom property.",
      action: "Drag the picker and watch the whole card follow.",
    },
  ],
  fork: ["https://una.im/modern-css-theming", "https://daverupert.com/archive/"],
  fallback: "https://una.im/modern-css-theming",
  wow: "A design-system theme with no JavaScript colour library.",
  gotcha:
    "Black or white only, by WCAG 2 ratio, so a mid-tone brand can flip to black text at small sizes. Safari 26.2 changed color-mix()'s default interpolation space to oklab, so write the space explicitly; old screenshots may differ.",
};

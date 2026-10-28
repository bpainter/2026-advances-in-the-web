import type { DemoSection } from "@/content/demo-schema";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./f5-what-you-can-delete/files/. */
export const section: DemoSection = {
  id: "f5-what-you-can-delete",
  order: 11,
  label: "What you can delete",
  scenario:
    "TODO rewrite: One table maps each core demo's today plumbing to the libraries it stands in for, with one fresh npm pull and an honest not-yet column.",
  pages: [
    {
      id: "f5-single",
      stage: "single",
      title: "What you can delete",
      intro:
        "TODO rewrite: Each core demo stood in for libraries teams carry today. Here is the list, with the honest exceptions.",
      frame: {
        build: "static",
        route: "/demos/10-delete/static",
        viewport: {
          width: 1304,
          height: 628,
        },
        hooks: ["reset"],
        poster: "/posters/f5-s4.png",
      },
      steps: [
        {
          id: "s0",
          label: "Table header",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
          ],
          bullets: ["TODO rewrite: One row per core demo, and one row that stays."],
        },
        {
          id: "s1",
          label: "Order actions row",
          actions: [
            {
              type: "reveal",
              target: "#row-d1",
            },
          ],
          spotlight: ["#row-d1"],
          bullets: [
            "TODO rewrite: Order actions stood in for dialog and popover components, focus trapping and modal libraries.",
            "TODO rewrite: Floating UI stays until anchor positioning settles.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
        },
        {
          id: "s2",
          label: "Product card and form rows",
          actions: [
            {
              type: "reveal",
              target: "#row-d2",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#row-d3",
            },
          ],
          spotlight: ["#row-d2", "#row-d3"],
          bullets: [
            "TODO rewrite: The product card replaces ResizeObserver element-query code.",
            "TODO rewrite: The support form replaces textarea autosizing scripts.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
        },
        {
          id: "s3",
          label: "Navigation and content rows",
          actions: [
            {
              type: "reveal",
              target: "#row-d4",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#row-d5",
            },
          ],
          spotlight: ["#row-d4", "#row-d5"],
          bullets: [
            "TODO rewrite: Dashboard navigation replaces the click handler and History glue a small router library provides.",
            "TODO rewrite: Rich content keeps DOMPurify and changes how you use it: one reviewed policy instead of scattered calls.",
            "TODO rewrite: The Sanitizer API's setHTML() would remove it, but it is not in Safari as of October.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
        },
        {
          id: "s4",
          label: "Not yet: dates",
          actions: [
            {
              type: "reveal",
              target: "#row-dates",
            },
          ],
          spotlight: ["#row-dates"],
          bullets: [
            "TODO rewrite: Date libraries stay until Temporal reaches Safari.",
            "TODO rewrite: Intl covers formatting today.",
            "TODO rewrite: The counts come from one npm pull this week and include CI and agent installs, so compare ratios between rows.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
        },
      ],
      timing: {
        minutes: 0.75,
      },
      cutPriority: 1,
    },
  ],
  citations: [
    {
      text: "npm last-week downloads (swap the package name); one fresh pull the week of the talk",
      url: "https://api.npmjs.org/downloads/point/last-week/@headlessui/react",
    },
    {
      text: "@headlessui/react 2.2.10 size, 209 KB min / 63 KB gzipped",
      url: "https://bundlephobia.com/api/size?package=@headlessui/react",
    },
    {
      text: "Not yet: Floating UI and Popper, placement solved, interaction not (v2 research section 3)",
      url: "https://api.npmjs.org/downloads/point/last-week/@floating-ui/dom",
    },
    {
      text: "Interop 2026: anchor positioning still a focus area",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Temporal browser status (not in Safari)",
      url: "https://webstatus.dev/features/temporal",
    },
    {
      text: "Intl.DurationFormat Baseline Mar 2025",
      url: "https://webstatus.dev/features/intl-duration-format",
    },
    {
      text: "MDN Trusted Types API (policy wraps a reviewed sanitizer)",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API",
    },
    {
      text: "HTML Sanitizer API (setHTML); Safari pending per v2 research, recheck the week of the talk",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API",
    },
    {
      text: "react-textarea-autosize download count (fresh pull)",
      url: "https://api.npmjs.org/downloads/point/last-week/react-textarea-autosize",
    },
  ],
  cautions: [],
};

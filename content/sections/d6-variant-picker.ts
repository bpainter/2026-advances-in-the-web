import type { DemoSection } from "@/content/demo-schema";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./d6-variant-picker/files/. */
export const section: DemoSection = {
  id: "d6-variant-picker",
  order: 6,
  label: "Variant picker",
  feature: "Customizable select",
  scenario:
    "TODO rewrite: A product editor in the portal. The Color field is a select with a swatch beside each name.",
  support: {
    kind: "web-features",
    id: "customizable-select",
    fallback: {
      missing: ["firefox"],
      text: "a normal select",
    },
  },
  pages: [
    {
      id: "d6-intro",
      stage: "intro",
      intro: "TODO rewrite",
      description: "TODO description",
      visual: {
        src: "/intro/d6-variant-picker.png",
        alt: "TODO alt",
        capture: {
          pageId: "d6-now",
          stepId: "s1",
        },
      },
      steps: [
        {
          id: "s0",
          label: "Title and support",
          actions: [],
          bullets: [],
        },
      ],
      timing: {
        minutes: 0.25,
      },
    },
    {
      id: "d6-used-to",
      stage: "used-to",
      eyebrow: "Customizable select",
      title: "How we used to do it",
      intro: "TODO rewrite",
      frame: {
        build: "today",
        route: "/demos/11-customizable-select/today",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset"],
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "Hand-rolled combobox",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [],
        },
      ],
      timing: {
        minutes: 0.5,
      },
    },
    {
      id: "d6-now",
      stage: "now",
      eyebrow: "Customizable select",
      title: "How we do it now",
      intro: "TODO rewrite",
      frame: {
        build: "native",
        route: "/demos/11-customizable-select/native",
        viewport: {
          width: 640,
          height: 628,
        },
        flags: {
          "enhance-css": true,
        },
        hooks: ["reset"],
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "Plain select",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [],
        },
        {
          id: "s1",
          label: "Select and anchor tiles",
          actions: [
            {
              type: "reveal",
              target: "#tile-select",
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "reveal",
              target: "#tile-anchor",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#tile-select", "#tile-anchor"],
          bullets: [
            "TODO rewrite: Customizable select gives branded product, color, or status pickers with native form semantics.",
            "TODO rewrite: Safari 27 shipped support, but cross-browser details and fallback authoring are still being refined.",
            "TODO rewrite: Anchor positioning covers tooltips, menus, teaching UI, and annotations that follow an anchor.",
            "TODO rewrite: Interop 2026 continues alignment, and recent keyword changes show that details still move.",
          ],
          ifKeyboard: "TODO rewrite: Same. Nothing to operate on this step.",
        },
        {
          id: "s2",
          label: "Open the select teaser",
          actions: [
            {
              type: "reveal",
              target: "#teaser",
            },
            {
              type: "pointer",
              to: "#color",
            },
            {
              type: "click",
              target: "#color",
            },
            {
              type: "assert",
              target: "#color",
              expect: ":open",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#color"],
          bullets: [
            "TODO rewrite: One live teaser, and only one.",
            "TODO rewrite: Customizable select is the strongest visual option because unsupported browsers retain a normal select when the options keep real text.",
            "TODO rewrite: It is still a real select: keyboard, form submission, and validation stay native.",
          ],
          ifKeyboard:
            "TODO rewrite: Tab to the select and press Space, or click it. ArrowDown to Moss and Enter, then open it again.",
        },
        {
          id: "s3",
          label: "Opt in, and keep the text",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#color", "#color option"],
          bullets: [
            "TODO rewrite: Two selectors opt in: the select and its picker.",
            "TODO rewrite: Every option keeps its text next to the swatch.",
            "TODO rewrite: The golden rule, from Saron Yitbarek and Tim Nguyen at WebKit: always provide text content or accessible text attributes for your option elements.",
          ],
          ifKeyboard: "TODO rewrite: Point at the word beside each swatch in the open picker.",
        },
        {
          id: "s4",
          label: "Firefox fallback",
          actions: [
            {
              type: "hook",
              name: "resetTeaser",
            },
            {
              type: "reveal",
              target: "#firefox-poster",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#firefox-poster"],
          bullets: [
            "TODO rewrite: Firefox does not support it yet.",
            "TODO rewrite: It gets a normal select, because every option keeps text, and the color still posts with the form.",
            "TODO rewrite: Safari 27.2 also added ::field-content on 26 October, one more sign the details are still moving.",
          ],
          ifKeyboard:
            "TODO rewrite: If Firefox is on the laptop, open /demos/08-fast-follows/static/select there and show the plain select live instead of the poster.",
        },
      ],
      timing: {
        minutes: 1.5,
      },
    },
  ],
  citations: [
    {
      text: "Yitbarek and Nguyen, The golden rule of Customizable Select, 15 Jun 2026",
      url: "https://webkit.org/blog/18117/the-golden-rule-of-customizable-select/",
    },
    {
      text: "WebKit features for Safari 27.2 (26 Oct 2026): ::field-content; flow-tolerance renamed fit-tolerance",
      url: "https://webkit.org/blog/18515/webkit-features-for-safari-27-2/",
    },
    {
      text: "WebKit features for Safari 27.0: Customizable Select ships",
      url: "https://webkit.org/blog/18325/webkit-features-for-safari-27-0/",
    },
    {
      text: "Customizable select support: Chrome 135, Safari 27, Firefox prefs only",
      url: "https://webstatus.dev/features/customizable-select",
    },
    {
      text: "Opting in loses the native mobile picker sheet",
      url: "https://developer.chrome.com/blog/a-customizable-select",
    },
    {
      text: "WebKit customizable select demos (Tim Nguyen)",
      url: "https://webkit.org/demos/customizable-select/",
    },
    {
      text: "Simmons, Etemad, Stewart, Introducing CSS Grid Lanes, 19 Dec 2025",
      url: "https://webkit.org/blog/17660/introducing-css-grid-lanes/",
    },
    {
      text: "Simmons, Grid Lanes demo",
      url: "https://webkit.org/demos/grid3/",
    },
  ],
  cautions: [
    "TODO rewrite: Keep text in every option.",
    "TODO rewrite: The syntax is still moving. Safari 27.2 added ::field-content.",
    "TODO rewrite: Test the Firefox fallback inside real forms.",
  ],
};

import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./f1-still-in-motion/files/. */
export const section: DemoSection = {
  id: "f1-still-in-motion",
  order: 6,
  label: "Still in motion",
  scenario:
    "Six features worth prototyping now that do not yet get the core demos' production recommendation, with one live teaser: a customizable product color picker that falls back to a normal select.",
  support: {
    tier: "two-engine",
    summary: "Chrome + Safari 27",
    detail:
      "Customizable select: Chrome 135 and Edge 135, Safari 27 (shipped 14 Sep 2026). Firefox: Nightly prefs only; Firefox 153 added parsing groundwork. Not Baseline. Safari 27.2 (26 Oct 2026) added ::field-content. The badge applies to the teaser only; the six tiles carry their own wait signals.",
    missing: ["firefox"],
  },
  pages: [
    {
      id: "f1-single",
      stage: "single",
      title: "Still in motion",
      frame: {
        build: "static",
        route: "/demos/08-fast-follows/static",
        viewport: {
          width: 1296,
          height: 856,
        },
        hooks: ["reset", "resetTeaser"],
        poster: "/posters/f1-firefox-select.png",
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("f1-still-in-motion", "index.html"),
        },
        {
          file: "styles.css",
          lang: "css",
          source: sectionFile("f1-still-in-motion", "styles.css"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Empty grid",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
          ],
          notes: "Six tiles are coming. Each one has a feature, a real use, and one wait signal.",
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
          spotlight: ["#tile-select", "#tile-anchor"],
          notes:
            "Customizable select gives branded product, color, or status pickers with native form semantics. Safari 27 shipped support, but cross-browser details and fallback authoring are still being refined. Anchor positioning covers tooltips, menus, teaching UI, and annotations that follow an anchor. Interop 2026 continues alignment, and recent keyword changes show that details still move.",
          ifKeyboard: "Same. Nothing to operate on this step.",
        },
        {
          id: "s2",
          label: "Grid Lanes and cross-document tiles",
          actions: [
            {
              type: "reveal",
              target: "#tile-grid-lanes",
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "reveal",
              target: "#tile-xdoc-vt",
            },
          ],
          spotlight: ["#tile-grid-lanes", "#tile-xdoc-vt"],
          notes:
            "Grid Lanes gives masonry-style editorial and product collections with logical tab order. Safari 27.2 renamed flow-tolerance to fit-tolerance on 26 October while the specification evolves, and Jeremy Keith already runs Grid Lanes on The Session behind @supports, with a carousel everywhere else. Cross-document view transitions polish moves between server-rendered pages. Same-document transitions are usable, while cross-document behavior remains an Interop 2026 focus.",
          ifKeyboard:
            "Same. If there is time, open thesession.org/events/11446 in Safari, then in Chrome.",
        },
        {
          id: "s3",
          label: "Scroll-driven and registries tiles",
          actions: [
            {
              type: "reveal",
              target: "#tile-scroll-driven",
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "reveal",
              target: "#tile-scoped-registries",
            },
          ],
          spotlight: ["#tile-scroll-driven", "#tile-scoped-registries"],
          notes:
            "Scroll-driven animations tie progress indicators and restrained content reveals to scroll. Interop work is still closing cross-browser differences. Scoped custom element registries let two versions of a design-system component live on one page. The feature is in Interop 2026 and is not yet a broad production default.",
          ifKeyboard: "Same.",
        },
        {
          id: "s4",
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
          spotlight: ["#color"],
          notes:
            "One live teaser, and only one. Customizable select is the strongest visual option because unsupported browsers retain a normal select when the options keep real text. It is still a real select: keyboard, form submission, and validation stay native.",
          ifKeyboard:
            "Tab to the select and press Space, or click it. ArrowDown to Moss and Enter, then open it again.",
        },
        {
          id: "s5",
          label: "Opt in, and keep the text",
          actions: [],
          spotlight: ["#color", "#color option"],
          code: {
            file: "styles.css",
            lines: [[1, 4]],
          },
          notes:
            "Two selectors opt in: the select and its picker. Every option keeps its text next to the swatch. The golden rule, from Saron Yitbarek and Tim Nguyen at WebKit: always provide text content or accessible text attributes for your option elements.",
          ifKeyboard: "Point at the word beside each swatch in the open picker.",
        },
        {
          id: "s6",
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
          spotlight: ["#firefox-poster"],
          notes:
            "Firefox does not support it yet. It gets a normal select, because every option keeps text, and the color still posts with the form. Safari 27.2 also added ::field-content on 26 October, one more sign the details are still moving.",
          ifKeyboard:
            "If Firefox is on the laptop, open /demos/08-fast-follows/static/select there and show the plain select live instead of the poster.",
        },
        {
          id: "s7",
          label: "The rule",
          actions: [
            {
              type: "reveal",
              target: "#rule",
            },
          ],
          spotlight: ["#rule"],
          notes:
            "Prototype now, verify in Baseline and Interop, then move it into the main demo set when support and syntax settle.",
          ifKeyboard: "Same.",
        },
      ],
      notes: {
        open: "These are worth learning and prototyping. They should not receive the same production recommendation as the five core demos until syntax, implementation, and the team's support target line up.",
        bridge:
          "The browser is not the only thing that moved this year. The framework section solves one production problem deeply, and that problem is caching.",
      },
      timing: {
        minutes: 2,
        cumulative: 22.75,
      },
    },
  ],
  citations: [
    {
      text: "Andrew, Interop 2026: anchor positioning, dialogs and popovers, scroll-driven animations, view transitions, scoped custom element registries as focus areas",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "WebDX Community Group, Baseline 2026",
      url: "https://web.dev/baseline/2026",
    },
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
      text: "Firefox 153 parsing groundwork",
      url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/153",
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
      text: "Keith, Enhancing with CSS Grid Lanes, 16 Jun 2026",
      url: "https://adactio.com/journal/22613",
    },
    {
      text: "The Session event page with Grid Lanes (view in Safari)",
      url: "https://thesession.org/events/11446",
    },
    {
      text: "Simmons, Etemad, Stewart, Introducing CSS Grid Lanes, 19 Dec 2025",
      url: "https://webkit.org/blog/17660/introducing-css-grid-lanes/",
    },
    {
      text: "Simmons, Grid Lanes demo",
      url: "https://webkit.org/demos/grid3/",
    },
    {
      text: "Matuzović, Your Grid Lanes will likely fail WCAG 2.4.3, 24 Jun 2026",
      url: "https://www.matuzo.at/blog/2026/grid-lanes-accessibility",
    },
  ],
  cautions: [
    "They should not receive the same production recommendation as the five core demos until syntax, implementation, and the team's support target line up.",
  ],
};

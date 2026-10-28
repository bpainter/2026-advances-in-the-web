import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

const TODAY = "demos/11-customizable-select/today";

/** D6: a hand-rolled combobox, then a customizable select that falls back to a normal one (PRD v4, 2.2). */
export const section: DemoSection = {
  id: "d6-variant-picker",
  order: 6,
  label: "Variant picker",
  feature: "Customizable select",
  scenario:
    "A product editor's Color field shows a swatch beside each name and still posts the color.",
  support: {
    kind: "web-features",
    id: "customizable-select",
    fallback: { missing: ["firefox"], text: "a normal select" },
  },
  pages: [
    {
      id: "d6-intro",
      stage: "intro",
      intro:
        "Our last core demo is a product editor. The Color field shows a swatch beside each name. Firefox does not support this yet, and it still gets a working form.",
      description:
        "Customizable select lets you style a real select, with any content inside each option.",
      visual: {
        src: "/intro/d6-variant-picker.png",
        alt: "The product editor with the color picker open, showing a swatch beside each color.",
        capture: { pageId: "d6-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d6-used-to",
      stage: "used-to",
      eyebrow: "Customizable select",
      title: "How we used to do it",
      intro:
        "The Color field shows a swatch beside each name. Teams built their own select for that.",
      frame: {
        build: "today",
        route: "/demos/11-customizable-select/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[11, 34]]),
        excerpt(`${TODAY}/styles.css`, "css", [[10, 35]]),
        excerpt(`${TODAY}/combobox.js`, "js", [[133, 170]]),
      ],
      steps: [
        {
          id: "s0",
          label: "The custom field",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Build the field",
          actions: [{ type: "pointer", to: "#t-color" }],
          code: { file: "index.html", lines: [6, 16, [20, 24]] },
          spotlight: ["#t-color"],
          bullets: ["The select is a div with a combobox role, a list and a hidden input."],
        },
        {
          id: "s2",
          label: "Open the list",
          actions: [
            { type: "click", target: "#t-color" },
            { type: "assert", target: "#t-color-list", expect: "visible" },
          ],
          code: {
            file: "styles.css",
            lines: [
              [16, 19],
              [25, 27],
            ],
          },
          spotlight: ["#t-color", "#t-color-list"],
          bullets: ["CSS lifts the list above the page and hides it when closed."],
        },
        {
          id: "s3",
          label: "Choose Moss",
          key: true,
          actions: [
            {
              type: "key",
              key: "ArrowDown",
              target: "#t-color",
              via: "dispatch(keydown) on the combobox; the today build listens in JavaScript",
            },
            {
              type: "key",
              key: "Enter",
              target: "#t-color",
              via: "dispatch(keydown) on the combobox",
            },
            { type: "assert", target: "#t-color", expect: "contains:Moss" },
          ],
          code: {
            file: "combobox.js",
            lines: [
              [8, 11],
              [18, 25],
            ],
          },
          spotlight: ["#t-color"],
          ifKeyboard: "Press Arrow Down, then Enter. Then press Next once to sync the frame.",
          meter: {
            label: "JavaScript",
            value: "127 lines",
            source: "non-blank, non-comment lines in /demos/11-customizable-select/today/*.js",
          },
          bullets: [
            "Arrow Down and Enter pick Moss.",
            "Script handles every key, the outside click and the form value: 127 lines.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d6-now",
      stage: "now",
      eyebrow: "Customizable select",
      title: "How we do it now",
      intro:
        "This is a real select with the same swatches. It starts plain, the way every browser draws it.",
      frame: {
        build: "native",
        route: "/demos/11-customizable-select/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-css": false },
        hooks: ["reset", "showFirefox"],
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d6-variant-picker", "index.html"),
        },
        { file: "select.css", lang: "css", source: sectionFile("d6-variant-picker", "select.css") },
        { file: "app.js", lang: "js", source: sectionFile("d6-variant-picker", "app.js") },
      ],
      steps: [
        {
          id: "s0",
          label: "Plain select",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Opt in",
          actions: [{ type: "toggle", flag: "enhance-css", on: true }],
          code: { file: "select.css", lines: [[1, 4]] },
          spotlight: ["#color"],
          bullets: [
            "Four lines of CSS turn the plain select into a custom one.",
            "Appearance base-select lets us style the select and its picker.",
            "The button now shows the swatch beside the name.",
          ],
        },
        {
          id: "s2",
          label: "Open the picker",
          actions: [
            { type: "pointer", to: "#color" },
            { type: "click", target: "#color" },
          ],
          code: {
            file: "index.html",
            lines: [
              [6, 9],
              [14, 17],
            ],
          },
          spotlight: ["#color"],
          ifKeyboard:
            "Click the select to open the live picker. Then press Next once to sync the frame.",
          bullets: [
            "The picker opens, and each option shows a swatch beside its name.",
            "The selectedcontent element copies the chosen option into the button.",
          ],
        },
        {
          id: "s3",
          label: "Choose Moss",
          key: true,
          actions: [
            { type: "click", target: "#color" },
            { type: "focus", target: "#color", visible: true },
            {
              type: "key",
              key: "ArrowDown",
              target: "#color",
              via: "select.next()/.prev(): selectedIndex + 1, then input and change events",
            },
          ],
          code: { file: "index.html", lines: [[14, 17]] },
          spotlight: ["#color"],
          ifKeyboard: "Tab to Color and press Arrow Down. Then press Next once to sync the frame.",
          bullets: [
            "Arrow Down picks Moss, and the button shows its swatch.",
            "The keyboard works because this is still a select. We wrote no key handling.",
          ],
        },
        {
          id: "s4",
          label: "Save the color",
          actions: [
            { type: "pointer", to: "#variant > button" },
            { type: "click", target: "#variant > button" },
            { type: "wait", ms: 400 },
            { type: "assert", target: "#status", expect: "contains:color=moss" },
          ],
          code: { file: "app.js", lines: [[6, 15]] },
          spotlight: ["#status"],
          meter: {
            label: "JavaScript",
            value: "10 lines",
            source: "non-blank, non-comment lines in content/sections/d6-variant-picker/files/*.js",
          },
          bullets: [
            "Save posts the form. The server got color equals moss.",
            "The select is a real form control, so the value posts with no extra code.",
          ],
        },
        {
          id: "s5",
          label: "Firefox",
          actions: [{ type: "hook", name: "showFirefox" }],
          code: { file: "select.css", lines: [[1, 4]] },
          spotlight: ["#firefox-capture"],
          proof: "Show the Firefox fallback: a normal select that still posts the chosen color.",
          ifKeyboard:
            "Open the frame in Firefox on the laptop instead, choose Moss and press Save.",
          bullets: [
            "This is the same form in Firefox. It shows a normal select.",
            "Save still posts the color. Every browser gets a working form.",
          ],
        },
      ],
      timing: { minutes: 1.5 },
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
    "Keep real text in every option. A browser that cannot style the select shows only the text.",
    "The syntax is still moving. Safari 27.2 added the field-content pseudo-element in October.",
    "Test the Firefox fallback inside your real forms before you ship.",
  ],
};

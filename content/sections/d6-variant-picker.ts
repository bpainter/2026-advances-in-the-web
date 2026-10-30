import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/11-customizable-select/today";

/** D6: a hand-rolled combobox, then a customizable select that falls back to a normal one (PRD v4, 2.2). */
export const section: DemoSection = {
  id: "d6-variant-picker",
  background: "d6",
  order: 6,
  label: "Variant picker",
  feature: "Customizable select",
  scenario:
    "The Color field shows a photo beside each name and still posts the color.",
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
        "A customer needs to choose a color. We’d like to show the color name and a small image.\n\nThat design request often sends us straight to a custom dropdown. Then we inherit all the behavior of a select control too.\n\nCustomizable select lets us keep more of the native control while changing its appearance. Support still needs care, so the ordinary select remains important.",
      description:
        "Customizable select lets you style a real select, with any content inside each option.",
      visual: {
        src: "/intro/d6-variant-picker.png",
        alt: "The product editor with the color picker open, showing a photo beside each color.",
        capture: { pageId: "d6-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d6-used-to",
      stage: "used-to",
      eyebrow: "Customizable select",
      title: "What we used to do",
      intro:
        "Here’s the custom color picker.\n\nIt looks like a select, but underneath it, we’ve built our own control.",
      frame: {
        build: "today",
        route: "/demos/11-customizable-select/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[11, 34]]),
        excerpt(`${TODAY}/styles.css`, "css", [[10, 35]]),
        excerpt(`${TODAY}/combobox.js`, "js", [[134, 171]]),
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
          bullets: [
            "We have a combobox, a list of options, and a hidden input to carry the selected value into the form.",
            "Now those pieces have to agree about what’s selected.",
          ],
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
          bullets: [
            "Open the picker.",
            "We handle its position, size, open state, and what happens when it gets close to the edge of the screen.",
          ],
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
            value: "128 lines",
            source: "non-blank, non-comment lines in /demos/11-customizable-select/today/*.js",
          },
          bullets: [
            "Choose a color with the keyboard.",
            "Arrow keys, Enter, focus, and typing to find an option all need attention. The demo counts 128 lines of JavaScript in this version.",
            "The picture in the option was the easy part.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d6-now",
      stage: "now",
      eyebrow: "Customizable select",
      title: "What we can do today",
      intro:
        "Start with a real `select` and real options.\n\nWithout the enhanced styling, the user still has a working color field. The form still has a value to submit.",
      frame: {
        build: "native",
        route: "/demos/11-customizable-select/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-css": false },
        hooks: ["reset", "showFirefox"],
      },
      files: [
        sectionCode("d6-variant-picker", "index.html", "html"),
        sectionCode("d6-variant-picker", "select.css", "css"),
        sectionCode("d6-variant-picker", "app.js", "js"),
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
            "Now opt into the customizable appearance with `base-select`.",
            "We can style the control and its picker rather than replacing the whole interaction with separate elements.",
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
            "The options can include the color image and label. `selectedcontent` displays the chosen option’s content in the button.",
            "The text still needs to make sense on its own. The image shouldn’t be the only way someone can tell the options apart.",
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
            "Choose Moss and watch the selected content update.",
            "The browser manages the selection. We still test actual keyboard and assistive-technology behavior on the browsers we support.",
            "A scripted selection in a demo isn’t a substitute for that test.",
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
            "Check the submitted form data.",
            "We get the value `moss`, just as we’d expect from a normal select. We don’t need a hidden field to keep a separate custom control in sync.",
            "The remaining JavaScript handles the request, not the picker.",
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
            "*Show the Firefox capture identified in the deck.*",
            "Here’s the Firefox capture for this example, rather than a live browser switch.",
            "The important fallback is still the ordinary select. We can add the richer appearance where it works without making color selection depend on it.",
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
    {
      text: "MDN compatibility: base-select",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/appearance.json",
    },
    {
      text: "MDN compatibility: selectedcontent",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/selectedcontent.json",
    },
  ],
  cautions: [
    "Keep real text in every option. A browser that cannot style the select shows only the text.",
    "The syntax is still moving. Safari 27.2 added the field-content pseudo-element in October.",
    "Test the Firefox fallback inside your real forms before you ship.",
  ],
};

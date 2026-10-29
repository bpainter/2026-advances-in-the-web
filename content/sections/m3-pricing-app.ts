import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/14-scoped-registries/today";

/**
 * M3: two versions of one design system on the product editor's Pricing tab
 * (docs/design/still-in-motion-demos.md 6). Used to: the pricing app in an iframe with a message
 * bridge. Now: the app inline with its own scoped custom element registry. Ridge UI v2 and v3 and
 * the tiers app are unshown modules shared by both builds (demos/14-scoped-registries/native-extra).
 */
export const section: DemoSection = {
  id: "m3-pricing-app",
  background: "m3",
  order: 9,
  label: "Pricing app",
  group: "still-in-motion",
  feature: "Scoped custom element registries",
  scenario: "Another team's pricing app runs on the editor's pricing tab, on a newer design system.",
  // web-features 3.44.0 predates Firefox 159 (27 Oct 2026); remove the fallback after the bump (3.4).
  support: {
    kind: "web-features",
    id: "scoped-custom-element-registries",
    fallback: { missing: ["firefox"], text: "the iframe version" },
  },
  pages: [
    {
      id: "m3-intro",
      stage: "intro",
      intro:
        "Next is the product editor's pricing tab. Another team's pricing app plugs into it. Both use our price field, in different versions.",
      description: "Scoped registries let two versions of the same custom element run on one page.",
      visual: {
        src: "/intro/m3-pricing-app.png",
        alt: "The product editor pricing tab with the tiered pricing app inline below the base price.",
        capture: { pageId: "m3-now", stepId: "s1" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
      cutPriority: 4,
    },
    {
      id: "m3-used-to",
      stage: "used-to",
      eyebrow: "Scoped custom element registries",
      title: "What we used to do",
      intro: "The editor and a pricing app both use the price field. They need different versions.",
      frame: {
        build: "today",
        route: "/demos/14-scoped-registries/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "loadApp", "addTier", "blurField"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[1, 24]]),
        excerpt(`${TODAY}/styles.css`, "css", [[1, 8]]),
        excerpt(`${TODAY}/bridge.js`, "js", [[1, 40]]),
        excerpt(`${TODAY}/app-bridge.js`, "js", [[1, 31]]),
      ],
      steps: [
        {
          id: "s0",
          label: "The framed app",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Load the pricing app",
          actions: [
            { type: "hook", name: "loadApp" },
            { type: "wait", ms: 400 },
            { type: "assert", target: "#t-app-frame", expect: "visible" },
          ],
          code: { file: "index.html", lines: [[13, 19]] },
          spotlight: ["#t-app-frame"],
          bullets: ["A tag name can be defined once per page. So the app runs in an iframe."],
        },
        {
          id: "s2",
          label: "Add a tier",
          actions: [
            { type: "hook", name: "addTier" },
            { type: "wait", ms: 300 },
          ],
          code: { file: "styles.css", lines: [[4, 8]] },
          spotlight: ["#t-app-frame"],
          bullets: ["Add tier grows the app. The iframe keeps its fixed height and scrolls."],
        },
        {
          id: "s3",
          label: "Change the base price",
          key: true,
          actions: [
            { type: "type", target: "#t-base-price input", text: "148" },
            { type: "wait", ms: 300 },
            { type: "hook", name: "blurField" },
            { type: "assert", target: "#t-app-frame", expect: "contains:148" },
          ],
          code: {
            file: "bridge.js",
            lines: [
              [14, 17],
              [28, 32],
            ],
          },
          // The field, not its 466 px row, so the two rings stay apart (review r6 motion M7).
          spotlight: ["#t-base-price input", "#t-app-frame"],
          // Like with like (review r6 motion M8): both meters count the code that connects the app
          // to the editor. Here, the message bridge on both sides; the app's own setup is left out.
          meter: {
            label: "JavaScript",
            value: "26 lines",
            source:
              "lines that connect the app to the editor in /demos/14-scoped-registries/today: the message bridge in bridge.js and app-bridge.js at printWidth 80, counted by hand",
          },
          bullets: [
            "A new base price reaches the app as a message.",
            "Script sends messages both ways and checks each origin: 26 lines.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
      cutPriority: 4,
    },
    {
      id: "m3-now",
      stage: "now",
      eyebrow: "Scoped custom element registries",
      title: "What we can do today",
      intro: "This is the same editor with no iframe. The app brings its own registry.",
      frame: {
        build: "native",
        route: "/demos/14-scoped-registries/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-js": true },
        hooks: ["reset", "loadApp", "addTier", "blurField"],
      },
      files: [
        sectionCode("m3-pricing-app", "index.html", "html"),
        sectionCode("m3-pricing-app", "pricing-app.js", "js"),
      ],
      steps: [
        {
          id: "s0",
          label: "Same editor",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Load the pricing app",
          actions: [
            { type: "hook", name: "loadApp" },
            { type: "wait", ms: 300 },
            { type: "assert", target: "#pricing-app", expect: "visible" },
          ],
          code: { file: "pricing-app.js", lines: [[8, 17]] },
          spotlight: ["#pricing-app"],
          bullets: [
            "The pricing app loads inside the page with version 3 fields.",
            "A registry maps tag names to components. The app creates its own.",
            "The editor's price field is still version 2.",
          ],
        },
        {
          id: "s2",
          label: "Add a tier",
          actions: [
            { type: "hook", name: "addTier" },
            { type: "wait", ms: 300 },
          ],
          code: { file: "pricing-app.js", lines: [[19, 24]] },
          spotlight: ["#pricing-app"],
          bullets: [
            "Add tier grows the app, and the page makes room.",
            "A shadow root is a component's private markup.",
            "This one uses the app's registry. Both versions work side by side.",
          ],
        },
        {
          id: "s3",
          label: "Change the base price",
          key: true,
          actions: [
            { type: "type", target: "#base-price input", text: "148" },
            { type: "wait", ms: 300 },
            { type: "hook", name: "blurField" },
            { type: "assert", target: "#pricing-app", expect: "contains:148" },
          ],
          code: { file: "pricing-app.js", lines: [[28, 32]] },
          spotlight: ["#base-price input", "#pricing-app"],
          // Like with like (review r6 motion M8): the code that connects the app to the editor, as on
          // the used-to page. The registry, the shadow root and the event listener; the app's own
          // setup and the iframe fallback are left out.
          meter: {
            label: "JavaScript",
            value: "9 lines",
            source:
              "lines that connect the app to the editor in content/sections/m3-pricing-app/files/pricing-app.js: the registry, the shadow root and the event listener at printWidth 80, counted by hand",
          },
          bullets: [
            "A new base price updates every tier.",
            "The app hears a normal DOM event. No messages, no origin checks.",
            "Two versions share one page. We deleted the iframe and the bridge.",
          ],
        },
      ],
      timing: { minutes: 1.25 },
      cutPriority: 4,
    },
  ],
  citations: [
    {
      text: "MDN, Firefox 159 release notes (27 Oct 2026): scoped custom element registries",
      url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159",
    },
    {
      text: "Interop 2026: scoped custom element registries focus area",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Chrome for Developers, Make custom elements behave with scoped registries, 9 Mar 2026: on by default from Chrome 146",
      url: "https://developer.chrome.com/blog/scoped-registries",
    },
    {
      text: "WebKit Features in Safari 26.0, 15 Sep 2025: scoped custom element registries",
      url: "https://webkit.org/blog/17333/webkit-features-in-safari-26-0/",
    },
    {
      text: "binvisions, Scoped Custom Element Registries, 22 Aug 2026 (its Firefox just caught up section covers Nightly, before the stable release)",
      url: "https://www.binvisions.com/articles/scoped-custom-element-registries/",
    },
    {
      text: "webstatus.dev, scoped custom element registries (3.44.0 predates Firefox 159; the intro uses a fallback until the bump)",
      url: "https://webstatus.dev/features/scoped-custom-element-registries",
    },
  ],
  cautions: [
    "Older browsers throw on the registry constructor. Keep the iframe build as a fallback.",
    "Each version ships its own code. Two versions make a heavier page.",
    "Use this to buy time. Plan to move both teams to one version.",
  ],
};

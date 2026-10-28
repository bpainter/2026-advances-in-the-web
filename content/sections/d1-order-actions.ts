import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

const TODAY = "demos/01-layered-ui/today";

/** D1: a hand-rolled menu and modal, then popover, dialog and invoker commands. Shown native files live in ./d1-order-actions/files/. */
export const section: DemoSection = {
  id: "d1-order-actions",
  background: "d1",
  order: 1,
  label: "Order actions",
  feature: "Dialog element",
  scenario:
    "An order row has an Actions menu. Cancel order asks first, returns focus, and calls the server only after you confirm.",
  support: { kind: "web-features", id: "dialog", alsoUses: ["popover", "invoker-commands"] },
  pages: [
    {
      id: "d1-intro",
      stage: "intro",
      intro:
        "Our first demo is an order list where each order has an Actions menu. Cancel order asks you to confirm first. We build it the old way, then the way browsers allow now.",
      description:
        "The dialog element gives you a confirm box, with focus and Escape handled for you.",
      visual: {
        src: "/intro/d1-order-actions.png",
        alt: "The order portal with the cancel dialog open.",
        capture: { pageId: "d1-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d1-used-to",
      stage: "used-to",
      eyebrow: "Dialog element",
      title: "How we used to do it",
      intro:
        "This is an order list, and Cancel order asks you to confirm first. Here is how teams commonly build it. The code lights up as the demo plays.",
      frame: {
        build: "today",
        route: "/demos/01-layered-ui/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset"],
        poster: "/posters/d1-today.png",
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[2, 20]]),
        excerpt(`${TODAY}/styles.css`, "css", [
          [27, 32],
          [38, 57],
        ]),
        excerpt(`${TODAY}/menu.js`, "js", [
          [112, 130],
          [221, 233],
        ]),
        excerpt(`${TODAY}/modal.js`, "js", [
          [101, 114],
          [123, 129],
          [182, 188],
        ]),
      ],
      steps: [
        {
          id: "s0",
          label: "The old row",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Open the menu",
          actions: [
            { type: "pointer", to: "#t-actions" },
            { type: "click", target: "#t-actions" },
            { type: "assert", target: "#t-menu", expect: "visible" },
          ],
          code: { file: "index.html", lines: [[7, 15], 19] },
          spotlight: ["#t-actions", "#t-menu"],
          bullets: [
            "The Actions button opens the menu. Script builds it in an empty box at the end of the page.",
          ],
        },
        {
          id: "s2",
          label: "Open the confirm box",
          actions: [
            { type: "pointer", to: "#t-cancel" },
            { type: "click", target: "#t-cancel" },
            { type: "assert", target: "#t-modal", expect: "visible" },
          ],
          code: { file: "styles.css", lines: [5, 11, 18, 23] },
          spotlight: ["#t-modal", "#t-backdrop"],
          bullets: [
            "Cancel order opens a confirm box over a dark backdrop. The CSS needs four z-index numbers to stack it.",
          ],
        },
        {
          id: "s3",
          label: "Close with Escape",
          key: true,
          actions: [
            {
              type: "key",
              key: "Escape",
              target: "#t-modal",
              via: "dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); the today build listens in JavaScript",
            },
            { type: "assert", target: "#t-actions", expect: "focused" },
          ],
          code: { file: "modal.js", lines: [[12, 14], [17, 22], 30] },
          spotlight: ["#t-actions"],
          meter: {
            label: "JavaScript",
            value: "404 lines",
            source: "non-blank, non-comment lines in /demos/01-layered-ui/today/*.js",
          },
          bullets: [
            "Escape closes the box, and focus goes back to Actions.",
            "Script handles Escape, keeps Tab inside the box and returns focus. That is 404 lines to maintain.",
          ],
          ifKeyboard: "Press Escape. Then press Next once to sync the frame.",
        },
      ],
      timing: { minutes: 0.75 },
    },
    {
      id: "d1-now",
      stage: "now",
      eyebrow: "Dialog element",
      title: "How we do it now",
      intro:
        "This is the same order row, built from HTML the browser understands. The menu is a popover. The confirm box is a dialog.",
      frame: {
        build: "native",
        route: "/demos/01-layered-ui/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-css": true },
        hooks: ["reset"],
        poster: "/posters/d1-now.png",
      },
      files: [
        { file: "index.html", lang: "html", source: sectionFile("d1-order-actions", "index.html") },
        {
          file: "enhance.css",
          lang: "css",
          source: sectionFile("d1-order-actions", "enhance.css"),
        },
        { file: "app.js", lang: "js", source: sectionFile("d1-order-actions", "app.js") },
      ],
      steps: [
        {
          id: "s0",
          label: "Same row",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Open the menu",
          actions: [
            { type: "pointer", to: "#actions-418" },
            { type: "click", target: "#actions-418" },
            { type: "assert", target: "#order-actions-418", expect: ":popover-open" },
          ],
          code: { file: "index.html", lines: [[6, 10]] },
          spotlight: ["#actions-418", "#order-actions-418"],
          bullets: [
            "The Actions button opens the menu again.",
            "A popover is a layer that shows above the page. The popover attribute makes this menu one.",
            "We need no z-index and no empty box at the end of the page.",
          ],
        },
        {
          id: "s2",
          label: "Open the dialog",
          actions: [
            { type: "pointer", to: '[commandfor="cancel-418"]' },
            { type: "click", target: '[commandfor="cancel-418"]' },
            { type: "assert", target: "#cancel-418", expect: ":open" },
            { type: "assert", target: '#cancel-418 button[value="cancel"]', expect: "focused" },
          ],
          code: { file: "index.html", lines: [[11, 16], 28] },
          spotlight: ['[commandfor="cancel-418"]', "#cancel-418"],
          bullets: [
            "Cancel order opens the dialog. Focus lands on Keep order, the safe choice.",
            "The command attribute tells the button what to do. Here it opens the dialog.",
            "The page behind waits until you answer. That is what modal means.",
          ],
        },
        {
          id: "s3",
          label: "Close with the keyboard",
          key: true,
          actions: [
            {
              type: "key",
              key: "Enter",
              target: '#cancel-418 button[value="cancel"]',
              via: "click() on the focused button",
            },
            { type: "assert", target: '[commandfor="cancel-418"]', expect: "focused" },
            {
              type: "key",
              key: "Escape",
              target: "#order-actions-418",
              via: "hidePopover() on the menu (the same close request Escape sends)",
            },
            { type: "assert", target: "#actions-418", expect: "focused" },
          ],
          code: { file: "index.html", lines: [[17, 27]] },
          spotlight: ["#cancel-418 form", "#actions-418"],
          proof: "Close and return focus with the keyboard only.",
          bullets: [
            "Enter picks Keep order. Escape closes the menu. Focus is back on the Actions button.",
            "The form uses method dialog, so its buttons close the dialog.",
            "The browser moves focus back for us. We wrote no code for it.",
          ],
          ifKeyboard: "Press Enter, then Escape. Press Next once to sync the frame.",
        },
        {
          id: "s4",
          label: "Confirm the cancel",
          actions: [
            { type: "pointer", to: "#actions-418" },
            { type: "click", target: "#actions-418" },
            { type: "click", target: '[commandfor="cancel-418"]' },
            { type: "pointer", to: '#cancel-418 button[value="confirm"]' },
            { type: "click", target: '#cancel-418 button[value="confirm"]' },
            { type: "wait", ms: 300 },
            { type: "assert", target: "#status", expect: "contains:Order 418 was canceled" },
          ],
          code: {
            file: "app.js",
            lines: [
              [9, 14],
              [26, 28],
            ],
          },
          spotlight: ["#status"],
          meter: {
            label: "JavaScript",
            value: "20 lines",
            source: "non-blank, non-comment lines in content/sections/d1-order-actions/files/*.js",
          },
          bullets: [
            "This time we confirm. The status line says Order 418 was canceled.",
            "This is the only JavaScript on the page. It waits for the dialog to close.",
            "If the answer is confirm, it calls the server. That is 20 lines.",
          ],
        },
        {
          id: "s5",
          label: "Styles off",
          actions: [
            { type: "toggle", flag: "enhance-css", on: false },
            { type: "assert", target: "#order-actions-418", expect: ":popover-open" },
          ],
          code: { file: "enhance.css", lines: [], off: true },
          spotlight: ["#order-actions-418"],
          proof: "Remove the enhancement CSS and show that the controls remain semantic and usable.",
          bullets: [
            "The CSS file is off. The menu loses its place under the button.",
            "It still opens, closes and moves focus. The CSS only sets place and motion.",
          ],
        },
      ],
      timing: { minutes: 2.0 },
    },
  ],
  citations: [
    {
      text: 'Coyier, 6 Jan 2025: "No JavaScript is required to make the opening and closing of a popover work."',
      url: "https://blog.master.dev/bone-up-html-2025/",
    },
    {
      text: 'shopify.com view-source, 26 Oct 2026: popoverTarget plus popover="auto" on the region picker (recapture the week of the talk)',
      url: "https://shopify.com/",
    },
    {
      text: 'vercel.com view-source, 26 Oct 2026: popover="manual" menu',
      url: "https://vercel.com/",
    },
    {
      text: "GitHub Primer: ActionList uses popover (PR #2378); Dialog uses <dialog> internally (PR #2496)",
      url: "https://raw.githubusercontent.com/primer/view_components/main/CHANGELOG.md",
    },
    {
      text: "MDN: Invoker Commands API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API",
    },
    {
      text: "Popover Baseline 27 Jan 2025",
      url: "https://webstatus.dev/features/popover",
    },
    {
      text: "Invoker commands Baseline 12 Dec 2025 (Chrome 135, Firefox 144, Safari 26.2)",
      url: "https://webstatus.dev/features/invoker-commands",
    },
    {
      text: ":open Baseline 11 May 2026",
      url: "https://webstatus.dev/features/open-pseudo",
    },
    {
      text: "dialog Baseline Widely, 14 Sep 2024 (web-features 3.44.0)",
      url: "https://unpkg.com/web-features/data.json",
    },
    {
      text: "@headlessui/react 2.2.10: 209 KB min / 63 KB gzipped (mid-2026 pull; refresh)",
      url: "https://bundlephobia.com/api/size?package=@headlessui/react",
    },
    {
      text: "@radix-ui/react-popover 1.3.1: 68 KB min / 23 KB gzipped (mid-2026 pull; refresh)",
      url: "https://bundlephobia.com/api/size?package=@radix-ui/react-popover",
    },
    {
      text: "Interop 2026 names dialogs and popovers and anchor positioning as focus areas",
      url: "https://web.dev/blog/interop-2026",
    },
  ],
  cautions: [
    "Use a dialog when the user must answer. Use a popover when they can ignore it.",
    "Check permission on the server. The dialog does not protect your data.",
    "Test with a screen reader. Browser support does not prove the page is accessible.",
  ],
};

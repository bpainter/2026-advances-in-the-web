import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

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
        "Let’s start with an order screen. Open the actions, choose cancel, and ask the user to confirm.\n\nNothing unusual. But a custom version needs positioning, keyboard handling, focus management, and rules for what happens behind the dialog.\n\nThe dialog element, popovers, and declarative button commands can take over a lot of that work. They’re separate features, so their support needs to be checked separately too.",
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
      title: "What we used to do",
      intro:
        "Here’s the order. The actions are hidden until we need them.\n\nThe interaction looks small. The work behind it is less small.",
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
            "Open the actions.",
            "Our code moves the menu outside the table so it doesn’t get clipped. Then it has to keep the menu lined up with the button.",
            "We haven’t canceled anything yet. We’re still working on where the menu goes.",
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
            "Now choose cancel.",
            "We need a backdrop, a dialog, and the right stacking order. The dialog has to sit above the menu and the rest of the page.",
            "That’s where the increasingly large `z-index` numbers tend to appear.",
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
            "Now add the keyboard behavior. Escape should close the right thing. Focus should stay in the modal, then return to a useful place when it closes.",
            "The background shouldn’t remain interactive either.",
            "The demo counts 404 lines of JavaScript in this version. That’s a count for this example, not every dialog. But it shows how much code can sit behind a familiar interaction.",
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
      title: "What we can do today",
      intro:
        "Same order. Same task. We’re changing how the interaction is built, not what the user has to learn.\n\nStart with the HTML.",
      frame: {
        build: "native",
        route: "/demos/01-layered-ui/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-css": true },
        hooks: ["reset"],
        poster: "/posters/d1-now.png",
      },
      files: [
        sectionCode("d1-order-actions", "index.html", "html"),
        sectionCode("d1-order-actions", "enhance.css", "css"),
        sectionCode("d1-order-actions", "app.js", "js"),
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
            "The button points to a popover with `popovertarget`.",
            "The browser puts the open popover in the top layer, above normal page content. We don’t need to move it to the end of the document just to escape a clipped container.",
            "A popover still isn’t a complete menu pattern by itself. We need the right content and keyboard behavior for the control we’re building.",
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
            "The cancel button uses `commandfor` and `show-modal` to open the dialog.",
            "The browser handles the modal behavior. The rest of the page becomes inert, and we choose the initial focus. Here, “Keep order” is the safer first choice.",
            "We still provide the label and clear actions.",
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
            "Now keep the order, then close the actions.",
            "Watch where focus goes. The interaction should leave you somewhere useful, not at the top of the page wondering what happened.",
            "Native behavior gives us a better starting point. We still test the full keyboard path.",
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
            // The dialog lives in the menu, so the menu is still open; close it so the room reads
            // the canceled row and the status chip (review r6 M1).
            {
              type: "key",
              key: "Escape",
              target: "#order-actions-418",
              via: "hidePopover() on the menu (the same close request Escape sends)",
            },
            { type: "assert", target: "#order-actions-418", expect: "!:popover-open" },
          ],
          code: {
            file: "app.js",
            lines: [
              [11, 16],
              [29, 30],
            ],
          },
          spotlight: ["#status"],
          ifKeyboard:
            "Open the menu and confirm the cancel. Press Escape. Then press Next once to sync the frame.",
          meter: {
            label: "JavaScript",
            value: "22 lines",
            source: "non-blank, non-comment lines in content/sections/d1-order-actions/files/*.js",
          },
          bullets: [
            "The JavaScript that’s left handles the actual cancellation request and the response.",
            "The demo counts 22 lines here. We removed interface plumbing, not the business rules. The server still checks whether this user can cancel this order.",
          ],
        },
        {
          id: "s5",
          label: "Styles off",
          actions: [
            { type: "toggle", flag: "enhance-css", on: false },
            { type: "pointer", to: "#actions-418" },
            { type: "click", target: "#actions-418" },
            { type: "assert", target: "#order-actions-418", expect: ":popover-open" },
            { type: "wait", ms: 1200 },
            {
              type: "key",
              key: "Escape",
              target: "#order-actions-418",
              via: "hidePopover() on the menu (the same close request Escape sends)",
            },
            { type: "assert", target: "#actions-418", expect: "focused" },
          ],
          code: { file: "enhance.css", lines: [], off: true },
          spotlight: ["#actions-418"],
          ifKeyboard: "Press Enter to open the menu, then Escape. Press Next once to sync the frame.",
          proof: "Remove the enhancement CSS and show that the controls remain semantic and usable.",
          bullets: [
            "Now remove the styling.",
            "It isn’t winning a design award, but the controls still have their basic behavior.",
            "That’s the useful part. The interaction doesn’t depend on us rebuilding every detail in JavaScript.",
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
    {
      text: "MDN compatibility: button commands",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/button.json",
    },
    {
      text: "MDN compatibility: :open",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/selectors/open.json",
    },
    {
      text: "MDN compatibility: dialog",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/dialog.json",
    },
    {
      text: "MDN compatibility: discrete transitions",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/transition-behavior.json",
    },
    {
      text: "MDN compatibility: overlay",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/overlay.json",
    },
  ],
  cautions: [
    "Use a dialog when the user must answer. Use a popover when they can ignore it.",
    "Check permission on the server. The dialog does not protect your data.",
    "Test with a screen reader. Browser support does not prove the page is accessible.",
  ],
};

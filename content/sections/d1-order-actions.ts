import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./d1-order-actions/files/. */
export const section: DemoSection = {
  id: "d1-order-actions",
  order: 1,
  label: "Order actions",
  feature: "Dialog element",
  scenario:
    "TODO rewrite: An order row opens an action menu. Choosing Cancel order opens a confirmation dialog, returns focus correctly, and calls the application only after confirmation.",
  support: {
    kind: "web-features",
    id: "dialog",
    alsoUses: ["popover", "invoker-commands"],
  },
  pages: [
    {
      id: "d1-intro",
      stage: "intro",
      intro: "TODO rewrite",
      description: "TODO description",
      visual: {
        src: "/intro/d1-order-actions.png",
        alt: "TODO alt",
        capture: {
          pageId: "d1-now",
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
      id: "d1-used-to",
      stage: "used-to",
      eyebrow: "Dialog element",
      title: "How we used to do it",
      intro:
        "TODO rewrite: One order row, one destructive action. Here is what teams commonly maintain to make a menu and a confirmation behave.",
      frame: {
        build: "today",
        route: "/demos/01-layered-ui/today",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset"],
        poster: "/posters/d1-today.png",
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "The hand-rolled row",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: This is a menu and modal built from div elements, ARIA roles, and a component library pattern.",
            "TODO rewrite: It works.",
            "TODO rewrite: Watch what it takes to keep it working.",
          ],
        },
        {
          id: "s1",
          label: "Open the menu",
          actions: [
            {
              type: "pointer",
              to: "#t-actions",
            },
            {
              type: "click",
              target: "#t-actions",
            },
            {
              type: "assert",
              target: "#t-menu",
              expect: "visible",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: The menu needs JavaScript for open state, Escape, and outside clicks.",
            "TODO rewrite: It renders into a portal root because ordinary z-index rules cannot reliably place the surface above the page.",
          ],
        },
        {
          id: "s2",
          label: "Open the confirmation",
          actions: [
            {
              type: "pointer",
              to: "#t-cancel",
            },
            {
              type: "click",
              target: "#t-cancel",
            },
            {
              type: "assert",
              target: "#t-modal",
              expect: "visible",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: The modal adds focus trapping, scroll locking, and stacking.",
            "TODO rewrite: Each one is code the team owns, tests, and fixes again when the component moves.",
          ],
        },
        {
          id: "s3",
          label: "Dismiss and count",
          actions: [
            {
              type: "key",
              key: "Escape",
              target: "#t-modal",
              via: "dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); the today build listens in JavaScript",
            },
            {
              type: "assert",
              target: "#t-actions",
              expect: "focused",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Escape closes it, and a handler puts focus back on the Actions button.",
            "TODO rewrite: Teams keep separate versions of this behavior across frameworks, with regressions when the component is moved or nested.",
            "TODO rewrite: The meter is the JavaScript this one row needs, counted from the build.",
          ],
          meter: {
            label: "JavaScript",
            value: "399 lines",
            source: "non-blank, non-comment lines in /demos/01-layered-ui/today/*.js",
          },
        },
      ],
      timing: {
        minutes: 0.75,
      },
    },
    {
      id: "d1-now",
      stage: "now",
      eyebrow: "Dialog element",
      title: "How we do it now",
      intro:
        "TODO rewrite: Same row, same task, with what the browser can own now: popover for the menu, dialog for the decision, and invoker commands to connect them in HTML.",
      frame: {
        build: "native",
        route: "/demos/01-layered-ui/native",
        viewport: {
          width: 640,
          height: 628,
        },
        flags: {
          "enhance-css": true,
        },
        hooks: ["reset"],
        poster: "/posters/d1-code.png",
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d1-order-actions", "index.html"),
        },
        {
          file: "enhance.css",
          lang: "css",
          source: sectionFile("d1-order-actions", "enhance.css"),
        },
        {
          file: "app.js",
          lang: "js",
          source: sectionFile("d1-order-actions", "app.js"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Three files",
          actions: [],
          code: {
            file: "index.html",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Three files.",
            "TODO rewrite: The HTML carries the behavior, the CSS is an enhancement, and the JavaScript handles one request.",
          ],
        },
        {
          id: "s1",
          label: "popovertarget",
          actions: [
            {
              type: "click",
              target: "#actions-418",
            },
            {
              type: "assert",
              target: "#order-actions-418",
              expect: ":popover-open",
            },
          ],
          code: {
            file: "index.html",
            lines: [[6, 10]],
          },
          spotlight: ["#actions-418", "#order-actions-418"],
          bullets: [
            "TODO rewrite: popovertarget connects the button to the menu, and the popover attribute does the rest.",
            'TODO rewrite: Shopify\'s region picker uses the same pair, popoverTarget with popover="auto"; that DevTools capture is taken the week of the talk.',
            'TODO rewrite: Vercel ships a popover="manual" menu, and GitHub Primer moved ActionList to popover and Dialog to the dialog element.',
          ],
        },
        {
          id: "s2",
          label: "Invoker command",
          actions: [
            {
              type: "click",
              target: '[commandfor="cancel-418"]',
            },
            {
              type: "assert",
              target: "#cancel-418",
              expect: ":open",
            },
          ],
          code: {
            file: "index.html",
            lines: [[11, 16], 28],
          },
          spotlight: ['[commandfor="cancel-418"]', "#cancel-418"],
          bullets: [
            'TODO rewrite: Invoker commands connect buttons to popovers and dialogs in HTML, reducing event-handler plumbing. command="show-modal" calls showModal() for us.',
            "TODO rewrite: The dialog sits inside the menu on purpose: opened from a sibling, showModal() closes the menu first and focus has nowhere to return.",
          ],
        },
        {
          id: "s3",
          label: "form method=dialog",
          actions: [
            {
              type: "click",
              target: '#cancel-418 button[value="cancel"]',
            },
            {
              type: "assert",
              target: '[commandfor="cancel-418"]',
              expect: "focused",
            },
          ],
          code: {
            file: "index.html",
            lines: [[17, 27]],
          },
          spotlight: ["#cancel-418 form", '#cancel-418 button[value="cancel"]'],
          bullets: [
            'TODO rewrite: A form with method="dialog" closes the dialog and sets returnValue from the button that was pressed.',
            "TODO rewrite: There are no click handlers.",
            "TODO rewrite: Focus goes back to Cancel order in the menu.",
          ],
        },
        {
          id: "s4",
          label: "Placement and state in CSS",
          actions: [
            {
              type: "click",
              target: '[commandfor="cancel-418"]',
            },
            {
              type: "assert",
              target: "#cancel-418",
              expect: ":open",
            },
          ],
          code: {
            file: "enhance.css",
            lines: [
              [10, 17],
              [18, 23],
              [24, 33],
            ],
          },
          spotlight: ["#order-actions-418", "#cancel-418"],
          bullets: [
            "TODO rewrite: The base placement works without anchor positioning.",
            "TODO rewrite: Where position-area is supported, the menu sits under its button through the implicit anchor, and that feature gets its own row on the fast-follow slide.",
            "TODO rewrite: The :open and :popover-open selectors expose state to CSS, and the short transition runs only when reduced motion is not requested.",
          ],
        },
        {
          id: "s5",
          label: "The one request",
          actions: [
            {
              type: "click",
              target: '#cancel-418 button[value="confirm"]',
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "assert",
              target: "#status",
              expect: "contains:Order 418 was canceled",
            },
          ],
          code: {
            file: "app.js",
            lines: [
              [7, 14],
              [26, 28],
            ],
          },
          spotlight: ["#status"],
          bullets: [
            "TODO rewrite: JavaScript stays focused on the order cancellation request and result.",
            "TODO rewrite: It listens for close, checks for confirm, calls the server, and announces the outcome.",
            "TODO rewrite: It also clears returnValue, so a stale confirm can never cancel twice.",
          ],
        },
        {
          id: "s6",
          label: "Production cautions",
          actions: [],
          code: {
            file: "app.js",
            lines: [[16, 24]],
          },
          spotlight: ["#status"],
          bullets: [
            "TODO rewrite: Use dialog for a modal decision and popover for a nonmodal surface.",
            "TODO rewrite: They are not interchangeable.",
            "TODO rewrite: Keep destructive work behind a server authorization check, because native UI does not replace application security.",
            "TODO rewrite: Test screen-reader output and nested overlay behavior:",
            "TODO rewrite: Baseline is a browser signal, not an accessibility certificate.",
          ],
        },
        {
          id: "s7",
          label: "TODO cut: Keep the order, then Escape",
          actions: [
            {
              type: "pointer",
              to: '#cancel-418 button[value="cancel"]',
            },
            {
              type: "click",
              target: '#cancel-418 button[value="cancel"]',
            },
            {
              type: "assert",
              target: '[commandfor="cancel-418"]',
              expect: "focused",
            },
            {
              type: "key",
              key: "Escape",
              target: "#order-actions-418",
              via: "hidePopover() on the menu (the same close request Escape sends)",
            },
            {
              type: "assert",
              target: "#actions-418",
              expect: "focused",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: "#actions-418",
              text: "Focus returns",
              side: "left",
            },
          ],
          bullets: [
            "TODO rewrite: Keep order closes the dialog, and focus goes back to the menu item that opened it.",
            "TODO rewrite: Escape closes the menu, and focus returns to the Actions button.",
            "TODO rewrite: One layer at a time, and none of it is our code.",
          ],
          proof: "Show focus returning to the Actions button after dismissal.",
        },
        {
          id: "s8",
          label: "TODO cut: Keyboard only",
          actions: [
            {
              type: "focus",
              target: "#actions-418",
              visible: true,
            },
            {
              type: "key",
              key: "Enter",
              target: "#actions-418",
              via: "click() on the focused button",
            },
            {
              type: "key",
              key: "Tab",
              target: '[commandfor="cancel-418"]',
              via: "focus({ focusVisible: true })",
            },
            {
              type: "key",
              key: "Enter",
              target: '[commandfor="cancel-418"]',
              via: "click() on the focused button",
            },
            {
              type: "key",
              key: "Escape",
              target: "#cancel-418",
              via: "requestClose() on the dialog",
            },
            {
              type: "assert",
              target: '[commandfor="cancel-418"]',
              expect: "focused",
            },
            {
              type: "key",
              key: "Enter",
              target: '[commandfor="cancel-418"]',
              via: "click() on the focused button",
            },
            {
              type: "key",
              key: "Tab",
              target: '#cancel-418 button[value="confirm"]',
              via: "focus({ focusVisible: true })",
            },
            {
              type: "key",
              key: "Enter",
              target: '#cancel-418 button[value="confirm"]',
              via: "click() on the focused button",
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "assert",
              target: "#status",
              expect: "contains:Order 418 was canceled",
            },
            {
              type: "key",
              key: "Escape",
              target: "#order-actions-418",
              via: "hidePopover() on the menu",
            },
            {
              type: "assert",
              target: "#actions-418",
              expect: "focused",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#status"],
          bullets: [
            "TODO rewrite: Now with the keyboard only.",
            "TODO rewrite: Enter opens the menu, Tab reaches Cancel order, Enter opens the dialog, and Escape dismisses it.",
            "TODO rewrite: Enter, Tab, and Enter confirm, and the status line announces the result.",
            "TODO rewrite: Escape closes the menu and focus is back on Actions.",
          ],
          ifKeyboard:
            "TODO rewrite: Drive it by hand: Tab to Actions, Enter, Tab, Enter, Escape, Enter, Tab, Enter, Escape. Then press Next once to sync the frame to the same end state.",
          proof: "Open, choose, dismiss, and confirm with the keyboard only.",
        },
        {
          id: "s9",
          label: "TODO cut: Enhancement CSS off",
          actions: [
            {
              type: "toggle",
              flag: "enhance-css",
              on: false,
            },
            {
              type: "click",
              target: "#actions-418",
            },
            {
              type: "assert",
              target: "#order-actions-418",
              expect: ":popover-open",
            },
            {
              type: "click",
              target: '[commandfor="cancel-418"]',
            },
            {
              type: "assert",
              target: "#cancel-418",
              expect: ":open",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: "#order-actions-418",
              text: "Still semantic",
              side: "right",
            },
            {
              target: "#cancel-418",
              text: "Still modal",
              side: "top",
            },
          ],
          bullets: [
            "TODO rewrite: Remove the enhancement CSS and the controls remain semantic and usable.",
            "TODO rewrite: The browser draws them plainly, and the behavior is unchanged.",
            "TODO rewrite: In rehearsal the same flow runs in current Chrome, Firefox, and Safari, and Edge stays in the recorded test matrix.",
          ],
          proof:
            "Remove the enhancement CSS and show that the controls remain semantic and usable.",
        },
      ],
      timing: {
        minutes: 2.0,
      },
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
    "TODO rewrite: Use dialog for a modal decision and popover for a nonmodal surface. They are not interchangeable.",
    "TODO rewrite: Keep destructive work behind a server authorization check. Native UI does not replace application security.",
    "TODO rewrite: Test screen-reader output and nested overlay behavior. Baseline is a browser signal, not an accessibility certificate.",
  ],
};

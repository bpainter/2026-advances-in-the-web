import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./d1-order-actions/files/. */
export const section: DemoSection = {
  id: "d1-order-actions",
  order: 1,
  label: "Order actions",
  scenario:
    "An order row opens an action menu. Choosing Cancel order opens a confirmation dialog, returns focus correctly, and calls the application only after confirmation.",
  support: {
    tier: "baseline-newly",
    summary: "Widely + Newly (Dec 2025)",
    detail:
      "The dialog element is Baseline Widely available. Popover is Baseline 2025. Invoker commands became Baseline Newly available in December 2025, and :open joined Baseline 2026. The core path works in current Chrome, Edge, Firefox, and Safari. The position-area enhancement is optional; the base placement does not depend on it.",
  },
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
    "Use dialog for a modal decision and popover for a nonmodal surface. They are not interchangeable.",
    "Keep destructive work behind a server authorization check. Native UI does not replace application security.",
    "Test screen-reader output and nested overlay behavior. Baseline is a browser signal, not an accessibility certificate.",
  ],
  pages: [
    {
      id: "d1-today",
      stage: "today",
      title: "Order actions: today",
      frame: {
        build: "today",
        route: "/demos/01-layered-ui/today",
        viewport: {
          width: 1280,
          height: 720,
        },
        hooks: ["reset"],
        poster: "/posters/d1-today.png",
      },
      steps: [
        {
          id: "s0",
          label: "The hand-rolled row",
          actions: [],
          notes:
            "This is a menu and modal built from div elements, ARIA roles, and a component library pattern. It works. Watch what it takes to keep it working.",
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
          callouts: [
            {
              target: "#t-actions",
              text: "Open state",
              side: "left",
            },
            {
              target: "#t-menu",
              text: "Portal root",
              side: "right",
            },
            {
              target: "#t-menu",
              text: "Outside click",
              side: "bottom",
            },
          ],
          notes:
            "The menu needs JavaScript for open state, Escape, and outside clicks. It renders into a portal root because ordinary z-index rules cannot reliably place the surface above the page.",
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
          callouts: [
            {
              target: "#t-modal",
              text: "Focus trap",
              side: "top",
            },
            {
              target: "#t-backdrop",
              text: "Scroll lock",
              side: "left",
            },
            {
              target: "#overlay-root",
              text: "Stacking order",
              side: "right",
            },
          ],
          notes:
            "The modal adds focus trapping, scroll locking, and stacking. Each one is code the team owns, tests, and fixes again when the component moves.",
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
          callouts: [
            {
              target: "#t-actions",
              text: "Focus return",
              side: "left",
            },
            {
              target: "#t-modal",
              text: "Escape handler",
              side: "top",
            },
          ],
          meter: {
            label: "JavaScript",
            value: "399 lines",
            source: "non-blank, non-comment lines in /demos/01-layered-ui/today/*.js",
          },
          notes:
            "Escape closes it, and a handler puts focus back on the Actions button. Teams keep separate versions of this behavior across frameworks, with regressions when the component is moved or nested. The meter is the JavaScript this one row needs, counted from the build.",
        },
      ],
      notes: {
        open: "One order row, one destructive action. Here is what teams commonly maintain to make a menu and a confirmation behave.",
        bridge: "Now the same task, with the plumbing the browser can own.",
      },
      timing: {
        minutes: 0.75,
        cumulative: 5.75,
      },
    },
    {
      id: "d1-now",
      stage: "now",
      title: "Order actions: now",
      frame: {
        build: "native",
        route: "/demos/01-layered-ui/native",
        viewport: {
          width: 1280,
          height: 720,
        },
        flags: {
          "enhance-css": true,
        },
        hooks: ["reset"],
        poster: "/posters/d1-now.png",
      },
      steps: [
        {
          id: "s0",
          label: "Same row, native parts",
          actions: [],
          notes:
            "Same row, same task. The markup is a button, a popover, and a dialog. There is no component library and no focus code.",
        },
        {
          id: "s1",
          label: "Open the menu",
          actions: [
            {
              type: "pointer",
              to: "#actions-418",
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
          ],
          callouts: [
            {
              target: "#order-actions-418",
              text: "Top layer",
              side: "right",
            },
            {
              target: "#order-actions-418",
              text: "Light dismiss",
              side: "bottom",
            },
          ],
          notes:
            'The Popover API puts the action menu in the top layer and handles light dismissal. There is no portal and no z-index fight. Chris Coyier put it plainly: "No JavaScript is required to make the opening and closing of a popover work."',
        },
        {
          id: "s2",
          label: "Ask to cancel",
          actions: [
            {
              type: "pointer",
              to: '[commandfor="cancel-418"]',
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
            {
              type: "assert",
              target: '#cancel-418 button[value="cancel"]',
              expect: "focused",
            },
          ],
          callouts: [
            {
              target: "#cancel-418",
              text: "Modal dialog",
              side: "top",
            },
            {
              target: '#cancel-418 button[value="cancel"]',
              text: "Safe default",
              side: "left",
            },
          ],
          notes:
            "A dialog opened with showModal() provides modal behavior, focus handling, Escape behavior, and a backdrop. Focus lands on Keep order, the safe choice.",
        },
        {
          id: "s3",
          label: "Keep the order, then Escape",
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
          callouts: [
            {
              target: "#actions-418",
              text: "Focus returns",
              side: "left",
            },
          ],
          notes:
            "Keep order closes the dialog, and focus goes back to the menu item that opened it. Escape closes the menu, and focus returns to the Actions button. One layer at a time, and none of it is our code.",
          proof: "Show focus returning to the Actions button after dismissal.",
        },
        {
          id: "s4",
          label: "Keyboard only",
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
          spotlight: ["#status"],
          notes:
            "Now with the keyboard only. Enter opens the menu, Tab reaches Cancel order, Enter opens the dialog, and Escape dismisses it. Enter, Tab, and Enter confirm, and the status line announces the result. Escape closes the menu and focus is back on Actions.",
          ifKeyboard:
            "Drive it by hand: Tab to Actions, Enter, Tab, Enter, Escape, Enter, Tab, Enter, Escape. Then press Next once to sync the frame to the same end state.",
          proof: "Open, choose, dismiss, and confirm with the keyboard only.",
        },
        {
          id: "s5",
          label: "Enhancement CSS off",
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
          notes:
            "Remove the enhancement CSS and the controls remain semantic and usable. The browser draws them plainly, and the behavior is unchanged. In rehearsal the same flow runs in current Chrome, Firefox, and Safari, and Edge stays in the recorded test matrix.",
          proof:
            "Remove the enhancement CSS and show that the controls remain semantic and usable.",
        },
      ],
      notes: {
        open: "Same row, same task, with what the browser can own now: popover for the menu, dialog for the decision, and invoker commands to connect them in HTML.",
        bridge:
          "Here is the code behind each of those moves. Highlighting a line plays what it does.",
      },
      timing: {
        minutes: 1.25,
        cumulative: 7,
      },
    },
    {
      id: "d1-code",
      stage: "code",
      title: "Order actions: code",
      frame: {
        build: "native",
        route: "/demos/01-layered-ui/native",
        viewport: {
          width: 896,
          height: 720,
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
          notes:
            "Three files. The HTML carries the behavior, the CSS is an enhancement, and the JavaScript handles one request.",
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
          notes:
            'popovertarget connects the button to the menu, and the popover attribute does the rest. Shopify\'s region picker uses the same pair, popoverTarget with popover="auto"; that DevTools capture is taken the week of the talk. Vercel ships a popover="manual" menu, and GitHub Primer moved ActionList to popover and Dialog to the dialog element.',
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
          notes:
            'Invoker commands connect buttons to popovers and dialogs in HTML, reducing event-handler plumbing. command="show-modal" calls showModal() for us. The dialog sits inside the menu on purpose: opened from a sibling, showModal() closes the menu first and focus has nowhere to return.',
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
          notes:
            'A form with method="dialog" closes the dialog and sets returnValue from the button that was pressed. There are no click handlers. Focus goes back to Cancel order in the menu.',
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
          notes:
            "The base placement works without anchor positioning. Where position-area is supported, the menu sits under its button through the implicit anchor, and that feature gets its own row on the fast-follow slide. The :open and :popover-open selectors expose state to CSS, and the short transition runs only when reduced motion is not requested.",
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
          notes:
            "JavaScript stays focused on the order cancellation request and result. It listens for close, checks for confirm, calls the server, and announces the outcome. It also clears returnValue, so a stale confirm can never cancel twice.",
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
          notes:
            "Use dialog for a modal decision and popover for a nonmodal surface. They are not interchangeable. Keep destructive work behind a server authorization check, because native UI does not replace application security. Test screen-reader output and nested overlay behavior: Baseline is a browser signal, not an accessibility certificate.",
        },
      ],
      notes: {
        open: "HTML, CSS, JavaScript. Each highlight plays the interaction it causes on the left.",
        bridge: "Next, a component that has to fit wherever a template puts it.",
      },
      timing: {
        minutes: 1.5,
        cumulative: 8.5,
      },
    },
  ],
};

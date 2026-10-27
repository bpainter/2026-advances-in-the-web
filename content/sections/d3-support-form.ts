import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./d3-support-form/files/. */
export const section: DemoSection = {
  id: "d3-support-form",
  order: 3,
  label: "Support form",
  scenario:
    "A support agent enters a short subject or a long explanation. The fields grow to fit content, native validation remains intact, and the layout sets sensible limits.",
  support: {
    tier: "baseline-newly",
    summary: "Newly (Jun 2026), with fallback",
    detail:
      "field-sizing became Baseline 2026 (Newly, 16 Jun 2026: Chrome 123, Safari 26.2, Firefox 152). A browser without it receives normal input and textarea behavior, so the production path can use progressive enhancement without a polyfill.",
  },
  citations: [
    {
      text: "field-sizing Baseline 16 Jun 2026 (Chrome 123, Safari 26.2, Firefox 152)",
      url: "https://webstatus.dev/features/field-sizing",
    },
    {
      text: 'Coyier, Sep 2025: "This is a need that developers have been creating in JavaScript since forever."',
      url: "https://blog.master.dev/what-you-need-to-know-about-modern-css-2025-edition/",
    },
    {
      text: 'WebKit, Safari 26.2: "This eliminates the need for JavaScript to resize form fields dynamically."',
      url: "https://webkit.org/blog/17640/webkit-features-for-safari-26-2/",
    },
    {
      text: "autosize usage: autosize(document.querySelectorAll('textarea'))",
      url: "https://www.jacklmoore.com/autosize/",
    },
    {
      text: "autosize 6.0.1: 2.8 KB min / 1.1 KB gzipped",
      url: "https://bundlephobia.com/api/size?package=autosize",
    },
    {
      text: "react-textarea-autosize weekly downloads (pull one fresh set the week of the talk)",
      url: "https://api.npmjs.org/downloads/point/last-week/react-textarea-autosize",
    },
    {
      text: "Pi-hole web admin PR #2998, Auto resize some textarea fields (merge date not confirmed)",
      url: "https://github.com/pi-hole/web/pull/2998",
    },
    {
      text: "MDN: field-sizing",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing",
    },
  ],
  cautions: [
    "Set explicit minimums and maximums. Unlimited growth can push primary actions out of reach.",
    "Test zoom, translated labels, pasted content, and long unbroken strings.",
    "Do not remove visible labels or validation instructions to make the demo look cleaner.",
  ],
  pages: [
    {
      id: "d3-today",
      stage: "today",
      title: "Support form: today",
      frame: {
        build: "today",
        route: "/demos/03-content-sized-form/today",
        viewport: {
          width: 1280,
          height: 720,
        },
        hooks: ["reset", "formReset"],
        poster: "/posters/d3-today.png",
      },
      steps: [
        {
          id: "s0",
          label: "The scripted form",
          actions: [],
          notes:
            "A subject and a details field that grow as the agent types. Today that takes a script.",
        },
        {
          id: "s1",
          label: "Type and paste",
          actions: [
            {
              type: "type",
              target: "#t-subject",
              text: "Refund missing for order 418",
            },
            {
              type: "paste",
              target: "#t-details",
              text: "Customer returned the shoes on 2 October.\n\nThe carrier shows delivery to the warehouse on 6 October.\n\nNo refund has been issued and the customer has asked twice.",
            },
          ],
          callouts: [
            {
              target: "#t-subject",
              text: "Hidden mirror",
              side: "right",
            },
            {
              target: "#t-details",
              text: "scrollHeight loop",
              side: "right",
            },
          ],
          notes:
            "The subject width comes from a hidden mirror element that copies text and font styles. The textarea code resets height, reads scrollHeight, writes a new height, and repeats after every edit.",
        },
        {
          id: "s2",
          label: "Reset needs code too",
          actions: [
            {
              type: "hook",
              name: "formReset",
            },
            {
              type: "assert",
              target: "#t-details",
              expect: "attr:data-rows=min",
            },
          ],
          callouts: [
            {
              target: "#t-form",
              text: "Reset handler",
              side: "top",
            },
            {
              target: "#t-details",
              text: "Paste listener",
              side: "right",
            },
          ],
          meter: {
            label: "JavaScript",
            value: "computed at build",
            source: "non-blank, non-comment lines in /demos/03-content-sized-form/today/*.js",
          },
          notes:
            "Pasted content, font loading, validation messages, and form reset each need their own handling. The meter counts it.",
        },
      ],
      notes: {
        open: "Content-sized fields and native validation. Here is what teams commonly maintain.",
        bridge: "Now one declaration, with limits.",
      },
      timing: {
        minutes: 0.5,
        cumulative: 12,
      },
    },
    {
      id: "d3-now",
      stage: "now",
      title: "Support form: now",
      frame: {
        build: "native",
        route: "/demos/03-content-sized-form/native",
        viewport: {
          width: 1280,
          height: 720,
        },
        flags: {
          "field-sizing": true,
          "enhance-js": true,
        },
        hooks: ["reset", "formReset"],
        poster: "/posters/d3-now.png",
      },
      steps: [
        {
          id: "s0",
          label: "Native form",
          actions: [],
          notes:
            "Same form. Native labels, required fields, constraints, and form submission continue to work without a custom control.",
        },
        {
          id: "s1",
          label: "Paste a paragraph",
          actions: [
            {
              type: "paste",
              target: "#details",
              text: "Customer returned the shoes on 2 October. The carrier shows delivery to the warehouse on 6 October. No refund has been issued.\n\nThe customer has asked twice by email and once by phone.\n\nOrder 418, size 10, black.",
            },
          ],
          callouts: [
            {
              target: "#details",
              text: "Grows to fit",
              side: "right",
            },
          ],
          notes:
            "field-sizing: content lets text controls size themselves around their content. There is no script measuring anything.",
        },
        {
          id: "s2",
          label: "Reach the limit",
          actions: [
            {
              type: "paste",
              target: "#details",
              text: "Customer returned the shoes on 2 October. The carrier shows delivery to the warehouse on 6 October. No refund has been issued.\n\nThe customer has asked twice by email and once by phone.\n\nOrder 418, size 10, black.\n\nWarehouse note: box received with the original tags. Inspection passed on 7 October.\n\nFinance note: the refund batch on 8 October failed for three orders. This one is among them.\n\nNext step: reissue the refund and confirm by email.\n\nEscalation: second contact, so the customer is owed a reply within one business day.\n\nAgent note: customer prefers email.\n\nAttachment list: carrier receipt, warehouse scan, two emails.",
            },
            {
              type: "assert",
              target: "#details",
              expect: "value-length>400",
            },
          ],
          callouts: [
            {
              target: "#details",
              text: "18-line limit",
              side: "right",
            },
          ],
          notes:
            "Paste several paragraphs and it grows until it reaches max-block-size, then scrolls. min-block-size and max-block-size preserve layout boundaries, so the button stays in reach.",
          proof:
            "Paste several paragraphs and show the textarea growing until it reaches the defined limit.",
        },
        {
          id: "s3",
          label: "Enhancement off",
          actions: [
            {
              type: "toggle",
              flag: "field-sizing",
              on: false,
            },
          ],
          callouts: [
            {
              target: "#details",
              text: "Ordinary textarea",
              side: "right",
            },
            {
              target: "#subject",
              text: "Full width",
              side: "right",
            },
          ],
          notes:
            "Turn off the @supports block and this is what an older browser gets: an ordinary fixed textarea that scrolls. The task still works.",
          ifKeyboard:
            "Do it in DevTools instead: select the textarea, find the @supports (field-sizing: content) rule in the Styles pane, and uncheck field-sizing. Re-check it before the next step.",
          proof:
            "Toggle the @supports block in developer tools to reveal the ordinary textarea fallback.",
        },
        {
          id: "s4",
          label: "Reset",
          actions: [
            {
              type: "toggle",
              flag: "field-sizing",
              on: true,
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "hook",
              name: "formReset",
            },
            {
              type: "assert",
              target: "#details",
              expect: "style:block-size=6lh",
            },
          ],
          callouts: [
            {
              target: "#details",
              text: "Six lines again",
              side: "right",
            },
          ],
          notes:
            "Turn it back on and reset the form. The control returns to its starting size, with no reset handler.",
          proof: "Reset the form and verify that the control returns to its starting size.",
        },
        {
          id: "s5",
          label: "Submit empty",
          actions: [
            {
              type: "pointer",
              to: ".case-form button",
            },
            {
              type: "click",
              target: ".case-form button",
            },
            {
              type: "assert",
              target: "#subject",
              expect: "focused",
            },
          ],
          callouts: [
            {
              target: "#subject",
              text: "Native validation",
              side: "right",
            },
          ],
          notes:
            "Submit the empty form. The browser moves focus to the first required field and shows its message, and no request leaves the page.",
          proof: "Submit an empty form and show that native focus and validation still work.",
        },
      ],
      notes: {
        open: "What the browser can own now: field-sizing for the growth, block and inline limits for the layout, and the form itself for validation.",
        bridge: "The code is short enough to read in one pass.",
      },
      timing: {
        minutes: 1,
        cumulative: 13,
      },
    },
    {
      id: "d3-code",
      stage: "code",
      title: "Support form: code",
      frame: {
        build: "native",
        route: "/demos/03-content-sized-form/native",
        viewport: {
          width: 896,
          height: 720,
        },
        flags: {
          "field-sizing": true,
          "enhance-js": true,
        },
        hooks: ["reset"],
        poster: "/posters/d3-code.png",
      },
      files: [
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d3-support-form", "index.html"),
        },
        {
          file: "form.css",
          lang: "css",
          source: sectionFile("d3-support-form", "form.css"),
        },
        {
          file: "app.js",
          lang: "js",
          source: sectionFile("d3-support-form", "app.js"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Three short files",
          actions: [],
          code: {
            file: "index.html",
            lines: [],
          },
          notes: "Three short files, and none of them measures anything.",
        },
        {
          id: "s1",
          label: "Labels and constraints",
          actions: [
            {
              type: "focus",
              target: "#subject",
              visible: true,
            },
          ],
          code: {
            file: "index.html",
            lines: [[4, 12]],
          },
          spotlight: ['label[for="subject"]', "#subject", "#details-hint", "#details"],
          notes:
            'Visible labels, required, maxlength, and a hint tied to the field with aria-describedby. rows="6" gives older browsers a sensible fixed size.',
        },
        {
          id: "s2",
          label: "The fallback first",
          actions: [
            {
              type: "toggle",
              flag: "field-sizing",
              on: false,
            },
            {
              type: "paste",
              target: "#details",
              text: "Customer returned the shoes on 2 October.\n\nThe carrier shows delivery on 6 October.\n\nNo refund yet.\n\nAsked twice.\n\nOrder 418.\n\nSize 10, black.\n\nPrefers email.",
            },
          ],
          code: {
            file: "form.css",
            lines: [[4, 6]],
          },
          spotlight: ["#details", "#subject"],
          notes:
            "Outside the @supports block, both controls are full width and the textarea is fixed. That is the fallback, and it is a complete form.",
        },
        {
          id: "s3",
          label: "The enhancement",
          actions: [
            {
              type: "toggle",
              flag: "field-sizing",
              on: true,
            },
            {
              type: "type",
              target: "#subject",
              text: "Refund missing for order 418",
            },
          ],
          code: {
            file: "form.css",
            lines: [[7, 13]],
          },
          spotlight: ["#subject"],
          notes:
            'A @supports block isolates the enhancement while older browsers keep ordinary fixed sizing. The input sets inline-size back to auto inside the block, because a fixed width would override field-sizing. Coyier called this "a need that developers have been creating in JavaScript since forever."',
        },
        {
          id: "s4",
          label: "Minimum and maximum",
          actions: [
            {
              type: "paste",
              target: "#details",
              text: "Customer returned the shoes on 2 October. The carrier shows delivery to the warehouse on 6 October. No refund has been issued.\n\nThe customer has asked twice by email and once by phone.\n\nOrder 418, size 10, black.\n\nWarehouse note: box received with the original tags. Inspection passed on 7 October.\n\nFinance note: the refund batch on 8 October failed for three orders. This one is among them.\n\nNext step: reissue the refund and confirm by email.\n\nEscalation: second contact, so the customer is owed a reply within one business day.\n\nAgent note: customer prefers email.\n\nAttachment list: carrier receipt, warehouse scan, two emails.",
            },
          ],
          code: {
            file: "form.css",
            lines: [[14, 15]],
          },
          spotlight: ["#details"],
          notes:
            "Six lines to start, eighteen at most, measured in line heights so they follow the font. Past the maximum it scrolls.",
        },
        {
          id: "s5",
          label: "No sizing script",
          actions: [
            {
              type: "click",
              target: ".case-form button",
            },
            {
              type: "wait",
              ms: 600,
            },
            {
              type: "assert",
              target: "#details",
              expect: "style:block-size=6lh",
            },
          ],
          code: {
            file: "app.js",
            lines: [[4, 13]],
          },
          spotlight: [".case-form button", "#details"],
          notes:
            "No sizing script. JavaScript may submit asynchronously, preserve a draft, or attach files, but it no longer calculates control height. Here it submits in place, the form resets, and the textarea returns to its starting size.",
        },
        {
          id: "s6",
          label: "Production cautions",
          actions: [],
          code: {
            file: "form.css",
            lines: [[10, 15]],
          },
          spotlight: ["#details", "#details-hint"],
          notes:
            "Set explicit minimums and maximums, because unlimited growth can push primary actions out of reach. Test zoom, translated labels, pasted content, and long unbroken strings. Do not remove visible labels or validation instructions to make the demo look cleaner.",
        },
      ],
      notes: {
        open: "HTML first, then the CSS fallback, then the enhancement, then the JavaScript that no longer sizes anything.",
        bridge: "Next, navigation: links, forms, Back, and Forward through one path.",
      },
      timing: {
        minutes: 1,
        cumulative: 14,
      },
    },
  ],
};

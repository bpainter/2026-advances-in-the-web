import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./d3-support-form/files/. */
export const section: DemoSection = {
  id: "d3-support-form",
  order: 3,
  label: "Support form",
  feature: "Field sizing",
  scenario:
    "TODO rewrite: A support agent enters a short subject or a long explanation. The fields grow to fit content, native validation remains intact, and the layout sets sensible limits.",
  support: {
    kind: "web-features",
    id: "field-sizing",
  },
  pages: [
    {
      id: "d3-intro",
      stage: "intro",
      intro: "TODO rewrite",
      description: "TODO description",
      visual: {
        src: "/intro/d3-support-form.png",
        alt: "TODO alt",
        capture: {
          pageId: "d3-now",
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
      id: "d3-used-to",
      stage: "used-to",
      eyebrow: "Field sizing",
      title: "How we used to do it",
      intro:
        "TODO rewrite: Content-sized fields and native validation. Here is what teams commonly maintain.",
      frame: {
        build: "today",
        route: "/demos/03-content-sized-form/today",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset", "formReset"],
        poster: "/posters/d3-today.png",
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "The scripted form",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: A subject and a details field that grow as the agent types.",
            "TODO rewrite: Today that takes a script.",
          ],
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
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: The subject width comes from a hidden mirror element that copies text and font styles.",
            "TODO rewrite: The textarea code resets height, reads scrollHeight, writes a new height, and repeats after every edit.",
          ],
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
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: Pasted content, font loading, validation messages, and form reset each need their own handling.",
            "TODO rewrite: The meter counts it.",
          ],
          meter: {
            label: "JavaScript",
            value: "112 lines",
            source: "non-blank, non-comment lines in /demos/03-content-sized-form/today/*.js",
          },
        },
      ],
      timing: {
        minutes: 0.5,
      },
    },
    {
      id: "d3-now",
      stage: "now",
      eyebrow: "Field sizing",
      title: "How we do it now",
      intro:
        "TODO rewrite: What the browser can own now: field-sizing for the growth, block and inline limits for the layout, and the form itself for validation.",
      frame: {
        build: "native",
        route: "/demos/03-content-sized-form/native",
        viewport: {
          width: 640,
          height: 628,
        },
        flags: {
          "enhance-css": true,
          "enhance-js": true,
        },
        hooks: ["reset", "submitted", "formReset"],
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
          bullets: ["TODO rewrite: Three short files, and none of them measures anything."],
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
          bullets: [
            'TODO rewrite: Visible labels, required, maxlength, and a hint tied to the field with aria-describedby. rows="6" gives older browsers a sensible fixed size.',
          ],
        },
        {
          id: "s2",
          label: "The fallback first",
          actions: [
            {
              type: "toggle",
              flag: "enhance-css",
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
          bullets: [
            "TODO rewrite: Outside the @supports block, both controls are full width and the textarea is fixed.",
            "TODO rewrite: That is the fallback, and it is a complete form.",
          ],
        },
        {
          id: "s3",
          label: "The enhancement",
          actions: [
            {
              type: "toggle",
              flag: "enhance-css",
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
          bullets: [
            "TODO rewrite: A @supports block isolates the enhancement while older browsers keep ordinary fixed sizing.",
            "TODO rewrite: The input sets inline-size back to auto inside the block, because a fixed width would override field-sizing.",
            'TODO rewrite: Coyier called this "a need that developers have been creating in JavaScript since forever."',
          ],
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
          bullets: [
            "TODO rewrite: Six lines to start, eighteen at most, measured in line heights so they follow the font.",
            "TODO rewrite: Past the maximum it scrolls.",
          ],
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
              type: "hook",
              name: "submitted",
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
          bullets: [
            "TODO rewrite: No sizing script.",
            "TODO rewrite: JavaScript may submit asynchronously, preserve a draft, or attach files, but it no longer calculates control height.",
            "TODO rewrite: Here it submits in place, the form resets, and the textarea returns to its starting size.",
          ],
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
          bullets: [
            "TODO rewrite: Set explicit minimums and maximums, because unlimited growth can push primary actions out of reach.",
            "TODO rewrite: Test zoom, translated labels, pasted content, and long unbroken strings.",
            "TODO rewrite: Do not remove visible labels or validation instructions to make the demo look cleaner.",
          ],
        },
        {
          id: "s7",
          label: "TODO cut: Reach the limit",
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
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: "#details",
              text: "18-line limit",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: Paste several paragraphs and it grows until it reaches max-block-size, then scrolls. min-block-size and max-block-size preserve layout boundaries, so the button stays in reach.",
          ],
          proof:
            "Paste several paragraphs and show the textarea growing until it reaches the defined limit.",
        },
        {
          id: "s8",
          label: "TODO cut: Enhancement off",
          actions: [
            {
              type: "toggle",
              flag: "enhance-css",
              on: false,
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
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
          bullets: [
            "TODO rewrite: Turn off the @supports block and this is what an older browser gets: an ordinary fixed textarea that scrolls.",
            "TODO rewrite: The task still works.",
          ],
          ifKeyboard:
            "TODO rewrite: Do it in DevTools instead: select the textarea, find the @supports (field-sizing: content) rule in the Styles pane, and uncheck field-sizing. Re-check it before the next step.",
          proof:
            "Toggle the @supports block in developer tools to reveal the ordinary textarea fallback.",
        },
        {
          id: "s9",
          label: "TODO cut: Reset",
          actions: [
            {
              type: "toggle",
              flag: "enhance-css",
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
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: "#details",
              text: "Six lines again",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: Turn it back on and reset the form.",
            "TODO rewrite: The control returns to its starting size, with no reset handler.",
          ],
          proof: "Reset the form and verify that the control returns to its starting size.",
        },
        {
          id: "s10",
          label: "TODO cut: Submit empty",
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
          code: {
            file: "TODO",
            lines: [],
          },
          callouts: [
            {
              target: "#subject",
              text: "Native validation",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: Submit the empty form.",
            "TODO rewrite: The browser moves focus to the first required field and shows its message, and no request leaves the page.",
          ],
          proof: "Submit an empty form and show that native focus and validation still work.",
        },
      ],
      timing: {
        minutes: 1.75,
      },
    },
  ],
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
    "TODO rewrite: Set explicit minimums and maximums. Unlimited growth can push primary actions out of reach.",
    "TODO rewrite: Test zoom, translated labels, pasted content, and long unbroken strings.",
    "TODO rewrite: Do not remove visible labels or validation instructions to make the demo look cleaner.",
  ],
};

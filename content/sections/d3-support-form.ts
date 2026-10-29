import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/03-content-sized-form/today";
const LONG_DETAILS =
  "Customer returned the shoes on 2 October. The carrier shows delivery to the warehouse on 6 October. No refund has been issued.\n\nThe customer has asked twice by email and once by phone. Order 418, size 10, black.\n\nNext step: reissue the refund and reply by email within one business day.";

/** D3: a mirror element and a scrollHeight loop, then field-sizing with line-height limits. */
export const section: DemoSection = {
  id: "d3-support-form",
  background: "d3",
  order: 3,
  label: "Support form",
  feature: "Field sizing",
  scenario: "An agent types a short subject or long details, and the fields fit the text.",
  support: { kind: "web-features", id: "field-sizing" },
  pages: [
    {
      id: "d3-intro",
      stage: "intro",
      intro:
        "Our third demo is a support form. The agent types a subject and pastes the details. Both fields should fit what is typed.",
      description: "Field sizing lets a text field grow and shrink to fit what the user types.",
      visual: {
        src: "/intro/d3-support-form.png",
        alt: "The support form with a long pasted message in a grown details box.",
        capture: { pageId: "d3-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d3-used-to",
      stage: "used-to",
      eyebrow: "Field sizing",
      title: "What we used to do",
      intro: "An agent fills in a subject and the details. Both fields grow by script.",
      frame: {
        build: "today",
        route: "/demos/03-content-sized-form/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "formReset"],
        poster: "/posters/d3-today.png",
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [
          [10, 26],
          [32, 34],
          [36, 38],
        ]),
        excerpt(`${TODAY}/styles.css`, "css", [[14, 33]]),
        excerpt(`${TODAY}/input-width.js`, "js", [
          [14, 24],
          [37, 52],
        ]),
        excerpt(`${TODAY}/autosize.js`, "js", [
          [36, 49],
          [73, 76],
        ]),
      ],
      steps: [
        {
          id: "s0",
          label: "The scripted form",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Type a subject",
          actions: [{ type: "type", target: "#t-subject", text: "Refund missing for order 418" }],
          code: {
            file: "index.html",
            lines: [
              [3, 9],
              [15, 18],
            ],
          },
          spotlight: ["#t-subject"],
          bullets: ["Script measures a hidden copy of the subject to size the field."],
        },
        {
          id: "s2",
          label: "Paste the details",
          actions: [{ type: "paste", target: "#t-details", text: LONG_DETAILS }],
          code: {
            file: "styles.css",
            lines: [
              [9, 12],
              [15, 21],
            ],
          },
          spotlight: ["#t-details"],
          bullets: [
            "The CSS turns off resizing and hides the copy off screen. Script does the sizing.",
          ],
        },
        {
          id: "s3",
          label: "Reset the form",
          key: true,
          actions: [
            { type: "hook", name: "formReset" },
            { type: "assert", target: "#t-details", expect: "attr:data-rows=min" },
          ],
          code: { file: "autosize.js", lines: [[5, 10], [17, 20]] },
          spotlight: ["#t-details"],
          meter: {
            label: "JavaScript",
            value: "113 lines",
            source: "non-blank, non-comment lines in /demos/03-content-sized-form/today/*.js",
          },
          bullets: [
            "Reset needs its own handler to shrink the box again.",
            "Script measures after every edit, paste and reset: 113 lines.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d3-now",
      stage: "now",
      eyebrow: "Field sizing",
      title: "What we can do today",
      intro:
        "This is the same form with no sizing script. The fields fit their text with one CSS property.",
      frame: {
        build: "native",
        route: "/demos/03-content-sized-form/native",
        viewport: { width: 640, height: 628 },
        flags: { "enhance-css": true, "enhance-js": true },
        hooks: ["reset", "formReset", "submitted"],
        poster: "/posters/d3-now.png",
      },
      files: [
        sectionCode("d3-support-form", "index.html", "html"),
        sectionCode("d3-support-form", "form.css", "css"),
        sectionCode("d3-support-form", "app.js", "js"),
      ],
      steps: [
        {
          id: "s0",
          label: "Native form",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Type a subject",
          actions: [{ type: "type", target: "#subject", text: "Refund missing for order 418" }],
          code: { file: "form.css", lines: [[5, 11]] },
          spotlight: ["#subject"],
          bullets: [
            "The subject field grows as the text gets longer.",
            "Field sizing content tells a field to fit its text.",
            "The width stays between 18 characters and the full row.",
          ],
        },
        {
          id: "s2",
          label: "Paste the details",
          key: true,
          actions: [
            { type: "paste", target: "#details", text: LONG_DETAILS },
            { type: "assert", target: "#details", expect: "value-length>250" },
          ],
          code: { file: "form.css", lines: [7, 12] },
          spotlight: ["#details"],
          bullets: [
            "The details box starts at six lines and grows to fit the pasted text.",
            "One lh is one line of text, so the size follows the font.",
            "The browser does the sizing. We wrote no measuring code.",
          ],
        },
        {
          id: "s3",
          label: "Submit the case",
          actions: [
            { type: "pointer", to: ".case-form button" },
            { type: "click", target: ".case-form button" },
            { type: "hook", name: "submitted" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#details", expect: "style:block-size=6lh" },
          ],
          code: { file: "app.js", lines: [[4, 13]] },
          spotlight: ["#details"],
          meter: {
            label: "JavaScript",
            value: "9 lines",
            source: "non-blank, non-comment lines in content/sections/d3-support-form/files/*.js",
          },
          bullets: [
            "Open case sends the form. The box shrinks back to six lines.",
            "The only script submits in place. It never measures a field.",
          ],
        },
        {
          id: "s4",
          label: "Submit it empty",
          actions: [
            { type: "pointer", to: ".case-form button" },
            { type: "click", target: ".case-form button" },
            { type: "assert", target: "#subject", expect: "focused" },
            // Chromium's message bubble is too small to read from the room and covers the Details
            // label; moving focus away and back dismisses it (review r6 M7). The outlines and the
            // callout carry the proof.
            { type: "wait", ms: 600 },
            { type: "focus", target: "#details", visible: false },
            { type: "focus", target: "#subject" },
            { type: "assert", target: "#subject", expect: "focused" },
          ],
          code: {
            file: "index.html",
            lines: [
              [4, 6],
              [10, 12],
            ],
          },
          spotlight: ["#subject"],
          callouts: [{ target: "#subject", text: "No script", side: "right" }],
          proof: "Submit an empty form and show that native focus and validation still work.",
          bullets: [
            "Submitting the empty form moves focus to Subject. Both empty fields get a red outline.",
            "The required attribute does the checking. No request leaves the page.",
          ],
        },
        {
          id: "s5",
          label: "Field sizing off",
          actions: [
            { type: "toggle", flag: "enhance-css", on: false },
            { type: "paste", target: "#details", text: LONG_DETAILS },
          ],
          code: { file: "form.css", lines: [], off: true },
          spotlight: ["#details"],
          proof:
            "Toggle the @supports block in developer tools to reveal the ordinary textarea fallback.",
          ifKeyboard: "Turn off field sizing in DevTools. Then press Next once to sync the frame.",
          bullets: [
            "With the field sizing block off, this is what an older browser gets.",
            "The box keeps a fixed size and scrolls. The form still works.",
          ],
        },
      ],
      timing: { minutes: 1.75 },
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
    "Set a minimum and a maximum size. Unlimited growth can push the submit button out of reach.",
    "Test zoom, translated labels, pasted text and long words with no spaces.",
    "Keep visible labels and instructions. Do not remove them to make the form look cleaner.",
  ],
};

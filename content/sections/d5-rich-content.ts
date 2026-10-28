import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

const TODAY = "demos/05-trusted-types/today";

/** D5: scattered HTML sinks and a helper nobody must forget, then one Trusted Types policy the browser enforces. */
export const section: DemoSection = {
  id: "d5-rich-content",
  background: "d5",
  order: 5,
  label: "Rich content",
  feature: "Trusted Types",
  scenario: "A product page shows CMS rich text, and only reviewed HTML may reach it.",
  support: { kind: "web-features", id: "trusted-types" },
  pages: [
    {
      id: "d5-intro",
      stage: "intro",
      intro:
        "Our fifth demo is a product page with rich text from a CMS. Some of that text could carry a script. We want the browser to stop it.",
      description:
        "Trusted Types lets the browser refuse HTML that skipped your reviewed code.",
      visual: {
        src: "/intro/d5-rich-content.png",
        alt: "The product page with the security console showing a blocked write.",
        capture: { pageId: "d5-now", stepId: "s4" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "d5-used-to",
      stage: "used-to",
      eyebrow: "Trusted Types",
      title: "How we used to do it",
      intro:
        "This product page shows CMS content in three places. Each place writes HTML its own way.",
      frame: {
        build: "today",
        route: "/demos/05-trusted-types/today",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "renderReview"],
        poster: "/posters/d5-today.png",
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[9, 25]]),
        excerpt(`${TODAY}/reviews.js`, "js", [[57, 72]]),
        excerpt(`${TODAY}/sanitize.js`, "js", [
          [1, 5],
          [10, 12],
        ]),
      ],
      steps: [
        {
          id: "s0",
          label: "Three ways in",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Find the sinks",
          actions: [{ type: "pointer", to: "#t-description" }],
          code: {
            file: "index.html",
            lines: [
              [3, 4],
              [8, 9],
              [15, 17],
            ],
          },
          spotlight: ["#t-description", "#t-reviews", "#t-promo"],
          bullets: ["CMS content lands in three places. Three people wrote the code for them."],
        },
        {
          id: "s2",
          label: "Add a bad review",
          actions: [
            { type: "hook", name: "renderReview", args: ["handler"] },
            { type: "wait", ms: 400 },
            { type: "assert", target: ".injected-banner", expect: "visible" },
          ],
          code: { file: "reviews.js", lines: [[2, 4], 14] },
          spotlight: ["#t-reviews", ".injected-banner"],
          bullets: [
            "A review arrives with an event handler. This path skipped the helper, so the script ran.",
          ],
        },
        {
          id: "s3",
          label: "Count the sinks",
          key: true,
          actions: [{ type: "pointer", to: ".injected-banner" }],
          code: {
            file: "sanitize.js",
            lines: [
              [1, 4],
              [7, 9],
            ],
          },
          spotlight: [".injected-banner"],
          meter: {
            label: "HTML sinks",
            value: "7 sinks",
            source:
              "innerHTML and insertAdjacentHTML calls in /demos/05-trusted-types/today, counted by hand from the build",
          },
          bullets: [
            "The safety helper exists, but nothing makes a path call it.",
            "Reviewers have to remember 7 places that write HTML.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d5-now",
      stage: "now",
      eyebrow: "Trusted Types",
      title: "How we do it now",
      intro:
        "This is the same page with one rule in the header. HTML can only come through a policy we review.",
      frame: {
        build: "native",
        route: "/demos/05-trusted-types/native",
        viewport: { width: 640, height: 628 },
        flags: { "csp-enforce": false },
        hooks: ["reset", "renderFixture", "renderDirect"],
        poster: "/posters/d5-now.png",
      },
      files: [
        {
          file: "csp-header.http",
          lang: "http",
          source: sectionFile("d5-rich-content", "csp-header.http"),
        },
        { file: "app.js", lang: "js", source: sectionFile("d5-rich-content", "app.js") },
        { file: "index.html", lang: "html", source: sectionFile("d5-rich-content", "index.html") },
      ],
      steps: [
        {
          id: "s0",
          label: "Report-only mode",
          actions: [],
          code: { file: "csp-header.http", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Report a direct write",
          actions: [
            { type: "hook", name: "renderDirect", args: ["handler"] },
            { type: "wait", ms: 400 },
            { type: "assert", target: "#console", expect: "contains:require-trusted-types-for" },
            { type: "assert", target: ".injected-banner", expect: "visible" },
          ],
          code: { file: "csp-header.http", lines: [[2, 6]] },
          spotlight: ["#console", ".injected-banner"],
          proof: "Show one report-only violation before switching the local demo to enforcement.",
          bullets: [
            "In report-only mode the browser logs the unsafe write and still lets it run.",
            "These reports list every place that writes HTML. That is our inventory.",
          ],
        },
        {
          id: "s2",
          label: "Turn on enforcement",
          actions: [
            { type: "toggle", flag: "csp-enforce", on: true },
            { type: "wait", ms: 400 },
            { type: "assert", target: "#description", expect: "contains:Ridgeline" },
          ],
          code: { file: "csp-header.http", lines: [[9, 12]] },
          spotlight: ["#description"],
          bullets: [
            "The same rule now enforces. The approved description still renders.",
            "Only the two policies named in the header may create HTML.",
          ],
        },
        {
          id: "s3",
          label: "Render through the policy",
          key: true,
          actions: [
            { type: "hook", name: "renderFixture", args: ["handler"] },
            { type: "assert", target: "#description img", expect: "no-attr:onerror" },
          ],
          code: { file: "app.js", lines: [[6, 17]] },
          spotlight: ["#description", "#description img"],
          meter: {
            label: "JavaScript",
            value: "15 lines",
            source: "non-blank, non-comment lines in content/sections/d5-rich-content/files/*.js",
          },
          bullets: [
            "Content with an event handler goes through our one policy. The handler is gone.",
            "A policy is a named function the browser trusts to create HTML.",
            "This one runs the sanitizer first. It is the only way in.",
          ],
        },
        {
          id: "s4",
          label: "Write a plain string",
          actions: [
            { type: "hook", name: "renderDirect", args: ["handler"] },
            { type: "assert", target: "#console", expect: "contains:TypeError" },
            { type: "assert", target: ".injected-banner", expect: "hidden" },
          ],
          code: { file: "app.js", lines: [[20, 23]] },
          spotlight: ["#console"],
          proof: "Try a direct string assignment and show the browser exception.",
          bullets: [
            "A plain string write now throws a TypeError. The banner stays hidden.",
            "The browser enforces this, so a forgotten code path cannot slip through.",
          ],
        },
      ],
      timing: { minutes: 1.75 },
    },
  ],
  citations: [
    {
      text: "MDN: Trusted Types API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API",
    },
    {
      text: "Trusted Types Baseline Newly 24 Feb 2026 (Chrome 83, Safari 26, Firefox 148)",
      url: "https://webstatus.dev/features/trusted-types",
    },
    {
      text: "web.dev Baseline digest, February 2026",
      url: "https://web.dev/blog/baseline-digest-feb-2026",
    },
    {
      text: "React 19.3: Trusted Types support",
      url: "https://react.dev/blog/2026/09/09/react-19-3",
    },
    {
      text: "Sanitizer API (setHTML): Chrome 146, Firefox 148, no Safari as of October 2026",
      url: "https://webstatus.dev/features/sanitizer",
    },
    {
      text: "DOMPurify creates an internal Trusted Types policy named dompurify (checked in dompurify 3.4.17 source)",
      url: "https://github.com/cure53/DOMPurify",
    },
    {
      text: "Safari 26.0 shipped Trusted Types",
      url: "https://webkit.org/blog/17333/webkit-features-in-safari-26-0/",
    },
  ],
  cautions: [
    "Trusted Types does not clean HTML. The policy must call a reviewed sanitizer with tests.",
    "Start in report-only mode and list every sink. Enforcing first can break a large app.",
    "Do not keep a permissive default policy. Use it only while you remove old code paths.",
  ],
};

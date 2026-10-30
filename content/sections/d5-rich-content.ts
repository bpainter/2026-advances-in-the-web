import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

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
        "A CMS gives us rich text. Reviews and promotions may bring in more HTML.\n\nSomewhere, that content gets inserted into the page. The question is whether every path goes through the same checks.\n\nTrusted Types can help us enforce a rule at those insertion points. It doesn’t clean the content by itself.",
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
      title: "What we used to do",
      split: "60/40",
      intro:
        "We have a product description, a review, and a promotion.\n\nThey look like three bits of content. In the code, they may be three different routes into the page.",
      frame: {
        build: "today",
        route: "/demos/05-trusted-types/today",
        viewport: { width: 768, height: 628 },
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
          bullets: [
            "Here’s one call to `innerHTML`, then another.",
            "Maybe we have a sanitizing helper. But everyone has to remember to use it, every time, including the person who adds a feature next month.",
          ],
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
            "Now try content with an unwanted event handler.",
            "The problem isn’t whether the text came from a familiar system. It’s what the browser is being asked to interpret as HTML.",
            "One missed path can undo the care we took elsewhere.",
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
            "The demo identifies seven places where strings are inserted as HTML.",
            "That’s seven places to review and keep consistent. A comment saying “sanitize first” is useful, but it isn’t enforcement.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "d5-now",
      stage: "now",
      eyebrow: "Trusted Types",
      title: "What we can do today",
      split: "60/40",
      intro:
        "Start in report-only mode.\n\nWe want to see where the application breaks the proposed rule before we enforce it for users.",
      frame: {
        build: "native",
        route: "/demos/05-trusted-types/native",
        viewport: { width: 768, height: 628 },
        flags: { "csp-enforce": false },
        hooks: ["reset", "renderFixture", "renderDirect"],
        poster: "/posters/d5-now.png",
      },
      files: [
        sectionCode("d5-rich-content", "csp-header.http", "http"),
        sectionCode("d5-rich-content", "app.js", "js"),
        sectionCode("d5-rich-content", "index.html", "html"),
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
            { type: "hook", name: "renderDirect", args: ["update"] },
            { type: "wait", ms: 400 },
            { type: "assert", target: "#console", expect: "contains:require-trusted-types-for" },
            { type: "assert", target: ".injected-banner", expect: "visible" },
          ],
          code: { file: "csp-header.http", lines: [[2, 6]] },
          spotlight: ["#console", ".injected-banner"],
          proof: "Show one report-only violation before switching the local demo to enforcement.",
          bullets: [
            "Exercise the content paths and look at the reports.",
            "Report-only mode tells us about violations. It doesn’t block them. And it only tells us about the paths we’ve actually run.",
            "That makes it a discovery step, not a clean bill of health.",
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
            "Once those paths are ready, enforce the policy through Content Security Policy.",
            "Now the protected HTML insertion points require the right trusted value instead of an ordinary string. We also limit which policies the page can create.",
          ],
        },
        {
          id: "s3",
          label: "Render through the policy",
          key: true,
          actions: [
            { type: "hook", name: "renderFixture", args: ["update"] },
            { type: "assert", target: "#description img", expect: "no-attr:onerror" },
          ],
          code: {
            file: "app.js",
            lines: [
              [6, 7],
              [9, 12],
              [14, 19],
            ],
          },
          spotlight: ["#description", "#description img"],
          meter: {
            label: "JavaScript",
            value: "17 lines",
            source: "non-blank, non-comment lines in content/sections/d5-rich-content/files/*.js",
          },
          bullets: [
            "Our policy uses DOMPurify to clean the content before producing that value.",
            "Trusted Types makes the application follow the policy. DOMPurify does the sanitizing. We still need both jobs done correctly.",
            "We’re removing scattered checks, not removing the sanitizer.",
          ],
        },
        {
          id: "s4",
          label: "Write a plain string",
          actions: [
            { type: "hook", name: "renderDirect", args: ["update"] },
            { type: "assert", target: "#console", expect: "contains:TypeError" },
            { type: "assert", target: ".injected-banner", expect: "hidden" },
          ],
          code: { file: "app.js", lines: [[21, 24]] },
          spotlight: ["#console"],
          proof: "Try a direct string assignment and show the browser exception.",
          bullets: [
            "Try inserting a raw string at a protected insertion point.",
            "With enforcement active, the browser rejects it. That’s stronger than hoping every caller remembers the helper.",
            "It doesn’t solve every kind of cross-site scripting. It gives us an enforceable rule for an important set of risky operations.",
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
    {
      text: "MDN compatibility: TrustedTypePolicyFactory",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/TrustedTypePolicyFactory.json",
    },
    {
      text: "MDN compatibility: Content-Security-Policy",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/http/headers/Content-Security-Policy.json",
    },
  ],
  cautions: [
    "Trusted Types does not clean HTML. The policy must call a reviewed sanitizer with tests.",
    "Start in report-only mode and list every sink. Enforcing first can break a large app.",
    "Do not keep a permissive default policy. Use it only while you remove old code paths.",
  ],
};

import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./d5-rich-content/files/. */
export const section: DemoSection = {
  id: "d5-rich-content",
  order: 5,
  label: "Rich content",
  scenario:
    "A product team renders approved CMS rich text. The browser blocks direct strings from reaching HTML injection sinks and allows content only through one reviewed sanitization policy.",
  support: {
    tier: "baseline-newly",
    summary: "Newly (Feb 2026), report first",
    detail:
      "Trusted Types became Baseline 2026 in February (24 Feb 2026: Chrome 83, Safari 26, Firefox 148). Production adoption should begin in report-only mode, inventory existing sinks, and then enforce the policy. Browsers without Trusted Types still get sanitized content through the same function.",
  },
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
    "Trusted Types does not sanitize content. The policy must call a reviewed transformation and must have tests.",
    "Begin with reporting and an injection-sink inventory. Turning on enforcement without that work can break a large application.",
    "Avoid a permissive default policy as the final state. MDN recommends it as a migration aid while legacy paths are being removed.",
  ],
  pages: [
    {
      id: "d5-today",
      stage: "today",
      title: "Rich content: today",
      frame: {
        build: "today",
        route: "/demos/05-trusted-types/today",
        viewport: {
          width: 1280,
          height: 720,
        },
        hooks: ["reset", "renderReview"],
        poster: "/posters/d5-today.png",
      },
      steps: [
        {
          id: "s0",
          label: "Three ways in",
          actions: [],
          notes:
            "A product page with CMS content in three places, each written by a different person at a different time.",
        },
        {
          id: "s1",
          label: "Scattered sinks",
          actions: [
            {
              type: "pointer",
              to: "#t-description",
            },
          ],
          callouts: [
            {
              target: "#t-description",
              text: "Helper used",
              side: "right",
            },
            {
              target: "#t-reviews",
              text: "Raw innerHTML",
              side: "right",
            },
            {
              target: "#t-promo",
              text: "Escape hatch",
              side: "top",
            },
          ],
          notes:
            "Scattered innerHTML assignments and framework escape hatches. A sanitization helper that engineers are expected to remember during review.",
        },
        {
          id: "s2",
          label: "One path forgot",
          actions: [
            {
              type: "hook",
              name: "renderReview",
              args: ["handler"],
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "assert",
              target: ".injected-banner",
              expect: "visible",
            },
          ],
          callouts: [
            {
              target: "#t-reviews",
              text: "Helper skipped",
              side: "right",
            },
            {
              target: ".injected-banner",
              text: "Handler ran",
              side: "bottom",
            },
          ],
          notes:
            "A review arrives with an event handler in it. The one path that skipped the helper ran it. The banner is all this payload does.",
        },
        {
          id: "s3",
          label: "The CSP saw nothing",
          actions: [],
          callouts: [
            {
              target: "#console",
              text: "No report",
              side: "left",
            },
          ],
          meter: {
            label: "innerHTML sinks",
            value: "7 sinks",
            source:
              "count of innerHTML, outerHTML and insertAdjacentHTML assignments in /demos/05-trusted-types/today, counted by hand",
          },
          notes:
            "There is a Content Security Policy that controls script sources, but it cannot require a trusted object at each DOM injection sink. Security testing finds unsafe paths after they are introduced. The meter counts the sinks a reviewer has to remember.",
        },
      ],
      notes: {
        open: "Content safety. Here is what teams commonly maintain.",
        bridge: "Now the browser enforces one reviewed path.",
      },
      timing: {
        minutes: 0.75,
        cumulative: 18.25,
      },
    },
    {
      id: "d5-now",
      stage: "now",
      title: "Rich content: now",
      frame: {
        build: "native",
        route: "/demos/05-trusted-types/native",
        viewport: {
          width: 1280,
          height: 720,
        },
        flags: {
          "csp-enforce": false,
        },
        hooks: ["reset", "renderFixture", "renderDirect"],
        poster: "/posters/d5-now.png",
      },
      steps: [
        {
          id: "s0",
          label: "Report-only mode",
          actions: [],
          notes:
            "Same page, one policy, and the header in report-only mode. That is where a real rollout starts.",
        },
        {
          id: "s1",
          label: "Approved content",
          actions: [
            {
              type: "hook",
              name: "renderFixture",
              args: ["approved"],
            },
            {
              type: "assert",
              target: "#description",
              expect: "contains:Ridgeline",
            },
          ],
          spotlight: ["#description"],
          callouts: [
            {
              target: "#description",
              text: "Through the policy",
              side: "right",
            },
          ],
          notes:
            "Ordinary approved content goes through the policy and renders. The policy creates TrustedHTML only after the content passes through a vetted sanitizer.",
          proof: "Render ordinary approved content through the policy.",
        },
        {
          id: "s2",
          label: "One report-only violation",
          actions: [
            {
              type: "hook",
              name: "renderDirect",
              args: ["handler"],
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "assert",
              target: "#console",
              expect: "contains:require-trusted-types-for",
            },
            {
              type: "assert",
              target: ".injected-banner",
              expect: "visible",
            },
          ],
          spotlight: ["#console", ".injected-banner"],
          callouts: [
            {
              target: "#console",
              text: "Reported",
              side: "left",
            },
            {
              target: ".injected-banner",
              text: "Not blocked",
              side: "bottom",
            },
          ],
          notes:
            "Now a direct string assignment, in report-only mode. The browser reports the violation and lets it through, so the handler ran. Reporting is how you inventory the sinks; it does not protect anyone yet.",
          proof: "Show one report-only violation before switching the local demo to enforcement.",
        },
        {
          id: "s3",
          label: "Enforce",
          actions: [
            {
              type: "toggle",
              flag: "csp-enforce",
              on: true,
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "assert",
              target: "#description",
              expect: "contains:Ridgeline",
            },
          ],
          callouts: [
            {
              target: "#description",
              text: "Still renders",
              side: "right",
            },
          ],
          notes:
            "Switch the header to enforcement. The approved path still renders, because it already goes through the policy.",
        },
        {
          id: "s4",
          label: "Direct string throws",
          actions: [
            {
              type: "hook",
              name: "renderDirect",
              args: ["approved"],
            },
            {
              type: "assert",
              target: "#console",
              expect: "contains:TypeError",
            },
          ],
          spotlight: ["#console"],
          callouts: [
            {
              target: "#console",
              text: "TypeError",
              side: "left",
            },
          ],
          notes:
            "The same direct string assignment now throws a TypeError. That is the require-trusted-types-for directive at work.",
          proof: "Try a direct string assignment and show the browser exception.",
        },
        {
          id: "s5",
          label: "Handler stripped",
          actions: [
            {
              type: "hook",
              name: "renderFixture",
              args: ["handler"],
            },
            {
              type: "assert",
              target: "#description img",
              expect: "no-attr:onerror",
            },
            {
              type: "assert",
              target: ".injected-banner",
              expect: "hidden",
            },
          ],
          spotlight: ["#description img"],
          callouts: [
            {
              target: "#description img",
              text: "Handler removed",
              side: "right",
            },
          ],
          notes:
            "Content with an event handler goes through the policy. The sanitizer removes the handler before TrustedHTML is created, and nothing runs.",
          proof:
            "Try content containing an event handler and show the sanitizer removing it before TrustedHTML is created.",
        },
      ],
      notes: {
        open: "What the browser can own now: a policy that creates TrustedHTML, a CSP directive that requires it, and violation reports during rollout.",
        bridge:
          "The interesting change is the enforced JavaScript boundary and the header. Here they are.",
      },
      timing: {
        minutes: 1.25,
        cumulative: 19.5,
      },
    },
    {
      id: "d5-code",
      stage: "code",
      title: "Rich content: code",
      frame: {
        build: "native",
        route: "/demos/05-trusted-types/native",
        viewport: {
          width: 896,
          height: 720,
        },
        flags: {
          "csp-enforce": false,
        },
        hooks: ["reset", "renderFixture", "renderDirect"],
        poster: "/posters/d5-code.png",
      },
      files: [
        {
          file: "csp-header.http",
          lang: "http",
          source: sectionFile("d5-rich-content", "csp-header.http"),
        },
        {
          file: "app.js",
          lang: "js",
          source: sectionFile("d5-rich-content", "app.js"),
        },
        {
          file: "index.html",
          lang: "html",
          source: sectionFile("d5-rich-content", "index.html"),
        },
        {
          file: "content.css",
          lang: "css",
          source: sectionFile("d5-rich-content", "content.css"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Header and one boundary",
          actions: [],
          code: {
            file: "csp-header.http",
            lines: [],
          },
          notes:
            "Use a normal semantic content container. The interesting change is the enforced JavaScript boundary and the CSP header, not a new visual component.",
        },
        {
          id: "s1",
          label: "Report-only header",
          actions: [
            {
              type: "hook",
              name: "renderDirect",
              args: ["handler"],
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "assert",
              target: "#console",
              expect: "contains:report",
            },
            {
              type: "assert",
              target: ".injected-banner",
              expect: "visible",
            },
          ],
          code: {
            file: "csp-header.http",
            lines: [[2, 6]],
          },
          spotlight: ["#console", ".injected-banner"],
          notes:
            "Start here. require-trusted-types-for 'script' covers the injection sinks, trusted-types names the policies the application may create, and violations go to a reporting endpoint. In report-only mode nothing is blocked, so you can inventory every sink first.",
        },
        {
          id: "s2",
          label: "Enforcement header",
          actions: [
            {
              type: "toggle",
              flag: "csp-enforce",
              on: true,
            },
            {
              type: "wait",
              ms: 400,
            },
          ],
          code: {
            file: "csp-header.http",
            lines: [[9, 12]],
          },
          spotlight: ["#description"],
          notes:
            "The same directives in the enforcing header. The list allows two policies: ours, and dompurify, the internal policy DOMPurify creates. Leave dompurify out and sanitize returns an empty string under enforcement, without an error.",
        },
        {
          id: "s3",
          label: "One named policy",
          actions: [
            {
              type: "hook",
              name: "renderFixture",
              args: ["handler"],
            },
            {
              type: "assert",
              target: "#description img",
              expect: "no-attr:onerror",
            },
          ],
          code: {
            file: "app.js",
            lines: [[6, 12]],
          },
          spotlight: ["#description", "#description img"],
          notes:
            "One policy, cms-html, and its only job is to run the reviewed sanitizer. Browsers without Trusted Types fall back to the same function, so they still get clean HTML. The handler is gone before TrustedHTML exists.",
        },
        {
          id: "s4",
          label: "The trusted path",
          actions: [
            {
              type: "hook",
              name: "renderFixture",
              args: ["approved"],
            },
            {
              type: "assert",
              target: "#description",
              expect: "contains:Ridgeline",
            },
          ],
          code: {
            file: "app.js",
            lines: [
              [14, 18],
              [25, 28],
            ],
          },
          spotlight: ["#description"],
          notes:
            "Content from the CMS goes through createHTML, and the result is what reaches innerHTML. That is the only way in.",
        },
        {
          id: "s5",
          label: "The line that throws",
          actions: [
            {
              type: "hook",
              name: "renderDirect",
              args: ["handler"],
            },
            {
              type: "assert",
              target: "#console",
              expect: "contains:TypeError",
            },
            {
              type: "assert",
              target: ".injected-banner",
              expect: "hidden",
            },
          ],
          code: {
            file: "app.js",
            lines: [[20, 23]],
          },
          spotlight: ["#console"],
          notes:
            "This now throws under enforcement. The handler payload never reaches the page, and the banner stays hidden. React 19.3 added Trusted Types support, so the same boundary holds inside a React app.",
        },
        {
          id: "s6",
          label: "Production cautions",
          actions: [],
          code: {
            file: "app.js",
            lines: [
              [6, 7],
              [9, 12],
            ],
          },
          spotlight: ["#description"],
          notes:
            "Trusted Types does not sanitize content: the policy must call a reviewed transformation and must have tests. Begin with reporting and an injection-sink inventory, because enforcement without that work can break a large application. Avoid a permissive default policy as the final state; MDN recommends it as a migration aid while legacy paths are being removed.",
        },
      ],
      notes: {
        open: "The header first, because rollout order matters. Then the policy.",
        bridge: "That is the browser section. Next, what is still in motion.",
      },
      timing: {
        minutes: 1.25,
        cumulative: 20.75,
      },
    },
  ],
};

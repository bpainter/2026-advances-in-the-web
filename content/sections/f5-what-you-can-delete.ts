import type { DemoSection } from "@/content/demo-schema";

/** F5: what each core demo lets a team delete, with one npm pull and a not-yet column. */
export const section: DemoSection = {
  id: "f5-what-you-can-delete",
  background: "f5",
  order: 11,
  label: "What you can delete",
  scenario: "One table maps each core demo to the libraries it replaces, from one npm pull.",
  pages: [
    {
      id: "f5-single",
      stage: "single",
      badge: { text: "npm, one weekly pull" },
      title: "What you can delete",
      intro:
        "Each core demo stood in for code teams carry today. This table names it, with the exceptions.",
      frame: {
        build: "static",
        route: "/demos/10-delete/static",
        viewport: { width: 1304, height: 628 },
        hooks: ["reset"],
      },
      steps: [
        {
          id: "s0",
          label: "Order actions",
          actions: [{ type: "hook", name: "reset" }, { type: "reveal", target: "#row-d1" }],
          spotlight: ["#row-d1"],
          bullets: ["Dialog and popover replace modal and focus-trap libraries. Floating UI stays for now."],
        },
        {
          id: "s1",
          label: "Card and form",
          actions: [
            { type: "reveal", target: "#row-d2" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#row-d3" },
          ],
          spotlight: ["#row-d2", "#row-d3"],
          bullets: [
            "Container queries replace resize observers. Field sizing replaces autosize scripts.",
          ],
        },
        {
          id: "s2",
          label: "Navigation and content",
          actions: [
            { type: "reveal", target: "#row-d4" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#row-d5" },
          ],
          spotlight: ["#row-d4", "#row-d5"],
          bullets: [
            "The Navigation API replaces small routers. DOMPurify stays, behind one policy.",
          ],
        },
        {
          id: "s3",
          label: "Variant picker",
          actions: [{ type: "reveal", target: "#row-d6" }],
          spotlight: ["#row-d6"],
          bullets: [
            "Customizable select can replace custom select libraries once Firefox ships it.",
          ],
        },
        {
          id: "s4",
          label: "Not yet: dates",
          key: true,
          actions: [{ type: "reveal", target: "#row-dates" }],
          spotlight: ["#row-dates"],
          bullets: [
            "Date libraries stay until Temporal reaches Safari.",
            "The counts are one npm pull and include CI installs. Compare rows, not totals.",
          ],
        },
      ],
      timing: { minutes: 0.75 },
      cutPriority: 1,
    },
  ],
  citations: [
    {
      text: "npm last-week downloads (swap the package name); one fresh pull the week of the talk",
      url: "https://api.npmjs.org/downloads/point/last-week/@headlessui/react",
    },
    {
      text: "@headlessui/react 2.2.10 size, 209 KB min / 63 KB gzipped",
      url: "https://bundlephobia.com/api/size?package=@headlessui/react",
    },
    {
      text: "Not yet: Floating UI and Popper, placement solved, interaction not (v2 research section 3)",
      url: "https://api.npmjs.org/downloads/point/last-week/@floating-ui/dom",
    },
    {
      text: "Interop 2026: anchor positioning still a focus area",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Temporal browser status (not in Safari)",
      url: "https://webstatus.dev/features/temporal",
    },
    {
      text: "Intl.DurationFormat Baseline Mar 2025",
      url: "https://webstatus.dev/features/intl-duration-format",
    },
    {
      text: "MDN Trusted Types API (policy wraps a reviewed sanitizer)",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API",
    },
    {
      text: "HTML Sanitizer API (setHTML); Safari pending per v2 research, recheck the week of the talk",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API",
    },
    {
      text: "react-textarea-autosize download count (fresh pull)",
      url: "https://api.npmjs.org/downloads/point/last-week/react-textarea-autosize",
    },
  ],
  cautions: [],
};

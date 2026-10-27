import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "tooling",
  index: 27,
  section: "delete",
  layout: "list",
  title: "Put the tier in the lint config",
  eyebrow: "MAKE IT MECHANICAL",
  items: [
    {
      label: "module-replacements (e18e)",
      detail: "Three manifests: 205 native, 109 micro-utility, 183 preferred. Consumed by eslint-plugin-depend and @e18e/eslint-plugin. Tells you what to delete.",
      icon: "trash-2",
    },
    {
      label: "browserslist-config-baseline",
      detail: "Sets your compile target to Baseline Widely or a Baseline year. Vite 7+ already defaults to baseline-widely-available. Tells you when your targets allow it.",
      icon: "calendar-check",
    },
    {
      label: "@eslint/css use-baseline, eslint-plugin-baseline-js",
      detail: "Plus the Lighthouse Baseline Features audit and npx knip for unused dependencies. Catches the regressions.",
      icon: "shield-check",
    },
  ],
  citations: [
    {
      text: "e18e manifests",
      url: "https://github.com/es-tooling/module-replacements",
    },
    {
      text: "browserslist-config-baseline",
      url: "https://github.com/web-platform-dx/browserslist-config-baseline",
    },
    {
      text: "@eslint/css",
      url: "https://github.com/eslint/css",
    },
    {
      text: "eslint-plugin-baseline-js",
      url: "https://registry.npmjs.org/eslint-plugin-baseline-js",
    },
    {
      text: "Lighthouse Baseline audit",
      url: "https://web.dev/blog/baseline-lighthouse-features-audit",
    },
    {
      text: "Vite 7 default",
      url: "https://vite.dev/blog/announcing-vite7",
    },
    {
      text: "Modern Web Guidance skills",
      url: "https://web.dev/blog/baseline-digest-aug-2026",
    },
    {
      text: "Comeau: we can't expect LLMs to use modern CSS features when so much of their training data is years old",
      url: "https://www.joshwcomeau.com/css/interop-2027/",
    },
  ],
  speakerNotes: "One tool tells you what to delete, one tells you when your targets allow it, and one stops it coming back. The adoption rule should live where the machine reads it rather than in a wiki. Josh Comeau's point for teams whose code is increasingly agent-written: we can't expect LLMs to use modern CSS features when so much of their training data is years old, so the agent will default to Floating UI and useEffect autosize unless your lint rules, AGENTS.md, and design-system docs say otherwise; Google's Baseline-aware Modern Web Guidance skills for coding agents are an early answer. Thirty seconds. The lint config decides what you add; the package manager now decides what you're allowed to install, and that changed because of what happened next.",
  timing: {
    minutes: 0.5,
    cumulative: 27,
  },
  cutPriority: 8,
};

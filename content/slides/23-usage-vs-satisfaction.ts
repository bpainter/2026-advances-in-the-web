import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "usage-vs-satisfaction",
  index: 23,
  section: "frameworks",
  layout: "chart",
  title: "Usage and satisfaction",
  eyebrow: "STATE OF JS 2025",
  body: ["Used most, liked least."],
  stats: [
    {
      value: "Jan 2026",
      label: "Cloudflare acquires Astro",
      source: "https://www.nasdaq.com/press-release/cloudflare-acquires-astro-accelerate-future-high-performance-web-development-2026-01",
    },
    {
      value: "Jun 2026",
      label: "Cloudflare acquires VoidZero, the Vite, Vitest, and Rolldown team",
      source: "https://voidzero.dev/posts/voidzero-cloudflare",
    },
    {
      value: "Oct 2025",
      label: "Meta moves React to a Linux Foundation-hosted React Foundation",
      source: "https://react.dev/blog/2025/10/07/introducing-the-react-foundation",
    },
  ],
  citations: [
    {
      text: "State of JS 2025 usage and satisfaction",
      url: "https://2025.stateofjs.com/en-US/libraries/",
    },
    {
      text: "Strapi summary",
      url: "https://strapi.io/blog/state-of-javascript-2025-key-takeaways",
    },
    {
      text: "Cloudflare acquires Astro",
      url: "https://www.nasdaq.com/press-release/cloudflare-acquires-astro-accelerate-future-high-performance-web-development-2026-01",
    },
    {
      text: "Cloudflare acquires VoidZero",
      url: "https://voidzero.dev/posts/voidzero-cloudflare",
    },
    {
      text: "React Foundation",
      url: "https://react.dev/blog/2025/10/07/introducing-the-react-foundation",
    },
    {
      text: "Remix 3 (aside only)",
      url: "https://remix.run/blog/remix-3-release-candidate",
    },
    {
      text: "React Router v8",
      url: "https://remix.run/blog/react-router-v8",
    },
  ],
  speakerNotes: "The inversion is the story: the most-used meta-framework has the lowest satisfaction of the three we present on, and the least-used has the highest; Turbopack itself sits at 66 percent. Survey data explains why the frameworks changed course: satisfaction fell where the magic was thickest. Ownership moved too: Cloudflare now controls both Astro and Vite's core team, so one CDN company stewards the substrate most of the frameworks converged on, and React's move to a foundation is the open-governance counterexample; say both. One line, no slide: Remix 3 shipped on 1 October as a non-React, zero-dependency framework at 36K weekly downloads against React Router's 33M. Now the part of the talk the room can act on tomorrow morning.",
  timing: {
    minutes: 0.75,
    cumulative: 24,
  },
  cutPriority: 5,
  chart: {
    kind: "dot",
    xLabel: "Used by (% of respondents)",
    yLabel: "Satisfied (% of users)",
    points: [
      {
        label: "Next.js",
        x: 58.6,
        y: 55,
        source: "https://2025.stateofjs.com/",
      },
      {
        label: "Astro",
        x: 6,
        y: 94,
        source: "https://2025.stateofjs.com/",
      },
    ],
    axisNotes: [
      {
        label: "SvelteKit",
        y: 88,
      },
      {
        label: "Svelte",
        y: 86,
      },
    ],
  },
};

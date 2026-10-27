import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "section-frameworks",
  index: 21,
  section: "frameworks",
  layout: "section",
  title: "The frameworks",
  eyebrow: "SECTION 3",
  body: ["Astro 7 and SvelteKit 3 require Vite 8. Next.js is the holdout."],
  items: [
    {
      label: "Astro 7 · 22 Jun 2026",
      detail: "Vite 8 and Rolldown; builds 15 to 61% faster; Hono-compatible src/fetch.ts",
    },
    {
      label: "SvelteKit 3 · 1 Oct 2026",
      detail: "Requires Vite 8; config in vite.config.ts; #lib Node subpath imports",
    },
    {
      label: "Next.js 16 · 21 Oct 2025",
      detail: "Turbopack default; edge runtime deprecated; proxy.ts on Node",
    },
  ],
  image: {
    prompt: "Flat vector graphic on a navy #0F1C41 field: three thin white lines enter from the left edge at different heights, bend once, and merge into a single thicker Slalom blue #0C62FB line that exits at the right edge. Flat fills only, no gradient, no glow, no shadow, no text, generous empty space on the left half. 16:9.",
    alt: "Three white lines merging into one blue line on a navy field.",
    model: "higgsfield/nano-banana-2",
    placement: "right-half",
  },
  citations: [
    {
      text: "Vite 8, 12 Mar 2026, Rolldown, Linear 46s to 6s",
      url: "https://vite.dev/blog/announcing-vite8",
    },
    {
      text: "Vite 7 baseline-widely-available default",
      url: "https://vite.dev/blog/announcing-vite7",
    },
    {
      text: "Astro 7, 22 Jun 2026",
      url: "https://astro.build/blog/astro-7/",
    },
    {
      text: "SvelteKit 3, 1 Oct 2026",
      url: "https://www.netlify.com/changelog/2026-10-01-sveltekit-3.md",
    },
    {
      text: "Next.js 16, 21 Oct 2025",
      url: "https://nextjs.org/blog/next-16",
    },
    {
      text: "Edge runtime deprecated, proxy.ts",
      url: "https://nextjs.org/docs/messages/edge-runtime-deprecated",
    },
    {
      text: "Vercel: deprecated for new projects",
      url: "https://vercel.com/changelog/edge-middleware-and-edge-functions-are-now-powered-by-vercel-functions",
    },
    {
      text: "React Router 8.2 Web Streams",
      url: "https://reactrouter.com/changelog",
    },
  ],
  speakerNotes: "We scope this act to React and Next.js, Svelte and SvelteKit, and Astro, because that's what we present on and what this room runs. Vite 8 shipped on 12 March 2026 with Rolldown as its single Rust bundler, 10 to 30x build claims, Linear's build from 46 seconds to 6, and Vite 7 had already set the default browser target to baseline-widely-available, the platform's vocabulary showing up in your build config. The substrate is web-standard: Astro 7 routes through a Hono-compatible fetch, React Router 8.2 defaults to Web Streams, and Vercel's own changelog says Edge Functions are deprecated for new projects. Say the Next.js correction plainly: the most-used framework did not converge on Vite, so the abstract's framing needs the asterisk; Nuxt, SolidStart, Nitro, and TanStack Start made the same Vite 8 move, one line, no slide. Next, Next.js makes the second argument in its own words.",
  timing: {
    minutes: 1,
    cumulative: 22,
  },
};

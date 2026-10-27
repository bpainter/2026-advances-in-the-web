import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "nextjs-own-words",
  index: 22,
  section: "frameworks",
  layout: "comparison",
  title: "Next.js on caching",
  eyebrow: "RETREAT FROM IMPLICIT MAGIC",
  items: [
    {
      label: "Next.js 16.3 release post",
      detail: "\"The caching model was implicit, confusing, and not helpful for dynamic apps.\"\nServer Components \"made navigations feel slow.\"\n16.4: Cache Components recommended for every app, default in Next.js 17.",
    },
    {
      label: "The wrapper and the platform",
      detail: "// React 19.3\n<ViewTransition><Card id={id} /></ViewTransition>\n\n// the platform it wraps (slide 16)\ndocument.startViewTransition(() => render());\n\nReact Router 8.5 deprecated its own view-transition APIs in favour of the platform's.",
      mono: true,
    },
  ],
  quote: {
    text: "The caching model was implicit, confusing, and not helpful for dynamic apps.",
    who: "Next.js 16.3 release post",
    where: "nextjs.org, 2026",
    url: "https://nextjs.org/blog/next-16-3",
  },
  citations: [
    {
      text: "Next.js 16 Cache Components",
      url: "https://nextjs.org/blog/next-16",
    },
    {
      text: "Next.js 16.3 quotes",
      url: "https://nextjs.org/blog/next-16-3",
    },
    {
      text: "Next.js 16.4, default in 17",
      url: "https://nextjs.org/blog/next-16-4",
    },
    {
      text: "React 19.3 <ViewTransition> stable",
      url: "https://react.dev/blog/2026/09/09/react-19-3",
    },
    {
      text: "React Router 8.5",
      url: "https://reactrouter.com/changelog",
    },
    {
      text: "SvelteKit remote functions: this is our take on RPCs",
      url: "https://devclass.com/devops/2026/08/20/sveltekit-3-puts-heat-on-nextjs-with-radical-approach-to-rpcs/5290688",
    },
    {
      text: "Svelte, August 2025",
      url: "https://svelte.dev/blog/whats-new-in-svelte-august-2025",
    },
    {
      text: "TanStack Start 1.0 (aside only)",
      url: "https://tanstack.com/blog/tanstack-start-1-0",
    },
    {
      text: "CVE caution: two identifiers",
      url: "https://jfrog.com/fr/blog/2025-55182-and-2025-66478-react2shell-all-you-need-to-know/",
    },
  ],
  speakerNotes: "Letting Next.js say it avoids the appearance of a framework fight: the most-used framework published the critique of its own caching model, and the fix is explicitness. Next.js 16 introduced opt-in Cache Components with use cache, 16.3 said the quiet part, and 16.4 made it the recommendation and the default in 17. The same move is everywhere: typed RPC instead of a server rendering model, with Simon Holthausen calling SvelteKit's remote functions our take on RPCs; say check the flag status rather than stable, because a Svelte maintainer may be in the room, and give TanStack Start one line at most. The code pair bridges back to slide 16, so the room sees the platform API and the framework wrapper as one feature. Don't put the December 2025 React Server Components CVE on a slide; two identifiers exist and the report says confirm before using either.",
  timing: {
    minutes: 1.25,
    cumulative: 23.25,
  },
};

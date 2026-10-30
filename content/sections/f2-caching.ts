import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/06-framework-cache-today";
const REQUEST = { type: "hook", name: "requestPage" } as const;

/** F2: route-level freshness flags in Next.js, then Cache Components with use cache and tags. */
export const section: DemoSection = {
  id: "f2-caching",
  background: "f2",
  order: 12,
  label: "Caching",
  feature: "Cache Components",
  scenario: "A product page with shared copy, a scheduled price and stock read for each user.",
  support: {
    kind: "tooling",
    packages: [{ name: "Next.js", npm: "next", version: "16", logo: "/logos/nextjs.svg" }],
  },
  pages: [
    {
      id: "f2-intro",
      stage: "intro",
      intro:
        "Let’s move from browser features to framework decisions.\n\nA product page has information everyone shares, like the name and description. Stock may depend on the user’s region or account. Those pieces don’t need the same caching rules.\n\nWe’ll use Next.js Cache Components to make that difference explicit. The useful question isn’t just, “Can we cache this page?” It’s, “Which work can we safely reuse?”",
      description:
        "Cache Components let you mark in code exactly which parts of a page are cached.",
      visual: {
        src: "/intro/f2-caching.png",
        alt: "The product page above its request log, where only inventory queries repeat.",
        capture: { pageId: "f2-now", stepId: "s1" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "f2-used-to",
      stage: "used-to",
      eyebrow: "Cache Components",
      title: "What we used to do",
      intro:
        "Here’s the page with Cache Components turned off.\n\nThe request log will show which queries run each time. We’ll watch the work, not just whether the page looks fast.",
      frame: {
        build: "framework",
        route: "/framework-today/products/ridgeline-trail",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "requestPage"],
      },
      files: [
        excerpt(`${TODAY}/app/products/[id]/page.tsx`, "tsx", [[11, 29]], "page.tsx"),
        excerpt(`${TODAY}/lib/inventory.ts`, "ts", [
          [9, 19],
          [31, 33],
        ]),
        excerpt(`${TODAY}/lib/catalog.ts`, "ts", [[1, 12]]),
      ],
      steps: [
        {
          id: "s0",
          label: "Empty log",
          actions: [{ type: "hook", name: "reset" }],
          code: { file: "page.tsx", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Read the route settings",
          actions: [REQUEST],
          code: { file: "page.tsx", lines: [[2, 6]] },
          spotlight: ["#request-log"],
          bullets: [
            "The route has an hourly revalidation setting and an automatic rendering setting.",
            "Those are useful controls, but they don’t explain the whole page on their own. We also need to look at what the data functions do.",
          ],
        },
        {
          id: "s2",
          label: "Load the page again",
          actions: [REQUEST, { type: "wait", ms: 400 }, REQUEST],
          code: { file: "inventory.ts", lines: [9, [14, 16]] },
          spotlight: ["#request-log"],
          bullets: [
            "Load the page again.",
            "The stock function reads cookies, so the route needs request-time rendering. The catalog is a plain database read without its own cache, so that query runs again too.",
            "Reading a cookie doesn’t erase every possible data cache. The repeated work here comes from this particular combination.",
          ],
        },
        {
          id: "s3",
          label: "Count the settings",
          key: true,
          actions: [REQUEST],
          code: { file: "catalog.ts", lines: [[4, 11]] },
          spotlight: ["#request-log"],
          meter: {
            label: "Freshness settings",
            value: "5 in 4 files",
            source: "counted by scripts/count-cache-flags.mjs in apps/f2-today",
          },
          bullets: [
            "The demo counts five freshness settings across four files.",
            "To understand what gets reused, we have to follow those settings through the application.",
            "The problem isn’t that caching was impossible before. It’s that the intended behavior can be hard to see where the data is loaded.",
          ],
        },
      ],
      timing: { minutes: 0.75 },
    },
    {
      id: "f2-now",
      stage: "now",
      eyebrow: "Cache Components",
      title: "What we can do today",
      intro:
        "Now Cache Components is enabled.\n\nWe’ll mark the shared catalog read for caching and leave the request-specific stock read outside that shared cache.",
      frame: {
        build: "framework",
        route: "/framework/products/ridgeline-trail",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "requestPage", "invalidateProduct", "switchRegion", "switchUser"],
      },
      files: [
        sectionCode("f2-caching", "catalog.ts", "ts"),
        sectionCode("f2-caching", "page.tsx", "tsx"),
        sectionCode("f2-caching", "inventory.ts", "ts"),
      ],
      steps: [
        {
          id: "s0",
          label: "Page loaded",
          actions: [{ type: "hook", name: "reset" }, REQUEST],
          code: { file: "catalog.ts", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Cache the catalog",
          key: true,
          actions: [REQUEST, { type: "wait", ms: 400 }, REQUEST],
          code: { file: "catalog.ts", lines: [[11, 14]] },
          spotlight: ["#request-log"],
          proof:
            "Log the catalog query and inventory query separately so the audience can see which work repeats.",
          meter: {
            label: "Freshness settings",
            value: "3 in 1 file",
            source:
              "use cache, cacheLife and cacheTag in content/sections/f2-caching/files/catalog.ts, counted by hand",
          },
          bullets: [
            "Load the page a couple more times and watch the log.",
            "`use cache` marks the catalog function for reuse. `cacheLife` sets its cache policy, and `cacheTag` gives us a way to target that cached result later.",
            "In this example, the catalog query stops repeating while the stock query still runs for each request. The three controls are together where we can find them.",
          ],
        },
        {
          id: "s2",
          label: "Stream the stock",
          actions: [{ type: "hook", name: "requestPage", args: [{ inventoryDelayMs: 1200 }] }],
          code: {
            file: "page.tsx",
            lines: [
              [22, 26],
              [31, 37],
            ],
          },
          spotlight: [".stock"],
          bullets: [
            "Slow the stock request down.",
            "The product name and description can appear first. The stock section shows its fallback until the result is ready.",
            "`Suspense` lets us wait for that part without holding back the whole page.",
          ],
        },
        {
          id: "s3",
          label: "Expire the tag",
          actions: [
            { type: "hook", name: "invalidateProduct", args: ["Now with a recycled rubber sole."] },
            { type: "wait", ms: 300 },
            REQUEST,
          ],
          code: { file: "catalog.ts", lines: [13] },
          spotlight: ["article h1 + p", "#request-log"],
          proof:
            "Change the product copy, fire the product tag invalidation, and show the next request receiving fresh content.",
          bullets: [
            "Save a new product description.",
            "The save action calls `updateTag` for the product’s cache tag. The next read gets fresh catalog data instead of waiting for the normal cache policy.",
            "That doesn’t mean every already-open page updates itself. Cache invalidation and updating an existing screen are separate jobs.",
          ],
        },
        {
          id: "s4",
          label: "Switch user and region",
          actions: [
            { type: "hook", name: "switchUser", args: ["agent-2"] },
            { type: "hook", name: "switchRegion", args: ["eu"] },
            REQUEST,
          ],
          code: {
            file: "inventory.ts",
            lines: [
              [5, 6],
              [10, 13],
            ],
          },
          spotlight: [".stock", "#request-log"],
          bullets: [
            "Switch the user and region.",
            "The stock result changes, while the shared catalog can stay cached.",
            "Keeping user-specific reads out of a shared cache helps avoid mixing results between users. It isn’t the whole privacy story. We still need authorization and careful cache keys wherever private data is involved.",
          ],
        },
      ],
      timing: { minutes: 2.25 },
    },
  ],
  citations: [
    {
      text: "Next.js 16: opt-in Cache Components and use cache, 21 Oct 2025",
      url: "https://nextjs.org/blog/next-16",
    },
    {
      text: "Next.js 16.3: the caching model was implicit, confusing, and not helpful for dynamic apps",
      url: "https://nextjs.org/blog/next-16-3",
    },
    {
      text: "Next.js 16.4: Cache Components recommended for every app, default in Next.js 17",
      url: "https://nextjs.org/blog/next-16-4",
    },
    {
      text: "Next.js, Migrating to Cache Components (cacheComponents, cacheLife, cacheTag, updateTag, generateStaticParams, cookies inside Suspense)",
      url: "https://nextjs.org/docs/app/guides/migrating-to-cache-components",
    },
    {
      text: "Next.js across platforms (stable Adapter API)",
      url: "https://nextjs.org/blog/nextjs-across-platforms",
    },
    {
      text: "React 19.3: stable ViewTransition and Trusted Types support",
      url: "https://react.dev/blog/2026/09/09/react-19-3",
    },
    {
      text: "Astro 7.0: stable route caching, Vite 8, faster compiler and Markdown",
      url: "https://astro.build/blog/astro-7/",
    },
    {
      text: "SvelteKit 3 release coverage (migration command)",
      url: "https://www.netlify.com/changelog/2026-10-01-sveltekit-3.md",
    },
    {
      text: "State of JS 2025: Next.js 58.6% usage, 55% satisfaction (optional context)",
      url: "https://2025.stateofjs.com/en-US/libraries/",
    },
  ],
  cautions: [
    "Pin the framework and runtime versions in the repository, and say them if asked.",
    "Show one failure mode, such as stale copy or private data in a shared cache.",
    "Do not repeat vendor benchmarks unless your own repository reproduces them.",
  ],
};

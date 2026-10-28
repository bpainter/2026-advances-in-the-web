import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

const TODAY = "demos/06-framework-cache-today";
const REQUEST = { type: "hook", name: "requestPage" } as const;

/** F2: route-level freshness flags in Next.js, then Cache Components with use cache and tags. */
export const section: DemoSection = {
  id: "f2-caching",
  order: 8,
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
        "Frameworks are changing too. This product page has copy everyone shares and stock that is different for each user. The question is what to cache.",
      description:
        "Cache Components let you mark exactly which parts of a page are cached, right in the code.",
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
      title: "How we used to do it",
      intro:
        "This is the same page in Next.js 16 with Cache Components off. The log below it lists every query.",
      frame: {
        build: "framework",
        route: "/framework-today/products/ridgeline-trail",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "requestPage"],
      },
      files: [
        excerpt(`${TODAY}/app/products/[id]/page.tsx`, "tsx", [[5, 23]], "page.tsx"),
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
            "The route says regenerate hourly and work it out. Those two settings cover the whole page.",
          ],
        },
        {
          id: "s2",
          label: "Load the page again",
          actions: [REQUEST, { type: "wait", ms: 400 }, REQUEST],
          code: { file: "inventory.ts", lines: [9, [14, 16]] },
          spotlight: ["#request-log"],
          bullets: [
            "Each load runs the catalog query again. Reading a cookie for stock made the whole route dynamic.",
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
            "The catalog has no setting of its own, so it follows the route.",
            "Five freshness settings in four files decide what caches.",
          ],
        },
      ],
      timing: { minutes: 0.75 },
    },
    {
      id: "f2-now",
      stage: "now",
      eyebrow: "Cache Components",
      title: "How we do it now",
      intro:
        "This is the same page with one flag on in the config. Now nothing is cached unless the code asks.",
      frame: {
        build: "framework",
        route: "/framework/products/ridgeline-trail",
        viewport: { width: 640, height: 628 },
        hooks: ["reset", "requestPage", "invalidateProduct", "switchRegion", "switchUser"],
      },
      files: [
        { file: "catalog.ts", lang: "ts", source: sectionFile("f2-caching", "catalog.ts") },
        { file: "page.tsx", lang: "tsx", source: sectionFile("f2-caching", "page.tsx") },
        { file: "inventory.ts", lang: "ts", source: sectionFile("f2-caching", "inventory.ts") },
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
            "Two more loads. The catalog query ran once, and only inventory repeats.",
            "The use cache line caches this function. cacheLife says for how long.",
            "cacheTag gives the result a name, so we can expire it later.",
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
            "We slowed inventory down. The name and copy arrive first, then the stock line.",
            "Suspense lets the cached part show while the stock is still loading.",
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
            "We save new copy. The next load runs the catalog query once and shows it.",
            "The save calls updateTag with this tag, so nobody sees the old copy.",
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
            "A different user in another region. The stock changes, and the catalog stays cached.",
            "Inventory reads cookies and is never cached, so one user's data never reaches another.",
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

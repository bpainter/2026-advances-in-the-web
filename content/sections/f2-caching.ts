import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./f2-caching/files/. */
export const section: DemoSection = {
  id: "f2-caching",
  order: 8,
  label: "Caching",
  feature: "Cache Components",
  scenario:
    "TODO rewrite: A Next.js 16 product page combines a shared catalog description, a price that changes on a business schedule, and inventory that must be read at request time, with an explicit cache invalidation event.",
  support: {
    kind: "tooling",
    packages: [
      {
        name: "Next.js",
        npm: "next",
        version: "16",
        logo: "/logos/nextjs.svg",
      },
    ],
  },
  pages: [
    {
      id: "f2-intro",
      stage: "intro",
      intro: "TODO rewrite",
      description: "TODO description",
      visual: {
        src: "/intro/f2-caching.png",
        alt: "TODO alt",
        capture: {
          pageId: "f2-now",
          stepId: "s1",
        },
      },
      steps: [
        {
          id: "s0",
          label: "Title and support",
          actions: [],
          bullets: [],
        },
      ],
      timing: {
        minutes: 0.25,
      },
    },
    {
      id: "f2-used-to",
      stage: "used-to",
      eyebrow: "Cache Components",
      title: "How we used to do it",
      intro:
        "TODO rewrite: The framework section should solve one production problem deeply. Here is a product page built the way many teams still build it: a shared catalog description, a price on a business schedule, and inventory read at request time.",
      frame: {
        build: "framework",
        route: "/framework-today/products/ridgeline-trail",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset", "requestPage"],
        poster: "/posters/f2-today-s2.png",
      },
      files: [],
      steps: [
        {
          id: "s0",
          label: "Product page, empty log",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: A product page and its request log.",
            "TODO rewrite: Five freshness settings across four files decide what this page caches.",
          ],
        },
        {
          id: "s1",
          label: "Three requests",
          actions: [
            {
              type: "hook",
              name: "requestPage",
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "hook",
              name: "requestPage",
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#request-log"],
          bullets: [
            "TODO rewrite: Three requests.",
            "TODO rewrite: The catalog query runs every time, and so does inventory.",
            "TODO rewrite: The route says revalidate 3600, but the inventory cookie read made the whole route dynamic, and the catalog call is a database query, so nothing caches it.",
          ],
          ifKeyboard: "TODO rewrite: Reload the page three times and point at the log.",
        },
        {
          id: "s2",
          label: "Which part is cached",
          actions: [],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#request-log .log-head"],
          bullets: [
            "TODO rewrite: Route-level dynamic and revalidation flags whose combined behavior is difficult to explain. fetch options spread across data functions with unclear ownership of freshness.",
            "TODO rewrite: Price is cached by its fetch option, catalog is not, and you can only tell by reading four files.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
          meter: {
            label: "Freshness settings",
            value: "5 in 4 files",
            source: "counted by scripts/count-cache-flags.mjs in apps/f2-today",
          },
        },
      ],
      timing: {
        minutes: 0.75,
      },
    },
    {
      id: "f2-now",
      stage: "now",
      eyebrow: "Cache Components",
      title: "How we do it now",
      intro:
        "TODO rewrite: With Cache Components enabled, pages are dynamic by default unless code opts into caching. Watch which queries repeat.",
      frame: {
        build: "framework",
        route: "/framework/products/ridgeline-trail",
        viewport: {
          width: 640,
          height: 628,
        },
        hooks: ["reset", "requestPage", "invalidateProduct", "switchRegion", "switchUser"],
        poster: "/posters/f2-code-s5.png",
      },
      files: [
        {
          file: "next.config.ts",
          lang: "ts",
          source: sectionFile("f2-caching", "next.config.ts"),
        },
        {
          file: "catalog.ts",
          lang: "ts",
          source: sectionFile("f2-caching", "catalog.ts"),
        },
        {
          file: "inventory.ts",
          lang: "ts",
          source: sectionFile("f2-caching", "inventory.ts"),
        },
        {
          file: "page.tsx",
          lang: "tsx",
          source: sectionFile("f2-caching", "page.tsx"),
        },
        {
          file: "actions.ts",
          lang: "ts",
          source: sectionFile("f2-caching", "actions.ts"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Page loaded",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          bullets: [
            "TODO rewrite: The page from the last step, freshly reset, one request in the log.",
          ],
        },
        {
          id: "s1",
          label: "One flag",
          actions: [
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "next.config.ts",
            lines: [4],
          },
          spotlight: ["#request-log"],
          bullets: [
            "TODO rewrite: One flag in next.config.ts.",
            "TODO rewrite: With Cache Components enabled, pages are dynamic by default unless code opts into caching.",
          ],
          ifKeyboard: "TODO rewrite: Reload once.",
        },
        {
          id: "s2",
          label: "The cached unit",
          actions: [
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "catalog.ts",
            lines: [[11, 14]],
          },
          spotlight: ["article h1", ".log-row--catalog"],
          bullets: [
            "TODO rewrite: The use cache directive, cacheLife(), and cacheTag() make the cached unit and its lifetime visible in code.",
            "TODO rewrite: The log call sits inside the cached function, so it prints only on a miss, and this request adds no catalog line.",
          ],
          ifKeyboard: "TODO rewrite: Reload and point at the log: inventory only.",
        },
        {
          id: "s3",
          label: "Static shell, streamed stock",
          actions: [
            {
              type: "hook",
              name: "requestPage",
              args: [
                {
                  inventoryDelayMs: 1200,
                },
              ],
            },
          ],
          code: {
            file: "page.tsx",
            lines: [
              [22, 26],
              [31, 38],
            ],
          },
          spotlight: [".stock"],
          bullets: [
            "TODO rewrite: The page can keep a reusable static shell while request-time data resolves within a Suspense boundary.",
            "TODO rewrite: I slowed inventory down so you can see the name and copy arrive first, then the stock line.",
          ],
          ifKeyboard: "TODO rewrite: Reload with ?slow=inventory in the address bar.",
        },
        {
          id: "s4",
          label: "Request-time inventory",
          actions: [
            {
              type: "hook",
              name: "switchRegion",
              args: ["eu"],
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "inventory.ts",
            lines: [
              [5, 6],
              [10, 13],
            ],
          },
          spotlight: [".stock", ".log-row--inventory"],
          bullets: [
            "TODO rewrite: inventory.ts stays request-time because it depends on the user and region.",
            "TODO rewrite: There is no directive, and the cookie read is why it has to sit inside the Suspense boundary.",
          ],
          ifKeyboard: "TODO rewrite: Switch the region to EU in the demo header and reload.",
        },
        {
          id: "s5",
          label: "Invalidate by tag",
          actions: [
            {
              type: "hook",
              name: "invalidateProduct",
              args: ["Now with a recycled rubber sole."],
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "actions.ts",
            lines: [[9, 10]],
          },
          spotlight: ["article h1 + p", ".log-row--catalog"],
          bullets: [
            "TODO rewrite: updateTag runs in a Server Action after the write.",
            "TODO rewrite: It expires the product tag, so the next request waits for fresh data instead of serving stale content, and the same tag string is the one catalog.ts set.",
          ],
          ifKeyboard: "TODO rewrite: Save new copy in the demo admin field and reload.",
        },
        {
          id: "s6",
          label: "Production bar",
          actions: [],
          code: {
            file: "catalog.ts",
            lines: [13],
          },
          bullets: [
            "TODO rewrite: The production bar for any framework demo: state the framework version and runtime version in the repository, show one failure mode, measure a result the audience can inspect, and avoid vendor benchmark claims unless the demo repository reproduces them.",
            "TODO rewrite: If someone asks about the other frameworks:",
            "TODO rewrite: React 19.3 has stable ViewTransition and Trusted Types support, Astro 7 has stable route caching, Vite 8, and a faster compiler and Markdown path, and SvelteKit 3 has a migration command that produces code changes and a remaining TODO list.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
        },
        {
          id: "s7",
          label: "TODO cut: Three requests, logged separately",
          actions: [
            {
              type: "hook",
              name: "requestPage",
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "hook",
              name: "requestPage",
            },
            {
              type: "wait",
              ms: 400,
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["#request-log"],
          callouts: [
            {
              target: ".log-row--catalog",
              text: "Catalog once",
              side: "left",
            },
            {
              target: ".log-row--inventory",
              text: "Inventory every request",
              side: "left",
            },
          ],
          bullets: [
            "TODO rewrite: Three requests again.",
            "TODO rewrite: The catalog query runs once.",
            "TODO rewrite: Inventory runs on every request, because it depends on the user and region.",
          ],
          ifKeyboard: "TODO rewrite: Reload three times and read the log aloud.",
          proof:
            "Log the catalog query and inventory query separately so the audience can see which work repeats.",
        },
        {
          id: "s8",
          label: "TODO cut: Change copy, fire the tag",
          actions: [
            {
              type: "hook",
              name: "invalidateProduct",
              args: ["Now with a recycled rubber sole."],
            },
            {
              type: "wait",
              ms: 300,
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: ["article h1 + p", ".log-row--catalog"],
          callouts: [
            {
              target: ".log-row--catalog",
              text: "Tag fired",
              side: "left",
            },
            {
              target: "article h1 + p",
              text: "Fresh copy",
              side: "right",
            },
          ],
          bullets: [
            "TODO rewrite: Most cache demos prove speed and hide when data becomes stale.",
            "TODO rewrite: I change the product copy and fire the product tag.",
            "TODO rewrite: The next request runs the catalog query once and shows the new copy.",
          ],
          ifKeyboard:
            "TODO rewrite: Edit the copy in the demo admin field, press Save, then reload.",
          proof:
            "Change the product copy, fire the product tag invalidation, and show the next request receiving fresh content.",
        },
        {
          id: "s9",
          label: "TODO cut: Switch user and region",
          actions: [
            {
              type: "hook",
              name: "switchUser",
              args: ["agent-2"],
            },
            {
              type: "hook",
              name: "switchRegion",
              args: ["eu"],
            },
            {
              type: "hook",
              name: "requestPage",
            },
          ],
          code: {
            file: "TODO",
            lines: [],
          },
          spotlight: [".stock", ".log-row--inventory"],
          callouts: [
            {
              target: ".stock",
              text: "Per user, region",
              side: "right",
            },
            {
              target: ".log-row--catalog",
              text: "Still cached",
              side: "left",
            },
          ],
          bullets: [
            "TODO rewrite: A different user in a different region.",
            "TODO rewrite: Inventory changes and the catalog stays cached.",
            "TODO rewrite: Private inventory data is never served from the public cache.",
          ],
          ifKeyboard:
            "TODO rewrite: Use the user and region switchers in the demo header, then reload.",
          proof:
            "Switch users or regions and show that private inventory data is never served from the public cache.",
        },
      ],
      timing: {
        minutes: 2.25,
      },
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
    "TODO rewrite: State the framework version and runtime version in the repository.",
    "TODO rewrite: Show one failure mode, such as stale content, accidental private caching, or a migration TODO.",
    "TODO rewrite: Measure a result the audience can inspect: network calls, cache hits, build time, bundle size, or migration diff.",
    "TODO rewrite: Avoid vendor benchmark claims in the live narrative unless the same result is reproduced in the demo repository.",
  ],
};

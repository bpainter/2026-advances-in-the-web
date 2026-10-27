import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./f2-caching/files/. */
export const section: DemoSection = {
  id: "f2-caching",
  order: 7,
  label: "Caching",
  scenario:
    "A Next.js 16 product page combines a shared catalog description, a price that changes on a business schedule, and inventory that must be read at request time, with an explicit cache invalidation event.",
  support: {
    tier: "tooling",
    summary: "Next.js 16 · cacheComponents",
    detail:
      "Cache Components shipped opt-in in Next.js 16 (21 Oct 2025). 16.4 recommends them for every app and says they become the default in Next.js 17. Pin the exact Next.js, React and Node.js versions in the demo repository and read them aloud if asked.",
  },
  pages: [
    {
      id: "f2-today",
      stage: "today",
      title: "Caching: today",
      frame: {
        build: "framework",
        route: "/framework-today/products/ridgeline-trail",
        viewport: {
          width: 1296,
          height: 856,
        },
        hooks: ["reset", "requestPage"],
        poster: "/posters/f2-today-s2.png",
      },
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
          meter: {
            label: "Freshness settings",
            value: "5 in 4 files",
            source: "counted by scripts/count-cache-flags.mjs in apps/f2-today",
          },
          notes:
            "A product page and its request log. Five freshness settings across four files decide what this page caches.",
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
          spotlight: ["#request-log"],
          callouts: [
            {
              target: ".log-row--catalog",
              text: "Catalog repeats",
              side: "left",
            },
            {
              target: ".log-row--inventory",
              text: "Inventory repeats",
              side: "left",
            },
          ],
          meter: {
            label: "Freshness settings",
            value: "5 in 4 files",
            source: "counted by scripts/count-cache-flags.mjs in apps/f2-today",
          },
          notes:
            "Three requests. The catalog query runs every time, and so does inventory. The route says revalidate 3600, but the inventory cookie read made the whole route dynamic, and the catalog call is a database query, so nothing caches it.",
          ifKeyboard: "Reload the page three times and point at the log.",
        },
        {
          id: "s2",
          label: "Which part is cached",
          actions: [],
          spotlight: ["#request-log .log-head"],
          callouts: [
            {
              target: ".log-row--catalog",
              text: "Catalog repeats",
              side: "left",
            },
            {
              target: ".log-row--inventory",
              text: "Inventory repeats",
              side: "left",
            },
            {
              target: "#request-log .log-head",
              text: "Which is cached?",
              side: "top",
            },
          ],
          meter: {
            label: "Freshness settings",
            value: "5 in 4 files",
            source: "counted by scripts/count-cache-flags.mjs in apps/f2-today",
          },
          notes:
            "Route-level dynamic and revalidation flags whose combined behavior is difficult to explain. fetch options spread across data functions with unclear ownership of freshness. Price is cached by its fetch option, catalog is not, and you can only tell by reading four files.",
          ifKeyboard: "Same.",
        },
      ],
      notes: {
        open: "The framework section should solve one production problem deeply. Here is a product page built the way many teams still build it: a shared catalog description, a price on a business schedule, and inventory read at request time.",
        bridge:
          "Next.js said it in its own 16.3 release post: the caching model was implicit, confusing, and not helpful for dynamic apps. Same page, with Cache Components.",
      },
      timing: {
        minutes: 0.75,
        cumulative: 23.5,
      },
    },
    {
      id: "f2-now",
      stage: "now",
      title: "Caching: now",
      frame: {
        build: "framework",
        route: "/framework/products/ridgeline-trail",
        viewport: {
          width: 1296,
          height: 856,
        },
        hooks: ["reset", "requestPage", "invalidateProduct", "switchRegion", "switchUser"],
        poster: "/posters/f2-now-s3.png",
      },
      steps: [
        {
          id: "s0",
          label: "Same page, Cache Components on",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
          ],
          notes: "Same page, same data. Cache Components is on.",
        },
        {
          id: "s1",
          label: "Three requests, logged separately",
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
          notes:
            "Three requests again. The catalog query runs once. Inventory runs on every request, because it depends on the user and region.",
          ifKeyboard: "Reload three times and read the log aloud.",
          proof:
            "Log the catalog query and inventory query separately so the audience can see which work repeats.",
        },
        {
          id: "s2",
          label: "Change copy, fire the tag",
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
          notes:
            "Most cache demos prove speed and hide when data becomes stale. I change the product copy and fire the product tag. The next request runs the catalog query once and shows the new copy.",
          ifKeyboard: "Edit the copy in the demo admin field, press Save, then reload.",
          proof:
            "Change the product copy, fire the product tag invalidation, and show the next request receiving fresh content.",
        },
        {
          id: "s3",
          label: "Switch user and region",
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
          notes:
            "A different user in a different region. Inventory changes and the catalog stays cached. Private inventory data is never served from the public cache.",
          ifKeyboard: "Use the user and region switchers in the demo header, then reload.",
          proof:
            "Switch users or regions and show that private inventory data is never served from the public cache.",
        },
      ],
      notes: {
        open: "With Cache Components enabled, pages are dynamic by default unless code opts into caching. Watch which queries repeat.",
        bridge:
          "The stable Adapter API gives deployment platforms a versioned description of the application. I am not building with a second adapter today, because portability should be demonstrated, not asserted. Here is the code behind each of those requests.",
      },
      timing: {
        minutes: 1.25,
        cumulative: 24.75,
      },
    },
    {
      id: "f2-code",
      stage: "code",
      title: "Caching: code",
      frame: {
        build: "framework",
        route: "/framework/products/ridgeline-trail",
        viewport: {
          width: 1296,
          height: 856,
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
          notes: "The page from the last step, freshly reset, one request in the log.",
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
          notes:
            "One flag in next.config.ts. With Cache Components enabled, pages are dynamic by default unless code opts into caching.",
          ifKeyboard: "Reload once.",
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
          notes:
            "The use cache directive, cacheLife(), and cacheTag() make the cached unit and its lifetime visible in code. The log call sits inside the cached function, so it prints only on a miss, and this request adds no catalog line.",
          ifKeyboard: "Reload and point at the log: inventory only.",
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
          notes:
            "The page can keep a reusable static shell while request-time data resolves within a Suspense boundary. I slowed inventory down so you can see the name and copy arrive first, then the stock line.",
          ifKeyboard: "Reload with ?slow=inventory in the address bar.",
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
          notes:
            "inventory.ts stays request-time because it depends on the user and region. There is no directive, and the cookie read is why it has to sit inside the Suspense boundary.",
          ifKeyboard: "Switch the region to EU in the demo header and reload.",
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
          notes:
            "updateTag runs in a Server Action after the write. It expires the product tag, so the next request waits for fresh data instead of serving stale content, and the same tag string is the one catalog.ts set.",
          ifKeyboard: "Save new copy in the demo admin field and reload.",
        },
        {
          id: "s6",
          label: "Production bar",
          actions: [],
          code: {
            file: "catalog.ts",
            lines: [13],
          },
          notes:
            "The production bar for any framework demo: state the framework version and runtime version in the repository, show one failure mode, measure a result the audience can inspect, and avoid vendor benchmark claims unless the demo repository reproduces them. If someone asks about the other frameworks: React 19.3 has stable ViewTransition and Trusted Types support, Astro 7 has stable route caching, Vite 8, and a faster compiler and Markdown path, and SvelteKit 3 has a migration command that produces code changes and a remaining TODO list.",
          ifKeyboard: "Same.",
        },
      ],
      notes: {
        open: "Five short files. Each highlight runs the matching request on the left. Next.js 16.4 recommends Cache Components for every app and says they become the default in Next.js 17.",
        bridge:
          "Caching decides what you serve. The next question is what you install, and who approved it.",
      },
      timing: {
        minutes: 1.5,
        cumulative: 26.25,
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
    "State the framework version and runtime version in the repository.",
    "Show one failure mode, such as stale content, accidental private caching, or a migration TODO.",
    "Measure a result the audience can inspect: network calls, cache hits, build time, bundle size, or migration diff.",
    "Avoid vendor benchmark claims in the live narrative unless the same result is reproduced in the demo repository.",
  ],
};

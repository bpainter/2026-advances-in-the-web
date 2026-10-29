import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, nativeBuild, manifestDefaults } from "@/lib/frames/build-helpers";
import { catalog, renderNative, renderToday, view } from "./render";

const DEMO = "16-cross-document-vt";

/**
 * M5 Trail gear pages (still-in-motion-demos.md 8): a single-page store with a router and a FLIP
 * helper (today) against two plain server-rendered pages with a cross-document view transition
 * (native: index.html and product.html in content/sections/m5-trail-gear-pages/files, composed
 * as a multi-page build, spec 3.3). Both read fixtures/storefront-catalog.json.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: folderBuild(
      DEMO,
      "today",
      "Trail gear, Ridgeline Outfitters",
      manifestDefaults({
        enhancement: { css: "all", js: ["router.js", "flip.js"] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "storefront-catalog" },
        styles: ["/portal/16-cross-document-vt.css"],
        runtimeSelectors: ["#t-card-trail", "#t-card-daypack"],
      }),
      { extraDir: path.join(process.cwd(), "demos", DEMO, "today-extra"), render: renderToday },
    ),
    native: nativeBuild(
      DEMO,
      "m5-trail-gear-pages",
      "Trail gear, Ridgeline Outfitters",
      manifestDefaults({
        flags: { "enhance-css": true },
        enhancement: { css: { files: ["transitions.css"] }, js: [] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "storefront-catalog" },
        styles: ["/portal/16-cross-document-vt.css"],
        runtimeSelectors: [],
      }),
      { pages: ["product.html"], render: renderNative },
    ),
  },
  routes: [
    {
      // The single-page store's product API.
      method: "GET",
      path: new RegExp(`^/demos/${DEMO}/today/api/products/(?<id>[\\w-]+)$`),
      handler: (_req, { params }) => {
        const data = catalog();
        const p = data.products.find((x) => x.id === params.id);
        return p
          ? Response.json(view(p, data.dir), { headers: { "Cache-Control": "no-store" } })
          : new Response("Not found", { status: 404 });
      },
    },
  ],
};

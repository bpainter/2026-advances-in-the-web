import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import type { ServerRoute } from "@/lib/frames/routes";
import { folderBuild, nativeBuild, manifestDefaults } from "@/lib/frames/build-helpers";
import { fillWall, morePhotos } from "./render";

const DEMO = "13-grid-lanes";

/** The Show more fragment: six photos as HTML (the native build's photos carry their size). */
function more(sized: boolean): ServerRoute["handler"] {
  return (req, { url }) =>
    new Response(morePhotos(Number(url.searchParams.get("from") ?? "12"), { sized }), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
}

/**
 * M2 Trail photos (still-in-motion-demos.md 5): a Masonry.js-style wall that positions every item
 * by script (today) against Grid Lanes (native, the shown files in
 * content/sections/m2-trail-photos/files). Both pages start from the same 12 server-rendered
 * photos from fixtures/trail-photos.json; Show more fetches six more as an HTML fragment.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: folderBuild(
      DEMO,
      "today",
      "Trail photos: used to",
      manifestDefaults({
        enhancement: { css: "all", js: ["masonry.js", "app.js"] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "product-photos" },
        styles: ["/portal/13-grid-lanes.css"],
        runtimeSelectors: [],
      }),
      {
        extraDir: path.join(process.cwd(), "demos", DEMO, "today-extra"),
        // The photos' sources wait for the loadPhotos hook (render.ts).
        render: (_file, html) => fillWall(html, { held: true }),
      },
    ),
    native: nativeBuild(
      DEMO,
      "m2-trail-photos",
      "Trail photos: now",
      manifestDefaults({
        flags: { "enhance-css": true, "enhance-js": true },
        // The enhancement is the @supports blocks in wall.css; the page starts with them off (s0
        // shows the regular grid) and the runtime puts them back when enhance-css turns on.
        enhancement: { css: "supports-blocks", js: ["app.js"] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "product-photos" },
        styles: ["/portal/13-grid-lanes.css"],
        runtimeSelectors: ["#safari-capture"],
      }),
      { render: (_file, html) => fillWall(html, { sized: true }) },
    ),
  },
  routes: [
    { method: "GET", path: `/demos/${DEMO}/today/photos`, handler: more(false) },
    { method: "GET", path: `/demos/${DEMO}/native/photos`, handler: more(true) },
  ],
};

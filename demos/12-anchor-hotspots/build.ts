import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import type { ServerRoute } from "@/lib/frames/routes";
import { folderBuild, nativeBuild, manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "12-anchor-hotspots";
const ROOT = process.cwd();
const EXTRA = path.join(ROOT, "demos", DEMO, "native-extra");

/**
 * The look photo and the product photos (public/demo-assets/), served beside either build's
 * document so the shown markup names them by file alone and stays inside 44 columns.
 */
const photo: ServerRoute = {
  method: "GET",
  path: new RegExp(`^/demos/${DEMO}/(?:today|native)/(?<file>[\\w-]+\\.webp)$`),
  handler: (_req, { params }) => {
    for (const dir of ["look", "catalog"]) {
      const abs = path.join(ROOT, "public", "demo-assets", dir, params.file);
      if (existsSync(abs)) return new Response(readFileSync(abs), { headers: { "Content-Type": "image/webp", "Cache-Control": "no-store" } });
    }
    return new Response("Not found", { status: 404 });
  },
};

/**
 * M1 Shop the look (docs/design/still-in-motion-demos.md 4): a hand-written positioning library
 * modeled on Floating UI (today) against anchor positioning, popover and invoker commands (native,
 * the shown files in content/sections/m1-shop-the-look/files). Both at the 60/40 split.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: {
      ...folderBuild(
        DEMO,
        "today",
        "Shop the look: used to",
        manifestDefaults({
          enhancement: { css: "all", js: ["hotspots.js"] },
          instrumentation: ["hooks.js"],
          sideEffects: ["reset"],
          wrapper: { id: "lookbook", outside: ["t-float-root"] },
          styles: ["/portal/12-anchor-hotspots.css"],
          runtimeSelectors: ["#t-card-shell", "#t-card-pack", "#t-card-shoe"],
        }),
      ),
      extraDir: EXTRA,
    },
    native: nativeBuild(
      DEMO,
      "m1-shop-the-look",
      "Shop the look: now",
      manifestDefaults({
        flags: { "enhance-css": true },
        enhancement: { css: "all", js: [] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "lookbook" },
        styles: ["/portal/12-anchor-hotspots.css"],
      }),
    ),
  },
  routes: [photo],
};

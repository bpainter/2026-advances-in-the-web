import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, nativeBuild, manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "15-scroll-driven";

/** The shared hooks (scrollArticle, busyScroll) live beside the native build, outside the meter. */
const EXTRA = path.join(process.cwd(), "demos", DEMO, "native-extra");

/**
 * M4 Return guide (docs/design/still-in-motion-demos.md 7): a scroll listener and an
 * IntersectionObserver (today) against scroll-driven animations (native, the shown files in
 * content/sections/m4-return-guide/files). Both scroll a pane inside the shown markup, so the
 * document itself never scrolls.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: {
      ...folderBuild(
        DEMO,
        "today",
        "Return guide: used to",
        manifestDefaults({
          enhancement: { css: "all", js: ["progress.js", "reveal.js"] },
          instrumentation: ["hooks.js"],
          sideEffects: ["reset"],
          wrapper: { id: "help-center" },
          styles: ["/portal/15-scroll-driven.css"],
          runtimeSelectors: [".busy-chip"],
        }),
      ),
      extraDir: EXTRA,
    },
    native: nativeBuild(
      DEMO,
      "m4-return-guide",
      "Return guide: now",
      manifestDefaults({
        flags: { "enhance-css": true },
        enhancement: { css: "all", js: [] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "help-center" },
        styles: ["/portal/15-scroll-driven.css"],
        runtimeSelectors: [".busy-chip"],
      }),
    ),
  },
};

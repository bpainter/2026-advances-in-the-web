import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, nativeBuild, manifestDefaults } from "@/lib/frames/build-helpers";

/**
 * D2 Product card: viewport media queries, per-slot variant props and a ResizeObserver (today)
 * against a size container, container query units, @scope and :has() (native). No forms sandbox:
 * the add-to-order form is never submitted on stage (PRD Part A, 14.2).
 */
export const folder: DemoFolder = {
  demo: "02-container-card",
  builds: {
    today: folderBuild(
      "02-container-card",
      "today",
      "Product card: today",
      manifestDefaults({
        enhancement: { css: "all", js: ["app.js", "card.js", "resize-classes.js"] },
        wrapper: { id: "storefront-merch" },
        styles: ["/portal/02-container-card.css"],
        // The cards are rendered by card.js from props, so none of them is in index.html.
        runtimeSelectors: [
          "#t-grid .c-product-card",
          "#t-grid .c-product-card__title",
          "#t-rail .c-product-card",
          "#t-merch .c-product-card",
        ],
      }),
    ),
    native: nativeBuild(
      "02-container-card",
      "d2-product-card",
      "Product card: now",
      manifestDefaults({
        // The code page toggles enhance-js off: the composer drops the shown app.js (a comment)
        // and the card looks and responds the same.
        flags: { "enhance-js": true },
        enhancement: { css: "all", js: ["app.js"] },
        instrumentation: ["hooks.js"],
        wrapper: { id: "storefront-merch" },
      }),
    ),
  },
};

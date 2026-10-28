import type { DemoFolder } from "@/lib/frames/types";
import {
  folderBuild,
  nativeBuild,
  manifestDefaults,
  FORMS_SANDBOX,
} from "@/lib/frames/build-helpers";

/** D1 Order actions: a hand-rolled menu and modal (today) against popover, dialog and invoker commands (native). */
export const folder: DemoFolder = {
  demo: "01-layered-ui",
  builds: {
    today: folderBuild(
      "01-layered-ui",
      "today",
      "Order actions: today",
      manifestDefaults({
        sandbox: FORMS_SANDBOX,
        enhancement: {
          css: "all",
          js: ["menu.js", "modal.js", "focus-trap.js", "scroll-lock.js", "app.js"],
        },
        sideEffects: ["reset"],
        wrapper: { id: "order-queue", outside: ["overlay-root"] },
        styles: ["/portal/01-layered-ui.css"],
        runtimeSelectors: [
          "#t-menu",
          "#t-cancel",
          "#t-backdrop",
          "#t-modal",
          "#t-keep",
          "#t-confirm",
        ],
      }),
    ),
    native: nativeBuild(
      "01-layered-ui",
      "d1-order-actions",
      "Order actions: now",
      manifestDefaults({
        sandbox: FORMS_SANDBOX,
        flags: { "enhance-css": true },
        enhancement: { css: "all", js: ["app.js"] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "order-queue" },
        styles: ["/portal/01-layered-ui.css"],
      }),
    ),
  },
  routes: [
    {
      // The native build's one request; the order is restored by the frame's reset (a remount).
      method: "POST",
      path: /^\/api\/orders\/(?<id>\d+)\/cancel$/,
      handler: () => new Response(null, { status: 204 }),
    },
  ],
};

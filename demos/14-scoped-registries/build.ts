import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, nativeBuild, manifestDefaults } from "@/lib/frames/build-helpers";
import { FRAMING_CSP, innerDocument, innerResponse } from "@/lib/frames/inner";

const DEMO = "14-scoped-registries";
const ROOT = process.cwd();

/** Ridge UI v2 and v3, the tiers app and the hooks: unshown, shared by both builds. */
const EXTRA = path.join(ROOT, "demos", DEMO, "native-extra");

/**
 * M3 Pricing app (docs/design/still-in-motion-demos.md 6): Ridge UI v2 in the product editor and
 * the merchandising team's app on Ridge UI v3. Used to: the app in an iframe with a message bridge
 * (today). Now: the app inline, with its own scoped custom element registry (native, the shown
 * files in content/sections/m3-pricing-app/files). Browsers without scoped registries load the
 * iframe build instead.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: {
      ...folderBuild(
        DEMO,
        "today",
        "Pricing app: used to",
        manifestDefaults({
          enhancement: { css: "all", js: ["bridge.js"] },
          instrumentation: ["ridge-ui-v2.js", "hooks.js"],
          sideEffects: ["reset"],
          wrapper: { id: "editor-pricing" },
          styles: ["/portal/14-scoped-registries.css"],
          csp: FRAMING_CSP,
        }),
      ),
      extraDir: EXTRA,
    },
    native: nativeBuild(
      DEMO,
      "m3-pricing-app",
      "Pricing app: now",
      manifestDefaults({
        flags: { "enhance-js": true },
        enhancement: { css: "all", js: ["pricing-app.js"] },
        instrumentation: ["ridge-ui-v2.js", "hooks.js"],
        sideEffects: ["reset"],
        wrapper: { id: "editor-pricing" },
        styles: ["/portal/14-scoped-registries.css"],
        // The fallback for browsers without scoped registries embeds the iframe build.
        csp: FRAMING_CSP,
      }),
    ),
  },
  routes: [
    {
      // The pricing app's own document, framed by the used-to page and by the now page's
      // fallback: the theme only (spec 3.5, nested frame).
      method: "GET",
      path: `/demos/${DEMO}/today/app.html`,
      handler: (req, { url }) => {
        const host = req.headers.get("host") ?? url.host;
        const origin = `${url.protocol}//${host}`;
        // Its own sheet gives the fixed-height box a visible scrollbar and a lower fade.
        return innerResponse(innerDocument(path.join(ROOT, "demos", DEMO, "today-app", "app.html"), "Tiered pricing", ["/portal/14-scoped-registries-app.css"]), origin);
      },
    },
  ],
};

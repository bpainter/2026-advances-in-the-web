import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, nativeBuild, manifestDefaults, FORMS_SANDBOX } from "@/lib/frames/build-helpers";

const DEMO = "11-customizable-select";

/** The form's save: echoes the posted color, so the step shows what the server received. */
async function save(req: Request): Promise<Response> {
  const form = await req.formData();
  const color = String(form.get("color") ?? "");
  return new Response(`Saved. The server got color=${color}`, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/**
 * D6 Variant picker: a hand-rolled combobox (today) against a customizable select (native, the
 * shown files in content/sections/d6-variant-picker/files). Both post the color with the form.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: folderBuild(
      DEMO,
      "today",
      "Variant picker: used to",
      manifestDefaults({
        sandbox: FORMS_SANDBOX,
        enhancement: { css: "all", js: ["app.js", "combobox.js"] },
        sideEffects: ["reset"],
        wrapper: { id: "product-editor" },
        styles: ["/portal/11-customizable-select.css"],
        runtimeSelectors: ["#t-color-list-moss", "#t-color-list-black", "#t-color-list-sand"],
      }),
    ),
    native: nativeBuild(
      DEMO,
      "d6-variant-picker",
      "Variant picker: now",
      manifestDefaults({
        sandbox: FORMS_SANDBOX,
        flags: { "enhance-css": true },
        enhancement: { css: "all", js: ["app.js"] },
        instrumentation: ["hooks.js"],
        wrapper: { id: "product-editor" },
        styles: ["/portal/11-customizable-select.css"],
        runtimeSelectors: ["#picker-replica", "#firefox-capture"],
      }),
    ),
  },
  routes: [
    { method: "POST", path: `/demos/${DEMO}/today/variants`, handler: save },
    { method: "POST", path: `/demos/${DEMO}/native/variants`, handler: save },
  ],
};

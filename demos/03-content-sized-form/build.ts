import type { DemoFolder } from "@/lib/frames/types";
import type { ServerRoute } from "@/lib/frames/routes";
import {
  folderBuild,
  nativeBuild,
  manifestDefaults,
  FORMS_SANDBOX,
} from "@/lib/frames/build-helpers";

const DEMO = "03-content-sized-form";

/** A fetch submit (app.js) wants a status; a plain form post wants a page back. */
function wantsDocument(req: Request): boolean {
  const mode = req.headers.get("sec-fetch-mode");
  if (mode === "cors" || mode === "same-origin") return false;
  return (req.headers.get("accept") ?? "").includes("text/html");
}

/**
 * The case submit (PRD Part B, D3 notes for the builder): 204 for fetch requests, and for plain
 * form posts a 303 back to the referer, or to the build's document, with `?submitted=1` so the
 * JavaScript-off path also completes.
 */
function openCase(fallback: string): ServerRoute["handler"] {
  return async (req, { url }) => {
    const data = await req.formData().catch(() => null);
    const subject = String(data?.get("subject") ?? "").trim();
    const details = String(data?.get("details") ?? "").trim();
    if (!subject || !details) {
      return new Response("Subject and details are required", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (!wantsDocument(req)) return new Response(null, { status: 204 });
    let back: URL | null = null;
    try {
      const referer = req.headers.get("referer");
      if (referer) back = new URL(referer);
    } catch {
      back = null;
    }
    if (!back || back.origin !== url.origin) back = new URL(fallback, url.origin);
    back.searchParams.set("submitted", "1");
    return new Response(null, {
      status: 303,
      headers: { Location: back.pathname + back.search },
    });
  };
}

/** D3 Support form: a mirror-and-scrollHeight form (today) against field-sizing (native). */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: folderBuild(
      DEMO,
      "today",
      "Support form: today",
      manifestDefaults({
        sandbox: FORMS_SANDBOX,
        enhancement: { css: "all", js: ["input-width.js", "autosize.js", "app.js"] },
        wrapper: { id: "support-case" },
        styles: ["/portal/03-content-sized-form.css"],
        sideEffects: ["reset"],
      }),
    ),
    native: nativeBuild(
      DEMO,
      "d3-support-form",
      "Support form: now",
      manifestDefaults({
        sandbox: FORMS_SANDBOX,
        flags: { "enhance-css": true, "enhance-js": true },
        // The enhancement is the @supports (field-sizing: content) block; the runtime removes and
        // reinserts it through the CSSOM, so the authored file never changes.
        enhancement: { css: "supports-blocks", js: ["app.js"] },
        wrapper: { id: "support-case" },
        styles: ["/portal/03-content-sized-form.css"],
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
      }),
    ),
  },
  routes: [
    {
      method: "POST",
      path: `/demos/${DEMO}/today/cases`,
      handler: openCase(`/demos/${DEMO}/today/index.html`),
    },
    {
      method: "POST",
      path: "/cases",
      handler: openCase(`/demos/${DEMO}/native/index.html`),
    },
  ],
};

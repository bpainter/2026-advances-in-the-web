/**
 * The presenter embeds this app from PRESENTER_ORIGIN and serves the frame runtime from
 * DEMO_ORIGIN (PRD Part A, 8.1). Both are read by proxy.ts (CSP) and the root layout (runtime).
 */
export const PRESENTER_ORIGIN = process.env.PRESENTER_ORIGIN ?? "http://localhost:3000";
export const DEMO_ORIGIN = process.env.DEMO_ORIGIN ?? "http://127.0.0.1:3000";
export const RUNTIME_SRC = `${DEMO_ORIGIN}/runtime/demo-runtime.js`;

/** The one product the demo shows. */
export const PRODUCT_ID = "ridgeline-trail";

/**
 * `reset` reloads the page through `/products/<id>--reset`: the id maps to the same seeded
 * product (lib/db.ts) but is a different `use cache` key, so the reload shows seeded data without
 * filling the real entry, and lib/log.ts drops its lines. The first real request is still a miss.
 */
export const RESET_SUFFIX = "--reset";

import type { ServerRoute } from "./routes";
import type { WrapperId } from "./wrappers/types";

/** PRD Part A, section 8.4. One manifest per build of a demo folder. */
export interface BuildManifest {
  demo: string; // "01-layered-ui"
  build: "today" | "native" | "static" | "terminal";
  /** iframe sandbox attribute (Part A, 14.2). */
  sandbox: string;
  /** Flags this build understands; a `toggle` of any other flag fails validation. */
  flags: Partial<Record<"enhance-css" | "enhance-js" | "csp-enforce", true>>;
  enhancement: { css: "all" | "supports-blocks" | { files: string[] }; js: string[] };
  /** Scripts that only observe (served even when enhance-js is off). */
  instrumentation: string[];
  /** Hooks skipped in mirror mode. */
  sideEffects: string[];
  probes: { name: string; target: string; expect: string }[];
  scrollers: string[];
  /** Selectors created at runtime, exempt from the static selector check. */
  runtimeSelectors: string[];
  /**
   * Unshown portal CSS for this demo's content layout (rows, grids), root-relative under
   * public/portal/. It sits in @layer portal-layout, is linted like the theme and never toggles.
   */
  styles?: string[];
  /**
   * The contextual wrapper around the shown markup (PRD v5, 2 and 4.4): composed at serve time,
   * never shown. `outside` lifts ids (overlay roots) out of the shown slot; `scrolls` lets the
   * document scroll (D4 only, because scroll restore is part of that demo).
   */
  wrapper?: { id: WrapperId; outside?: string[]; scrolls?: boolean };
  /** The v4 portal shell (docs/design/demo-glass-spec.md, 8); replaced by `wrapper` in v5. */
  shell?: { title: string; nav: "orders" | "products" | "support" | "content" | "reports"; outside?: string[]; context?: "orders" | "cases" | "products" };
  /** Overrides the base CSP (D5). `ORIGIN` and `PRESENTER` are substituted. */
  csp?: string;
}

export interface BuildDef {
  manifest: BuildManifest;
  /** Absolute directory holding index.html and the build's other files. */
  dir: string;
  /** Files served from the build's directory (all files there when omitted). */
  files?: string[];
  /** Second directory searched for files: unshown instrumentation and hooks (demos/<demo>/native-extra). */
  extraDir?: string;
  /** Document title. */
  title: string;
}

export interface DemoFolder {
  /** Folder name under demos/, e.g. "01-layered-ui". */
  demo: string;
  builds: Partial<Record<"today" | "native" | "static" | "terminal", BuildDef>>;
  /** Extra routes the demo needs (submit handlers, addresses, APIs), matched on the demo origin. */
  routes?: ServerRoute[];
}

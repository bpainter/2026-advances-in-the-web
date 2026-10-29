import "server-only";
import type { BuildManifest, DemoFolder } from "./types";
import { matchRoute } from "./routes";
import { folder as d01 } from "@/demos/01-layered-ui/build";
import { folder as d02 } from "@/demos/02-container-card/build";
import { folder as d03 } from "@/demos/03-content-sized-form/build";
import { folder as d04 } from "@/demos/04-navigation-api/build";
import { folder as d05 } from "@/demos/05-trusted-types/build";
import { folder as d07 } from "@/demos/07-package-workflow/build";
import { folder as d08 } from "@/demos/08-fast-follows/build";
import { folder as d09 } from "@/demos/09-vite-8/build";
import { folder as d11 } from "@/demos/11-customizable-select/build";
import { folder as d12 } from "@/demos/12-anchor-hotspots/build";
import { folder as d13 } from "@/demos/13-grid-lanes/build";
import { folder as d14 } from "@/demos/14-scoped-registries/build";
import { folder as d15 } from "@/demos/15-scroll-driven/build";
import { folder as d16 } from "@/demos/16-cross-document-vt/build";
import { folder as d00 } from "@/demos/00-fixtures/build";

export { nativeBuild, folderBuild, manifestDefaults, BASE_SANDBOX, FORMS_SANDBOX } from "./build-helpers";

/** Every demo folder the frame routes can serve, keyed by folder name. */
export const DEMO_FOLDERS: Record<string, DemoFolder> = Object.fromEntries([d01, d02, d03, d04, d05, d07, d08, d09, d11, d12, d13, d14, d15, d16].map((f) => [f.demo, f]));

/** Engine fixtures (demos/00-fixtures) are served in development only (PRD v5, 3.4). */
const DEV_FOLDERS: Record<string, DemoFolder> = process.env.NODE_ENV === "production" ? {} : { [d00.demo]: d00 };

export function demoFolder(demo: string): DemoFolder | undefined {
  return DEMO_FOLDERS[demo] ?? DEV_FOLDERS[demo];
}

/**
 * The manifest behind a `Frame.route` such as /demos/01-layered-ui/native, or null for other
 * origins. Native builds own root-level addresses (/orders, /cases; PRD Part A, 8.2): such a route
 * resolves to the native build of the folder whose `routes` serve it.
 */
export function manifestFor(route: string): BuildManifest | null {
  const m = /^\/demos\/([\w-]+)\/(today|native|static|terminal)/.exec(route);
  if (m) return (DEMO_FOLDERS[m[1]] ?? DEV_FOLDERS[m[1]])?.builds[m[2] as "today"]?.manifest ?? null;
  if (route.startsWith("/framework")) return null;
  const pathname = route.split("?")[0];
  for (const f of Object.values(DEMO_FOLDERS)) {
    if (f.builds.native && f.routes && matchRoute(f.routes, "GET", pathname)) return f.builds.native.manifest;
  }
  return null;
}

/** All extra routes across demo folders, for the root-level handlers. */
export function allExtraRoutes() {
  return Object.values(DEMO_FOLDERS).flatMap((f) => f.routes ?? []);
}

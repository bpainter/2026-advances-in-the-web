import path from "node:path";
import type { BuildDef, BuildManifest } from "./types";

/** Helpers for demos/<demo>/build.ts. Kept apart from the registry so folders never import it back. */
const ROOT = process.cwd();

export const BASE_SANDBOX = "allow-scripts allow-same-origin";
export const FORMS_SANDBOX = "allow-scripts allow-same-origin allow-forms";

/** A native build composes the section's shown files verbatim (content/sections/<id>/files). */
export function nativeBuild(demo: string, sectionId: string, title: string, manifest: Omit<BuildManifest, "demo" | "build">): BuildDef {
  return { manifest: { ...manifest, demo, build: "native" }, dir: path.join(ROOT, "content", "sections", sectionId, "files"), extraDir: path.join(ROOT, "demos", demo, "native-extra"), title };
}

/** A today, static or terminal build lives under demos/<demo>/<build>/. */
export function folderBuild(demo: string, build: "today" | "static" | "terminal", title: string, manifest: Omit<BuildManifest, "demo" | "build">): BuildDef {
  return { manifest: { ...manifest, demo, build }, dir: path.join(ROOT, "demos", demo, build), title };
}

/** Manifest defaults; builds override what they need. */
export function manifestDefaults(over: Partial<Omit<BuildManifest, "demo" | "build">> = {}): Omit<BuildManifest, "demo" | "build"> {
  return {
    sandbox: BASE_SANDBOX,
    flags: {},
    enhancement: { css: "all", js: [] },
    instrumentation: [],
    sideEffects: [],
    probes: [],
    scrollers: [],
    runtimeSelectors: [],
    ...over,
  };
}

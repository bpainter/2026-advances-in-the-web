import path from "node:path";
import type { BuildDef, BuildManifest } from "./types";

/**
 * Helpers for demos/<demo>/build.ts. Kept apart from the registry so folders never import it back.
 * Build directories are not traced (a `demo` path would pull in the F2 apps); next.config.ts
 * lists the files the frame routes read.
 */
const ROOT = process.cwd();

export const BASE_SANDBOX = "allow-scripts allow-same-origin";
export const FORMS_SANDBOX = "allow-scripts allow-same-origin allow-forms";

/** A native build composes the section's shown files verbatim (content/sections/<id>/files). */
export function nativeBuild(demo: string, sectionId: string, title: string, manifest: Omit<BuildManifest, "demo" | "build">, extra: BuildExtras = {}): BuildDef {
  return { manifest: { ...manifest, demo, build: "native" }, dir: path.join(/*turbopackIgnore: true*/ ROOT, "content", "sections", sectionId, "files"), extraDir: path.join(/*turbopackIgnore: true*/ ROOT, "demos", demo, "native-extra"), title, ...extra };
}

/** A today, static or terminal build lives under demos/<demo>/<build>/. */
export function folderBuild(demo: string, build: "today" | "static" | "terminal", title: string, manifest: Omit<BuildManifest, "demo" | "build">, extra: BuildExtras = {}): BuildDef {
  return { manifest: { ...manifest, demo, build }, dir: path.join(/*turbopackIgnore: true*/ ROOT, "demos", demo, build), title, ...extra };
}

/**
 * Optional parts of a build (still-in-motion-demos.md 3.3): more composed pages, a template
 * filler, and a second directory for unshown hooks (a today build's hooks stay out of its meter).
 */
export interface BuildExtras {
  pages?: string[];
  render?: BuildDef["render"];
  extraDir?: string;
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

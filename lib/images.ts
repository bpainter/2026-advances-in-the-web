import "server-only";
import { assetExists } from "@/lib/assets";

/**
 * Pre-generated still for a slide under public/images/[slide-id].{avif,webp,jpg,png}, if present.
 * Existence comes from the build-time file list (lib/assets.ts), not the disk (docs/PRD-perf.md, P1-FUNC).
 */
export function imageSrc(slideId: string): string | null {
  for (const ext of ["avif", "webp", "jpg", "png"]) {
    const src = `/images/${slideId}.${ext}`;
    if (assetExists(src)) return src;
  }
  return null;
}

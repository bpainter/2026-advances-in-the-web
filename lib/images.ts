import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/** Pre-generated still for a slide under public/images/[slide-id].{avif,webp,jpg,png}, if present. */
export function imageSrc(slideId: string): string | null {
  for (const ext of ["avif", "webp", "jpg", "png"]) {
    if (existsSync(path.join(process.cwd(), "public", "images", `${slideId}.${ext}`))) return `/images/${slideId}.${ext}`;
  }
  return null;
}

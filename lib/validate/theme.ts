import { existsSync } from "node:fs";
import path from "node:path";
import type { Issue } from "./rules";

/** Portal backgrounds (PRD v4, 6.5); a missing file is a warning, the theme falls back to a gradient. */
export const BACKGROUNDS = ["glass-fan.jpg", "glass-petal.jpg", "glass-lavender.jpg", "glass-navy.jpg", "glass-blue.jpg"];

/** Theme checks: backgrounds present. The theme lint and the F2 copy hash join in M4. */
export function themeIssues(root: string): Issue[] {
  const out: Issue[] = [];
  for (const f of BACKGROUNDS) if (!existsSync(path.join(root, "public", "backgrounds", f))) out.push({ rule: "backgrounds", where: "theme", message: `public/backgrounds/${f} is missing; the theme falls back to a gradient`, level: "warning" });
  return out;
}

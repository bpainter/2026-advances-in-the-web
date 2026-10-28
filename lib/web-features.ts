import { readFileSync } from "node:fs";
import path from "node:path";
import type { WebFeaturesData } from "./support-data";

/**
 * The installed `web-features` package (PRD v4, 3.1): its version and data.json, read from
 * node_modules directly (the package's exports map does not expose package.json).
 */
export function installedWebFeatures(root = process.cwd()): { version: string; data: WebFeaturesData } {
  const dir = path.join(root, "node_modules", "web-features");
  const version = (JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")) as { version: string }).version;
  const data = JSON.parse(readFileSync(path.join(dir, "data.json"), "utf8")) as WebFeaturesData;
  return { version, data };
}

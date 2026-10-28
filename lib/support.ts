import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { SupportEntry, SupportFile } from "./support-data";

const FILE = path.join(process.cwd(), "content", ".generated", "support.json");

/** One section's support entry from content/.generated/support.json (pnpm support); null when missing. */
export function supportEntry(sectionId: string): SupportEntry | null {
  if (!existsSync(FILE)) return null;
  try {
    return (JSON.parse(readFileSync(FILE, "utf8")) as SupportFile).sections[sectionId] ?? null;
  } catch {
    return null;
  }
}

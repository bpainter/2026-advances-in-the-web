import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "content", ".generated", "meters.json");

/** Computed meters by `meter.source` (scripts/meters.mts); null until the script has run. */
export function meterValue(source: string): string | null {
  if (!existsSync(FILE)) return null;
  try {
    const data = JSON.parse(readFileSync(FILE, "utf8")) as Record<string, string>;
    return data[source] ?? null;
  } catch {
    return null;
  }
}

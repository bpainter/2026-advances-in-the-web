/**
 * Writes public/theme/grain.png, the shared grain tile (PRD v5, 1.2). `pnpm check` regenerates it
 * in memory and fails if the committed pixels differ.
 *
 *   pnpm grain
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { grainPng } from "@/lib/grain";

const out = path.join(process.cwd(), "public", "theme", "grain.png");
mkdirSync(path.dirname(out), { recursive: true });
const png = grainPng();
writeFileSync(out, png);
console.log(`wrote ${path.relative(process.cwd(), out)} (${png.length} bytes)`);

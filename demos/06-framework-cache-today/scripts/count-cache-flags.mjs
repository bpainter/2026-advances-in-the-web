#!/usr/bin/env node
// Counts the freshness settings the f2-today meter reports ("5 in 4 files"): route segment
// configs and fetch options spread across the files that decide what the product page caches.
// Prints the meter value; run from the app folder (`pnpm count-cache-flags`).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "app/products/[id]/page.tsx",
  "app/products/layout.tsx",
  "lib/price.ts",
  "lib/inventory.ts",
];
const patterns = [
  /^\s*export const revalidate\b/m,
  /^\s*export const dynamic\b/m,
  /^\s*export const fetchCache\b/m,
  /\bcache:\s*["']/g,
  /\bnext:\s*\{/g,
];

let total = 0;
let filesWithFlags = 0;
for (const file of files) {
  const source = readFileSync(path.join(root, file), "utf8");
  let count = 0;
  for (const pattern of patterns) count += (source.match(pattern) ?? []).length;
  if (count) filesWithFlags++;
  total += count;
}
console.log(`${total} in ${filesWithFlags} files`);

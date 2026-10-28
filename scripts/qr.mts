/**
 * Writes public/qr/linkedin.svg for the closing slide (PRD v5, 4.6). Runs in predev and prebuild
 * and needs no network; `pnpm check` fails if a fresh render differs from the committed file.
 *
 *   pnpm qr
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { QR_URL, qrSvg } from "@/lib/qr";

const out = path.join(process.cwd(), "public", "qr", "linkedin.svg");
const { svg, modules, module, size } = await qrSvg();
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote public/qr/linkedin.svg: ${QR_URL}, ${modules} modules with the quiet zone, ${module} px each, ${size} px square`);

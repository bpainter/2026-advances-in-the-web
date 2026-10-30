import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { PNG } = require("/Users/bermonpainter/Sites/web-unleashed-talk-2026/node_modules/.pnpm/pngjs@5.0.0/node_modules/pngjs");
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (p) => 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
const R = (a, b) => ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
// args: file, y (row through the ring), x0, x1 : prints the run of pixels across the left edge of the ring
const [f, y, x0, x1] = process.argv.slice(2);
const png = PNG.sync.read(readFileSync(f));
const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
for (let x = +x0; x <= +x1; x++) { const p = px(x, +y); console.log(x, p.join(","), L(p).toFixed(3)); }

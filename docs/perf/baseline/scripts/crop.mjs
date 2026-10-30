import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const sharp = require("/Users/bermonpainter/Sites/web-unleashed-talk-2026/node_modules/.pnpm/sharp@0.35.5_@types+node@26.6.5/node_modules/sharp");
const [src, out, l, t, w, h, z] = process.argv.slice(2);
await sharp(src).extract({ left: +l, top: +t, width: +w, height: +h }).resize({ width: Math.round(+w * (+z || 1)), kernel: "nearest" }).toFile(out);

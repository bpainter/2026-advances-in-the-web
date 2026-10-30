/**
 * The portal theme (PRD v4, 6.2):
 *
 *   pnpm theme:sync   copies styles/glass-tokens.css to public/theme/portal-glass.css, writes
 *                     public/theme/backgrounds.css from content/backgrounds.ts (PRD v5, 4.1) with
 *                     each section's AVIF from content/.generated/images.json in image-set()
 *                     (docs/PRD-perf.md, P1-IMG), and copies the theme, a JPEG-only
 *                     backgrounds.css, the F2 section background and the two Slalom Sans faces
 *                     into each F2 app's public/
 *   pnpm theme:lint   lints the theme (lib/validate/theme.ts)
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BACKGROUNDS_PUBLIC, F2_APPS, F2_BACKGROUND, F2_WRAPPER_CSS, FONTS, THEME_PUBLIC, THEME_SOURCE, backgroundsCss, lintTheme } from "@/lib/validate/theme";

const root = process.cwd();
const cmd = process.argv[2];
const copy = (from: string, to: string) => {
  mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
  copyFileSync(path.join(root, from), path.join(root, to));
};

if (cmd === "sync") {
  copy(THEME_SOURCE, THEME_PUBLIC);
  writeFileSync(path.join(root, BACKGROUNDS_PUBLIC), backgroundsCss());
  for (const app of F2_APPS) {
    copy(THEME_SOURCE, `${app}/public/theme/portal-glass.css`);
    // The F2 apps serve no public/opt: they keep the JPEG they carry.
    writeFileSync(path.join(root, app, BACKGROUNDS_PUBLIC), backgroundsCss({ avif: false }));
    copy(`public/backgrounds/v5/${F2_BACKGROUND}`, `${app}/public/backgrounds/v5/${F2_BACKGROUND}`);
    for (const f of F2_WRAPPER_CSS) copy(`public/wrappers/${f}`, `${app}/public/wrappers/${f}`);
    for (const f of FONTS) copy(`public/fonts/${f}`, `${app}/public/fonts/${f}`);
  }
  console.log(`synced ${THEME_SOURCE} to ${THEME_PUBLIC} and ${F2_APPS.length} F2 apps`);
} else if (cmd === "lint") {
  const issues = lintTheme(readFileSync(path.join(root, THEME_SOURCE), "utf8"));
  for (const i of issues) console.log(`✖ ${i.where}: ${i.message}`);
  console.log(issues.length ? `${issues.length} problem(s)` : "theme lint: clean");
  process.exit(issues.length ? 1 : 0);
} else {
  console.error("usage: theme.mts sync|lint");
  process.exit(2);
}

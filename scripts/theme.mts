/**
 * The portal theme (PRD v4, 6.2):
 *
 *   pnpm theme:sync   copies styles/glass-tokens.css to public/theme/portal-glass.css and, with the
 *                     portal backgrounds and the two Slalom Sans faces, into each F2 app's public/
 *   pnpm theme:lint   lints the theme (lib/validate/theme.ts)
 */
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { BACKGROUNDS, F2_APPS, FONTS, THEME_PUBLIC, THEME_SOURCE, lintTheme } from "@/lib/validate/theme";

const root = process.cwd();
const cmd = process.argv[2];
const copy = (from: string, to: string) => {
  mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
  copyFileSync(path.join(root, from), path.join(root, to));
};

if (cmd === "sync") {
  copy(THEME_SOURCE, THEME_PUBLIC);
  for (const app of F2_APPS) {
    copy(THEME_SOURCE, `${app}/public/theme/portal-glass.css`);
    for (const f of BACKGROUNDS) copy(`public/backgrounds/${f}`, `${app}/public/backgrounds/${f}`);
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

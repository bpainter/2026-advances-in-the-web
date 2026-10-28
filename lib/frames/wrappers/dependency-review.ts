import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { BASE_CSS, bar, chip, context, day, esc, readJson } from "./common";
import type { WrapperDef } from "./types";

/**
 * F5 `dependency-review` (spec 4.12): a draft pull request that removes packages. The title, a
 * Draft chip and a generated count (the distinct packages in the shown table, from the same npm
 * pull) with the pull's week. No diff, reviewers, checks or merge button.
 */
export const dependencyReview: WrapperDef = {
  id: "dependency-review",
  banned: [{ name: "a merge button or review state", pattern: /\b(Merge|Approved|Changes requested)\b/ }],
  render: () => {
    const ctx = context();
    const pull = readJson<{ window?: { start?: string }; packages: Record<string, unknown> }>("fixtures/npm-pull.json");
    const table = readFileSync(path.join(process.cwd(), "demos", "10-delete", "static", "index.html"), "utf8");
    const names = new Set([...table.matchAll(/<code>([^<]+)<\/code>/g)].map((m) => m[1]).filter((n) => n in pull.packages));
    const week = pull.window?.start ? `npm downloads, week of ${day(pull.window.start)}` : "npm downloads";
    const before = [
      '<div class="wrap wrap--report wrap--pr"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: ctx.review.area, end: [chip(ctx.review.state)] }),
      '<div class="wrap-body wrap-report">',
      `<div class="wrap-pr-head"><p class="wrap-pr-title">${esc(ctx.review.title)}</p><p class="wrap-meta">Removes ${names.size} packages. ${esc(week)}</p></div>`,
    ].join("");
    return { before, after: "</div></div></div>", shownClass: "wrap-shown--bare", styles: [BASE_CSS, "/wrappers/report.css"], scripts: [] };
  },
};

/**
 * `pnpm perf lighthouse`: Lighthouse performance and accessibility for the sampled pages, desktop
 * and mobile (docs/PRD-perf.md 9.1 and 9.2). Runs Lighthouse 12.8.2 (the review's version) through
 * `pnpm dlx`, on Playwright's Chromium, so nothing is added to the app's dependencies.
 *
 *   pnpm perf lighthouse [--origin=<presenter>] [--form=desktop|mobile|both] [--only=<path>]
 */
import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { origins, parseArgs, round, table, writeResult } from "./lib.mts";

const LIGHTHOUSE = "lighthouse@12.8.2";
const PAGES = ["/", "/s/title", "/s/d1-intro", "/s/d1-now", "/s/m2-now", "/s/m2-intro", "/s/people-to-follow", "/s/closing", "/present?s=d4-now"];

interface Lhr {
  categories: Record<string, { score: number | null }>;
  audits: Record<string, { numericValue?: number; details?: { items?: { node?: { selector?: string } }[] } }>;
}

export async function run(argv: string[]): Promise<void> {
  const { opt } = parseArgs(argv);
  const { P } = origins(opt);
  const form = opt("form") ?? "both";
  const pages = opt("only") ? [opt("only")!] : PAGES;
  const forms = form === "both" ? ["desktop", "mobile"] : [form];
  const chrome = chromium.executablePath();
  const dir = mkdtempSync(path.join(tmpdir(), "perf-lh-"));
  const rows: (string | number | null)[][] = [];
  const raw: unknown[] = [];
  for (const f of forms) {
    for (const p of pages) {
      const out = path.join(dir, "report.json");
      const args = ["dlx", LIGHTHOUSE, P + p, "--quiet", "--output=json", `--output-path=${out}`, "--only-categories=performance,accessibility", `--chrome-path=${chrome}`, "--chrome-flags=--headless=new --enable-blink-features=CSSGridLanesLayout", ...(f === "desktop" ? ["--preset=desktop"] : [])];
      const r = spawnSync("pnpm", args, { stdio: ["ignore", "ignore", "inherit"] });
      if (r.status !== 0) {
        rows.push([f, p, "failed", null, null, null, null, null, null]);
        continue;
      }
      const lhr = JSON.parse(readFileSync(out, "utf8")) as Lhr;
      const a = (id: string) => lhr.audits[id]?.numericValue;
      const rec = {
        form: f,
        page: p,
        performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
        fcp: round(a("first-contentful-paint")),
        lcp: round(a("largest-contentful-paint")),
        tbt: round(a("total-blocking-time")),
        cls: a("cumulative-layout-shift")?.toFixed(3) ?? null,
        ttfb: round(a("server-response-time")),
        bytes: round((a("total-byte-weight") ?? 0) / 1024),
        lcpElement: lhr.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.node?.selector ?? null,
      };
      raw.push(rec);
      rows.push([f, p, rec.performance, rec.accessibility, rec.fcp, rec.lcp, rec.tbt, rec.cls, rec.bytes]);
      console.log(`${f} ${p.padEnd(22)} perf ${rec.performance} a11y ${rec.accessibility} LCP ${rec.lcp} CLS ${rec.cls} ${rec.bytes} KB`);
    }
  }
  rmSync(dir, { recursive: true, force: true });
  const file = writeResult("lighthouse", { task: "lighthouse", origin: P, lighthouse: LIGHTHOUSE, rows: raw });
  console.log("\n" + table(["Form", "Page", "Performance", "Accessibility", "FCP", "LCP", "TBT", "CLS", "KB"], rows));
  console.log(`\nwrote ${file}`);
}

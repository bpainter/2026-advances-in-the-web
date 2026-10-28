/**
 * F4 measurement (design review B3): builds fixtures/vite-measure/app with the Vite 7 setup and
 * the Vite 8 setup on this machine and writes fixtures/vite-measurements.json. Each setup is
 * installed with pnpm, then built five times cold (Vite's cache and the output removed) and five
 * times warm (cache kept); the medians are recorded with the output size, the warning count and
 * the plugins that failed. Nothing is typed by hand.
 *
 *   pnpm measure:vite
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const FIXTURE = path.join(root, "fixtures", "vite-measure");
const RUNS = 5;

type Result = { vite: string | null; coldMs: number | null; warmMs: number | null; outputKb: number | null; warnings: number | null; failingPlugins: string[] | null; error?: string };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return Math.round(s[Math.floor(s.length / 2)]);
};
function dirKb(dir: string): number {
  let bytes = 0;
  for (const f of readdirSync(dir, { recursive: true }) as string[]) {
    const abs = path.join(dir, f);
    if (statSync(abs).isFile() && !f.endsWith("stats.html")) bytes += statSync(abs).size;
  }
  return Math.round(bytes / 1024);
}

function build(dir: string): { ms: number; ok: boolean; output: string } {
  const t = performance.now();
  const r = spawnSync(process.execPath, [path.join(dir, "node_modules", "vite", "bin", "vite.js"), "build"], { cwd: dir, encoding: "utf8" });
  return { ms: performance.now() - t, ok: r.status === 0, output: `${r.stdout}\n${r.stderr}` };
}

function measure(name: string): Result {
  const dir = path.join(FIXTURE, name);
  try {
    execFileSync("pnpm", ["install", "--ignore-workspace", "--silent"], { cwd: dir, stdio: "inherit" });
  } catch (e) {
    return { vite: null, coldMs: null, warmMs: null, outputKb: null, warnings: null, failingPlugins: null, error: `install failed: ${(e as Error).message}` };
  }
  const vite = (JSON.parse(readFileSync(path.join(dir, "node_modules", "vite", "package.json"), "utf8")) as { version: string }).version;
  const cold: number[] = [];
  const warm: number[] = [];
  let output = "";
  for (let i = 0; i < RUNS; i++) {
    rmSync(path.join(dir, "node_modules", ".vite"), { recursive: true, force: true });
    rmSync(path.join(dir, "dist"), { recursive: true, force: true });
    const r = build(dir);
    output = r.output;
    if (!r.ok) {
      const plugins = [...new Set([...r.output.matchAll(/\[plugin:?\s*([\w:@/-]+)\]/g)].map((m) => m[1]))];
      return { vite, coldMs: null, warmMs: null, outputKb: null, warnings: null, failingPlugins: plugins.length ? plugins : ["(build failed; see error)"], error: r.output.split("\n").find((l) => /error/i.test(l)) ?? "build failed" };
    }
    cold.push(r.ms);
  }
  for (let i = 0; i < RUNS; i++) warm.push(build(dir).ms);
  const warnings = output.split("\n").filter((l) => /\bwarn(ing)?\b|\(!\)|deprecat/i.test(l)).length;
  return { vite, coldMs: median(cold), warmMs: median(warm), outputKb: existsSync(path.join(dir, "dist")) ? dirKb(path.join(dir, "dist")) : null, warnings, failingPlugins: [] };
}

const existing = measure("vite7");
const vite8 = measure("vite8");
const cpu = os.cpus()[0]?.model ?? "unknown CPU";
const out = {
  note: "Measured by pnpm measure:vite (scripts/measure-vite.mts) on the machine named below: fixtures/vite-measure/app built with Vite 7 and Vite 8 and the same plugins. Median of five runs. Cold: Vite's cache and the output removed. Warm: cache kept. Never typed by hand.",
  measuredAt: new Date().toISOString(),
  machine: `${cpu}, ${os.cpus().length} cores, macOS ${execFileSync("sw_vers", ["-productVersion"], { encoding: "utf8" }).trim()}`,
  node: process.versions.node,
  plugins: "@vitejs/plugin-react 5.2.0, vite-plugin-svgr 4.5.0, rollup-plugin-visualizer 6.0.11",
  existing,
  vite8,
};
writeFileSync(path.join(root, "fixtures", "vite-measurements.json"), JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify({ existing, vite8 }, null, 2));

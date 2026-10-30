/**
 * Captures intro stills and step posters from production builds (coordinator decision 5; design
 * review B1, H7, M12), so no dev badge or dev overlay is ever in an image. Builds the presenter and
 * both F2 apps into separate directories, starts them on ports 3300, 3316 and 3317 beside the dev
 * servers, runs `pnpm visuals --posters` against them and stops them. `pnpm visuals` ends by
 * running `pnpm images` for the sections it captured and recording each page's frame inputs in
 * content/.generated/posters.json (docs/PRD-perf.md, P1-IMG), so a capture leaves the slides on
 * the new AVIFs and `pnpm check` clean: commit public/intro, public/posters, public/opt and the
 * two manifests together.
 *
 *   pnpm capture [section-id ...]
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const P = "http://localhost:3300";
const env = {
  ...process.env,
  NEXT_DIST_DIR: ".next-capture",
  NEXT_PUBLIC_PRESENTER_ORIGIN: P,
  NEXT_PUBLIC_DEMO_ORIGIN: "http://127.0.0.1:3300",
  NEXT_PUBLIC_FRAMEWORK_ORIGIN: "http://localhost:3316",
  NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN: "http://localhost:3317",
  PRESENTER_ORIGIN: P,
  DEMO_ORIGIN: "http://127.0.0.1:3300",
};
const next = (dir: string) => path.join(dir, "node_modules", ".bin", "next");
const apps = [
  { dir: root, port: 3300 },
  { dir: path.join(root, "demos", "06-framework-cache"), port: 3316 },
  { dir: path.join(root, "demos", "06-framework-cache-today"), port: 3317 },
];

execFileSync("pnpm", ["-s", "theme:sync"], { stdio: "inherit" });
// The production builds answer assetExists() from the build-time file list (lib/assets.ts).
if (existsSync(path.join(root, "scripts", "asset-versions.mts"))) execFileSync(process.execPath, ["--import", "tsx", "scripts/asset-versions.mts"], { stdio: "inherit" });
for (const a of apps) execFileSync(next(a.dir), ["build"], { cwd: a.dir, env, stdio: "inherit" });
const servers: ChildProcess[] = apps.map((a) => spawn(next(a.dir), ["start", "-p", String(a.port)], { cwd: a.dir, env, stdio: "ignore" }));
const stop = () => servers.forEach((s) => s.kill());
process.on("exit", stop);

async function up(url: string) {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(url)).status < 500) return;
    } catch {
      /* starting */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} did not start`);
}
await up(`${P}/_health`);
await up("http://localhost:3316/products/ridgeline-trail");
await up("http://localhost:3317/products/ridgeline-trail");
try {
  execFileSync("node", ["--conditions=react-server", "--import", "tsx", "scripts/visuals.mts", ...process.argv.slice(2), "--posters"], { env: { ...process.env, DECK_URL: P }, stdio: "inherit" });
} finally {
  stop();
}

/**
 * Records F3's terminal sessions A to C for real (design review B2; coordinator decision 4) and
 * keeps session D (staged publishing) as a marked example. Authoring time only, never on stage:
 *
 *   node --import tsx scripts/record-f3.mts
 *
 * 1. Starts Verdaccio on localhost:4873 with no uplinks, so nothing touches the public registry.
 * 2. Publishes demos/07-package-workflow/fixture-package as report-exporter 1.2.0, back-dates that
 *    version two weeks in the registry's own metadata, then publishes 1.3.0 now.
 * 3. In a git copy of demos/07-package-workflow/fixture-workspace, runs the session commands with
 *    pnpm 12.11.0 and npm 11.15.0 (pinned through npx) and captures their output.
 * 4. Writes demos/07-package-workflow/recordings/session.json: A to C as recorded lines, D as
 *    `example: true` lines kept from the illustrative transcript. The player labels each part.
 */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { sanitize, scanTokens } from "./record-terminal.mts";

const root = process.cwd();
const REG = "http://localhost:4873/";
const work = mkdtempSync(path.join(os.tmpdir(), "f3-record-"));
// The two tools, pinned and installed once from the public registry (tools only; every package the
// sessions install or publish lives on the local registry).
execFileSync("npm", ["install", "--prefix", path.join(work, "tools"), "--registry", "https://registry.npmjs.org/", "--no-audit", "--no-fund", "pnpm@12.11.0", "npm@11.15.0"], { stdio: "ignore" });
const PNPM_BIN = path.join(work, "tools", "node_modules", ".bin", "pnpm");
const NPM_BIN = path.join(work, "tools", "node_modules", ".bin", "npm");

writeFileSync(
  path.join(work, "verdaccio.yaml"),
  `storage: ${path.join(work, "storage")}\nauth:\n  htpasswd:\n    file: ${path.join(work, "htpasswd")}\n    max_users: 10\nuplinks: {}\npackages:\n  '**':\n    access: $all\n    publish: $authenticated\n    unpublish: $authenticated\nlog: { type: stdout, format: pretty, level: error }\n`,
);
const registry = spawn("npx", ["-y", "verdaccio@6.8.0", "--config", path.join(work, "verdaccio.yaml"), "--listen", "4873"], { stdio: "ignore", detached: true });
const stop = () => {
  try {
    process.kill(-registry.pid!);
  } catch {
    /* gone */
  }
};
process.on("exit", stop);

async function waitFor(url: string) {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no registry at ${url}`);
}
await waitFor(`${REG}-/ping`);

// A throwaway user on the local registry; its token stays in the work directory.
const user = await fetch(`${REG}-/user/org.couchdb.user:recorder`, {
  method: "PUT",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "recorder", password: "recorder-local-only" }),
});
const token = ((await user.json()) as { token: string }).token;
const npmrc = `registry=${REG}\n//localhost:4873/:_authToken=${token}\n`;

function publish(version: string) {
  const pkg = path.join(work, `pkg-${version}`);
  cpSync(path.join(root, "demos", "07-package-workflow", "fixture-package"), pkg, { recursive: true });
  const manifest = JSON.parse(readFileSync(path.join(pkg, "package.json"), "utf8"));
  manifest.version = version;
  writeFileSync(path.join(pkg, "package.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(path.join(pkg, ".npmrc"), npmrc);
  const r = spawnSync(NPM_BIN, ["publish", "--registry", REG], { cwd: pkg, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`publish ${version} failed:\n${r.stdout}\n${r.stderr}`);
}
publish("1.2.0");
// Back-date 1.2.0 in the registry's metadata, as if it shipped two weeks ago.
const metaFile = path.join(work, "storage", "report-exporter", "package.json");
const meta = JSON.parse(readFileSync(metaFile, "utf8"));
const twoWeeks = new Date(Date.now() - 14 * 864e5).toISOString();
meta.time = { ...meta.time, created: twoWeeks, "1.2.0": twoWeeks, modified: twoWeeks };
writeFileSync(metaFile, JSON.stringify(meta, null, 2));
publish("1.3.0");

// The workspace, under git so the approval shows as a diff.
const ws = path.join(work, "workspace");
cpSync(path.join(root, "demos", "07-package-workflow", "fixture-workspace"), ws, { recursive: true, filter: (src) => !src.includes(".github") });
writeFileSync(path.join(ws, ".npmrc"), `${readFileSync(path.join(ws, ".npmrc"), "utf8")}\n//localhost:4873/:_authToken=${token}\n`);
const git = (...args: string[]) => execFileSync("git", args, { cwd: ws, stdio: "ignore" });
git("init", "-q");
git("add", "-A");
git("-c", "user.email=demo@example.com", "-c", "user.name=demo", "commit", "-qm", "fixture");

type Line = { line: number; delay: number; text: string; kind: "cmd" | "out" | "comment"; example?: boolean };
const lines: Line[] = [];
const push = (kind: Line["kind"], text: string, delay: number, example = false) => lines.push({ line: lines.length + 1, delay, text: sanitize(text).replace(work, "~/workspace"), kind, ...(example ? { example } : {}) });

/** Runs one shell command in the workspace and records it and its output. */
function run(display: string, cmd: string, args: string[], keep?: (l: string) => boolean) {
  push("cmd", `$ ${display}`, 650);
  const r = spawnSync(cmd, args, { cwd: ws, encoding: "utf8", env: { ...process.env, CI: "", FORCE_COLOR: "0", NO_COLOR: "1" } });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`
    .split("\n")
    .map((l) => sanitize(l).replace(ws, ".").trimEnd())
    // Store notices, progress bars and log-file pointers are noise on stage; everything else is kept.
    .filter((l) => l.trim() && !/^npm (warn|notice)|Progress:|^Done in|^\s*$|^\+$|Packages are cloned|Content-addressable store|Virtual store is at|A complete log of this run/.test(l) && (!keep || keep(l)));
  out.forEach((l, i) => push("out", l, i === 0 ? 900 : 110));
}

push("comment", "# A: install intake, pnpm 12.11", 300);
push("comment", "# test registry: localhost:4873", 300);
run("pnpm -v", PNPM_BIN, ["-v"]);
run("pnpm add -w report-exporter", PNPM_BIN, ["add", "-w", "report-exporter"]);
run("ls .marker", "ls", [".marker"]);
run("pnpm permissions list", PNPM_BIN, ["permissions", "list"]);
run("pnpm approve report-exporter", PNPM_BIN, ["approve", "report-exporter"]);
run("git diff pnpm-workspace.yaml", "git", ["--no-pager", "diff", "--no-color", "-U0", "pnpm-workspace.yaml"], (l) => !/^(diff --git|index |--- |\+\+\+ )/.test(l));
run("pnpm install", PNPM_BIN, ["install"]);
run("cat .marker", "cat", [".marker"]);
const partB = lines.length + 1;
push("comment", "# B: a version that is too new", 300);
run("pnpm add -w report-exporter@1.3.0", PNPM_BIN, ["add", "-w", "report-exporter@1.3.0"]);
const partC = lines.length + 1;
push("comment", "# C: npm 11.15 install sources", 300);
run("npm -v", NPM_BIN, ["-v"]);
run("npm config get allow-remote", NPM_BIN, ["config", "get", "allow-remote"]);
run("npm install https://cdn.example/x.tgz", NPM_BIN, ["install", "https://cdn.example/x.tgz"]);
const partD = lines.length + 1;

// D: staged publishing stays an example (it needs npm's staging service), marked line by line.
const old = JSON.parse(readFileSync(path.join(root, "demos", "07-package-workflow", "recordings", "session.json"), "utf8")) as { lines: Line[] };
const start = old.lines.findIndex((l) => /^# D:/.test(l.text));
push("comment", "# D: example, not recorded: staged publish", 300, true);
for (const l of old.lines.slice(start + 1)) if (!/^# end of recording/.test(l.text)) push(l.kind, l.text, l.delay, true);

const bad = scanTokens(lines);
if (bad.length) throw new Error(`token-like text in the recording: ${bad.map((b) => b.line).join(", ")}`);
const pnpmV = execFileSync(PNPM_BIN, ["-v"], { encoding: "utf8" }).trim();
const npmV = execFileSync(NPM_BIN, ["-v"], { encoding: "utf8" }).trim();
const rec = {
  id: "session",
  capturedAt: new Date().toISOString().slice(0, 10),
  recorded: "A to C were recorded by scripts/record-f3.mts against Verdaccio on this machine. D is an example, not a recording.",
  env: { os: `macOS ${execFileSync("sw_vers", ["-productVersion"], { encoding: "utf8" }).trim()}`, node: process.versions.node, pnpm: pnpmV, npm: npmV, registry: REG },
  parts: { A: [1, partB - 1], B: [partB, partC - 1], C: [partC, partD - 1], D: [partD, lines.length] },
  lines,
};
writeFileSync(path.join(root, "demos", "07-package-workflow", "recordings", "session.json"), JSON.stringify(rec, null, 2) + "\n");
for (const l of lines) console.log(String(l.line).padStart(3), l.example ? "ex" : "  ", l.kind.padEnd(7), l.text);
console.log(JSON.stringify(rec.parts));
stop();
process.exit(0);

/**
 * Terminal recorder for F3 (PRD Part A, 10.4): `pnpm record:terminal <script> [--id <id>]`.
 *
 * The full recorder runs <script> (one command per line, `#` lines become comments) in a
 * pseudo-terminal and writes demos/07-package-workflow/recordings/<id>.json in the
 * TerminalRecording shape: ANSI colour stripped, the home path replaced with `~`, a delay per
 * line, and a hard failure when any line matches a token pattern. The PTY dependency (node-pty)
 * is not installed and needs its own reviewed approval (Part A, 14.3), so this file ships the
 * sanitiser and the checker and explains the capture:
 *
 *   node --import tsx scripts/record-terminal.mts --check demos/07-package-workflow/recordings/session.json
 *
 * Recording the night before (F3 builder notes):
 *   1. Start a private registry on localhost:4873 (Verdaccio or equivalent). Nothing in these
 *      sessions may touch the public registry.
 *   2. Publish demos/07-package-workflow/fixture-package as report-exporter 1.2.0 two weeks
 *      before, and 1.3.0 ten minutes before session B (bump the version, publish again).
 *   3. Work in a copy of demos/07-package-workflow/fixture-workspace with pnpm 12.11 and
 *      npm 11.15 on PATH; its .npmrc points at the test registry and sets allow-remote=none.
 *   4. Session D's CI excerpt comes from a real run of publish.yml with registry-url pointed
 *      at the test registry; paste those four lines as `out` lines after `$ npm stage publish`.
 *   5. Keep the line count (69) and session boundaries of the illustrative transcript, or
 *      update every `terminal` range in content/sections/f3-package-trust.ts with it.
 *   6. Run --check, then play /s/f3-now and /s/f3-code with the rehearsal overlay (d).
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import type { TerminalRecording } from "@/demos/07-package-workflow/build";

const TOKEN_PATTERNS = [/npm_[A-Za-z0-9]{36}/, /_authToken=/];
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]|\u001b\][^\u0007]*\u0007/g;

/** One raw terminal line as the recorder stores it. */
export function sanitize(line: string, home = os.homedir()): string {
  const clean = line.replace(ANSI, "").replace(/\r$/, "");
  return home ? clean.split(home).join("~") : clean;
}

/** The lines that match a token pattern; the recorder fails on any. */
export function scanTokens(
  lines: { line: number; text: string }[],
): { line: number; pattern: string }[] {
  const hits: { line: number; pattern: string }[] = [];
  for (const l of lines)
    for (const p of TOKEN_PATTERNS)
      if (p.test(l.text)) hits.push({ line: l.line, pattern: p.source });
  return hits;
}

/** Problems with a recording file: shape, numbering, kinds, prompts, delays, tokens. */
export function checkRecording(rec: TerminalRecording): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9-]+$/.test(rec.id)) problems.push(`id "${rec.id}" is not [a-z0-9-]+`);
  if (Number.isNaN(new Date(rec.capturedAt).getTime()))
    problems.push(`capturedAt "${rec.capturedAt}" is not a date`);
  for (const k of ["os", "node", "pnpm", "npm", "registry"] as const)
    if (!rec.env?.[k]) problems.push(`env.${k} missing`);
  if (
    rec.env?.registry &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(rec.env.registry)
  )
    problems.push(`env.registry "${rec.env.registry}" is not a local test registry`);
  if (!Array.isArray(rec.lines) || rec.lines.length === 0) return [...problems, "no lines"];
  rec.lines.forEach((l, i) => {
    if (l.line !== i + 1) problems.push(`line ${i + 1} is numbered ${l.line}`);
    if (!["cmd", "out", "comment"].includes(l.kind))
      problems.push(`line ${l.line}: kind "${l.kind}"`);
    if (l.kind === "cmd" && !l.text.startsWith("$ "))
      problems.push(`line ${l.line}: a cmd line starts with "$ "`);
    if (l.kind === "comment" && !l.text.startsWith("#"))
      problems.push(`line ${l.line}: a comment line starts with "#"`);
    if (!Number.isInteger(l.delay) || l.delay < 0)
      problems.push(`line ${l.line}: delay ${l.delay}`);
    if (l.text !== sanitize(l.text, ""))
      problems.push(`line ${l.line}: contains ANSI or a carriage return`);
  });
  for (const hit of scanTokens(rec.lines))
    problems.push(`line ${hit.line}: matches token pattern ${hit.pattern}`);
  return problems;
}

const args = process.argv.slice(2);
const isMain = process.argv[1]?.endsWith("record-terminal.mts");
if (isMain) {
  const checkAt = args.indexOf("--check");
  if (checkAt !== -1 && args[checkAt + 1]) {
    const file = args[checkAt + 1];
    const rec = JSON.parse(readFileSync(file, "utf8")) as TerminalRecording;
    const problems = checkRecording(rec);
    if (problems.length) {
      console.error(`${file}: ${problems.length} problem(s)`);
      for (const p of problems) console.error(`  ${p}`);
      process.exit(1);
    }
    console.log(
      `${file}: ${rec.lines.length} lines, ${rec.lines.filter((l) => l.kind === "cmd").length} commands, no tokens`,
    );
  } else {
    console.error(
      "The PTY recorder is not installed (node-pty needs its own reviewed approval; PRD 14.3).",
    );
    console.error(
      "Capture the session by hand as the header of scripts/record-terminal.mts describes, then run",
    );
    console.error(
      "  node --import tsx scripts/record-terminal.mts --check demos/07-package-workflow/recordings/<id>.json",
    );
    process.exit(2);
  }
}

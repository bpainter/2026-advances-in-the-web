import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import type { ServerRoute } from "@/lib/frames/routes";
import { folderBuild, manifestDefaults } from "@/lib/frames/build-helpers";
import { buildFile, composeFrame, frameResponse } from "@/lib/frames/compose";
import { parseFlags } from "@/lib/frames/origins";

/**
 * F3 Package trust (PRD Part A 10.4, Part B F3). Two frames, both without a registry call:
 *   /demos/07-package-workflow/timeline         the static incident timeline (today)
 *   /demos/07-package-workflow/terminal/<rec>   the terminal player for recordings/<rec>.json
 * The player server-renders every recording line hidden; the runtime's `terminal` action
 * reveals ranges. Recordings are captured by scripts/record-terminal.mts and token-scanned.
 */
const DEMO = "07-package-workflow";
const PREFIX = `/demos/${DEMO}`;
const ROOT = process.cwd();

/** PRD Part A 10.4. */
export interface TerminalRecording {
  id: string;
  capturedAt: string;
  env: { os: string; node: string; pnpm: string; npm: string; registry: string };
  lines: { line: number; delay: number; text: string; kind: "cmd" | "out" | "comment"; example?: boolean }[];
}

const builds = {
  static: folderBuild(
    DEMO,
    "static",
    "Package trust: timeline",
    manifestDefaults({
      enhancement: { css: { files: [] }, js: [] },
      sideEffects: ["reset"],
    }),
  ),
  terminal: folderBuild(
    DEMO,
    "terminal",
    "Package trust: terminal",
    manifestDefaults({
      enhancement: { css: { files: [] }, js: [] },
      sideEffects: ["reset"],
      scrollers: ["[data-terminal]"],
    }),
  ),
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function notFound(what: string): Response {
  return new Response(`${what} not found`, {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** The origin the request arrived on, for the CSP (mirrors the frame route handler). */
function originOf(req: Request, url: URL): string {
  const host = req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function readRecording(id: string): TerminalRecording | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const file = path.join(ROOT, "demos", DEMO, "recordings", `${id}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as TerminalRecording;
}

/** One `<li>` per recording line, hidden, as the runtime's `terminal` action expects. */
export function renderLines(rec: TerminalRecording): string {
  return rec.lines
    .map((l) => {
      const text = l.kind === "cmd" ? l.text.replace(/^\$ /, "") : l.text;
      const prompt =
        l.kind === "cmd" ? '<span class="term__prompt" aria-hidden="true">$ </span>' : "";
      const example = l.example ? " data-example" : "";
      return `<li data-line="${l.line}" data-kind="${l.kind}" data-delay="${l.delay}"${example} style="--n: ${text.length}" hidden>${prompt}<span class="term__text">${escapeHtml(text)}</span></li>`;
    })
    .join("\n      ");
}

function renderEnv(rec: TerminalRecording): string {
  const entries: [string, string][] = [
    ["os", rec.env.os],
    ["node", rec.env.node],
    ["pnpm", rec.env.pnpm],
    ["npm", rec.env.npm],
    ["registry", rec.env.registry.replace(/^https?:\/\//, "").replace(/\/$/, "")],
  ];
  return entries.map(([k, v]) => `<span>${k} <b>${escapeHtml(v)}</b></span>`).join("\n    ");
}

function renderCaptured(rec: TerminalRecording): string {
  const d = new Date(rec.capturedAt);
  const label = Number.isNaN(d.getTime())
    ? rec.capturedAt
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  // "Recorded <date>" while recorded lines are on screen; "Example session" once an example line is
  // revealed (the CSS swaps them), so nothing illustrative claims to be a recording.
  return `<span class="term__chip-recorded">Recorded <time datetime="${escapeHtml(rec.capturedAt)}">${escapeHtml(label)}</time></span><span class="term__chip-example">Example session</span>`;
}

/** The terminal document for one recording: the build's index.html with its placeholders filled. */
export function terminalBody(rec: TerminalRecording): string {
  const template = readFileSync(path.join(builds.terminal.dir, "index.html"), "utf8");
  return template
    .replace("<!--lines-->", renderLines(rec))
    .replace("<!--env-->", renderEnv(rec))
    .replace("<!--captured-->", renderCaptured(rec));
}

function flagsOf(url: URL): Record<string, boolean> {
  return parseFlags(url.searchParams.get("flags"));
}

const routes: ServerRoute[] = [
  {
    // The today frame; the engine requests extension-less routes as <route>/index.html.
    method: "GET",
    path: new RegExp(`^${PREFIX}/timeline(?:/index\\.html)?$`),
    handler: (req, { url }) => {
      const flags = flagsOf(url);
      const origin = originOf(req, url);
      return frameResponse(
        composeFrame(builds.static, { flags, origin }),
        builds.static,
        origin,
        flags,
      );
    },
  },
  {
    // The timeline's own css and js, by relative name next to the document.
    method: "GET",
    path: new RegExp(`^${PREFIX}/timeline/(?<file>[\\w.-]+)$`),
    handler: (_req, { params }) => buildFile(builds.static, params.file) ?? notFound("Demo file"),
  },
  {
    // The terminal player for recordings/<rec>.json.
    method: "GET",
    path: new RegExp(`^${PREFIX}/terminal/(?<rec>[a-z0-9-]+)(?:/index\\.html)?$`),
    handler: (req, { params, url }) => {
      const rec = readRecording(params.rec);
      if (!rec) return notFound("Recording");
      const flags = flagsOf(url);
      const origin = originOf(req, url);
      const html = composeFrame(builds.terminal, {
        flags,
        origin,
        body: terminalBody(rec),
        title: `${builds.terminal.title}: ${rec.id}`,
      });
      return frameResponse(html, builds.terminal, origin, flags);
    },
  },
  {
    // The player's css and js, resolved relative to /terminal/<rec>/index.html.
    method: "GET",
    path: new RegExp(`^${PREFIX}/terminal/[a-z0-9-]+/(?<file>[\\w.-]+)$`),
    handler: (_req, { params }) => buildFile(builds.terminal, params.file) ?? notFound("Demo file"),
  },
];

export const folder: DemoFolder = { demo: DEMO, builds, routes };

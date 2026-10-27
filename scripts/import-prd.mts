/**
 * One-off: turns content/.generated/prd.json (from extract-prd.mts) into content/slides/*.ts and
 * content/demos/[id]/ files. Applies the Part 0 normalisations and inserts a blank line between
 * chunks of demo source, remapping step highlight line numbers to match.
 * Usage: npx tsx scripts/import-prd.mts
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

type Any = Record<string, any>;
const { slides } = JSON.parse(readFileSync("content/.generated/prd.json", "utf8")) as { slides: Any[] };

// ---------- chunking: blank lines between top-level chunks, with a line map ----------
const indentOf = (l: string) => l.length - l.trimStart().length;

function wantsBlank(lang: string, line: string, prevNonBlank: string): boolean {
  const trimmed = line.trim();
  const ind = indentOf(line);
  const prevT = prevNonBlank.trim();
  const prevInd = indentOf(prevNonBlank);
  if (lang === "css") return ind === 0 && !trimmed.startsWith("}") && /}\s*$/.test(prevT);
  if (lang === "js" || lang === "ts") {
    if (ind !== 0 || /^[\]})]/.test(trimmed) || trimmed.startsWith("//") || prevT.startsWith("//")) return false;
    const prevCloses = /^[\]})]+;?\)?;?$/.test(prevT) || /^}\)?;?$/.test(prevT) || /^}\);$/.test(prevT);
    const opens = /^(function |class |export )/.test(trimmed) || /[{[]\s*$/.test(trimmed);
    return prevCloses || opens;
  }
  if (lang === "html") {
    if (trimmed.startsWith("</")) return false;
    if (ind === 0) return true;
    if (ind === 2) return prevInd > 2 || (prevT.startsWith("</") && prevInd === 2);
  }
  return false;
}

function chunk(source: string, lang: string): { text: string; map: (n: number) => number } {
  const lines = source.split("\n");
  const out: string[] = [];
  const newIndex: number[] = []; // old 1-based -> new 1-based
  let inner: "js" | "css" | null = null; // inside <script> or <style> within HTML
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const prev = out.length ? out[out.length - 1] : "";
    const prevNonBlank = [...out].reverse().find((l) => l.trim() !== "") ?? "";
    const closingInner = lang === "html" && inner && /^<\/(script|style)>/i.test(trimmed);
    const justOpened = lang === "html" && /^<(script|style)\b[^>]*>$/i.test(prevNonBlank.trim());
    let blank = false;
    if (i > 0 && trimmed !== "" && prev.trim() !== "" && !closingInner && !justOpened) {
      blank = wantsBlank(inner ?? lang, line, prevNonBlank);
    }
    if (blank) out.push("");
    newIndex[i + 1] = out.length + 1;
    out.push(line);
    if (lang === "html") {
      if (/^<script\b[^>]*>$/i.test(trimmed)) inner = "js";
      else if (/^<style\b[^>]*>$/i.test(trimmed)) inner = "css";
      else if (closingInner) inner = null;
    }
  }
  return { text: out.join("\n"), map: (n) => newIndex[n] ?? n };
}

// ---------- TS literal printer ----------
const ID = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function lit(v: unknown, depth = 1): string {
  const pad = "  ".repeat(depth);
  const padEnd = "  ".repeat(depth - 1);
  if (v === null || v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && (v as Any).__raw) return (v as Any).__raw;
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const simple = v.every((x) => typeof x !== "object" || x === null || (Array.isArray(x) && x.every((y) => typeof y === "number")));
    if (simple) return `[${v.map((x) => lit(x, depth + 1)).join(", ")}]`;
    return `[\n${v.map((x) => pad + lit(x, depth + 1)).join(",\n")},\n${padEnd}]`;
  }
  const entries = Object.entries(v as Any).filter(([, x]) => x !== undefined);
  if (entries.length === 0) return "{}";
  return `{\n${entries.map(([k, x]) => `${pad}${ID.test(k) ? k : JSON.stringify(k)}: ${lit(x, depth + 1)}`).join(",\n")},\n${padEnd}}`;
}

const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// ---------- demos ----------
function writeDemo(demo: Any): string {
  const dir = path.join("content", "demos", demo.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const maps: Record<string, (n: number) => number> = {};
  for (const f of demo.code) {
    const { text, map } = f.lang === "bash" ? { text: f.source, map: (n: number) => n } : chunk(f.source, f.lang);
    maps[f.file] = map;
    writeFileSync(path.join(dir, f.file), text + "\n");
  }
  const firstFile = demo.code[0].file;
  const steps = demo.steps.map((s: Any) => {
    const map = maps[s.file ?? firstFile];
    const highlight = (s.highlight as (number | [number, number])[]).map((h) => (Array.isArray(h) ? [map(h[0]), map(h[1])] : map(h)));
    return { ...s, highlight };
  });
  const out: Any = {
    ...demo,
    code: { __raw: `demoCode(${JSON.stringify(demo.id)}, ${lit(demo.code.map((f: Any) => ({ file: f.file, lang: f.lang })), 2)})` },
    steps,
  };
  const src = `import type { Demo } from "@/content/schema";\nimport { demoCode } from "@/lib/demo-files";\n\nexport const demo: Demo = ${lit(out)};\n`;
  writeFileSync(path.join(dir, "demo.ts"), src);
  return demo.id;
}

// ---------- normalisation (PRD Part 0, canonical schema table) ----------
function normalise(s: Any): Any {
  const out = { ...s };
  if (s.id === "chrome-only-round") {
    out.demos = s.demos.map((d: Any, i: number) => {
      const m = /Chrome \d+(?: and \d+)?\+?/.exec(s.items?.[i]?.detail ?? "");
      return { ...d, support: { ...s.support, since: m ? m[0] : s.support.since } };
    });
  }
  if (s.id === "delete-this-quarter") {
    out.tableColumns = ["Delete", "Weekly", "Native replacement", "Safe since", "Caveat"];
    out.tableRows = s.items.map((it: Any) => ({ cells: [it.label, ...it.detail.split(" | ")] }));
    delete out.items;
  }
  if (s.id === "usage-vs-satisfaction") {
    out.chart = {
      kind: "dot",
      xLabel: "Used by (% of respondents)",
      yLabel: "Satisfied (% of users)",
      points: [
        { label: "Next.js", x: 58.6, y: 55, source: "https://2025.stateofjs.com/" },
        { label: "Astro", x: 6, y: 94, source: "https://2025.stateofjs.com/" },
      ],
      axisNotes: [
        { label: "SvelteKit", y: 88 },
        { label: "Svelte", y: 86 },
      ],
    };
    delete out.items;
  }
  if (s.id === "nextjs-own-words") out.items = s.items.map((it: Any, i: number) => (i === 1 ? { ...it, mono: true } : it));
  if (s.id === "trusted-publishing" || s.id === "section-delete") out.field = "navy";
  return out;
}

// ---------- slides ----------
rmSync("content/slides", { recursive: true, force: true });
mkdirSync("content/slides", { recursive: true });
const imports: string[] = [];
const names: string[] = [];
for (const raw of slides) {
  const s = normalise(raw);
  const lines: string[] = [`import type { Slide } from "@/content/schema";`];
  const obj: Any = { ...s };
  if (s.demo) {
    writeDemo(s.demo);
    lines.push(`import { demo } from "@/content/demos/${s.demo.id}/demo";`);
    obj.demo = { __raw: "demo" };
  }
  if (s.demos) {
    const ids: string[] = s.demos.map((d: Any) => writeDemo(d));
    for (const id of ids) lines.push(`import { demo as ${camel(id)} } from "@/content/demos/${id}/demo";`);
    obj.demos = { __raw: `[${ids.map(camel).join(", ")}]` };
  }
  const file = `${String(s.index).padStart(2, "0")}-${s.id}.ts`;
  writeFileSync(path.join("content", "slides", file), `${lines.join("\n")}\n\nexport const slide: Slide = ${lit(obj)};\n`);
  const name = `s${String(s.index).padStart(2, "0")}`;
  imports.push(`import { slide as ${name} } from "./${file.replace(/\.ts$/, "")}";`);
  names.push(name);
}
writeFileSync(
  "content/slides/index.ts",
  `import type { Slide } from "@/content/schema";\n${imports.join("\n")}\n\nexport const slides: Slide[] = [${names.join(", ")}];\n`,
);
console.log(`wrote ${slides.length} slides`);

import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { CodeFile, CodeLang } from "@/content/schema";

const DEMOS_DIR = path.join(process.cwd(), "content", "demos");

/**
 * Populates `Demo.code[].source` from the real files under content/demos/[id]/ so demo
 * sources stay editable and lintable as code (PRD Part A, section 9.1).
 */
export function demoCode(id: string, files: { file: string; lang: CodeLang }[]): CodeFile[] {
  return files.map(({ file, lang }) => ({
    file,
    lang,
    source: readFileSync(path.join(DEMOS_DIR, id, file), "utf8").replace(/\n$/, ""),
  }));
}

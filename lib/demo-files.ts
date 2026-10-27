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
  return files.map(({ file, lang }) => {
    const abs = path.join(DEMOS_DIR, id, file);
    // `source` is a getter: the file is read when the demo is rendered or composed, not when the
    // module loads, so an edit to html/css/js shows on the next request in dev without touching
    // demo.ts. Production builds still read once at build time.
    const entry = { file, lang } as CodeFile;
    Object.defineProperty(entry, "source", {
      enumerable: true,
      get: () => readFileSync(abs, "utf8").replace(/\n$/, ""),
    });
    return entry;
  });
}

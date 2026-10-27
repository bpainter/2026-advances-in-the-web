import "server-only";
import { createElement, type ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { createHighlighter, type Highlighter } from "shiki";
import type { Element, ElementContent, Root } from "hast";
import type { CodeFile, CodeLang } from "@/content/schema";

const LANGS: Record<CodeLang, string> = { html: "html", css: "css", js: "javascript", ts: "typescript", tsx: "tsx", bash: "bash", http: "http", yaml: "yaml" };
const THEME = "github-light";

let highlighterPromise: Promise<Highlighter> | undefined;
function highlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: [THEME], langs: Object.values(LANGS) });
  return highlighterPromise;
}

export interface RenderedFile {
  file: string;
  lang: CodeLang;
  /** One React node per source line, tokens already coloured. No raw HTML strings. */
  lines: ReactNode[];
}

function isElement(n: ElementContent): n is Element {
  return n.type === "element";
}

/** Shiki -> hast -> React elements, split per line so the panel can mark highlighted lines. */
export async function renderCodeFile(file: CodeFile): Promise<RenderedFile> {
  const h = await highlighter();
  const root = h.codeToHast(file.source, { lang: LANGS[file.lang], theme: THEME });
  const pre = root.children.find((n): n is Element => n.type === "element" && n.tagName === "pre");
  const code = pre?.children.find((n): n is Element => n.type === "element" && n.tagName === "code");
  // Shiki 4 emits `class`, older versions `className`; accept either.
  const lineEls = (code?.children ?? []).filter(isElement).filter((el) => {
    const cls = el.properties?.className ?? el.properties?.class;
    const list = Array.isArray(cls) ? cls.map(String) : String(cls ?? "").split(/\s+/);
    return list.includes("line");
  });
  const lines = lineEls.map((el, i) => {
    const lineRoot: Root = { type: "root", children: el.children };
    return createElement(Fragment, { key: `l${i + 1}` }, toJsxRuntime(lineRoot, { Fragment, jsx, jsxs }));
  });
  return { file: file.file, lang: file.lang, lines };
}

export async function renderCodeFiles(files: CodeFile[]): Promise<RenderedFile[]> {
  return Promise.all(files.map(renderCodeFile));
}

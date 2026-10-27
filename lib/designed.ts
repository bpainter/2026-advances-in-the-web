import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { fromHtml } from "hast-util-from-html";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Element, ElementContent, Root, RootContent } from "hast";

const DESIGNED_DIR = path.join(process.cwd(), "content", "designed");

export interface DesignedSection {
  /** The `<section>` as React elements; inline styles become style objects, nothing is injected as HTML. */
  node: ReactNode;
  /** Section background colour as written, e.g. "#0F1C41". */
  background: string | null;
  /** True when the background is dark enough for light footer text. */
  dark: boolean;
  /** Plain-text speaker notes from the section's `<aside>`, if any. */
  notes: string | null;
}

function isElement(n: RootContent | ElementContent): n is Element {
  return n.type === "element";
}

function findSection(root: Root): Element | undefined {
  for (const child of root.children) if (isElement(child) && child.tagName === "section") return child;
  return undefined;
}

function textOf(el: Element): string {
  return el.children
    .map((c) => (c.type === "text" ? c.value : isElement(c) ? textOf(c) : ""))
    .join("")
    .trim();
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Loads a slide exported from Claude Design (one `<section>` in the Slides format, 1920 x 1080,
 * inline styles only) and turns it into React elements for the stage. Image paths were rewritten
 * to /images/design/ when the file was imported; fonts are the families in styles/fonts.css.
 */
export function loadDesigned(file: string): DesignedSection {
  const html = readFileSync(path.join(DESIGNED_DIR, file), "utf8");
  const root = fromHtml(html, { fragment: true });
  const section = findSection(root);
  if (!section) throw new Error(`content/designed/${file}: no <section> found`);

  const aside = section.children.find((c): c is Element => isElement(c) && c.tagName === "aside");
  const notes = aside ? textOf(aside) : null;
  section.children = section.children.filter((c) => c !== aside);
  // The stage owns transitions; the section id would collide with the page's own ids.
  delete section.properties.dataTransition;
  delete section.properties.id;

  const style = String(section.properties.style ?? "");
  const bg = /background\s*:\s*(#[0-9a-f]{3,8})/i.exec(style)?.[1] ?? null;
  const dark = bg ? luminance(bg) < 0.4 : false;

  const node = toJsxRuntime(section, { Fragment, jsx, jsxs });
  return { node, background: bg, dark, notes };
}

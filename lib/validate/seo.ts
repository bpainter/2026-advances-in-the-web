import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { deck, sections, slides } from "@/lib/content";
import { BACKGROUNDS } from "@/content/backgrounds";
import { BANNED, LIMITS, sentences, words, type Issue } from "./rules";
import { jpegSize } from "./v5";

/**
 * The SEO and social checks (PRD r7, 10.5): the per-slide JSON-LD, the metadata titles, and the
 * committed Open Graph image against the hash of the inputs it was captured from (10.2).
 * `scripts/og.mts` writes the image with the same `ogInputs`, so the two can never disagree.
 */

export const OG_DIR = path.join("public", "og");
export const OG_IMAGE_FILE = path.join(OG_DIR, "cover.jpg");
export const OG_META_FILE = path.join(OG_DIR, "cover.json");
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_MAX_BYTES = 300 * 1024;
const GLASS_SLIDE = path.join("components", "layouts", "glass", "GlassSlide.tsx");
const SLIDES_CSS = path.join("styles", "components", "slides-glass.css");
const FONTS = ["SlalomSans-Regular.otf", "SlalomSans-Bold.otf"];

export interface OgMeta {
  hash: string;
  width: number;
  height: number;
  bytes: number;
  imageSha256: string;
  source: string;
  inputs: Record<string, string>;
}

const sha = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

/** Leaf rules of a stylesheet: the selector (with any at-rule preludes around it) and the body. */
export function cssRules(css: string): { selector: string; context: string[]; body: string }[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: { selector: string; context: string[]; body: string }[] = [];
  const stack: { prelude: string; start: number; nested: boolean }[] = [];
  let last = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "{") {
      if (stack.length) stack[stack.length - 1].nested = true;
      stack.push({ prelude: text.slice(last, i).trim(), start: i + 1, nested: false });
      last = i + 1;
    } else if (c === "}") {
      const top = stack.pop();
      if (top && !top.nested) out.push({ selector: top.prelude, context: stack.map((s) => s.prelude), body: text.slice(top.start, i).replace(/\s+/g, " ").trim() });
      last = i + 1;
    } else if (c === ";") {
      // A declaration (or a statement at-rule) ends: the next prelude starts after it.
      last = i + 1;
    }
  }
  return out;
}

/**
 * The `case "title":` branch of GlassSlide.tsx, and every component it renders: defined in the
 * same file, or imported from a sibling module (`import { Wordmark } from "./Wordmark"`), whose
 * whole file is included.
 */
export function titleBranch(source: string, readSibling: (rel: string) => string | null = () => null): string {
  const start = source.indexOf('case "title":');
  if (start < 0) return "";
  const end = source.indexOf("case \"", start + 1);
  const branch = source.slice(start, end < 0 ? undefined : end);
  const parts = [branch];
  for (const name of new Set([...branch.matchAll(/<([A-Z]\w*)/g)].map((m) => m[1]))) {
    const at = source.search(new RegExp(`function ${name}\\s*\\(`));
    if (at >= 0) {
      const close = source.indexOf("\n}\n", at);
      parts.push(source.slice(at, close < 0 ? undefined : close + 2));
      continue;
    }
    const imp = new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*"(\\.[^"]+)"`).exec(source);
    const text = imp ? readSibling(imp[1]) : null;
    if (text !== null) parts.push(`// ${imp![1]}\n${text}`);
  }
  return parts.join("\n");
}

/** The cover's class names (`sg`, `sg--title`, `sg-eyebrow`, `sg-wordmark`...), read from the title branch and its components. */
function coverClasses(branch: string): string[] {
  const names = new Set<string>(["sg--title"]);
  // Every sg-prefixed token: className attributes, template literals and default props alike.
  for (const m of branch.matchAll(/(?<![\w.$-])sg(?:-[\w-]*)?(?![\w-])/g)) names.add(m[0]);
  return [...names];
}

/**
 * The CSS that draws the cover: rules that name `.sg--title`, and rules for the cover's classes
 * that are not scoped to another slide kind (`.sg--grid .sg-title` is not the cover's).
 */
export function coverCss(css: string, classes: string[]): string {
  const has = (sel: string, c: string) => new RegExp(`\\.${c.replace(/[-]/g, "\\-")}(?![\\w-])`).test(sel);
  return cssRules(css)
    .filter(({ selector }) => {
      if (/^@/.test(selector)) return false;
      if (has(selector, "sg--title")) return true;
      const otherKind = [...selector.matchAll(/\.sg--([\w-]+)/g)].some((m) => m[1] !== "title");
      return !otherKind && classes.some((c) => has(selector, c));
    })
    .map((r) => `${r.context.join(" / ")}${r.context.length ? " / " : ""}${r.selector} { ${r.body} }`)
    .join("\n");
}

/**
 * What the Open Graph image is captured from (PRD r7, 10.2): the title slide's data, the speaker
 * and event, the title background, the cover's CSS, the title branch of GlassSlide.tsx and the two
 * Slalom Sans files. Each input is hashed on its own, so `pnpm check` can name what changed.
 */
export function ogInputs(root = process.cwd()): Record<string, string> {
  const title = slides.find((s) => s.layout === "glass-title");
  const read = (p: string) => (existsSync(path.join(root, p)) ? readFileSync(path.join(root, p)) : Buffer.from(""));
  const source = read(GLASS_SLIDE).toString("utf8");
  const sibling = (rel: string) => {
    const base = path.join(path.dirname(GLASS_SLIDE), rel);
    const file = [base, `${base}.tsx`, `${base}.ts`].find((f) => existsSync(path.join(root, f)) && statSync(path.join(root, f)).isFile());
    return file ? read(file).toString("utf8") : null;
  };
  const branch = titleBranch(source, sibling);
  const bg = path.join("public", "backgrounds", "v5", BACKGROUNDS.title.file);
  return {
    "title slide": sha(JSON.stringify(title ? { id: title.id, layout: title.layout, title: title.title, glass: title.glass, background: title.background } : null)),
    "deck.speaker": sha(JSON.stringify(deck.speaker)),
    "deck.event": sha(JSON.stringify(deck.event)),
    [bg]: sha(read(bg)),
    [`${SLIDES_CSS} (cover rules)`]: sha(coverCss(read(SLIDES_CSS).toString("utf8"), coverClasses(branch))),
    [`${GLASS_SLIDE} (title branch and its components)`]: sha(branch),
    ...Object.fromEntries(FONTS.map((f) => [path.join("public", "fonts", f), sha(read(path.join("public", "fonts", f)))])),
  };
}

export function ogHash(inputs: Record<string, string>): string {
  return sha(JSON.stringify(Object.entries(inputs).sort(([a], [b]) => a.localeCompare(b))));
}

// --------------------------------------------------------------- checks

/** The writing rules (PRD v4, 5.2) on one description. */
function copyIssues(where: string, field: string, text: string): Issue[] {
  const out: Issue[] = [];
  const add = (rule: string, message: string, level: "error" | "warning" = "error") => out.push({ rule, where, message: `${field}: ${message}`, level });
  if (!text.trim()) add("seo-description", "is empty");
  if (text.length > 160) add("seo-description", `${text.length} characters (at most 160)`);
  if (/[–—]/.test(text)) add("dash", "has an en or em dash");
  if (text.includes("!")) add("exclaim", "has an exclamation point");
  if (/^[a-z]/.test(text)) add("case", "should start with a capital (sentence case)");
  const lower = ` ${text.toLowerCase().replace(/[^a-z' ]+/g, " ")} `;
  for (const w of BANNED) if (lower.includes(` ${w} `)) add("banned", `uses "${w}"`);
  for (const s of sentences(text)) {
    const n = words(s);
    if (n > LIMITS.sentenceWords) add("sentence", `a sentence of ${n} words (at most ${LIMITS.sentenceWords}): "${s.slice(0, 60)}…"`);
    else if (n > LIMITS.sentenceWarnWords) add("sentence", `a sentence of ${n} words (aim for ${LIMITS.sentenceWarnWords}): "${s.slice(0, 60)}…"`, "warning");
  }
  return out;
}

const REQUIRED: Record<string, string[]> = {
  CreativeWork: ["@id", "url", "name", "description", "position", "inLanguage", "isPartOf", "author", "image"],
  PresentationDigitalDocument: ["@id", "name", "url", "author", "inLanguage", "image", "size", "about"],
  Person: ["@id", "name", "jobTitle", "worksFor", "sameAs"],
  Event: ["@id", "name", "eventAttendanceMode", "location", "performer", "workPerformed", "superEvent"],
};

/** Every `{ "@id": x }` reference in a node tree (objects that carry an id and nothing else). */
function references(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => references(v, out));
  else if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length === 1 && keys[0] === "@id") out.push(String(o["@id"]));
    else for (const v of Object.values(o)) references(v, out);
  }
  return out;
}

/** Every `url` and `sameAs` value in a node tree. */
function urls(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => urls(v, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === "url" || k === "sameAs" || k === "image") && typeof v === "string") out.push(v);
      else if (k === "sameAs" && Array.isArray(v)) out.push(...v.map(String));
      else urls(v, out);
    }
  return out;
}

/** The SEO checks for `pnpm check` (PRD r7, 10.5). */
export async function seoIssues(root = process.cwd()): Promise<Issue[]> {
  const out: Issue[] = [];
  const add = (rule: string, where: string, message: string, level: "error" | "warning" = "error") => out.push({ rule, where, message, level });

  // The Open Graph image and its inputs (10.2). Checked first: lib/seo.ts imports cover.json.
  const metaFile = path.join(root, OG_META_FILE);
  const imageFile = path.join(root, OG_IMAGE_FILE);
  if (!existsSync(metaFile) || !existsSync(imageFile)) {
    add("og-image", OG_IMAGE_FILE, "missing; run pnpm og");
    return out;
  }
  const meta = JSON.parse(readFileSync(metaFile, "utf8")) as OgMeta;
  const image = readFileSync(imageFile);
  const size = jpegSize(image);
  if (!size || size.width !== OG_SIZE.width || size.height !== OG_SIZE.height) add("og-image", OG_IMAGE_FILE, `is ${size ? `${size.width} by ${size.height}` : "not a JPEG"}; expected ${OG_SIZE.width} by ${OG_SIZE.height}`);
  if (statSync(imageFile).size > OG_MAX_BYTES) add("og-image", OG_IMAGE_FILE, `is ${Math.round(statSync(imageFile).size / 1024)} KB (at most ${OG_MAX_BYTES / 1024})`);
  if (sha(image) !== meta.imageSha256) add("og-image", OG_IMAGE_FILE, "does not match cover.json (edited by hand?); run pnpm og");
  const inputs = ogInputs(root);
  if (ogHash(inputs) !== meta.hash) {
    const changed = Object.keys({ ...inputs, ...meta.inputs }).filter((k) => inputs[k] !== meta.inputs?.[k]);
    add("og-stale", OG_IMAGE_FILE, `The cover changed; run pnpm og (changed: ${changed.join(", ") || "the hash recipe"})`);
  }

  const seo = await import("@/lib/seo");

  // Metadata titles (10.5): unique per slide page, and not the root's (the cover is the talk, so it may share it).
  const titles = new Map<string, string>();
  for (const s of slides) {
    const m = seo.slideMetadata(s);
    const t = String(m.title);
    if (titles.has(t)) add("seo-title", s.id, `title "${t}" repeats ${titles.get(t)}`);
    titles.set(t, s.id);
    if (s.layout !== "glass-title" && t === String(seo.siteMetadata().title)) add("seo-title", s.id, `title "${t}" equals the site title`);
  }

  // Written descriptions (content/descriptions.ts): one per page except feature intros, none for an unknown id.
  const { pageDescriptions } = await import("@/content/descriptions");
  const ids = new Set(slides.map((s) => s.id));
  for (const id of Object.keys(pageDescriptions)) if (!ids.has(id)) add("seo-description", id, "is written in content/descriptions.ts but no slide has this id");
  for (const s of slides) {
    if (s.page?.stage === "intro") continue;
    const d = pageDescriptions[s.id];
    // The JSON-LD check below runs the writing rules on the description itself.
    if (!d) add("seo-description", s.id, "has no description in content/descriptions.ts");
  }
  out.push(...copyIssues("deck", "site description", seo.SITE_DESCRIPTION));
  out.push(...copyIssues("deck", "image alt", seo.OG_IMAGE.alt));

  // Per-slide JSON-LD (10.3, 10.5).
  for (const s of slides) {
    const graph = seo.slideJsonLd(s);
    const html = seo.jsonLdHtml(graph);
    let parsed: typeof graph;
    try {
      parsed = JSON.parse(html);
    } catch (e) {
      add("jsonld", s.id, `does not parse: ${(e as Error).message}`);
      continue;
    }
    if (JSON.stringify(parsed) !== JSON.stringify(graph)) add("jsonld", s.id, "does not round-trip through JSON");
    if (/<\/?script/i.test(html)) add("jsonld", s.id, "contains a script tag");
    if (parsed["@context"] !== "https://schema.org") add("jsonld", s.id, "@context is not https://schema.org");
    const nodes = parsed["@graph"];
    const ids = new Set(nodes.map((n) => String(n["@id"])));
    for (const n of nodes) {
      const type = String(n["@type"]);
      for (const field of REQUIRED[type] ?? []) if (n[field] === undefined || n[field] === "") add("jsonld", s.id, `${type} has no ${field}`);
    }
    for (const type of Object.keys(REQUIRED)) if (!nodes.some((n) => n["@type"] === type)) add("jsonld", s.id, `the graph has no ${type}`);
    const slideNode = nodes.find((n) => n["@type"] === "CreativeWork");
    if (slideNode) {
      const canonical = new URL(String(seo.slideMetadata(s).alternates?.canonical), seo.ORIGIN).href;
      if (slideNode.position !== s.index) add("jsonld", s.id, `position ${String(slideNode.position)} is not the slide index ${s.index}`);
      if (slideNode.url !== canonical) add("jsonld", s.id, `url ${String(slideNode.url)} is not the canonical ${canonical}`);
      out.push(...copyIssues(s.id, "description", String(slideNode.description)));
      if (s.demoSection && !(Array.isArray(slideNode.about) && slideNode.about.length)) add("jsonld", s.id, "a demo page with no about");
      if (s.citations.length && !Array.isArray(slideNode.citation)) add("jsonld", s.id, "has citations but no citation field");
      for (const c of (slideNode.citation as { url: string }[] | undefined) ?? []) if (!c.url.startsWith("https:")) add("jsonld", s.id, `citation URL is not https: ${c.url}`);
    }
    for (const ref of references(nodes)) if (!ids.has(ref)) add("jsonld", s.id, `@id ${ref} does not resolve inside the graph`);
    for (const u of urls(nodes)) if (!/^https?:\/\//.test(u)) add("jsonld", s.id, `URL is not absolute: ${u}`);
  }
  const talk = seo.talkJsonLd()["@graph"].find((n) => n["@type"] === "PresentationDigitalDocument");
  if ((talk?.hasPart as unknown[] | undefined)?.length !== slides.length) add("jsonld", "deck", "the talk's hasPart does not list every slide");

  // Names for the web-features ids a section also uses.
  for (const sec of sections)
    if (sec.support?.kind === "web-features")
      for (const id of sec.support.alsoUses ?? []) if (seo.featureName(id) === id) add("jsonld", sec.id, `no display name for "${id}" in FEATURE_NAMES (lib/seo.ts)`, "warning");

  if (!deck.event.startDate)
    add("event-date", "deck", `deck.event.startDate${deck.event.venue ? "" : " and venue"} unset: the Event JSON-LD ships without them (PRD r7, open question 2)`, "warning");
  return out;
}

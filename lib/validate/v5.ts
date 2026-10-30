import { BANNED, LIMITS, sentences, words, type Issue } from "./rules";
import { notesPlain } from "@/lib/notes";
import type { GlassContent } from "@/content/schema";
import type { Background } from "@/content/backgrounds";

/**
 * Deck-level checks added in PRD v5 (4.7): backgrounds, the grain tile, the QR code, wrappers and
 * the native opening and closing slides. Pure: scripts/validate.mts gathers the context, and
 * scripts/validator-fixtures.mts breaks one rule at a time.
 */

export interface FileInfo {
  width: number;
  height: number;
  bytes: number;
  sha256: string;
}

export interface V5Context {
  /** Non-demo slides in deck order. */
  slides: { id: string; background?: string }[];
  /** Demo sections in deck order. */
  sections: { id: string; background?: string }[];
  registry: Record<string, Background>;
  /** A file under public/backgrounds/v5/, or null when it is missing. */
  fileInfo: (file: string) => FileInfo | null;
  /** Entries directly under public/backgrounds/. */
  backgroundsDir: string[];
  /** Source files that still name a v4 glass-*.jpg background. */
  glassMentions: string[];
  /** content/.generated/backgrounds.json: the hash each file was measured at. */
  stats: Record<string, { file: string; sha256: string }> | null;
  /** The grain tile: the committed pixels and a fresh render. */
  grain: { committed: Uint8Array | null; fresh: Uint8Array };
  /** Registry ids whose slide is still to be built (a warning, not an error, until it lands). */
  pending?: string[];
  /** The closing QR code: the committed SVG and a fresh render (null before M7). */
  qr?: { committed: string | null; fresh: string } | null;
}

const KB = 1024;
export const BG_WARN_BYTES = 900 * KB;
export const BG_MAX_BYTES = 1.5 * KB * KB;

export function validateV5(ctx: V5Context): Issue[] {
  const out: Issue[] = [];
  const err = (rule: string, where: string, message: string) => out.push({ rule, where, message, level: "error" });
  const warn = (rule: string, where: string, message: string) => out.push({ rule, where, message, level: "warning" });

  // Every slide and section names a registry background.
  const users = new Map<string, string[]>();
  for (const s of [...ctx.slides, ...ctx.sections]) {
    if (!s.background) {
      err("bg-missing", s.id, "has no background");
      continue;
    }
    if (!(s.background in ctx.registry)) {
      err("bg-unknown", s.id, `background "${s.background}" is not in content/backgrounds.ts`);
      continue;
    }
    users.set(s.background, [...(users.get(s.background) ?? []), s.id]);
  }
  // Each registry id is used exactly once, by one non-demo slide or one section.
  for (const id of Object.keys(ctx.registry)) {
    const u = users.get(id) ?? [];
    if (u.length === 0 && ctx.pending?.includes(id)) warn("bg-unused", `background ${id}`, "is used by no slide yet; its slide lands in a later milestone");
    else if (u.length === 0) err("bg-unused", `background ${id}`, "is used by no slide or section");
    if (u.length > 1) err("bg-shared", `background ${id}`, `is used by ${u.join(", ")}; each file belongs to one slide or section`);
  }
  // Adjacent sections never share a lead hue.
  for (let i = 1; i < ctx.sections.length; i++) {
    const a = ctx.registry[ctx.sections[i - 1].background ?? ""];
    const b = ctx.registry[ctx.sections[i].background ?? ""];
    if (a && b && a.lead === b.lead) err("bg-adjacent", ctx.sections[i].id, `shares the lead hue "${a.lead}" with ${ctx.sections[i - 1].id}`);
  }
  // Files: present, 1920 by 1080, under the size budget, all different.
  const hashes = new Map<string, string>();
  for (const [id, bg] of Object.entries(ctx.registry)) {
    const info = ctx.fileInfo(bg.file);
    if (!info) {
      err("bg-file", `background ${id}`, `public/backgrounds/v5/${bg.file} is missing`);
      continue;
    }
    if (info.width !== 1920 || info.height !== 1080) err("bg-size", `background ${id}`, `${bg.file} is ${info.width} by ${info.height}; it must be 1920 by 1080`);
    if (info.bytes > BG_MAX_BYTES) err("bg-bytes", `background ${id}`, `${bg.file} is ${Math.round(info.bytes / KB)} KB; the limit is 1.5 MB`);
    else if (info.bytes > BG_WARN_BYTES) warn("bg-bytes", `background ${id}`, `${bg.file} is ${Math.round(info.bytes / KB)} KB; aim for 900 KB or less`);
    const dup = hashes.get(info.sha256);
    if (dup) err("bg-duplicate", `background ${id}`, `${bg.file} is the same file as ${dup}`);
    hashes.set(info.sha256, bg.file);
    // The stats the contrast test and the walk read were measured on this exact file.
    const st = ctx.stats?.[id];
    if (!ctx.stats) continue;
    if (!st || st.sha256 !== info.sha256) err("bg-stats", `background ${id}`, `content/.generated/backgrounds.json is stale for ${bg.file}; run pnpm backgrounds`);
  }
  if (!ctx.stats) err("bg-stats", "deck", "content/.generated/backgrounds.json is missing; run pnpm backgrounds");
  // Nothing from v4 is left.
  for (const entry of ctx.backgroundsDir) if (entry !== "v5" && entry !== "README.md") err("bg-leftover", "public/backgrounds", `${entry} is left over; only v5/ and README.md belong here`);
  for (const f of ctx.glassMentions) err("bg-glass", f, "names a v4 glass-*.jpg background");
  // The grain tile matches a fresh render.
  const { committed, fresh } = ctx.grain;
  if (!committed) err("grain", "public/theme/grain.png", "is missing or not an 8-bit gray 256 by 256 PNG; run pnpm grain");
  else if (committed.length !== fresh.length || committed.some((v, i) => v !== fresh[i])) err("grain", "public/theme/grain.png", "differs from a fresh render; run pnpm grain");
  // The closing QR code matches a fresh render.
  if (ctx.qr) {
    if (ctx.qr.committed === null) err("qr", "public/qr/linkedin.svg", "is missing; run pnpm qr");
    else if (ctx.qr.committed !== ctx.qr.fresh) err("qr", "public/qr/linkedin.svg", "differs from a fresh render; run pnpm qr");
  }
  return out;
}

/** Width and height from a JPEG's first SOF marker, or null. */
export function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) {
      off++;
      continue;
    }
    const marker = buf[off + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      off += 2;
      continue;
    }
    const len = buf.readUInt16BE(off + 2);
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    off += 2 + len;
  }
  return null;
}

/** The text of a native glass slide, field by field (PRD v5, 4.7: the writing rules apply). */
export function glassText(g: GlassContent): { field: string; text: string; label?: boolean }[] {
  switch (g.kind) {
    case "title":
      return [{ field: "eyebrow", text: g.eyebrow, label: true }, ...g.lines.map((t) => ({ field: "title", text: t }))];
    case "grid":
      return [
        ...(g.eyebrow ? [{ field: "eyebrow", text: g.eyebrow, label: true }] : []),
        ...(g.title ? [{ field: "title", text: g.title, label: true }] : []),
        ...(g.display ? [{ field: "display", text: g.display, label: true }] : []),
        ...(g.lede ? [{ field: "lede", text: g.lede }] : []),
        ...(g.cardsEyebrow ? [{ field: "eyebrow", text: g.cardsEyebrow, label: true }] : []),
        ...g.cards.flatMap((c) => [{ field: "card title", text: c.title, label: true }, ...(c.body ? [{ field: "card body", text: c.body }] : []), ...(c.question ? [{ field: "question", text: c.question }] : [])]),
      ];
    case "quotes":
      return [{ field: "title", text: g.title, label: true }, ...g.quotes.flatMap((q) => [{ field: "quote", text: q.text }, { field: "cite", text: q.cite }])];
    case "statement":
      return g.lines.map((t) => ({ field: "statement", text: t }));
    case "people":
      return [{ field: "title", text: g.title, label: true }, ...g.people.map((p) => ({ field: "person", text: `${p.name}, ${p.role}` }))];
    case "closing":
      return [{ field: "eyebrow", text: g.eyebrow, label: true }, { field: "name", text: g.name }, { field: "role", text: g.role }, { field: "caption", text: g.caption, label: true }];
  }
}

/**
 * The writing rules (PRD v4, 5.2) on the opening and closing slides' text and notes, and no
 * uppercase or tracked text in their stylesheet (PRD v5, 4.7).
 */
export function slideCopyIssues(slides: { id: string; glass?: GlassContent; speakerNotes: string }[], css: string): Issue[] {
  const out: Issue[] = [];
  const add = (rule: string, where: string, message: string, level: "error" | "warning" = "error") => out.push({ rule, where, message, level });
  for (const s of slides) {
    // The notes are the speaker's verified script (docs/speaker-notes-verified.md), checked on their
    // plain text: banned words, "X, not Y" and long sentences are warnings there; the slide's own text stays strict.
    const fields: { field: string; text: string; label?: boolean; spoken?: boolean }[] = [...(s.glass ? glassText(s.glass) : []), { field: "notes", text: notesPlain(s.speakerNotes), spoken: true }];
    for (const { field, text, label, spoken } of fields) {
      const soft = spoken ? "warning" : "error";
      if (/[–—]/.test(text)) add("dash", s.id, `${field} has an en or em dash`);
      if (text.includes("!")) add("exclaim", s.id, `${field} has an exclamation point`);
      if (/\bTODO\b/.test(text)) add("todo", s.id, `${field} still has a TODO`);
      const lower = ` ${text.toLowerCase().replace(/[^a-z' ]+/g, " ")} `;
      for (const w of BANNED) if (lower.includes(` ${w} `)) add("banned", s.id, `${field} uses "${w}"`, soft);
      if (label && /^[a-z]/.test(text)) add("case", s.id, `${field} "${text}" should start with a capital (sentence case)`);
      if (/, not /.test(text)) add("x-not-y", s.id, `${field} uses "X, not Y"`, soft);
      for (const sentence of sentences(text)) {
        const n = words(sentence);
        if (n > LIMITS.sentenceWords) add("sentence", s.id, `${field}: a sentence of ${n} words (${spoken ? "aim for" : "at most"} ${LIMITS.sentenceWords}): "${sentence.slice(0, 60)}…"`, soft);
        else if (n > LIMITS.sentenceWarnWords) add("sentence", s.id, `${field}: a sentence of ${n} words (aim for ${LIMITS.sentenceWarnWords}): "${sentence.slice(0, 60)}…"`, "warning");
      }
    }
  }
  if (/text-transform:\s*uppercase/i.test(css)) add("slide-case", "styles/components/slides-glass.css", "sets text-transform: uppercase");
  for (const m of css.matchAll(/letter-spacing:\s*([^;]+);/g)) if (!/^(0|normal|-)/.test(m[1].trim())) add("slide-case", "styles/components/slides-glass.css", `sets letter-spacing: ${m[1].trim()} (tracked text)`);
  return out;
}

/** PRD r7 deck checks: one source for the speaker's links, the "Still in motion" group and the drawer's coverage. */
export interface R7Context {
  deck: { site: { url: string }; speaker: { linkedin: string }; org: { url: string } };
  /** The closing slide's `glass.url` (the QR generator's input), or null when there is no closing slide. */
  closingUrl: string | null;
  /** Demo sections in deck order, with their page ids. */
  sections: { id: string; group?: string; pageIds: string[]; stages: string[] }[];
  /** Every slide id in the deck. */
  slideIds: string[];
  /** The drawer's links in order (lib/nav.ts), or null before it lands. */
  nav?: { slideId: string; label: string }[] | null;
}

export function validateR7(ctx: R7Context): Issue[] {
  const out: Issue[] = [];
  const err = (rule: string, where: string, message: string) => out.push({ rule, where, message, level: "error" });

  // Links (PRD r7, 5.1): https, and the closing QR reads the same LinkedIn URL as the deck.
  const urls: [string, string][] = [
    ["deck.site.url", ctx.deck.site.url],
    ["deck.speaker.linkedin", ctx.deck.speaker.linkedin],
    ["deck.org.url", ctx.deck.org.url],
  ];
  for (const [field, url] of urls) if (!/^https:\/\/[^\s]+$/.test(url)) err("deck-links", "content/deck.ts", `${field} "${url}" must be an https URL`);
  if (ctx.closingUrl !== null && ctx.closingUrl !== ctx.deck.speaker.linkedin) err("deck-links", "closing", `glass.url "${ctx.closingUrl}" must equal deck.speaker.linkedin "${ctx.deck.speaker.linkedin}"`);

  // The "Still in motion" chip sits on an intro slide, and the group is one run of sections.
  const grouped = ctx.sections.map((s, i) => ({ ...s, i })).filter((s) => s.group);
  for (const s of grouped) if (!s.stages.includes("intro")) err("group", s.id, `group "${s.group}" needs an intro page to carry the chip`);
  for (let k = 1; k < grouped.length; k++) if (grouped[k].group === grouped[k - 1].group && grouped[k].i !== grouped[k - 1].i + 1) err("group", grouped[k].id, `group "${grouped[k].group}" is split; its sections must follow one another`);

  // The drawer (PRD r7, 9.6): every demo section appears exactly once, and every link target exists.
  if (ctx.nav) {
    const known = new Set(ctx.slideIds);
    for (const l of ctx.nav) if (!known.has(l.slideId)) err("nav", `nav ${l.label}`, `links to "${l.slideId}", which is not a slide`);
    for (const s of ctx.sections) {
      const n = ctx.nav.filter((l) => s.pageIds.includes(l.slideId)).length;
      if (n !== 1) err("nav", s.id, `appears ${n} times in the drawer; expected once`);
    }
  }
  return out;
}

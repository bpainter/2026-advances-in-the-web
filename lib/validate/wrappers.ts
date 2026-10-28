import type { Issue } from "./rules";
import { lintWrapperCss } from "./theme";

/**
 * Wrapper rules for `pnpm check` (PRD v5, 2.1 and 4.7). Pure: scripts/validate.mts renders every
 * wrapper a frame build names and passes the text in; scripts/validator-fixtures.mts breaks one
 * rule at a time.
 */
export interface WrappedBuild {
  /** "01-layered-ui/native". */
  where: string;
  wrapperId: string | null;
  known: boolean;
  /** Folder still on the v4 shell until its milestone lands: a warning, not an error. */
  pending?: boolean;
  markup: string;
  css: { file: string; text: string }[];
  scripts: { file: string; text: string }[];
  banned: { name: string; pattern: RegExp }[];
  shownHasMain: boolean;
}

export function validateWrappers(builds: WrappedBuild[], shownFiles: { path: string; text: string }[]): Issue[] {
  const out: Issue[] = [];
  const err = (rule: string, where: string, message: string) => out.push({ rule, where, message, level: "error" });
  const linted = new Set<string>();
  for (const b of builds) {
    if (!b.wrapperId) {
      out.push({ rule: "wrapper-missing", where: b.where, message: "has no wrapper (PRD v5, 4.4)", level: b.pending ? "warning" : "error" });
      continue;
    }
    if (!b.known) {
      err("wrapper-unknown", b.where, `wrapper "${b.wrapperId}" is not in lib/frames/wrappers/index.ts`);
      continue;
    }
    for (const c of b.css) {
      const key = `${c.file}|${b.banned.map((x) => x.name).join(",")}`;
      if (linted.has(key)) continue;
      linted.add(key);
      out.push(...lintWrapperCss(c.text, c.file, b.banned));
    }
    const m = b.markup;
    const where = `${b.where} (${b.wrapperId})`;
    if (/\bhref\s*=/i.test(m)) err("wrapper-markup", where, "a wrapper element has an href; wrappers never navigate");
    const tab = /\btabindex\s*=\s*"?(-?\d+)/gi;
    for (const t of m.matchAll(tab)) if (Number(t[1]) >= 0) err("wrapper-markup", where, `tabindex="${t[1]}" makes a wrapper element focusable`);
    if (/<(a|button|input|select|textarea|option|details|summary|label)\b/i.test(m)) err("wrapper-markup", where, "a wrapper holds a link, button or form control");
    if (/<h1\b/i.test(m)) err("wrapper-markup", where, "a wrapper holds an h1");
    if (b.shownHasMain && /<main\b/i.test(m)) err("wrapper-markup", where, "a wrapper adds a main beside the shown one");
    for (const cls of m.matchAll(/\bclass\s*=\s*"([^"]*)"/g)) {
      const bad = cls[1].split(/\s+/).filter((c) => c && !c.startsWith("wrap"));
      if (bad.length) err("wrapper-markup", where, `class "${bad[0]}" lacks the wrap- prefix`);
    }
    for (const x of b.banned) {
      if (x.pattern.test(m)) err("wrapper-banned", where, `the markup uses ${x.name}, which this section demonstrates`);
      for (const s of b.scripts) if (x.pattern.test(s.text)) err("wrapper-banned", `${where} ${s.file}`, `the script uses ${x.name}`);
    }
  }
  for (const f of shownFiles) if (/\bwrap-[a-z]/.test(f.text)) err("wrapper-shown", f.path, "a shown file uses the wrap- prefix, which belongs to wrappers");
  return out;
}

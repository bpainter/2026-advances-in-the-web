/**
 * Wrapper checks for the walk (PRD v5, 2.1 and 4.8), at s0 and on the last step of every frame:
 * exactly one `[data-shown]`; every element a shown CSS selector matches sits inside it (or in an
 * id the manifest lifts out); every tabbable element sits inside it; the visible blocks fill the
 * frame; and the document does not scroll unless the wrapper says it may.
 *
 * Evaluated code is passed as strings, so tsx does not wrap helpers in its __name() calls.
 */
import type { Frame } from "@playwright/test";
import type { DemoCodeFile } from "@/content/demo-schema";
import type { Report } from "./walk-spotlight.mts";

/** Selectors of the shown CSS files, minus document-level ones that cannot match a wrapper. */
export function shownSelectors(files: DemoCodeFile[]): string[] {
  const out = new Set<string>();
  for (const f of files.filter((x) => x.lang === "css")) {
    const css = f.source.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/([^{};]+)\{/g)) {
      const prelude = m[1].trim();
      if (!prelude || prelude.startsWith("@") || /^(from|to|\d+%)$/.test(prelude)) continue;
      for (const raw of prelude.split(/,(?![^(]*\))/)) {
        // Pseudo-elements and state pseudo-classes do not change which elements match.
        const sel = raw
          .trim()
          .replace(/::?(before|after|backdrop|picker\([^)]*\)|picker-icon|checkmark|marker|placeholder|selection|file-selector-button|first-line|first-letter)\b/g, "")
          .replace(/:(hover|focus|focus-visible|focus-within|active|open|popover-open|checked|disabled|enabled|user-invalid|user-valid|invalid|valid|empty|modal|target|visited|link|any-link|placeholder-shown|default|indeterminate|required|optional|read-only|read-write)\b/g, "")
          .trim();
        // `html`, `body` and `:root` match the document itself, which the check allows.
        if (!sel || sel === "*") continue;
        out.add(sel);
      }
    }
  }
  return [...out];
}

const CHECK = (selectors: string[], single: boolean) => `(() => {
  const sels = ${JSON.stringify(selectors)};
  const out = { shown: 0, stray: [], tabbable: [], fill: null, scroll: null, wrapper: document.documentElement.dataset.wrapper || null };
  const slots = document.querySelectorAll("[data-shown]");
  out.shown = slots.length;
  const outside = (document.documentElement.dataset.shownOutside || "").split(" ").filter(Boolean).map((id) => document.getElementById(id)).filter(Boolean);
  const inShown = (el) => el === document.documentElement || el === document.body || el.closest("[data-shown]") || outside.some((o) => o.contains(el));
  const describe = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).join(".") : "");
  for (const s of sels) {
    let list = [];
    try { list = [...document.querySelectorAll(s)]; } catch (e) { continue; }
    for (const el of list) if (!inShown(el)) { out.stray.push(s + " matches " + describe(el)); break; }
  }
  const focusable = [...document.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]")];
  for (const el of focusable) {
    if (el.disabled || el.tabIndex < 0 || el.closest("[inert]") || !el.getClientRects().length) continue;
    if (!inShown(el)) out.tabbable.push(describe(el));
  }
  // Fill (spec 3.7): the visible blocks other than .wrap and .wrap-sheet, clipped to the viewport.
  const W = innerWidth, H = innerHeight;
  const blocks = [...document.querySelectorAll(".wrap > *, .wrap-sheet > *, .wrap-body > *, .wrap-main > *, .wrap-cols > *, [data-shown] > *, [data-shown]")]
    .filter((el) => !el.matches(".wrap-sheet, .wrap-mask, script, link, style, template") && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden");
  const rects = blocks.map((el) => el.getBoundingClientRect()).map((r) => ({ top: Math.max(r.top, 0), bottom: Math.min(r.bottom, H), left: Math.max(r.left, 0), right: Math.min(r.right, W) })).filter((r) => r.bottom - r.top > 0.5 && r.right - r.left > 0.5);
  if (rects.length) {
    const top = Math.min(...rects.map((r) => r.top)), bottom = Math.max(...rects.map((r) => r.bottom));
    const left = Math.min(...rects.map((r) => r.left)), right = Math.max(...rects.map((r) => r.right));
    const sorted = rects.slice().sort((a, b) => a.top - b.top);
    let gap = 0, reach = sorted[0].bottom;
    for (const r of sorted.slice(1)) { if (r.top > reach) gap = Math.max(gap, r.top - reach); reach = Math.max(reach, r.bottom); }
    out.fill = { w: Math.round(right - left), h: Math.round(bottom - top), gap: Math.round(gap), vw: W, vh: H };
  }
  const se = document.scrollingElement;
  out.scroll = { scrolls: document.documentElement.hasAttribute("data-scrolls"), h: se.scrollHeight, w: se.scrollWidth, vh: H, vw: W };
  return out;
})()`;

/** The wrapper checks on one frame state. */
export async function checkWrapper(frame: Frame | null, where: string, files: DemoCodeFile[], single: boolean, report: Report) {
  if (!frame) return report.fail(where, "wrapper: no frame");
  const v = (await frame.evaluate(CHECK(shownSelectors(files), single)).catch(() => null)) as {
    shown: number;
    stray: string[];
    tabbable: string[];
    fill: { w: number; h: number; gap: number; vw: number; vh: number } | null;
    scroll: { scrolls: boolean; h: number; w: number; vh: number; vw: number };
    wrapper: string | null;
  } | null;
  if (!v) return report.fail(where, "wrapper: the frame did not answer");
  const problems: string[] = [];
  if (!v.wrapper) problems.push("no wrapper");
  if (v.shown !== 1) problems.push(`${v.shown} [data-shown] slots`);
  if (v.stray.length) problems.push(`shown CSS reaches the wrapper: ${v.stray.slice(0, 3).join("; ")}`);
  if (v.tabbable.length) problems.push(`tabbable outside the shown markup: ${v.tabbable.slice(0, 3).join(", ")}`);
  const minW = Math.ceil(v.fill ? v.fill.vw * 0.85 : 0);
  const minH = Math.ceil(v.fill ? v.fill.vh * 0.85 : 0);
  if (!v.fill) problems.push("no visible blocks");
  else {
    if (v.fill.w < minW || v.fill.h < minH) problems.push(`blocks span ${v.fill.w} by ${v.fill.h}; needs ${minW} by ${minH}`);
    if (v.fill.gap > 96) problems.push(`a ${v.fill.gap} px gap between blocks`);
  }
  if (!v.scroll.scrolls && (v.scroll.h > v.scroll.vh + 1 || v.scroll.w > v.scroll.vw + 1)) problems.push(`the document scrolls (${v.scroll.w} by ${v.scroll.h} in ${v.scroll.vw} by ${v.scroll.vh})`);
  if (problems.length) report.fail(where, `wrapper ${v.wrapper ?? "none"}: ${problems.join("; ")}`);
  else report.pass(`wrapper ${v.wrapper}: one shown slot, shown CSS and tab order stay inside it, blocks ${v.fill!.w} by ${v.fill!.h}, largest gap ${v.fill!.gap}${v.scroll.scrolls ? ", scrolls by design" : ", no scroll"}`);
}

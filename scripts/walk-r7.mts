/**
 * Round 7 checks for the walk (docs/PRD-r7.md, section 11): links on the native slides (5.3), the
 * cover group (4.4), the intro chip (8.4), walk-page titles (3.3), the select chevron (7.2), no menu
 * button and no view transition under automation (9.3, 9.8), the drawer's keyboard contract (9.8),
 * Next after playback on every framed page (`--advance`, 6.5), the slide crossfade
 * (`transitions --fade=1`, 9.3) and the Grid Lanes fallback (7.1).
 *
 * Evaluated code is passed as strings, so tsx does not wrap helpers in its __name() calls.
 */
import type { Browser, BrowserContext, Frame, Page } from "@playwright/test";
import { hasFrame, type DemoPage } from "@/content/demo-schema";
import type { Slide } from "@/content/schema";
import { deck, sections, slides } from "@/lib/content";
import { siteHref } from "@/content/deck";
import type { Report } from "./walk-spotlight.mts";

/** Counts the document's view transitions; installed before any page script runs. */
export const VT_WATCH = `(() => {
  window.__vtCount = 0;
  const start = Document.prototype.startViewTransition;
  if (typeof start !== "function") return;
  Document.prototype.startViewTransition = function (...args) {
    window.__vtCount++;
    return start.apply(this, args);
  };
})()`;

const TITLES = ["What we used to do", "What we can do today"];
const EXPECTED_SLIDES = 50;

/** The canvas-space box of a selector's union, or null. */
const BOX = `(sel) => {
  const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
  const s = canvas.width / 1920;
  const els = [...document.querySelectorAll(sel)];
  if (!els.length) return null;
  const rs = els.map((e) => e.getBoundingClientRect());
  const l = Math.min(...rs.map((r) => r.left)), t = Math.min(...rs.map((r) => r.top));
  const r = Math.max(...rs.map((r) => r.right)), b = Math.max(...rs.map((r) => r.bottom));
  return { x: (l - canvas.left) / s, y: (t - canvas.top) / s, w: (r - l) / s, h: (b - t) / s };
}`;

type Link = { href: string; target: string | null; rel: string; hidden: string; tabIndex: number };

async function linksIn(page: Page, scope: string): Promise<Link[]> {
  return (await page.evaluate(`[...document.querySelectorAll(${JSON.stringify(scope)} + " a[href]")].map((a) => ({ href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel") || "", hidden: a.querySelector(".visually-hidden")?.textContent || "", tabIndex: a.tabIndex }))`)) as Link[];
}

function checkLink(report: Report, where: string, label: string, links: Link[], href: string, rel: string[]) {
  const l = links.find((x) => x.href === href);
  if (!l) return report.fail(where, `${label}: no link to ${href}`);
  const problems: string[] = [];
  if (l.target !== "_blank") problems.push(`target ${l.target}`);
  const rels = l.rel.split(/\s+/);
  for (const r of rel) if (!rels.includes(r)) problems.push(`rel lacks ${r}`);
  if (!/opens in a new tab/.test(l.hidden)) problems.push("no hidden \"opens in a new tab\" text");
  // The audience window never gives a link the clicker's keys (5.2).
  if (l.tabIndex !== -1) problems.push(`tabIndex ${l.tabIndex} in the audience window`);
  if (problems.length) report.fail(where, `${label}: ${problems.join(", ")}`);
  else report.pass(`${label}: ${href}, new tab, rel ${rel.join(" ")}, out of the audience tab order`);
}

/**
 * Per slide, during the deck walk in the audience window (automation): links (5.3), the cover group
 * (4.4), the intro chip and panel (8.4), and no visible menu button (9.8).
 */
export async function checkSlideR7(page: Page, slide: Slide, report: Report) {
  const where = slide.id;
  // 9.4 and 9.8: the audience pill shows only with a visible cursor, never under automation.
  const menu = (await page.evaluate(`document.querySelectorAll(".reader-controls--audience, .nav-drawer-trigger").length`)) as number;
  if (menu) report.fail(where, `the audience window renders a menu button under automation (${menu})`);

  const footer = (await page.$(".sg-footer")) !== null;
  if (footer) checkLink(report, where, `${where} footer pill`, await linksIn(page, ".sg-footer"), siteHref(slide.id), ["noopener"]);

  if (slide.id === slides[0].id) {
    const links = await linksIn(page, ".stage__canvas");
    checkLink(report, where, "cover wordmark", links, deck.org.url, ["noopener"]);
    checkLink(report, where, "cover name", links, deck.speaker.linkedin, ["me", "noopener"]);
    const g = (await page.evaluate(`(() => {
      const box = ${BOX};
      const group = box(".sg--title .sg-eyebrow, .sg--title .sg-title-lines, .sg--title .sg-cover__name, .sg--title .sg-cover__role");
      const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
      const s = canvas.width / 1920;
      // Glyph boxes: one range per text node of the title.
      let right = 0;
      const title = document.querySelector(".sg--title .sg-title-lines");
      if (title) {
        const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) right = Math.max(right, (r.right - canvas.left) / s);
        }
      }
      return { group, right, lines: title ? title.innerText.split("\\n").filter(Boolean) : [] };
    })()`)) as { group: { x: number; y: number; w: number; h: number } | null; right: number; lines: string[] };
    if (!g.group) report.fail(where, "cover: no eyebrow, title, name and role group");
    else {
      const center = g.group.y + g.group.h / 2;
      if (Math.abs(center - 540) > 4) report.fail(where, `cover: the group's center is at y ${center.toFixed(1)}, not within 4 px of 540`);
      else report.pass(`cover: group centered at y ${center.toFixed(1)}`);
    }
    // r7-spec 1: two lines, line one ending near x 1437, inside the wash's ellipse (its 0.40 zone ends at 1437).
    if (g.lines.length !== 2) report.fail(where, `cover: the title has ${g.lines.length} lines, not 2 ("2026 advances", "in the web")`);
    if (g.right > 1440) report.fail(where, `cover: a title glyph box reaches x ${g.right.toFixed(1)}, past 1440 and out of the wash's ellipse`);
    else report.pass(`cover: title glyphs end at x ${g.right.toFixed(1)} (${g.lines.length} lines)`);
  }

  if (slide.id === "closing") {
    const links = await linksIn(page, ".stage__canvas");
    const url = deck.speaker.linkedin;
    checkLink(report, where, "closing wordmark", links, deck.org.url, ["noopener"]);
    const toLinkedIn = links.filter((l) => l.href === url);
    if (toLinkedIn.length < 2) report.fail(where, `closing: ${toLinkedIn.length} link(s) to ${url}; the LinkedIn line and the QR code both link`);
    for (const [i, l] of toLinkedIn.entries()) checkLink(report, where, `closing LinkedIn link ${i + 1}`, [l], url, ["me", "noopener"]);
  }

  const section = slide.demoSection;
  if (slide.page?.stage === "intro" && section) {
    const v = (await page.evaluate(`(() => {
      const chip = document.querySelector(".intro__group");
      const text = document.querySelector(".intro__text");
      const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
      const s = canvas.width / 1920;
      return { chip: chip ? chip.textContent.trim() : null, height: text ? text.getBoundingClientRect().height / s : 0, overflow: text ? text.scrollHeight > text.clientHeight + 1 : false };
    })()`)) as { chip: string | null; height: number; overflow: boolean };
    const want = section.group === "still-in-motion";
    if (want && v.chip !== "Still in motion") report.fail(where, `intro chip: "${v.chip}", want "Still in motion"`);
    else if (!want && v.chip !== null) report.fail(where, `intro chip "${v.chip}" on a section outside "Still in motion"`);
    else if (want) report.pass(`${where}: "Still in motion" chip`);
    if (v.height > 952.5 || v.overflow) report.fail(where, `intro panel is ${v.height.toFixed(1)} px tall${v.overflow ? " and overflows" : ""}; it must fit 952`);
  }
}

/** After the deck walk: 50 slides, and no view transition ran under automation (9.3). */
export async function finishDeckR7(page: Page, base: string, report: Report) {
  if (slides.length !== EXPECTED_SLIDES) report.fail("deck", `${slides.length} slides; r7 has ${EXPECTED_SLIDES}`);
  const health = (await (await fetch(`${base}/_health`)).json().catch(() => null)) as { slides: number; pages: number } | null;
  if (!health || health.slides !== EXPECTED_SLIDES || health.pages !== 40) report.fail("deck", `/_health reports ${JSON.stringify(health)}; want slides 50, pages 40`);
  else report.pass(`/_health: ${health.slides} slides, ${health.pages} pages`);
  const vt = (await page.evaluate(`window.__vtCount ?? null`)) as number | null;
  if (vt === null) report.fail("deck", "view transition watch not installed");
  else if (vt > 0) report.fail("deck", `${vt} view transition(s) ran under automation; the fade must be off`);
  else report.pass("deck: no view transition under automation");
}

/** 3.3: the walk page's title is one of the two strings, on one line, clear of the meter. */
export async function checkPageTitle(page: Page, demoPage: DemoPage, report: Report) {
  if (demoPage.stage !== "used-to" && demoPage.stage !== "now") return;
  const where = demoPage.id;
  const v = (await page.evaluate(`(() => {
    const box = ${BOX};
    const el = document.querySelector(".page__title");
    if (!el) return null;
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()];
    const lines = new Set(rects.map((r) => Math.round(r.top))).size;
    // The glyphs, not the heading's block box, which spans the row.
    const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
    const s = canvas.width / 1920;
    const l = Math.min(...rects.map((r) => r.left)), t = Math.min(...rects.map((r) => r.top));
    const r = Math.max(...rects.map((r) => r.right)), b = Math.max(...rects.map((r) => r.bottom));
    const title = { x: (l - canvas.left) / s, y: (t - canvas.top) / s, w: (r - l) / s, h: (b - t) / s };
    return { text: el.textContent.trim(), lines, title, meter: box(".page__meter") };
  })()`)) as { text: string; lines: number; title: { x: number; y: number; w: number; h: number }; meter: { x: number; y: number; w: number; h: number } | null } | null;
  if (!v) return report.fail(where, "no .page__title");
  const problems: string[] = [];
  if (!TITLES.includes(v.text)) problems.push(`reads "${v.text}"`);
  if (v.lines !== 1) problems.push(`wraps to ${v.lines} lines`);
  if (v.meter) {
    const overlap = !(v.title.x + v.title.w <= v.meter.x || v.meter.x + v.meter.w <= v.title.x || v.title.y + v.title.h <= v.meter.y || v.meter.y + v.meter.h <= v.title.y);
    if (overlap) problems.push("overlaps the meter");
  }
  if (problems.length) report.fail(where, `title ${problems.join(", ")}`);
  else report.pass(`title "${v.text}" on one line${v.meter ? ", clear of the meter" : ""}`);
}

/**
 * 7.2: D4's status select is 36 px tall (within 1), its chevron's center 20 px from the right
 * border edge and on the text's vertical center (within 1). D6's customizable select keeps one
 * chevron (its own) where base-select applies.
 */
export async function checkSelect(frame: Frame | null, where: string, browserName: string, report: Report) {
  if (!frame) return report.fail(where, "select: no frame");
  const v = (await frame
    .evaluate(`(() => {
      const s = document.querySelector("#status");
      if (!s) return null;
      const cs = getComputedStyle(s);
      const r = s.getBoundingClientRect();
      const px = (v) => Number.parseFloat(v) || 0;
      const x = cs.backgroundPositionX;
      // "right 11px", "calc(100% - 11px)" or "100%" forms.
      const m = /(?:right\\s+|100%\\s*-\\s*)([\\d.]+)px/.exec(x);
      const offset = m ? Number(m[1]) : x.trim() === "100%" ? 0 : null;
      const size = px(cs.backgroundSize.split(" ")[0]);
      const y = cs.backgroundPositionY;
      return {
        height: r.height,
        appearance: cs.appearance,
        image: cs.backgroundImage !== "none",
        fromRight: offset === null ? null : px(cs.borderRightWidth) + offset + size / 2,
        yCentered: /^(50%|center)$/.test(y.trim()),
        paddingDiff: Math.abs(px(cs.paddingTop) - px(cs.paddingBottom)) + Math.abs(px(cs.borderTopWidth) - px(cs.borderBottomWidth)),
        x, y,
      };
    })()`)
    .catch(() => null)) as { height: number; appearance: string; image: boolean; fromRight: number | null; yCentered: boolean; paddingDiff: number; x: string; y: string } | null;
  if (!v) return report.fail(where, "select: #status not found");
  const problems: string[] = [];
  if (Math.abs(v.height - 36) > 1) problems.push(`${v.height.toFixed(1)} px tall`);
  if (v.appearance !== "none" || !v.image) problems.push(`appearance ${v.appearance}, ${v.image ? "a" : "no"} theme chevron`);
  if (v.fromRight === null || Math.abs(v.fromRight - 20) > 1) problems.push(`chevron center ${v.fromRight ?? "?"} px from the right border edge (${v.x})`);
  if (!v.yCentered || v.paddingDiff > 1) problems.push(`chevron off the text's center (${v.y}, padding and border differ by ${v.paddingDiff} px)`);
  if (problems.length) report.fail(where, `${browserName} select: ${problems.join("; ")}`);
  else report.pass(`${browserName} select: ${v.height.toFixed(1)} px tall, chevron ${v.fromRight} px from the right edge, centered`);
}

// ----------------------------------------------------------------------------------------- M2

/**
 * 7.1, in a browser without `display: grid-lanes`: s0 is the cropped regular grid (every figure the
 * same height), s1 the columns fallback (`column-width: 104px`, at least four heights), s3 fewer
 * columns than s1. Returns the column count at s1 for the s3 comparison.
 */
export async function checkM2Fallback(frame: Frame, where: string, stepId: string, state: { columns?: number }, report: Report) {
  const v = (await frame.evaluate(`(() => {
    const wall = document.querySelector("#wall");
    const figs = [...wall.querySelectorAll("figure")];
    const cs = getComputedStyle(wall);
    const heights = new Set(figs.map((f) => Math.round(f.getBoundingClientRect().height)));
    const columns = new Set(figs.map((f) => Math.round(f.getBoundingClientRect().left))).size;
    return { display: cs.display, columnWidth: cs.columnWidth, heights: [...heights], figures: figs.length, columns };
  })()`)) as { display: string; columnWidth: string; heights: number[]; figures: number; columns: number };
  if (stepId === "s0") {
    if (v.heights.length !== 1) report.fail(where, `no lanes, s0: figures have ${v.heights.length} heights (${v.heights.join(", ")}); the regular grid crops them to one`);
    else report.pass(`no lanes, s0: the regular grid, every figure ${v.heights[0]} px tall (display ${v.display})`);
  } else if (stepId === "s1") {
    state.columns = v.columns;
    if (v.columnWidth !== "104px") report.fail(where, `no lanes, s1: column-width is ${v.columnWidth}, not 104px`);
    else if (v.heights.length < 4) report.fail(where, `no lanes, s1: only ${v.heights.length} figure height(s); the columns should pack varied heights`);
    else report.pass(`no lanes, s1: CSS columns (column-width 104px), ${v.heights.length} heights in ${v.columns} columns`);
  } else if (stepId === "s2") {
    if (v.figures !== 18) report.fail(where, `no lanes, s2: ${v.figures} figures, not 18`);
    else report.pass(`no lanes, s2: 18 figures`);
  } else if (stepId === "s3") {
    if (state.columns === undefined || v.columns >= state.columns) report.fail(where, `no lanes, s3: ${v.columns} columns; s1 had ${state.columns ?? "?"}, and narrowing must drop some`);
    else report.pass(`no lanes, s3: ${state.columns} columns drop to ${v.columns}`);
  }
}

// ------------------------------------------------------------------------------------ drawer

/**
 * 9.8 in reader mode (`/s/d1-intro`): Tab reaches the menu button; Enter opens the drawer with focus
 * on the first link; Tab stays inside; clicker keys move nothing and PageDown closes it; Escape
 * closes and focus returns to the button. Then, with the audience and speaker windows open
 * together, a link moves both windows and the audience stage takes the keyboard.
 */
export async function walkDrawer(browser: Browser, base: string, report: Report) {
  console.log("\n== drawer (PRD r7, 9.8)");
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  try {
    const page = await ctx.newPage();
    await page.goto(`${base}/s/d1-intro`);
    await page.waitForSelector(".reader-controls .nav-drawer-trigger", { timeout: 10000 });
    await page.waitForTimeout(500);
    const focused = `(() => { const a = document.activeElement; return a ? (a.matches("[data-nav-trigger]") ? "trigger" : a.matches("a.nav-drawer__link") ? "link:" + a.dataset.slideId : a.id ? "#" + a.id : a.tagName) : null; })()`;
    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = (await page.evaluate(focused)) === "trigger";
    }
    if (!reached) return report.fail("drawer", "Tab never reached the menu button in reader mode");
    report.pass("drawer: Tab reaches the menu button");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    const open = (await page.evaluate(`document.querySelector("#deck-nav")?.open ?? false`)) as boolean;
    const first = (await page.evaluate(`document.querySelector("#deck-nav a.nav-drawer__link")?.dataset.slideId ?? null`)) as string | null;
    const at = (await page.evaluate(focused)) as string;
    if (!open) return report.fail("drawer", "Enter on the menu button did not open the drawer");
    if (at !== `link:${first}`) report.fail("drawer", `the drawer opened with focus on ${at}, not its first link`);
    else report.pass("drawer: Enter opens it, focus on the first link");
    const linkCount = (await page.evaluate(`document.querySelectorAll("#deck-nav a[href], #deck-nav button").length`)) as number;
    let outside = 0;
    for (let i = 0; i < linkCount + 3; i++) {
      await page.keyboard.press("Tab");
      if (!((await page.evaluate(`document.querySelector("#deck-nav").contains(document.activeElement)`)) as boolean)) outside++;
    }
    if (outside) report.fail("drawer", `Tab left the drawer ${outside} time(s)`);
    else report.pass(`drawer: Tab stays inside over ${linkCount + 3} presses`);
    const url = page.url();
    for (const key of ["ArrowRight", "ArrowLeft", "Space", "b", "."]) await page.keyboard.press(key);
    await page.waitForTimeout(400);
    if (page.url() !== url) report.fail("drawer", `clicker keys moved the deck with the drawer open (${page.url()})`);
    else report.pass("drawer: clicker keys do not move the deck while it is open");
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(400);
    const afterPd = (await page.evaluate(`document.querySelector("#deck-nav")?.open ?? false`)) as boolean;
    if (afterPd) report.fail("drawer", "PageDown did not close the drawer");
    else if (page.url() !== url) report.fail("drawer", "PageDown closed the drawer but moved the deck");
    else report.pass("drawer: PageDown closes it without moving the deck");
    // Escape returns focus to the button.
    await page.focus(".reader-controls .nav-drawer-trigger");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const afterEsc = (await page.evaluate(focused)) as string;
    const stillOpen = (await page.evaluate(`document.querySelector("#deck-nav")?.open ?? false`)) as boolean;
    if (stillOpen) report.fail("drawer", "Escape did not close the drawer");
    else if (afterEsc !== "trigger") report.fail("drawer", `Escape closed the drawer, focus on ${afterEsc}, not the menu button`);
    else report.pass("drawer: Escape closes it and focus returns to the menu button");
    await page.close();

    // Audience and speaker together: a link in the speaker's drawer moves both windows.
    const speaker = await ctx.newPage();
    await speaker.setViewportSize({ width: 1440, height: 900 });
    await speaker.goto(`${base}/speaker`);
    const audience = await ctx.newPage();
    await audience.goto(`${base}/present?s=d1-intro`);
    await speaker.waitForURL(/s=d1-intro/, { timeout: 10000 }).catch(() => null);
    await audience.waitForTimeout(800);
    const trigger = speaker.locator(".speaker__controls .nav-drawer-trigger, .speaker [data-nav-trigger]").first();
    if (!(await trigger.count())) return report.fail("drawer", "no menu button in the speaker window");
    await trigger.click();
    await speaker.waitForTimeout(400);
    const target = "m2-intro";
    const link = speaker.locator(`#deck-nav a.nav-drawer__link[data-slide-id="${target}"]`);
    if (!(await link.count())) return report.fail("drawer", `the speaker's drawer has no link to ${target}`);
    await link.click();
    const moved = await Promise.all([speaker, audience].map((p) => p.waitForURL(new RegExp(`s=${target}`), { timeout: 5000 }).then(() => true).catch(() => false)));
    if (!moved.every(Boolean)) report.fail("drawer", `a drawer link moved ${moved.filter(Boolean).length} of 2 windows to ${target}`);
    else report.pass(`drawer: a link in the speaker window moves both windows to ${target}`);
    await audience.waitForTimeout(1500);
    const aFocus = (await audience.evaluate(`document.activeElement?.id || document.activeElement?.tagName`)) as string;
    if (aFocus !== "stage") report.fail("drawer", `after a jump the audience focus is on ${aFocus}, not #stage`);
    else report.pass("drawer: after a jump the audience stage has the keyboard");
  } finally {
    await ctx.close();
  }
}

/**
 * 5.3: with `/present` on the closing slide, click the LinkedIn link, come back, press ArrowRight:
 * the stage handles the key (`document.activeElement` is `#stage`).
 */
export async function walkLinkFocus(browser: Browser, base: string, report: Report) {
  console.log("\n== link focus (PRD r7, 5.3)");
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  try {
    const page = await ctx.newPage();
    await page.goto(`${base}/present?s=closing`);
    await page.waitForSelector("a.sg-closing__link", { timeout: 10000 });
    await page.waitForTimeout(600);
    // The new tab is real; close it as soon as it opens, and come back.
    ctx.on("page", (p) => void p.close().catch(() => {}));
    await page.click("a.sg-closing__link");
    await page.waitForTimeout(800);
    await page.bringToFront();
    await page.evaluate(`window.__handled = null; addEventListener("keydown", (e) => { window.__handled = e.defaultPrevented; }, { once: true })`);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    const v = (await page.evaluate(`({ active: document.activeElement?.id || document.activeElement?.tagName, handled: window.__handled })`)) as { active: string; handled: boolean | null };
    if (v.active !== "stage") report.fail("closing", `after the LinkedIn link, focus is on ${v.active}, not #stage`);
    else if (v.handled !== true) report.fail("closing", "after the LinkedIn link, the stage did not handle ArrowRight");
    else report.pass("closing: after the LinkedIn link the stage has focus and handles ArrowRight");
  } finally {
    await ctx.close();
  }
}

// ----------------------------------------------------------------------------------- advance

type Results = Record<string, { seq: number; finished: boolean }>;
const RESULTS = `(window.__stepResults ?? {})`;

async function seqOf(page: Page): Promise<number> {
  return (await page.evaluate(`window.__stepSeq ?? 0`).catch(() => 0)) as number;
}
async function waitResult(page: Page, key: string, after: number, timeout = 10000) {
  const t = Date.now();
  while (Date.now() - t < timeout) {
    const r = ((await page.evaluate(RESULTS).catch(() => ({}))) as Results)[key];
    if (r && r.seq > after) return r;
    await page.waitForTimeout(40);
  }
  return null;
}
/**
 * ms until a press moved the deck to slide `id`, or -1 after `timeout`. In the presenter windows the
 * press is the shared state naming the slide (what the engine decides; the store writes it to
 * localStorage on the press), and the window must then land on the slide within 10 s (the dev
 * server renders it on demand). Reader mode has no store: the address changes when the slide lands,
 * so it gets 4000 ms on a dev server.
 */
async function arrives(page: Page, id: string, timeout = 1500): Promise<number> {
  const t = Date.now();
  const reader = new URL(page.url()).pathname.startsWith("/s/");
  const ok = await page
    .waitForFunction(
      ([want, r]) => {
        if (new URLSearchParams(location.search).get("s") === want || location.pathname === `/s/${want}`) return true;
        if (r) return false;
        try {
          return JSON.parse(localStorage.getItem("deck:state") || "null")?.slideId === want;
        } catch {
          return false;
        }
      },
      [id, reader] as const,
      { timeout: reader ? Math.max(timeout, 4000) : timeout, polling: 20 },
    )
    .then(() => true)
    .catch(() => false);
  if (!ok) return -1;
  const ms = Date.now() - t;
  await page.waitForFunction((want) => new URLSearchParams(location.search).get("s") === want || location.pathname === `/s/${want}`, id, { timeout: 10000 }).catch(() => null);
  return ms;
}

async function claim(audience: Page, base: string, id: string, step: number) {
  await audience.goto(`${base}/present?s=${id}${step > 0 ? `&step=${step}` : ""}`);
  await audience.waitForSelector('.page-frame__iframe[data-visible="true"]', { timeout: 15000 }).catch(() => null);
}

/**
 * 6.5: on every page with a live frame, Next after the last step's playback leaves the page within
 * 1500 ms, by key with focus in the frame, by the reader Next button and by the speaker's Next
 * button; also after a press 200 ms into the code lead and one mid-playback; Back from the next
 * slide lands on the last step; and after the shown document is disposed mid-run.
 */
export async function walkAdvance(browser: Browser, base: string, browserName: string, only: string | undefined, report: Report) {
  const targets = sections.flatMap((s) => s.pages.filter((p) => hasFrame(p) && (!only || p.id === only || s.id === only || s.id.startsWith(`${only}-`))).map((p) => p));
  type Windows = { ctx: BrowserContext; speaker: Page; audience: Page; reader: Page };
  const open = async (): Promise<Windows> => {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    // Speaker first, so the audience's typed URL claims both windows on its first hello.
    const speaker = await ctx.newPage();
    await speaker.setViewportSize({ width: 1440, height: 900 });
    await speaker.goto(`${base}/speaker`);
    const audience = await ctx.newPage();
    const reader = await ctx.newPage();
    await audience.bringToFront();
    return { ctx, speaker, audience, reader };
  };
  let windows = await open();
  const near = (ms: number) => (ms >= 0 ? `${ms} ms` : "never");
  // One page's checks; a page that hangs (a call with no timeout of its own) fails after
  // PAGE_LIMIT_MS, and the walk goes on with fresh windows.
  const PAGE_LIMIT_MS = 180000;
  for (const p of targets) {
    const n = p.steps.length;
    const idx = slides.findIndex((s) => s.id === p.id);
    const next = slides[idx + 1];
    if (!next) continue;
    const where = `${p.id} advance`;
    console.log(`\n== ${p.id} --advance (${browserName}, ${n} steps, next ${next.id})`);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const limit = new Promise<"timeout">((r) => (timer = setTimeout(() => r("timeout"), PAGE_LIMIT_MS)));
    const outcome = await Promise.race([onePage(p, next, where, windows), limit]);
    clearTimeout(timer);
    if (outcome === "timeout") {
      // Fresh windows; the hung run keeps the old ones, which close under it.
      report.fail(where, `the checks did not finish in ${PAGE_LIMIT_MS / 1000} s`);
      const old = windows;
      windows = await open();
      await old.ctx.close().catch(() => {});
    }
  }
  await windows.ctx.close();

  async function onePage(p: DemoPage, next: Slide, where: string, w: Windows): Promise<void> {
    const { speaker, audience, reader } = w;
    const n = p.steps.length;
    const last = p.steps[n - 1];
    try {
      // A. Last step, focus in the frame, ArrowRight.
      await claim(audience, base, p.id, n - 1);
      if (!(await audience.$(".page-frame__iframe"))) {
        report.pass(`${p.id}: no live frame here (offline poster); skipped`);
        return;
      }
      await waitResult(audience, `${p.id}:${last.id}`, 0, 15000);
      await audience.waitForTimeout(400);
      await audience.focus('.page-frame__iframe[data-visible="true"]').catch(() => {});
      const inFrame = (await audience.evaluate(`document.activeElement?.tagName`)) === "IFRAME";
      await audience.keyboard.press("ArrowRight");
      let ms = await arrives(audience, next.id);
      if (ms < 0) report.fail(where, `last step, ArrowRight${inFrame ? " with focus in the frame" : ""}: still on ${p.id} after 1500 ms`);
      else report.pass(`last step, ArrowRight${inFrame ? " (focus in the frame)" : ""}: on ${next.id} in ${near(ms)}`);

      // B. Back from the next slide lands on the last step.
      if (ms >= 0) {
        await audience.waitForTimeout(next.page && hasFrame(next.page) ? 1200 : 600);
        await audience.keyboard.press("ArrowLeft");
        // The shared state is what the press decides; the address mirrors it (throttled, and WebKit
        // rate-limits the history API over a long run, so a late mirror is a note, not a failure).
        const back = await audience
          .waitForFunction(
            ([id, step]) => {
              try {
                const st = JSON.parse(localStorage.getItem("deck:state") || "null");
                return st?.slideId === id && st?.stepIndex === step;
              } catch {
                return false;
              }
            },
            [p.id, n - 1] as const,
            { timeout: 3000 },
          )
          .then(() => true)
          .catch(() => false);
        const urlOk = await audience
          .waitForFunction(([id, step]) => { const q = new URLSearchParams(location.search); return q.get("s") === id && (q.get("step") ?? "0") === step; }, [p.id, String(n - 1)] as const, { timeout: 3000 })
          .then(() => true)
          .catch(() => false);
        const st = (await audience.evaluate(`(() => { try { const s = JSON.parse(localStorage.getItem("deck:state")); return s.slideId + " step " + s.stepIndex; } catch { return "no state"; } })()`).catch(() => "?")) as string;
        if (!back) report.fail(where, `ArrowLeft from ${next.id}: the deck is on ${st}, want ${p.id} step ${n - 1}`);
        else report.pass(`ArrowLeft from ${next.id}: ${p.id} step ${n - 1}${urlOk ? `, ?step=${n - 1}` : " (the address mirror lagged)"}`);
        // C. The speaker's Next button, from the last step.
        if (back) {
          await waitResult(audience, `${p.id}:${last.id}`, 0, 10000);
          await speaker.waitForURL(new RegExp(`s=${p.id}`), { timeout: 5000 }).catch(() => null);
          await audience.waitForTimeout(600);
          await speaker.locator(".speaker__controls button", { hasText: /^Next$/ }).click();
          ms = await arrives(audience, next.id);
          if (ms < 0) report.fail(where, `last step, the speaker's Next button: still on ${p.id} after 1500 ms`);
          else report.pass(`last step, the speaker's Next button: on ${next.id} in ${near(ms)}`);
        }
      }

      // D and E. A press 200 ms into the code lead, then a press mid-playback.
      if (n >= 2) {
        for (const [label, delay] of [["200 ms into the code lead", 200], ["mid-playback", 700]] as const) {
          await claim(audience, base, p.id, n - 2);
          await waitResult(audience, `${p.id}:${p.steps[n - 2].id}`, 0, 15000);
          await audience.waitForTimeout(500);
          const s = await seqOf(audience);
          await audience.keyboard.press("ArrowRight");
          await audience.waitForTimeout(delay);
          await audience.keyboard.press("ArrowRight");
          const left = await arrives(audience, next.id, 300);
          if (left >= 0 && label.startsWith("200")) {
            report.fail(where, `a press ${label} skipped ${last.id} and left the page`);
            continue;
          }
          if (left < 0) {
            const r = await waitResult(audience, `${p.id}:${last.id}`, s, 10000);
            if (!r) report.fail(where, `a press ${label}: ${last.id} never finished`);
            await audience.waitForTimeout(150);
            await audience.keyboard.press("ArrowRight");
            ms = await arrives(audience, next.id);
            if (ms < 0) report.fail(where, `after a press ${label}: Next stayed on ${p.id} for 1500 ms`);
            else report.pass(`after a press ${label}: ${last.id} ${r?.finished ? "finished at once" : "done"}, then Next on ${next.id} in ${near(ms)}`);
          } else report.pass(`a press ${label}: ${last.id} had already finished; on ${next.id}`);
        }

        // F. Fault injection: dispose the shown document mid-run.
        await claim(audience, base, p.id, n - 2);
        await waitResult(audience, `${p.id}:${p.steps[n - 2].id}`, 0, 15000);
        await audience.waitForTimeout(500);
        await audience.keyboard.press("ArrowRight");
        await audience.waitForTimeout(600);
        const disposed = (await audience.evaluate(`typeof window.__disposeShownFrame === "function" ? window.__disposeShownFrame() : null`)) as boolean | null;
        if (disposed === null) report.fail(where, "fault injection: window.__disposeShownFrame is missing");
        else {
          await audience.waitForTimeout(200);
          await audience.keyboard.press("ArrowRight");
          ms = await arrives(audience, next.id);
          if (ms < 0) {
            // The watchdog: a second press 1500 ms after the first finish request advances anyway.
            await audience.waitForTimeout(1600);
            await audience.keyboard.press("ArrowRight");
            ms = await arrives(audience, next.id);
            if (ms < 0) report.fail(where, "fault injection: after the shown document was disposed mid-run, Next never left the page");
            else report.pass(`fault injection: on ${next.id} after the watchdog's second press`);
          } else report.pass(`fault injection: disposed mid-run, Next on ${next.id} in ${near(ms)}`);
        }
      }

      // G. Reader mode: key with focus in the frame, then the Next button.
      for (const how of ["key", "button"] as const) {
        await reader.goto(`${base}/s/${p.id}?step=${n - 1}`);
        await reader.waitForSelector('.page-frame__iframe[data-visible="true"]', { timeout: 15000 }).catch(() => null);
        await waitResult(reader, `${p.id}:${last.id}`, 0, 15000);
        await reader.waitForTimeout(400);
        if (how === "key") {
          await reader.focus('.page-frame__iframe[data-visible="true"]').catch(() => {});
          await reader.keyboard.press("ArrowRight");
        } else {
          // Let the pill fade first, with the pointer resting over the frame, then move to Next as a
          // person does: the move wakes the pill, and the press must reach it.
          const frameBox = await reader.locator('.page-frame__iframe[data-visible="true"]').boundingBox();
          if (frameBox) await reader.mouse.move(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
          await reader.waitForTimeout(2800);
          const btn = await reader.locator('.reader-controls button[aria-label="Next"]').boundingBox();
          if (!btn) throw new Error("no reader Next button");
          await reader.mouse.move(btn.x + btn.width / 2, btn.y + btn.height / 2, { steps: 8 });
          await reader.waitForTimeout(250);
          await reader.mouse.click(btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
        ms = await arrives(reader, next.id);
        if (ms < 0) report.fail(where, `reader, last step, ${how === "key" ? "ArrowRight with focus in the frame" : "the Next button"}: still on ${p.id} after 1500 ms`);
        else report.pass(`reader, last step, ${how === "key" ? "ArrowRight in the frame" : "the Next button"}: on ${next.id} in ${near(ms)}`);
      }
      const stuck = (await audience.evaluate(`window.__stuckPlayback ?? []`).catch(() => [])) as string[];
      if (stuck.length) report.fail(where, `the watchdog fired: ${stuck.join(", ")}`);
      await audience.bringToFront();
    } catch (err) {
      report.fail(where, `threw: ${err instanceof Error ? err.message.split("\n")[0] : String(err)}`);
    }
  }
}

// ------------------------------------------------------------------------------- transitions

/**
 * 9.3 with `--fade=1` (Chromium, WebKit): a view transition runs on next and previous slide, none on
 * a step change; two presses 50 ms apart land two slides on; the frame's s0 `step-done` arrives
 * within 300 ms of the no-fade baseline; under reduced motion, no opacity animation runs on the
 * new snapshot.
 */
export async function walkTransitions(browser: Browser, base: string, report: Report) {
  console.log("\n== transitions (PRD r7, 9.3)");
  const run = async (fade: "0" | "1", reduced: boolean) => {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
    await ctx.addInitScript(VT_WATCH);
    const page = await ctx.newPage();
    return { ctx, page, url: (id: string) => `${base}/present?s=${id}&fade=${fade}` };
  };
  const vt = (page: Page) => page.evaluate(`window.__vtCount ?? 0`) as Promise<number>;
  {
    const { ctx, page, url } = await run("1", false);
    await page.goto(url("what-we-cover"));
    await page.waitForTimeout(1500);
    const order = slides.map((s) => s.id);
    const at = order.indexOf("what-we-cover");
    let c = await vt(page);
    await page.keyboard.press("Shift+ArrowRight");
    await arrives(page, order[at + 1], 4000);
    await page.waitForTimeout(500);
    const afterNext = (await vt(page)) - c;
    c = await vt(page);
    await page.keyboard.press("Shift+ArrowLeft");
    await arrives(page, order[at], 4000);
    await page.waitForTimeout(500);
    const afterPrev = (await vt(page)) - c;
    if (afterNext < 1 || afterPrev < 1) report.fail("transitions", `view transitions: next ${afterNext}, previous ${afterPrev}; each slide change should run one`);
    else report.pass(`transitions: one on next (${afterNext}) and previous (${afterPrev})`);
    // A step change: d1-used-to s0 to s1.
    await page.goto(url("d1-used-to"));
    await waitResult(page, "d1-used-to:s0", 0, 15000);
    await page.waitForTimeout(500);
    c = await vt(page);
    const s = await seqOf(page);
    await page.keyboard.press("ArrowRight");
    await waitResult(page, "d1-used-to:s1", s, 10000);
    const onStep = (await vt(page)) - c;
    if (onStep) report.fail("transitions", `${onStep} view transition(s) on a step change`);
    else report.pass("transitions: none on a step change");
    // Two presses 50 ms apart land two slides on.
    await page.goto(url("what-we-cover"));
    await page.waitForTimeout(1500);
    await page.keyboard.press("Shift+ArrowRight");
    await page.waitForTimeout(50);
    await page.keyboard.press("Shift+ArrowRight");
    const two = await arrives(page, order[at + 2], 5000);
    if (two < 0) report.fail("transitions", `two presses 50 ms apart: on ${new URL(page.url()).searchParams.get("s")}, not ${order[at + 2]}`);
    else report.pass(`transitions: two presses 50 ms apart land on ${order[at + 2]}`);
    await ctx.close();
  }
  // s0 step-done timing against the no-fade baseline: arrive on d1-used-to from d1-intro.
  const timing = async (fade: "0" | "1") => {
    const { ctx, page, url } = await run(fade, false);
    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      await page.goto(url("d1-intro"));
      await page.waitForTimeout(2500);
      const s = await seqOf(page);
      const t = Date.now();
      await page.keyboard.press("ArrowRight");
      const r = await waitResult(page, "d1-used-to:s0", s, 15000);
      if (r) samples.push(Date.now() - t);
    }
    await ctx.close();
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length / 2)] ?? Infinity;
  };
  const base0 = await timing("0");
  const fade1 = await timing("1");
  if (fade1 - base0 > 300) report.fail("transitions", `the frame's s0 step-done takes ${fade1} ms with the fade, ${base0} ms without (over 300 ms later)`);
  else report.pass(`transitions: s0 step-done in ${fade1} ms with the fade, ${base0} ms without`);
  // Reduced motion: no opacity animation on ::view-transition-new.
  {
    const { ctx, page, url } = await run("1", true);
    await page.goto(url("what-we-cover"));
    await page.waitForTimeout(1500);
    await page.evaluate(`window.__vtFades = 0; const tick = () => { for (const a of document.getAnimations()) { const pe = a.effect && a.effect.pseudoElement; if (pe && pe.startsWith("::view-transition-new")) { const k = a.effect.getKeyframes(); if (k.some((f) => f.opacity !== undefined && Number(f.opacity) > 0 && Number(f.opacity) < 1)) window.__vtFades++; else if (k.some((f) => f.opacity !== undefined) && k.map((f) => Number(f.opacity)).some((o, i, arr) => i > 0 && o !== arr[0])) window.__vtFades++; } } if (performance.now() < window.__vtUntil) requestAnimationFrame(tick); }; window.__vtUntil = performance.now() + 1500; requestAnimationFrame(tick);`);
    await page.keyboard.press("Shift+ArrowRight");
    await page.waitForTimeout(1600);
    const fades = (await page.evaluate(`window.__vtFades`)) as number;
    if (fades) report.fail("transitions", `reduced motion: ${fades} frame(s) with an opacity animation on ::view-transition-new`);
    else report.pass("transitions: reduced motion, no opacity animation on the new snapshot");
    await ctx.close();
  }
}

/**
 * Accessibility checks of docs/PRD-perf.md, P2-A11Y and P2-TEXT (WS-5). Run through the walk's
 * dispatcher:
 *
 *   pnpm walk a11y [--origin=<presenter>] [--browser=chromium|webkit|firefox] [--headed]
 *
 * - H3: Tab reaches the code tabs; ArrowRight, ArrowLeft, Home and End change the file and never
 *   move the deck; tabs and panel are wired (`aria-controls`, `role="tabpanel"`).
 * - M2: Enter on Next keeps focus on Next across 5 slides; Previous too.
 * - M3: a step change writes the step sentence into the deck's one live region, once; a slide
 *   change writes nothing there (Next's route announcer reads the title).
 * - M4: the pill's focus ring measures at least 3:1 against the pill, from rendered pixels.
 * - M6: the code points to a "Lines … are highlighted." sentence; an off file's tab says so.
 * - H1b: "Try the demo" turns hands-on on and off, and gives the frame the keyboard.
 * - L1, L3, L7: one h1 on /s/closing, the footer number's label, the reader's help rows.
 * - P2-TEXT: at 390 by 844, 320 by 568 and 844 by 390 the text view replaces the stage, body
 *   text is 16 px or more, nothing scrolls sideways but code, and no frame loads; axe finds
 *   nothing in it; the "Text view" toggle works from the keyboard; /present and /speaker have
 *   no text view.
 * - The audience window's title names a walk page's feature.
 *
 * `--origin` defaults to DECK_URL or http://localhost:3000 (`pnpm dev`). Evaluated code is passed as
 * strings, so tsx does not wrap helpers in its __name() calls.
 */
import { chromium, firefox, webkit, type Browser, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { keyHelpFor } from "@/lib/keys";
import { sections } from "@/lib/content";

type Report = { fail: (where: string, msg: string) => void; pass: (msg: string) => void };

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/** sharp from Next's install, to read the ring's pixels. */
type Sharp = (input: Buffer) => { raw: () => { toBuffer: (o: { resolveWithObject: true }) => Promise<{ data: Buffer; info: { width: number; height: number; channels: number } }> } };
function loadSharp(): Sharp {
  const req = createRequire(createRequire(import.meta.url).resolve("next/package.json"));
  return req("sharp") as Sharp;
}

const describeActive = `(() => { const a = document.activeElement; if (!a) return "none"; if (a === document.body) return "body"; return a.tagName.toLowerCase() + (a.dataset && a.dataset.control ? "[" + a.dataset.control + "]" : "") + (typeof a.className === "string" && a.className ? "." + a.className.trim().split(/\\s+/).join(".") : ""); })()`;

export async function walkA11y(args: string[]): Promise<number> {
  const origin = (args.find((a) => a.startsWith("--origin="))?.slice(9) ?? process.env.DECK_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const browserName = (args.find((a) => a.startsWith("--browser="))?.slice(10) ?? "chromium") as "chromium" | "webkit" | "firefox";
  const health = await fetch(`${origin}/_health`).catch(() => null);
  if (!health?.ok) {
    console.error(`No deck at ${origin}. Start it with \`pnpm dev\`, or pass --origin=<deployment>.`);
    return 2;
  }
  const failures: string[] = [];
  let checks = 0;
  const report: Report = {
    fail: (where, msg) => {
      failures.push(`${where}: ${msg}`);
      console.log(`    ✖ ${where}: ${msg}`);
    },
    pass: (msg) => {
      checks++;
      console.log(`    ✓ ${msg}`);
    },
  };
  const launcher = { chromium, webkit, firefox }[browserName];
  const browser = await launcher.launch({ headless: !args.includes("--headed") });
  console.log(`\n== walk a11y (${browserName}, ${origin})`);
  try {
    await codeTabs(browser, origin, report);
    await focusAndAnnouncements(browser, origin, report);
    await pillRing(browser, origin, report);
    await demoToggle(browser, origin, report);
    await lows(browser, origin, report);
    await textView(browser, origin, report);
  } finally {
    await browser.close();
  }
  console.log(`\n${browserName} a11y: ${checks} check(s) passed, ${failures.length} failure(s)`);
  for (const f of failures) console.log(`  ✖ ${f}`);
  return failures.length ? 1 : 0;
}

async function openReader(page: Page, origin: string, path: string) {
  await page.goto(`${origin}${path}`);
  await page.waitForSelector('.page-frame[data-status="ready"], .sg, .intro', { timeout: 20000 }).catch(() => null);
  await page.waitForTimeout(600);
}

// ------------------------------------------------------------------------------- H3 and M6

async function codeTabs(browser: Browser, origin: string, report: Report) {
  console.log("\n  code tabs (H3) and the highlight as text (M6)");
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  for (const id of ["d1-used-to", "d2-now"]) {
    const where = `a11y /s/${id}`;
    await openReader(page, origin, `/s/${id}`);
    const tabs = (await page.evaluate(`[...document.querySelectorAll("#stage .code__tab")].map((t) => t.textContent)`)) as string[];
    // Tab from the top of the page: the selected tab is the one tab stop of the list.
    await page.evaluate(`document.activeElement && document.activeElement.blur && document.activeElement.blur()`);
    let reached = -1;
    for (let i = 0; i < 20 && reached < 0; i++) {
      await page.keyboard.press("Tab");
      if (((await page.evaluate(describeActive)) as string).includes("code__tab")) reached = i + 1;
    }
    if (reached < 0) {
      report.fail(where, "Tab never reached a code tab");
      continue;
    }
    report.pass(`${where}: Tab reaches the code tabs in ${reached} press(es)`);
    const url = page.url();
    const seen = new Set<string>([(await page.evaluate(`document.activeElement.textContent`)) as string]);
    for (let i = 0; i < tabs.length; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(120);
      seen.add((await page.evaluate(`document.activeElement.textContent`)) as string);
    }
    const state = (await page.evaluate(`(() => {
      const a = document.activeElement, pre = document.querySelector("#stage .code__pre");
      return { selected: a.getAttribute("aria-selected"), tabIndex: a.tabIndex, controls: a.getAttribute("aria-controls"), panel: pre.id, role: pre.getAttribute("role"), labelledby: pre.getAttribute("aria-labelledby"), activeId: a.id, others: [...document.querySelectorAll("#stage .code__tab")].filter((t) => t !== a).map((t) => t.tabIndex) };
    })()`)) as { selected: string; tabIndex: number; controls: string; panel: string; role: string; labelledby: string; activeId: string; others: number[] };
    if (page.url() !== url) report.fail(where, `ArrowRight on a tab moved the deck to ${page.url()}`);
    else if (seen.size < tabs.length) report.fail(where, `ArrowRight reached ${seen.size} of ${tabs.length} files`);
    else report.pass(`${where}: ArrowRight walks all ${tabs.length} files and the deck stays`);
    const wired = state.selected === "true" && state.tabIndex === 0 && state.others.every((t) => t === -1) && state.controls === state.panel && state.role === "tabpanel" && state.labelledby === state.activeId;
    if (!wired) report.fail(where, `tabs are not wired: ${JSON.stringify(state)}`);
    else report.pass(`${where}: one tab stop, aria-controls to the tabpanel, the panel labelled by the selected tab`);
    await page.keyboard.press("End");
    const end = (await page.evaluate(`document.activeElement.textContent`)) as string;
    await page.keyboard.press("Home");
    const home = (await page.evaluate(`document.activeElement.textContent`)) as string;
    await page.waitForTimeout(200);
    if (end !== tabs.at(-1) || home !== tabs[0] || page.url() !== url) report.fail(where, `End gave ${end}, Home gave ${home}, deck ${page.url() === url ? "stayed" : "moved"}`);
    else report.pass(`${where}: End and Home reach the last and first file, and the deck stays`);
  }
  // M6: the sentence the code points to, and the off tab.
  await openReader(page, origin, "/s/d1-used-to?step=1");
  const desc = (await page.evaluate(`(() => { const p = document.querySelector("#stage .code__pre"); const id = p.getAttribute("aria-describedby"); return id ? document.getElementById(id)?.textContent ?? null : null; })()`)) as string | null;
  if (!desc || !/^Lines? .+ of .+ (is|are) highlighted\.$/.test(desc)) report.fail("a11y /s/d1-used-to?step=1", `the code's description is ${JSON.stringify(desc)}`);
  else report.pass(`a11y /s/d1-used-to?step=1: the code is described as "${desc}"`);
  // An off step: the first page whose step has code.off.
  const off = sections.flatMap((s) => s.pages).flatMap((p) => p.steps.map((st, i) => ({ id: p.id, i, st }))).find((x) => x.st.code?.off);
  if (off) {
    await openReader(page, origin, `/s/${off.id}?step=${off.i}`);
    const tabText = (await page.evaluate(`(() => { const chip = document.querySelector("#stage .code__off-chip"); return chip ? chip.closest(".code__tab").textContent : null; })()`)) as string | null;
    if (!tabText?.includes("(turned off in this step)")) report.fail(`a11y /s/${off.id}?step=${off.i}`, `the off tab reads ${JSON.stringify(tabText)}`);
    else report.pass(`a11y /s/${off.id}?step=${off.i}: the off file's tab reads "${tabText.trim()}"`);
  }
  await ctx.close();
}

// ------------------------------------------------------------------------------- M2 and M3

async function focusAndAnnouncements(browser: Browser, origin: string, report: Report) {
  console.log("\n  focus across slide changes (M2) and announcements (M3)");
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await openReader(page, origin, "/s/the-mandate");
  await page.focus('[data-control="next"]');
  let kept = 0;
  let lost = "";
  for (let i = 0; i < 5; i++) {
    const before = page.url();
    await page.keyboard.press("Enter");
    await page.waitForURL((u) => u.href !== before, { timeout: 5000 }).catch(() => null);
    await page.waitForTimeout(400);
    const a = (await page.evaluate(describeActive)) as string;
    if (a.startsWith("button[next]")) kept++;
    else lost ||= `${new URL(page.url()).pathname}: ${a}`;
  }
  if (kept !== 5) report.fail("a11y M2", `focus left Next after a slide change (${lost})`);
  else report.pass(`a11y M2: Enter on Next keeps focus on Next across 5 slides (now ${new URL(page.url()).pathname})`);
  await page.focus('[data-control="prev"]');
  const before = page.url();
  await page.keyboard.press("Enter");
  await page.waitForURL((u) => u.href !== before, { timeout: 5000 }).catch(() => null);
  await page.waitForTimeout(400);
  const a = (await page.evaluate(describeActive)) as string;
  if (!a.startsWith("button[prev]")) report.fail("a11y M2", `Enter on Previous left focus on ${a}`);
  else report.pass("a11y M2: Enter on Previous keeps focus on Previous");

  // M3: one live region, step sentences only.
  await openReader(page, origin, "/s/d1-used-to");
  await page.evaluate(`(() => {
    window.__liveWrites = [];
    const obs = new MutationObserver((ms) => { for (const m of ms) { const t = m.target.nodeType === 3 ? m.target.parentElement : m.target; const live = t && t.closest ? t.closest("[aria-live]") : null; if (live && live.id !== "__next-route-announcer__" && live.textContent) window.__liveWrites.push({ id: live.id || live.className, text: live.textContent }); } });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  })()`);
  await page.focus("#stage");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(900);
  const writes = (await page.evaluate(`window.__liveWrites`)) as { id: string; text: string }[];
  const deck = writes.filter((w) => w.id === "deck-announcer");
  const regions = (await page.evaluate(`document.querySelectorAll("#deck-announcer").length`)) as number;
  if (deck.length !== 1 || !/^Step 2 of \d+: .+\.( Lines? .+ highlighted\.)?/.test(deck[0].text)) report.fail("a11y M3", `a step change wrote ${JSON.stringify(deck)} to the deck's live region`);
  else report.pass(`a11y M3: a step change is announced once: "${deck[0].text}"`);
  if (regions !== 1) report.fail("a11y M3", `${regions} deck live regions`);
  // A slide change: the same node, nothing written (Next's route announcer reads the title).
  await page.evaluate(`(() => { window.__liveWrites = []; window.__announcer = document.getElementById("deck-announcer"); })()`);
  await page.keyboard.press("Shift+ArrowRight");
  await page.waitForURL((u) => !u.pathname.endsWith("/d1-used-to"), { timeout: 5000 }).catch(() => null);
  await page.waitForTimeout(900);
  const after = (await page.evaluate(`({ writes: window.__liveWrites.filter((w) => w.id === "deck-announcer"), same: window.__announcer === document.getElementById("deck-announcer"), stageAnnouncer: document.querySelectorAll(".stage__announcer").length })`)) as { writes: unknown[]; same: boolean; stageAnnouncer: number };
  if (after.writes.length || !after.same || after.stageAnnouncer) report.fail("a11y M3", `a slide change: ${JSON.stringify(after)}`);
  else report.pass("a11y M3: a slide change writes nothing to the deck's live region, which is the same node as before");
  await ctx.close();
}

// ------------------------------------------------------------------------------------- M4

async function pillRing(browser: Browser, origin: string, report: Report) {
  console.log("\n  the pill's focus ring (M4)");
  const sharp = loadSharp();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const lum = (r: number, g: number, b: number) => {
    const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  for (const id of ["the-mandate", "closing"]) {
    await openReader(page, origin, `/s/${id}`);
    // A keyboard move onto Keyboard help (enabled on every slide), so :focus-visible matches.
    await page.focus('[data-control="text"]');
    await page.keyboard.press("Tab");
    await page.waitForTimeout(400);
    const box = await page.locator('[data-control="help"]').boundingBox();
    const focused = (await page.evaluate(`document.activeElement.dataset.control`)) as string;
    if (!box || focused !== "help") {
      report.fail(`a11y M4 ${id}`, `Tab from Text view did not reach Keyboard help (focus on ${focused})`);
      continue;
    }
    const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    const px = (x: number, y: number) => {
      const i = (Math.round(y) * info.width + Math.round(x)) * info.channels;
      return lum(data[i], data[i + 1], data[i + 2]);
    };
    const mid = info.height / 2;
    const ring = Math.max(px(0, mid), px(1, mid));
    const inside = px(5, mid);
    const ratio = (Math.max(ring, inside) + 0.05) / (Math.min(ring, inside) + 0.05);
    if (ratio < 3) report.fail(`a11y M4 /s/${id}`, `the ring measures ${ratio.toFixed(2)}:1 against the pill`);
    else report.pass(`a11y M4 /s/${id}: the ring measures ${ratio.toFixed(2)}:1 against the pill`);
  }
  await ctx.close();
}

// ------------------------------------------------------------------------------------ H1b

async function demoToggle(browser: Browser, origin: string, report: Report) {
  console.log('\n  "Try the demo" (H1b)');
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await openReader(page, origin, "/s/d2-now");
  const btn = '[data-control="demo"]';
  if (!(await page.locator(btn).count())) {
    report.fail("a11y H1b", "no Try the demo button on /s/d2-now");
    await ctx.close();
    return;
  }
  await page.focus(btn);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);
  const on = (await page.evaluate(`({ pressed: document.querySelector('${btn}').getAttribute("aria-pressed"), handsOn: document.querySelector(".stage").dataset.handsOn, active: document.activeElement.className, tab: document.querySelector('.page-frame__iframe[data-visible="true"]')?.tabIndex })`)) as { pressed: string; handsOn: string; active: string; tab: number };
  if (on.pressed !== "true" || on.handsOn !== "true" || on.tab !== 0 || !on.active.includes("page-frame__iframe")) report.fail("a11y H1b", `after Try the demo: ${JSON.stringify(on)}`);
  else report.pass("a11y H1b: Try the demo turns hands-on on and gives the frame the keyboard");
  await page.focus(btn);
  await page.keyboard.press("Space");
  await page.waitForTimeout(800);
  const off = (await page.evaluate(`({ pressed: document.querySelector('${btn}').getAttribute("aria-pressed"), handsOn: document.querySelector(".stage").dataset.handsOn, active: document.activeElement.dataset.control ?? document.activeElement.tagName })`)) as { pressed: string; handsOn: string; active: string };
  if (off.pressed !== "false" || off.handsOn !== "false" || off.active !== "demo") report.fail("a11y H1b", `after a second press: ${JSON.stringify(off)}`);
  else report.pass("a11y H1b: a second press turns hands-on off, and focus stays on the toggle");
  await openReader(page, origin, "/s/what-changed");
  if (await page.locator(btn).count()) report.fail("a11y H1b", "Try the demo shows on a slide with no frame");
  else report.pass("a11y H1b: no Try the demo on a slide without a frame");
  await ctx.close();
}

// ------------------------------------------------------------------------------ L1, L3, L7

async function lows(browser: Browser, origin: string, report: Report) {
  console.log("\n  closing h1 (L1), footer number (L3), reader help (L7), audience title");
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await openReader(page, origin, "/s/closing");
  const h1 = (await page.evaluate(`[...document.querySelectorAll("#stage h1")].map((h) => h.textContent)`)) as string[];
  if (h1.length !== 1) report.fail("a11y L1", `/s/closing has ${h1.length} h1 in the stage`);
  else report.pass(`a11y L1: /s/closing has one h1 ("${h1[0]}")`);
  await openReader(page, origin, "/s/what-changed");
  const footer = (await page.evaluate(`(() => { const n = document.querySelector("#stage .sg-pill__num"); return n ? n.parentElement.textContent.replace(/\\s+/g, " ").trim() : null; })()`)) as string | null;
  if (!footer || !/, slide \d+$/.test(footer)) report.fail("a11y L3", `the footer reads ${JSON.stringify(footer)}`);
  else report.pass(`a11y L3: the footer reads "${footer}"`);
  await page.focus('[data-control="help"]');
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const rows = (await page.evaluate(`[...document.querySelectorAll("dialog.keyboard-help .keyboard-help__action")].map((d) => d.textContent)`)) as string[];
  const want = keyHelpFor("reader").map((r) => r.action);
  if (rows.join("|") !== want.join("|")) report.fail("a11y L7", `the reader help lists ${JSON.stringify(rows)}`);
  else report.pass(`a11y L7: the reader help lists the ${rows.length} reader rows, with "Move past the demo" and no presenter-only keys`);
  await page.keyboard.press("Escape");
  // The audience window's title names a walk page's feature (13 pages share "What we used to do").
  const audience = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const ap = await audience.newPage();
  await ap.goto(`${origin}/present?s=d1-used-to`);
  const title = await ap.title();
  if (title !== "Audience · Dialog element: What we used to do · 2026 advances in the web") report.fail("a11y titles", `the audience title is "${title}"`);
  else report.pass(`a11y titles: "${title}"`);
  await audience.close();
  await ctx.close();
}

// ---------------------------------------------------------------------------------- P2-TEXT

async function textView(browser: Browser, origin: string, report: Report) {
  console.log("\n  text view (P2-TEXT)");
  for (const vp of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true });
    const page = await ctx.newPage();
    const frames: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "document" && r.frame() !== page.mainFrame()) frames.push(r.url());
    });
    for (const id of ["title", "d1-intro", "d1-used-to", "d2-now", "f3-now", "people-to-follow", "closing"]) {
      const where = `text ${vp.width}x${vp.height} /s/${id}`;
      await page.goto(`${origin}/s/${id}`);
      await page.waitForTimeout(700);
      const m = (await page.evaluate(`(() => {
        const rv = document.querySelector(".reading-view"), stage = document.querySelector(".stage");
        const small = [...rv.querySelectorAll("p, li, blockquote, figcaption")].filter((e) => e.checkVisibility() && e.textContent.trim() && !e.closest("pre")).map((e) => parseFloat(getComputedStyle(e).fontSize)).filter((s) => s < 16);
        // Sideways overflow anywhere but inside a code block.
        const wide = [...rv.querySelectorAll("*")].filter((e) => !e.closest("pre") && e.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).map((e) => e.tagName + "." + e.className);
        return { rv: getComputedStyle(rv).display, stage: getComputedStyle(stage).display, small: small.length, wide: wide.slice(0, 3), scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      })()`)) as { rv: string; stage: string; small: number; wide: string[]; scroll: number };
      const problems = [m.rv === "none" && "the text view is hidden", m.stage !== "none" && "the stage shows", m.small > 0 && `${m.small} text element(s) under 16 px`, m.scroll > 0 && `the page scrolls ${m.scroll} px sideways`, m.wide.length > 0 && `wider than the window: ${m.wide.join(", ")}`].filter(Boolean);
      if (problems.length) report.fail(where, problems.join(", "));
      else report.pass(`${where}: reflowing text at 16 px or more, no sideways scroll`);
      if (vp.width === 390) {
        await page.evaluate(axeSource);
        const res = (await page.evaluate(`axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(AXE_TAGS)} }, rules: { region: { enabled: true } } })`)) as { violations: { id: string; nodes: { target: string[] }[] }[] };
        if (res.violations.length) report.fail(where, `axe: ${res.violations.map((v) => `${v.id} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 2).join(", ")})`).join("; ")}`);
        else report.pass(`${where}: axe finds no violations`);
      }
    }
    if (frames.length) report.fail(`text ${vp.width}x${vp.height}`, `${frames.length} frame document(s) loaded: ${frames.slice(0, 2).join(", ")}`);
    else report.pass(`text ${vp.width}x${vp.height}: no frame document loaded in text view`);
    await ctx.close();
  }

  // The switch, from the keyboard, on a wide window; the frame mounts when the stage comes back.
  {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${origin}/s/d1-now`);
    await page.waitForSelector('.page-frame[data-status="ready"]', { timeout: 20000 }).catch(() => null);
    const hidden = (await page.evaluate(`getComputedStyle(document.querySelector(".reading-view")).display`)) as string;
    if (hidden !== "none") report.fail("text toggle", "the text view shows on a wide window with the switch off");
    await page.focus('[data-control="text"]');
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    const on = (await page.evaluate(`({ attr: document.documentElement.dataset.textView, pressed: document.querySelector('[data-control="text"]').getAttribute("aria-pressed"), rv: getComputedStyle(document.querySelector(".reading-view")).display, stage: getComputedStyle(document.querySelector(".stage")).display, focus: document.activeElement.dataset.control })`)) as Record<string, string>;
    if (on.attr !== "on" || on.pressed !== "true" || on.rv === "none" || on.stage !== "none" || on.focus !== "text") report.fail("text toggle", `Enter on Text view: ${JSON.stringify(on)}`);
    else report.pass("text toggle: Enter on Text view swaps the stage for the text view, and focus stays on the switch");
    // A slide change keeps it on (the attribute is on <html>), and so does a reload (sessionStorage).
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(600);
    await page.reload();
    await page.waitForTimeout(800);
    const kept = (await page.evaluate(`({ attr: document.documentElement.dataset.textView, pressed: document.querySelector('[data-control="text"]').getAttribute("aria-pressed") })`)) as Record<string, string>;
    if (kept.attr !== "on" || kept.pressed !== "true") report.fail("text toggle", `after a reload: ${JSON.stringify(kept)}`);
    else report.pass("text toggle: the choice survives a reload in the same tab");
    await page.focus('[data-control="text"]');
    await page.keyboard.press("Space");
    await page.waitForSelector('.page-frame[data-status="ready"]', { timeout: 20000 }).catch(() => null);
    const off = (await page.evaluate(`({ attr: document.documentElement.dataset.textView ?? null, stage: getComputedStyle(document.querySelector(".stage")).display, frames: document.querySelectorAll(".page-frame__iframe").length })`)) as { attr: string | null; stage: string; frames: number };
    if (off.attr !== null || off.stage === "none" || off.frames < 1) report.fail("text toggle", `Space to turn it off: ${JSON.stringify(off)}`);
    else report.pass("text toggle: Space turns it off, the stage returns and its frame mounts");
    await ctx.close();
  }

  // Never in the presenter windows, even with the switch on in the session.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(`sessionStorage.setItem("deck:text-view", "on")`);
    for (const path of ["/present?s=d1-now", "/speaker?s=d1-now"]) {
      await page.goto(`${origin}${path}`);
      await page.waitForTimeout(800);
      const n = (await page.evaluate(`({ rv: document.querySelectorAll(".reading-view").length, stageHidden: [...document.querySelectorAll(".stage")].some((s) => getComputedStyle(s).display === "none") })`)) as { rv: number; stageHidden: boolean };
      if (n.rv || n.stageHidden) report.fail("text presenter", `${path} at 390 px: ${JSON.stringify(n)}`);
      else report.pass(`text presenter: ${path} has no text view and keeps its stage at 390 px`);
    }
    await ctx.close();
  }
}

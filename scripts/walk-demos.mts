/**
 * Walks every demo page in the audience window with the forward and back keys and asserts what
 * the frame runtime reported (PRD Part A, 16.1): every step reached, no runtime errors, every
 * `assert` passing, and the same digest when a step is reached forward (animated) and backward
 * (reset and replay).
 *
 *   pnpm walk [page-or-section-id] [--browser=chromium|webkit|firefox] [--headed]
 *   pnpm walk --advance [page-or-section-id]      Next after playback on every framed page (r7 6.5)
 *   pnpm walk transitions --fade=1                the slide crossfade (r7 9.3)
 *   pnpm walk m2 --no-lanes                       Chromium without the Grid Lanes switch (r7 7.1)
 *   pnpm walk drawer | links                      the drawer's keyboard contract (9.8), link focus (5.3)
 *   pnpm walk focus | underlay | keys             PRD-perf P0-1 to P0-4 (walk-perf.mts; also --origin=<url>)
 *   pnpm walk a11y                                PRD-perf P2-A11Y and P2-TEXT (walk-a11y.mts)
 *
 * Needs `pnpm dev` at DECK_URL (default http://localhost:3000) with the demo origin reachable.
 */
import { chromium, firefox, webkit, type Browser, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { SPLITS, hasFrame, type DemoPage, type DemoSection } from "@/content/demo-schema";
import type { SupportFile } from "@/lib/support-data";
import { sections } from "@/lib/content";
import type { StepResult } from "@/lib/engine/frame";
import { checkDistinct, checkFrameBackground, walkDeck } from "./walk-deck.mts";
import { checkWrapper } from "./walk-wrapper.mts";
import { slides as deckSlides } from "@/lib/content";
import { PROTOCOL_WATCH, checkProtocol, finishDeckSampler, startDeckSampler, walkFixture } from "./walk-spotlight.mts";
import { VT_WATCH, checkM2Fallback, checkPageTitle, checkSelect, checkSlideR7, finishDeckR7, walkAdvance, walkDrawer, walkLinkFocus, walkTransitions } from "./walk-r7.mts";
import { walkPerf } from "./walk-perf.mts";
import { walkA11y } from "./walk-a11y.mts";

const BASE = process.env.DECK_URL ?? "http://localhost:3000";
const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith("--"));
const headed = args.includes("--headed");
const browserName = (args.find((a) => a.startsWith("--browser="))?.slice(10) ?? "chromium") as "chromium" | "webkit" | "firefox";
/** Chromium without the Grid Lanes switch: M2 shows the columns fallback (PRD r7 7.1). */
const noLanes = args.includes("--no-lanes");
/** M2 asserts lanes for the browsers that have them; without lanes the columns checks stand in. */
const lanesExpected = (pageId: string, a: { expect: string }) => pageId === "m2-now" && a.expect === "style:display=grid-lanes" && (browserName === "firefox" || noLanes);

const failures: string[] = [];
let checks = 0;
const fail = (where: string, msg: string) => {
  failures.push(`${where}: ${msg}`);
  console.log(`    ✖ ${msg}`);
};
const pass = (msg: string) => {
  checks++;
  console.log(`    ✓ ${msg}`);
};

type Results = Record<string, StepResult & { seq: number }>;

async function results(page: Page): Promise<Results> {
  return page.evaluate(() => (window as unknown as { __stepResults?: Results }).__stepResults ?? {});
}

/** Waits for a result newer than `afterSeq` under `key`. */
async function waitForResult(page: Page, key: string, afterSeq: number, timeout = 8000): Promise<(StepResult & { seq: number }) | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = (await results(page))[key];
    if (r && r.seq > afterSeq) return r;
    await page.waitForTimeout(60);
  }
  return null;
}
async function lastSeq(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __stepSeq?: number }).__stepSeq ?? 0);
}

let speaker: Page | null = null;

/** Every section's frames carry a v5 wrapper (PRD v5, 2). */
const V5_WRAPPED = new Set(sections.map((s) => s.id));

/**
 * D6 (PRD v4, 2.2 and 7.6): in Firefox the select is a normal select and the saved form posted the
 * chosen color (the step's own assert); with --capture, the Firefox frame is saved as the poster
 * the s5 step reveals (public/posters/d6-firefox.png).
 */
async function checkD6(page: Page, where: string) {
  const frame = page.frames().find((f) => f.url().includes("/11-customizable-select/native/"));
  if (!frame) return fail(where, "D6 frame not found");
  const appearance = (await frame.evaluate(`getComputedStyle(document.querySelector("#color")).appearance`)) as string;
  if (browserName === "firefox") {
    if (appearance === "base-select") fail(where, "Firefox: the select is customized; expected a normal select");
    else pass(`Firefox: the select is a normal select (appearance ${appearance}) and the color posted`);
    if (args.includes("--capture")) {
      // A real Firefox run of the same form at 2x, cropped to the Color field, Save and the status
      // line (design review H6), so the proof is readable at projector scale.
      const out = path.join(process.cwd(), "public", "posters", "d6-firefox.png");
      mkdirSync(path.dirname(out), { recursive: true });
      const ctx = await page.context().browser()!.newContext({ viewport: { width: 640, height: 628 }, deviceScaleFactor: 2 });
      const p = await ctx.newPage();
      await p.goto(`${frame.url().split("?")[0]}?flags=enhance-css:1`);
      await p.selectOption("#color", "moss");
      await p.click("#variant > button");
      await p.waitForFunction(() => /color=moss/.test(document.querySelector("#status")?.textContent ?? ""), null, { timeout: 5000 });
      const box = (await p.evaluate(`(() => { const a = document.querySelector("#color").getBoundingClientRect(); const b = document.querySelector("#status").getBoundingClientRect(); const l = document.querySelector("label[for=color]").getBoundingClientRect(); const x = Math.min(a.left, b.left, l.left) - 12; const y = l.top - 12; return { x, y, width: Math.max(a.right, b.right) - x + 12, height: b.bottom - y + 12 }; })()`)) as { x: number; y: number; width: number; height: number };
      await p.screenshot({ path: out, clip: box });
      await ctx.close();
      pass(`captured ${path.relative(process.cwd(), out)} from Firefox (${Math.round(box.width)} by ${Math.round(box.height)} CSS px at 2x)`);
    }
  } else pass(`${browserName}: select appearance ${appearance}`);
}

/**
 * The Chromium switch behind chrome://flags/#css-grid-lanes-layout ("CSS Grid Lanes Layout"),
 * checked in Playwright's Chromium 145 and Chrome 156 on 28 October 2026
 * (still-in-motion-demos.md 3.5 and S0). On the talk laptop, turn the flag on in chrome://flags,
 * or start Chrome with this switch.
 */
export const GRID_LANES_SWITCH = "--enable-blink-features=CSSGridLanesLayout";

/**
 * M2 (still-in-motion-demos.md 3.5): the now frame supports Grid Lanes in Chromium (launched with
 * the switch) and WebKit; Firefox shows the regular grid. With --capture in WebKit, each step's
 * photo pane is saved for plan B (public/posters/m2-safari/<step>.png, read by `showSafari`).
 */
const m2State: { columns?: number } = {};
async function checkM2(page: Page, where: string, stepId: string) {
  const frame = await visibleFrame(page);
  if (!frame || !frame.url().includes("/13-grid-lanes/native/")) return fail(where, "M2 frame not found");
  const supports = (await frame.evaluate(`CSS.supports("display", "grid-lanes")`)) as boolean;
  if (stepId === "s0") {
    if (browserName === "firefox" || noLanes) pass(`${browserName}${noLanes ? " without the switch" : ""}: no Grid Lanes (${supports ? "supported" : "the columns fallback"}) is expected`);
    else if (!supports) fail(where, `${browserName}: CSS.supports("display", "grid-lanes") is false in the M2 now frame${browserName === "chromium" ? `; launch with ${GRID_LANES_SWITCH}` : ""}`);
    else pass(`${browserName}: CSS.supports("display", "grid-lanes") in the M2 now frame`);
  }
  // Without lanes the shown fallback is CSS columns (PRD r7 7.1).
  if (!supports) await checkM2Fallback(frame, where, stepId, m2State, { fail, pass });
  if (args.includes("--capture") && browserName === "webkit" && stepId === "s0") await captureM2(page, frame.url().split("?")[0]);
}

/**
 * M3 (review r6 motion M11): where the browser has the CustomElementRegistry constructor, the now
 * page's app must run in its own scoped shadow root, never the iframe fallback, which looks the
 * same at s1. Without the constructor (Playwright's Chromium 145, older Firefox) the fallback is
 * expected; walk with --channel=chrome to see the feature.
 */
async function checkM3(page: Page, where: string, stepId: string) {
  if (stepId !== "s1") return;
  const frame = page.frames().find((f) => f.url().includes("/14-scoped-registries/native"));
  if (!frame) return fail(where, "M3 frame not found");
  const r = (await frame.evaluate(`(() => {
    let scoped = false;
    try { new CustomElementRegistry(); scoped = true; } catch {}
    const app = document.querySelector("#pricing-app");
    return { scoped, shadow: Boolean(app && app.shadowRoot), iframe: Boolean(app && app.querySelector("iframe")) };
  })()`)) as { scoped: boolean; shadow: boolean; iframe: boolean };
  if (!r.scoped) {
    if (r.iframe) pass(`${browserName}: no CustomElementRegistry constructor; the iframe fallback is expected${browserName === "chromium" ? " (walk with --channel=chrome for the feature)" : ""}`);
    else fail(where, `${browserName}: no CustomElementRegistry constructor and no iframe fallback`);
  } else if (!r.shadow || r.iframe) fail(where, `${browserName}: scoped registries are supported, but the app is ${r.iframe ? "the iframe fallback" : "missing its shadow root"}`);
  else pass(`${browserName}: the pricing app runs in its own scoped shadow root, no iframe`);
}

/**
 * Plan B stills for M2 (still-in-motion-demos.md 5): the same four states recorded in WebKit at
 * 2x from the frame document itself, so no presenter box or cursor is in them: styles off, lanes
 * on, Show more pressed, the wall narrowed. `showSafari` lays them over the photo pane.
 */
async function captureM2(page: Page, url: string) {
  const ctx = await page.context().browser()!.newContext({ viewport: { width: 768, height: 628 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const dir = path.join(process.cwd(), "public", "posters", "m2-safari");
  mkdirSync(dir, { recursive: true });
  // The frame's CSP refuses string evaluation, so the waits poll locators.
  const settle = async () => {
    for (let i = 0; i < 80; i++) {
      const pending = await p.locator("#wall img").evaluateAll((imgs) => imgs.filter((img) => !(img as HTMLImageElement).complete).length);
      if (!pending) break;
      await p.waitForTimeout(100);
    }
    await p.waitForTimeout(300);
  };
  const shoot = async (step: string) => {
    await p.locator(".photos").screenshot({ path: path.join(dir, `${step}.png`) });
    pass(`captured public/posters/m2-safari/${step}.png from WebKit for plan B`);
  };
  await p.goto(`${url}?flags=enhance-css:0,enhance-js:1&bg=m2`);
  await settle();
  await shoot("s0");
  await p.goto(`${url}?flags=enhance-css:1,enhance-js:1&bg=m2`);
  await settle();
  await shoot("s1");
  await p.click("#more");
  await p.locator("#wall figure").nth(17).waitFor({ timeout: 8000 });
  await settle();
  await shoot("s2");
  await p.locator("#wall").evaluate((wall) => ((wall as HTMLElement).style.inlineSize = "66%"));
  await p.waitForTimeout(400);
  await shoot("s3");
  await ctx.close();
}

/**
 * Frame side, in every document on the demo origin: whether it was revealed with a cross-document
 * view transition, and whether the engine has them (`PageRevealEvent.viewTransition`; Firefox
 * falls back to a plain load).
 */
const REVEAL_WATCH = `(() => {
  if (location.hostname !== "127.0.0.1") return;
  const supported = typeof PageRevealEvent !== "undefined" && "viewTransition" in PageRevealEvent.prototype;
  window.__walkReveal = { supported, vt: "none" };
  addEventListener("pagereveal", (e) => {
    const vt = e.viewTransition;
    if (!vt) return;
    window.__walkReveal.vt = "running";
    vt.ready.catch(() => {});
    vt.finished.then(() => (window.__walkReveal.vt = "finished"), () => (window.__walkReveal.vt = "skipped"));
  });
})();`;

/**
 * A forward run that loads another document in a multi-page build (a routed step whose route
 * differs from the one before it) plays its view transition where the engine supports them.
 */
async function checkTransition(page: Page, where: string, label: string, demoPage: DemoPage, i: number) {
  const step = demoPage.steps[i];
  let prev: string | undefined;
  for (let k = i - 1; k >= 0 && !prev; k--) prev = demoPage.steps[k].route;
  if (!step.route || !prev || prev === step.route) return;
  const f = await visibleFrame(page);
  const s = f ? ((await f.evaluate(`({ pages: document.documentElement.hasAttribute("data-pages"), reveal: window.__walkReveal || null })`).catch(() => null)) as { pages: boolean; reveal: { supported: boolean; vt: string } | null } | null) : null;
  if (!s?.pages) return;
  if (!s.reveal) return fail(where, `${label}: the document's reveal was not observed`);
  if (!s.reveal.supported) return pass(`${label}: a plain load (no cross-document view transitions here)`);
  if (s.reveal.vt === "running" || s.reveal.vt === "finished") pass(`${label}: the view transition played (${s.reveal.vt})`);
  else fail(where, `${label}: no view transition on a forward run (${s.reveal.vt})`);
}

/**
 * The clicker's instant replay (Back one step, then Next again): Back to `i` was just pressed and
 * replayed; Next plays step `i + 1` animated from the replayed document, then Back replays `i`
 * again. Asserts, route and transition must hold as on the first forward run.
 */
async function replayThenNext(page: Page, where: string, demoPage: DemoPage, i: number) {
  const next = demoPage.steps[i + 1];
  const here = demoPage.steps[i];
  let seq = await lastSeq(page);
  await page.keyboard.press("ArrowRight");
  let r = await waitForResult(page, `${demoPage.id}:${next.id}`, seq, 10000);
  if (!r) return fail(where, `replay ${here.id} then next ${next.id}: no step result`);
  const failed = r.asserts.filter((a) => a.stepId === next.id && !a.pass && !lanesExpected(demoPage.id, a));
  if (failed.length) fail(where, `replay ${here.id} then next ${next.id}: ${failed.map((a) => `${a.target} ${a.expect} (got ${a.actual})`).join("; ")}`);
  else pass(`replay ${here.id} then next ${next.id}: ${r.asserts.filter((a) => a.stepId === next.id).length} assert(s) ok, ${r.ms}ms`);
  if (next.route) await checkRoute(page, where, `replay ${here.id} then next ${next.id}`, next.route);
  await checkTransition(page, where, `replay ${here.id} then next ${next.id}`, demoPage, i + 1);
  seq = await lastSeq(page);
  await page.keyboard.press("ArrowLeft");
  r = await waitForResult(page, `${demoPage.id}:${here.id}`, seq, 10000);
  if (!r) return fail(where, `back ${here.id} again: no step result`);
  const again = r.asserts.filter((a) => !a.pass && !lanesExpected(demoPage.id, a));
  if (again.length) fail(where, `back ${here.id} again: ${again.map((a) => `${a.target} ${a.expect} (got ${a.actual})`).join("; ")}`);
  if (here.route) await checkRoute(page, where, `back ${here.id} again`, here.route);
}

/** Multi-page builds (still-in-motion-demos.md 3.3): a routed step ends on its document. */
async function checkRoute(page: Page, where: string, stepId: string, route: string) {
  // A replay swaps iframes and drops the old one on the next frame: retry briefly. The document's
  // own address is read, because a frame object's url can lag a load in WebKit.
  let href: string | null = null;
  for (let i = 0; i < 10 && !href; i++) {
    const f = await visibleFrame(page);
    href = f ? ((await f.evaluate(() => location.href).catch(() => null)) as string | null) : null;
    if (!href) await page.waitForTimeout(100);
  }
  if (!href) return fail(where, `${stepId}: no frame for the route check`);
  const url = new URL(href);
  const want = new URL(route, url);
  const ok = url.pathname === want.pathname && [...want.searchParams].every(([k, v]) => url.searchParams.get(k) === v);
  if (ok) pass(`${stepId}: the frame is on ${route}`);
  else fail(where, `${stepId}: the frame is on ${url.pathname}${url.search}; the step's route is ${route}`);
}

/** Every frame carries the portal theme (PRD v4, 7.6): computed --glass-surface is set on its root. */
async function checkTheme(page: Page, where: string, stepId: string) {
  const frames = page.frames().filter((f) => f !== page.mainFrame() && /^http:\/\/(127\.0\.0\.1|localhost):\d+\//.test(f.url()) && !f.url().startsWith(BASE));
  // A nested frame that is not rendered yet (M3's hidden app iframe) has no computed style in
  // Firefox; it is checked once it shows. A direct child of the presenter is cross-origin, so its
  // frameElement is never read: WebKit reports that read as an uncaught "Blocked a frame" error.
  const values = await Promise.all(frames.map((f) => f.evaluate(`(() => { try { if (window.parent !== window.top && window.frameElement && !window.frameElement.getClientRects().length) return "not rendered"; } catch (e) {} return getComputedStyle(document.documentElement).getPropertyValue("--glass-surface").trim(); })()`).catch(() => "") as Promise<string>));
  if (!frames.length) return fail(where, `theme ${stepId}: no frame found`);
  if (values.some((v) => !v)) fail(where, `theme ${stepId}: --glass-surface is not set in a frame (${frames.map((f) => f.url()).join(", ")})`);
  else pass(`theme ${stepId}: --glass-surface ${values[0]} in the frame`);
}

/**
 * Speaker window at 1440 by 900 (PRD v4, 5.1 and 7.6; speaker view PRD, 12.1): on every step the
 * title and steps block sits fully in the viewport, the current bullets start inside the notes body
 * (verified notes run long, so the body scrolls; the first line must be readable without scrolling),
 * "Next step" shows when the page has another step and not on its last, no selector shows outside
 * References, and the cautions show on the now page's last step.
 */
let speakerLayoutChecked = false;
async function checkSpeaker(where: string, demoPage: DemoPage, section: DemoSection, i: number) {
  if (!speaker) return;
  const step = demoPage.steps[i];
  const want = `Step ${i + 1} of ${demoPage.steps.length}: ${step.label}`;
  const synced = await speaker
    .waitForFunction((w) => document.querySelector(".notes__step")?.textContent?.startsWith(w), want, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (!synced) return fail(where, `speaker ${step.id}: the notes did not follow (wanted "${want}")`);
  // CX risk 2: once the audience frame has finished the step, the speaker window says Ready.
  const ready = await speaker
    .waitForFunction(() => document.querySelector(".notes__play")?.textContent === "Ready", null, { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  if (!ready) fail(where, `speaker ${step.id}: the indicator never returned to Ready`);
  const v = (await speaker.evaluate(`(() => {
    const body = document.querySelector(".speaker__notes-body");
    const br = body.getBoundingClientRect();
    const inView = (el) => { if (!el) return true; const r = el.getBoundingClientRect(); return r.top >= br.top - 1 && r.top + 48 <= Math.min(br.bottom, innerHeight) + 1; };
    const header = document.querySelector(".notes__header");
    const hr = header.getBoundingClientRect();
    const then = document.querySelector(".notes__then");
    const clone = body.cloneNode(true);
    clone.querySelectorAll("details").forEach((d) => d.remove());
    const text = clone.textContent + " " + header.textContent;
    const sel = /#[a-z][\\w-]*|\\[[a-z-]+(=|\\])/i.exec(text);
    return { header: hr.top >= 0 && hr.left >= 0 && hr.bottom <= innerHeight && hr.right <= innerWidth, bullets: inView(document.querySelector(".notes__bullets")), then: then ? then.getBoundingClientRect().height > 0 : false, selector: sel ? sel[0] : null, cautions: Boolean(document.querySelector(".notes__cautions")) };
  })()`)) as { header: boolean; bullets: boolean; then: boolean; selector: string | null; cautions: boolean };
  const problems = [!v.header && "title and steps block", !v.bullets && "bullets"].filter(Boolean);
  if (problems.length) fail(where, `speaker ${step.id}: ${problems.join(", ")} not visible at 1440 by 900`);
  else pass(`speaker ${step.id}: title and steps block, bullets start in view`);
  const wantThen = i < demoPage.steps.length - 1;
  if (wantThen !== v.then) fail(where, `speaker ${step.id}: "Next step" ${v.then ? "shown on the last step" : "missing"}`);
  if (v.selector) fail(where, `speaker ${step.id}: selector text "${v.selector}" outside References`);
  const wantCautions = demoPage.stage === "now" && i === demoPage.steps.length - 1 && section.cautions.length > 0;
  if (wantCautions !== v.cautions) fail(where, `speaker ${step.id}: cautions ${v.cautions ? "shown" : "missing"}`);
  else if (wantCautions) pass(`speaker ${step.id}: cautions shown`);
  // Once per run (speaker view PRD, 11 criteria 1, 7 and 17): the preview keeps its size, the
  // transport label is gone, one main, and the next preview is out of the tree.
  if (speakerLayoutChecked) return;
  speakerLayoutChecked = true;
  const l = (await speaker.evaluate(`(() => {
    const c = document.querySelector(".speaker__current").getBoundingClientRect();
    const np = document.querySelector(".speaker__next-preview");
    // Criterion 6: nothing but the previews is bright. Fills are composited on the window's navy;
    // the flags, the Key point chip and the 6 px progress segments are the PRD's own exceptions.
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const bright = [];
    for (const el of document.querySelectorAll(".speaker *")) {
      if (el.closest(".speaker__current .stage, .speaker__next-preview, .speaker__flag, .notes__chip--key, .speaker__progress")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const m = /rgba?\\(([\\d.]+)[ ,]+([\\d.]+)[ ,]+([\\d.]+)(?:[ ,/]+([\\d.]+))?/.exec(getComputedStyle(el).backgroundColor);
      if (!m) continue;
      const a = m[4] === undefined ? 1 : Number(m[4]);
      if (a === 0) continue;
      const [rr, gg, bb] = [[m[1], 5], [m[2], 9], [m[3], 26]].map(([v, bg]) => lin(Number(v) * a + bg * (1 - a)));
      const lum = 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
      if (lum > 0.2) bright.push(\`\${el.tagName.toLowerCase()}.\${String(el.className).split(" ")[0]} \${lum.toFixed(2)}\`);
    }
    return { w: c.width, h: c.height, transport: Boolean(document.querySelector(".speaker__transport")), mains: document.querySelectorAll("main, [role=main]").length, inert: np ? np.hasAttribute("inert") : true, bright };
  })()`)) as { w: number; h: number; transport: boolean; mains: number; inert: boolean; bright: string[] };
  if (Math.abs(l.w - 633) > 1 || Math.abs(l.h - 356) > 1) fail("speaker", `current preview is ${l.w.toFixed(1)} by ${l.h.toFixed(1)}, wanted 633 by 356`);
  else pass("speaker: current preview 633 by 356");
  if (l.transport) fail("speaker", "the transport label still renders");
  if (l.mains !== 1) fail("speaker", `${l.mains} main landmarks, wanted 1`);
  if (!l.inert) fail("speaker", "the next preview is not inert");
  if (!l.transport && l.mains === 1 && l.inert) pass("speaker: no transport label, one main, next preview inert");
  if (l.bright.length) fail("speaker", `bright fills outside the previews: ${l.bright.slice(0, 4).join(", ")}`);
  else pass("speaker: no bright fill outside the previews");
}

/** Hands-on mode shows the step's ifKeyboard in the speaker window; turning it off replays the step. */
async function checkHandsOn(page: Page, where: string, demoPage: DemoPage, i: number) {
  const step = demoPage.steps[i];
  if (!speaker || !step.ifKeyboard) return;
  await page.keyboard.press("h");
  const shown = await speaker
    .waitForFunction((t) => document.querySelector(".notes__hands-on")?.textContent === t, step.ifKeyboard, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await page.waitForTimeout(800);
  const seq = await lastSeq(page);
  // In hands-on mode the frame owns the audience keyboard (a focused field takes the "h"), so
  // hands-on ends from the speaker window, as on stage.
  await speaker.keyboard.press("h");
  const r = await waitForResult(page, `${demoPage.id}:${step.id}`, seq, 10000);
  if (!shown) fail(where, `hands-on ${step.id}: ifKeyboard not shown in the speaker window`);
  else pass(`hands-on ${step.id}: ifKeyboard shown`);
  if (!r) fail(where, `hands-on ${step.id}: no replay after hands-on off`);
}

async function walkPage(page: Page, section: DemoSection, demoPage: DemoPage) {
  const where = demoPage.id;
  console.log(`\n== ${where} (${section.label}, ${demoPage.stage}, ${demoPage.steps.length} steps)`);
  await page.goto(`${BASE}/present?s=${demoPage.id}`);
  if (!hasFrame(demoPage)) {
    await walkIntro(page, section, where);
    return;
  }
  await checkGeometry(page, demoPage, where);
  await page.waitForSelector('.page-frame__iframe[data-visible="true"]', { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(800);
  await checkFrameBackground(await visibleFrame(page), where, section.background, { fail, pass });
  const forward: (string | null)[] = [];
  for (let i = 0; i < demoPage.steps.length; i++) {
    const step = demoPage.steps[i];
    const seq = i === 0 ? 0 : await lastSeq(page);
    // The deck invariant (PRD v5, 3.4): sample the boxes and their targets through the step.
    const sampleFrame = i > 0 && step.spotlight?.length ? await visibleFrame(page) : null;
    // The previous step's boxes are on the previous step's targets until they fade out.
    const sampling = i > 0 ? await startDeckSampler(page, sampleFrame, [demoPage.steps[i - 1].spotlight ?? [], step.spotlight ?? []]) : false;
    if (i > 0) await page.keyboard.press("ArrowRight");
    const r = await waitForResult(page, `${demoPage.id}:${step.id}`, seq, i === 0 ? 15000 : 8000);
    if (sampling) {
      // The boxes fade in after the settle that follows step-done; keep sampling through it.
      await page.waitForTimeout(500);
      const inv = await finishDeckSampler(page, sampleFrame, "frame" in demoPage ? demoPage.frame.spotlightClip?.bottom : undefined);
      if (inv && inv.violations.length) fail(where, `${step.id}: spotlight off its target in ${inv.violations.length} sample(s), e.g. ${inv.violations[0]}`);
      else if (inv) pass(`${step.id}: spotlight boxes on target in all ${inv.visible} visible sample(s) of ${inv.samples}`);
    }
    if (!r) {
      fail(where, `${step.id}: no step result (frame not ready or the step did not finish)`);
      forward.push(null);
      continue;
    }
    // M2 asserts lanes for the browsers that have them; elsewhere the columns checks stand in.
    const failed = r.asserts.filter((a) => a.stepId === step.id && !a.pass && !lanesExpected(demoPage.id, a));
    if (failed.length) fail(where, `${step.id}: ${failed.map((a) => `${a.target} ${a.expect} (got ${a.actual})`).join("; ")}`);
    else pass(`${step.id} ${step.label}: ${r.asserts.filter((a) => a.stepId === step.id).length} assert(s) ok, ${r.ms}ms`);
    forward.push(r.digest);
    if (i === 0 || i === demoPage.steps.length - 1) {
      await checkTheme(page, where, step.id);
      // Wrapper checks at s0 and on the last step (PRD v5, 4.8).
      const f = await visibleFrame(page);
      const wrapped = f ? await f.evaluate("Boolean(document.documentElement.dataset.wrapper)").catch(() => false) : false;
      if (wrapped || V5_WRAPPED.has(section.id)) await checkWrapper(f, `${where} ${step.id}`, demoPage.files ?? [], demoPage.stage === "single", { fail, pass });
    }
    if (demoPage.id === "d6-now" && step.id === "s4") await checkD6(page, where);
    if (demoPage.id === "m2-now") await checkM2(page, where, step.id);
    // PRD r7 7.2: the status select in all three engines.
    if (demoPage.id.startsWith("d4-") && demoPage.stage !== "intro" && i === 0) await checkSelect(await visibleFrame(page), where, browserName, { fail, pass });
    // PRD r7 3.3: the title, on the last step, where the meter shows too.
    if (i === demoPage.steps.length - 1) await checkPageTitle(page, demoPage, { fail, pass });
    if (demoPage.id === "m3-now") await checkM3(page, where, step.id);
    if (step.route) await checkRoute(page, where, step.id, step.route);
    await checkTransition(page, where, step.id, demoPage, i);
    await checkSpeaker(where, demoPage, section, i);
    await checkHandsOn(page, where, demoPage, i);
  }
  // Back: reset and replay must land on the same digest. At two steps the clicker's instant
  // replay is repeated: Next again from the replayed document, then Back once more.
  const n = demoPage.steps.length;
  const replayAt = new Set(n >= 2 ? [n - 2, Math.floor((n - 2) / 2)] : []);
  for (let i = demoPage.steps.length - 2; i >= 0; i--) {
    const step = demoPage.steps[i];
    const seq = await lastSeq(page);
    await page.keyboard.press("ArrowLeft");
    const r = await waitForResult(page, `${demoPage.id}:${step.id}`, seq, 10000);
    if (!r) {
      fail(where, `back ${step.id}: no step result`);
      continue;
    }
    const failed = r.asserts.filter((a) => !a.pass && !lanesExpected(demoPage.id, a));
    if (failed.length) fail(where, `back ${step.id}: ${failed.map((a) => `${a.target} ${a.expect} (got ${a.actual})`).join("; ")}`);
    else if (forward[i] && r.digest !== forward[i]) console.log(`    · back ${step.id}: digest ${r.digest} differs from forward ${forward[i]} (asserts pass)`);
    else pass(`back ${step.id}: asserts pass, digest ${r.digest}`);
    if (step.route) await checkRoute(page, where, `back ${step.id}`, step.route);
    if (replayAt.has(i)) await replayThenNext(page, where, demoPage, i);
  }
  await checkProtocol(page, where, { fail, pass });
  // The stuck-playback watchdog (PRD r7, 6.4) never fires in a clean walk.
  const stuck = (await page.evaluate("window.__stuckPlayback || []").catch(() => [])) as string[];
  if (stuck.length) fail(where, `stuck playback: ${stuck.join(", ")}`);
  // No box was forced in after 2000 ms on this page (PRD v5, 3.2 rule 6; M8's rehearsal criterion).
  const forced = (await page.evaluate("(window.__spotlightForced || []).map((f) => f.stepId)").catch(() => [])) as string[];
  if (forced.length) fail(where, `spotlight forced after 2000 ms on ${forced.join(", ")}`);
  else pass("no spotlight forced");
}

/** The frame the audience sees on a walk or single page. */
async function visibleFrame(page: Page) {
  const el = await page.$(".page-frame__iframe[data-visible=\"true\"]");
  return (await el?.contentFrame()) ?? null;
}

const support = JSON.parse(readFileSync(path.join(process.cwd(), "content", ".generated", "support.json"), "utf8")) as SupportFile;

/** Intro slides (PRD v4, 7.6): the tiles render and their text matches support.json. */
async function walkIntro(page: Page, section: DemoSection, where: string) {
  const entry = support.sections[section.id];
  if (!entry) return fail(where, "no support.json entry");
  await page.waitForSelector(".support-row__tile", { timeout: 8000 }).catch(() => null);
  const tiles = await page.$$eval(".support-row__tile", (els) => els.map((el) => ({ version: el.querySelector(".support-row__version")?.textContent ?? "", name: el.querySelector(".support-row__name")?.firstChild?.textContent ?? "" })));
  const expected = entry.tiles.map((t) => ({ version: t.version ?? "Not yet", name: t.name }));
  if (JSON.stringify(tiles) !== JSON.stringify(expected)) fail(where, `tiles ${JSON.stringify(tiles)}; support.json says ${JSON.stringify(expected)}`);
  else pass(`${where}: ${tiles.length} tiles match support.json (${tiles.map((t) => `${t.name} ${t.version}`).join(", ")})`);
  const text = (await page.textContent(".intro__description")) ?? "";
  if (!text.includes(entry.since)) fail(where, `description lacks "${entry.since}"`);
  else pass(`${where}: generated sentence shown`);
}

/**
 * Geometry (PRD v4, 7.6): on walk pages the frame slot and the code panel have the page's split
 * widths (880 and 880 by default, 1056 and 704 at 60/40), and a 44-column, 40-line fixture fits the
 * code panel with no horizontal scroll.
 */
async function checkGeometry(page: Page, demoPage: DemoPage, where: string) {
  if (demoPage.stage !== "used-to" && demoPage.stage !== "now") return;
  await page.waitForSelector(".page__code .code__pre", { timeout: 10000 }).catch(() => null);
  // A string, so tsx does not wrap the helpers in its __name() calls inside the page.
  const g = (await page.evaluate(`(() => {
    const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
    const scale = canvas.width / 1920;
    const width = (sel) => Math.round((document.querySelector(sel)?.getBoundingClientRect().width ?? 0) / scale);
    // Measure on a clone beside the real panel: React owns the real nodes.
    const real = document.querySelector(".page__code .code__pre");
    const pre = real.cloneNode(false);
    const code = real.querySelector("code").cloneNode(false);
    code.textContent = Array.from({ length: 40 }, () => "W".repeat(44)).join("\\n");
    pre.append(code);
    pre.style.position = "absolute";
    pre.style.visibility = "hidden";
    pre.style.width = real.getBoundingClientRect().width / scale + "px";
    real.parentElement.append(pre);
    const fixture = { scrollWidth: pre.scrollWidth, clientWidth: pre.clientWidth };
    pre.remove();
    return { frame: width(".page__frame"), code: width(".page__code"), fixture };
  })()`)) as { frame: number; code: number; fixture: { scrollWidth: number; clientWidth: number } };
  const want = SPLITS[demoPage.split ?? "50/50"];
  if (g.frame !== want.frame || g.code !== want.code) fail(where, `slots are ${g.frame} and ${g.code} canvas px; ${demoPage.split ?? "50/50"} wants ${want.frame} and ${want.code}`);
  else pass(`${where}: frame slot ${g.frame} px and code panel ${g.code} px (${demoPage.split ?? "50/50"})`);
  if (g.fixture.scrollWidth > g.fixture.clientWidth) fail(where, `a 44 by 40 fixture scrolls sideways (${g.fixture.scrollWidth} > ${g.fixture.clientWidth})`);
  else pass(`${where}: 44 by 40 fixture fits without horizontal scroll`);
}

async function main() {
  // PRD-perf stage checks (walk-perf.mts) run on their own, also against a deployment (--origin).
  if (only === "focus" || only === "underlay" || only === "keys") process.exit(await walkPerf(only, args));
  if (only === "a11y") process.exit(await walkA11y(args));
  const health = await fetch(`${BASE}/_health`).catch(() => null);
  if (!health?.ok) {
    console.error(`No deck at ${BASE}. Start it with \`pnpm dev\` and run the walk again.`);
    process.exit(2);
  }
  const launcher = { chromium, webkit, firefox }[browserName];
  // Two windows in one context share BroadcastChannel; neither may be throttled as a background tab.
  // GRID_LANES_SWITCH turns on Chrome's "CSS Grid Lanes Layout" flag (M2, plan A).
  const chromiumArgs = ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", ...(noLanes ? [] : [GRID_LANES_SWITCH])];
  // --channel=chrome walks the installed Google Chrome instead of Playwright's Chromium, for
  // features newer than the bundled build (M3's scoped registries need Chrome 146).
  const channel = args.find((a) => a.startsWith("--channel="))?.slice(10);
  const browser: Browser = await launcher.launch({ headless: !headed, ...(browserName === "chromium" ? { args: chromiumArgs, ...(channel ? { channel } : {}) } : {}) });
  const r7 = { fail, pass };
  // Round 7 modes that run on their own (PRD r7, section 11).
  if (args.includes("--advance")) {
    await walkAdvance(browser, BASE, browserName, only, r7);
    return finish(browser);
  }
  if (only === "transitions") {
    if (!args.includes("--fade=1")) console.log("  · transitions: pass --fade=1 (the walk turns the fade on with ?fade=1)");
    await walkTransitions(browser, BASE, r7);
    return finish(browser);
  }
  if (only === "drawer" || only === "links") {
    if (only === "drawer") await walkDrawer(browser, BASE, r7);
    else await walkLinkFocus(browser, BASE, r7);
    return finish(browser);
  }
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  // The speaker checks are layout checks; they run in Chromium, where background tabs can be unthrottled.
  if (!args.includes("--no-speaker") && browserName === "chromium") {
    speaker = await context.newPage();
    await speaker.setViewportSize({ width: 1440, height: 900 });
    await speaker.goto(`${BASE}/speaker`);
    // The audience page keeps the foreground, so its frames keep animation frames.
    await page.bringToFront();
  }
  page.on("pageerror", (err) => fail("page", `uncaught error: ${err.message}`));
  await page.addInitScript(PROTOCOL_WATCH);
  await page.addInitScript(REVEAL_WATCH);
  await page.addInitScript(VT_WATCH);

  // The spotlight fixture (PRD v5, 3.4) runs first on a full walk, and alone with `pnpm walk fixtures`.
  if (!only || only === "fixtures") await walkFixture(browser, BASE, { fail, pass });
  // The whole deck in order (PRD v5, 4.8), on a full walk or with `pnpm walk deck`.
  if (!only || only === "deck") {
    checkDistinct({ fail, pass });
    await walkDeck(page, BASE, deckSlides, { fail, pass }, (slide) => checkSlideR7(page, slide, r7));
    await finishDeckR7(page, BASE, r7);
    // The drawer's keyboard contract and the clicker after a slide link (PRD r7 9.8 and 5.3).
    await walkDrawer(browser, BASE, r7);
    await walkLinkFocus(browser, BASE, r7);
  }
  if (only === "fixtures" || only === "deck") {
    await browser.close();
    console.log(`\n${browserName}: ${checks} check(s) passed, ${failures.length} failure(s)`);
    for (const f of failures) console.log(`  ✖ ${f}`);
    process.exit(failures.length ? 1 : 0);
  }
  page.on("console", (msg) => {
    if (msg.type() !== "error" || /favicon/.test(msg.text())) return;
    // D5's CMS payload is an <img src="/missing.png" onerror=...>: the 404 is what fires the
    // injected handler, so it is expected (review v5 A2).
    if (/\/missing\.png$/.test(msg.location()?.url ?? "")) console.log("    · expected 404: /missing.png, the D5 injection payload's failing image");
    else console.log(`    console: ${msg.text().slice(0, 160)}`);
  });

  // A page id, a section id, or its short prefix ("d6" for d6-variant-picker).
  const targets = sections.flatMap((s) => s.pages.filter((p) => !only || p.id === only || s.id === only || s.id.startsWith(`${only}-`)).map((p) => ({ s, p })));
  if (targets.length === 0) {
    console.error(only ? `No page or section "${only}"` : "No pages");
    process.exit(2);
  }
  for (const { s, p } of targets) {
    try {
      await walkPage(page, s, p);
    } catch (err) {
      fail(p.id, `walk threw: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  await browser.close();
  console.log(`\n${browserName}: ${checks} check(s) passed, ${failures.length} failure(s)`);
  for (const f of failures) console.log(`  ✖ ${f}`);
  process.exit(failures.length ? 1 : 0);
}

async function finish(browser: Browser) {
  await browser.close();
  console.log(`\n${browserName}: ${checks} check(s) passed, ${failures.length} failure(s)`);
  for (const f of failures) console.log(`  ✖ ${f}`);
  process.exit(failures.length ? 1 : 0);
}

void main();

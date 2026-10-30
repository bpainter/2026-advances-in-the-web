// Walks the whole deck slide by slide (Shift+ArrowRight) and totals the bytes by kind and origin.
import { writeFileSync } from "node:fs";
import { launch, netlog, summarize, kind, P, D, kb } from "./lib.mjs";
const mode = process.argv[2] ?? "audience";
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
const net = await netlog(page);
await page.goto(mode === "audience" ? `${P}/present?s=title` : `${P}/s/title`, { waitUntil: "load" });
await page.waitForTimeout(2500);
for (let i = 0; i < 49; i++) { await page.keyboard.press("Shift+ArrowRight"); await page.waitForTimeout(1800); }
await page.waitForTimeout(2000);
const list = net.list();
const s = summarize(list);
const byOriginKind = {};
for (const r of list) { const o = r.url.startsWith(D) ? "demo" : r.url.startsWith(P) ? "presenter" : "other"; const k = `${o}:${kind(r)}`; byOriginKind[k] ??= { n: 0, bytes: 0 }; byOriginKind[k].n++; byOriginKind[k].bytes += r.bytes ?? 0; }
const dup = {};
for (const r of list) { const path = r.url.replace(P, "").replace(D, ""); if (/backgrounds|fonts/.test(path)) { const p = path.split("?")[0]; dup[p] ??= new Set(); dup[p].add(r.url.startsWith(D) ? "demo" : "presenter"); } }
const both = Object.entries(dup).filter(([, v]) => v.size > 1).map(([k]) => k);
const bothBytes = list.filter((r) => r.url.startsWith(D) && both.includes(r.url.replace(D, "").split("?")[0])).reduce((a, r) => a + (r.bytes ?? 0), 0);
console.log(mode, "slides walked 50; requests", s.requests, "total", kb(s.bytes), "KB; 304", s.notModified);
for (const [k, v] of Object.entries(byOriginKind).sort((a, b) => b[1].bytes - a[1].bytes)) console.log(" ", k.padEnd(20), v.n, kb(v.bytes) + "KB");
console.log("  fetched on both origins:", both.length, "files,", kb(bothBytes), "KB extra on the demo origin");
const top = list.filter((r) => kind(r) === "img").sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0)).slice(0, 12).map((r) => `${kb(r.bytes)}KB ${r.url.replace(P, "").replace(D, "[demo]")}`);
console.log(top.join("\n"));
writeFileSync(new URL(`./results/deckwalk-${mode}.json`, import.meta.url), JSON.stringify({ summary: s, byOriginKind, both, list: list.map((r) => ({ url: r.url, kind: kind(r), status: r.status, bytes: r.bytes })) }, null, 2));
await b.close();

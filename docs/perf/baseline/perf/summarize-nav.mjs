import { readFileSync, readdirSync } from "node:fs";
const med = (a) => { const s = a.filter((x) => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const p90 = (a) => { const s = a.filter((x) => x != null).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.ceil(s.length * 0.9) - 1)] : null; };
const files = readdirSync("results").filter((f) => f.startsWith("nav-") && f.endsWith(".json") && !f.includes("INVALID"));
const cls = (r) => { const to = (r.to || "").replace(/.*[=/]/, ""); if (/intro$/.test(to)) return "->intro"; if (/used-to$/.test(to)) return "intro->used-to"; if (/now$/.test(to)) return "used-to->now"; return "->glass"; };
console.log("file | pass | transition | n | paint med/p90 | bg ready med/max | intro img med/max | step0 med/p90 | lost");
for (const f of files.sort()) {
  const rows = JSON.parse(readFileSync("results/" + f));
  for (const pass of ["cold", "warm"]) for (const c of ["->intro", "intro->used-to", "used-to->now", "->glass"]) {
    const sel = rows.filter((r) => r.pass === pass && cls(r) === c && r.swapMs != null);
    const lost = rows.filter((r) => r.pass === pass && r.swapMs == null).length;
    if (!sel.length) continue;
    console.log(`${f.replace(/^nav-|\.json$/g, "")} | ${pass} | ${c} | ${sel.length} | ${med(sel.map((r) => r.paintMs))}/${p90(sel.map((r) => r.paintMs))} | ${med(sel.map((r) => r.bgReadyMs))}/${Math.max(...sel.map((r) => r.bgReadyMs ?? 0))} | ${c === "->intro" ? med(sel.map((r) => r.introImgReadyMs)) + "/" + Math.max(...sel.map((r) => r.introImgReadyMs ?? 0)) : "-"} | ${c.includes("used-to") || c.includes("now") ? med(sel.map((r) => r.frameStep0Ms)) + "/" + p90(sel.map((r) => r.frameStep0Ms)) : "-"} | ${c === "->intro" ? lost : ""}`);
  }
}

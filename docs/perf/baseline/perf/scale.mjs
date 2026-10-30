// When does the stage get its correct scale on a viewport that is not 1920x1080? (SSR paints scale 1.)
import { launch, P } from "./lib.mjs";
const HOOK = `(() => {
  const w = window; w.__scale = [];
  const tick = () => {
    const c = document.querySelector('.stage__canvas');
    if (c) {
      const s = getComputedStyle(c.parentElement).getPropertyValue('--stage-scale');
      const last = w.__scale[w.__scale.length - 1];
      if (!last || last.s !== s) w.__scale.push({ t: Math.round(performance.now()), s });
    }
    if (performance.now() < 4000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') w.__fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
})();`;
const b = await launch();
for (const vp of [{ width: 1440, height: 900, deviceScaleFactor: 2 }, { width: 1280, height: 720, deviceScaleFactor: 1 }]) {
  for (const url of ["/s/title", "/s/d1-now"]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor });
    await ctx.addInitScript(HOOK);
    const page = await ctx.newPage();
    await page.goto(P + url, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({ fcp: Math.round(window.__fcp), scale: window.__scale }));
    console.log(`${vp.width}x${vp.height}@${vp.deviceScaleFactor} ${url} fcp=${r.fcp} scale timeline=${JSON.stringify(r.scale)}`);
    await ctx.close();
  }
}
await b.close();

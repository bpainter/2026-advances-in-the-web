// Instrumentation for the M2 used-to build (not shown, and outside the meter's
// folder). The server sends the first photos with their sources held back
// (render.ts), the stand-in for a slow network: the room sees the unplaced
// stack, then `loadPhotos` releases the photos one by one and the build's own
// script lays them out once all have loaded (still-in-motion-demos.md 5).

function loadPhotos(opts) {
  const held = [...document.querySelectorAll("#t-wall img[data-held-src]")];
  const instant = Boolean(opts && opts.instant);
  return new Promise((resolve) => {
    held.forEach((img, i) => {
      const release = () => {
        img.src = img.dataset.heldSrc;
        img.removeAttribute("data-held-src");
        img.removeAttribute("style");
        if (i === held.length - 1) resolve();
      };
      if (instant) release();
      else setTimeout(release, 30 * i);
    });
    if (!held.length) resolve();
  });
}

// scrollPhotos: once the new photos have loaded and the wall is laid out again, scrolls the photo
// pane to its end, so the room sees where Show more put them (review r6 motion H2). Instant on
// replay.
async function scrollPhotos(opts) {
  const pane = document.querySelector(".photos");
  const until = performance.now() + 2000;
  const ready = () => [...pane.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth);
  while (!ready() && performance.now() < until) await new Promise((r) => setTimeout(r, 20));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const top = pane.scrollHeight - pane.clientHeight;
  pane.scrollTo({ top, behavior: opts && opts.instant ? "instant" : "smooth" });
}

window.demoHooks = { reset() {}, loadPhotos, scrollPhotos };

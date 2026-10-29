// Instrumentation for the M2 now build (not shown). Plan B for the talk
// (still-in-motion-demos.md 5): when the talk laptop's Chrome cannot render
// Grid Lanes, `showSafari` lays a capture of the same steps, recorded in
// Safari (WebKit) by `pnpm walk m2 --browser=webkit --capture`, over the live
// wall. It picks the still that matches the frame's state (styles off, lanes
// on, Show more pressed, the wall narrowed) and follows later steps.

const section = document.querySelector(".photos");
const wall = document.querySelector("#wall");

const capture = document.createElement("figure");
capture.id = "safari-capture";
capture.className = "safari-capture";
capture.hidden = true;
const still = document.createElement("img");
still.alt = "";
const label = document.createElement("figcaption");
label.textContent = "Recorded in Safari";
capture.append(still, label);

function lanesOn() {
  // The enhancement is the @supports blocks; the runtime removes them while styles are off.
  for (const sheet of document.styleSheets) {
    if (!sheet.href || !sheet.href.endsWith("/wall.css")) continue;
    try {
      return [...sheet.cssRules].some((r) => r instanceof CSSSupportsRule);
    } catch {
      return true;
    }
  }
  return true;
}

function stepNow() {
  if (!lanesOn()) return "s0";
  if (wall.children.length <= 12) return "s1";
  return wall.style.inlineSize ? "s3" : "s2";
}

let timer = null;
function sync() {
  const src = `/posters/m2-safari/${stepNow()}.png`;
  if (!still.src.endsWith(src)) {
    still.src = src;
    still.alt = `The same wall in Safari at this step.`;
  }
}

function showSafari() {
  if (!capture.isConnected) section.append(capture);
  capture.hidden = false;
  sync();
  if (!timer) timer = setInterval(sync, 150);
}

// scrollPhotos: once the new photos have loaded, scrolls the photo pane to its end, so the room
// sees the six new photos land in the short lanes (review r6 motion H2). Instant on replay.
async function scrollPhotos(opts) {
  // Plan B: the Safari stills cover the pane's first screen, so the pane stays put.
  if (capture.isConnected && !capture.hidden) return;
  const until = performance.now() + 2000;
  const ready = () => [...section.querySelectorAll("#wall img")].every((img) => img.complete && img.naturalWidth);
  while (!ready() && performance.now() < until) await new Promise((r) => setTimeout(r, 20));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const top = section.scrollHeight - section.clientHeight;
  section.scrollTo({ top, behavior: opts && opts.instant ? "instant" : "smooth" });
}

window.demoHooks = { reset() {}, showSafari, scrollPhotos };

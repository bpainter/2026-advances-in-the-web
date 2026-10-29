// Instrumentation for both M3 builds (unshown). The engine remounts a fresh document on reset.
//   loadApp: shows the pricing app (the iframe, or <pricing-app>) once its content is ready.
//   addTier: presses "Add tier" inside the app: in the iframe's document (same origin), in the
//     app's open shadow root, or in the fallback iframe inside <pricing-app>.
//   blurField: takes focus off the typed-into price field, so its focus ring does not double the
//     spotlight on it (review r6 motion M7).

function host() {
  return document.querySelector("#pricing-app, #t-app-frame");
}

function appRoot() {
  const el = host();
  if (el.tagName === "IFRAME") return el.contentDocument;
  return el.shadowRoot ?? el.querySelector("iframe")?.contentDocument ?? null;
}

function frames(n) {
  return new Promise((resolve) => {
    const step = (left) => (left ? requestAnimationFrame(() => step(left - 1)) : resolve());
    step(n);
  });
}

async function ready() {
  const until = performance.now() + 500;
  while (performance.now() < until) {
    if (appRoot()?.querySelector(".add-tier")) return frames(2);
    await new Promise((r) => setTimeout(r, 20));
  }
}

window.demoHooks = {
  reset() {},
  async loadApp() {
    host().hidden = false;
    await ready();
  },
  async addTier() {
    appRoot().querySelector(".add-tier").click();
    await frames(2);
  },
  async blurField() {
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    await frames(2);
  },
};

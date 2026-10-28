// The page: three slots, each telling the
// same card how to look through props. The
// merchandising slot's promo variant reads
// the viewport in CSS, and the search-grid
// card measures itself with a
// ResizeObserver.

import {
  renderCard,
  syncLayout,
  syncAllLayouts,
} from "./card.js";
// prettier-ignore
import {
  observeCard,
} from "./resize-classes.js";

const product = {
  name: "Ridgeline Trail",
  price: "$129",
  sku: "RT-129",
  image: "shoe.avif",
  alt: "Black trail shoe",
  stockMessage: "Only 3 left",
};

// Layout knowledge lives here, per slot.
const slots = [
  { id: "t-grid", variant: "default" },
  { id: "t-rail", variant: "compact" },
  { id: "t-merch", variant: "promo" },
];

function mount() {
  for (const slot of slots) {
    const host = document.getElementById(
      slot.id,
    );
    host.replaceChildren(
      renderCard(product, {
        variant: slot.variant,
        lowStock: true,
      }),
    );
  }
  syncAllLayouts();
  observeCard(
    document.querySelector(
      "#t-grid .c-product-card",
    ),
    syncLayout,
  );
}

mount();

// Frame hooks. The engine remounts a fresh
// document on reset, so there is nothing to
// clear. setViewportWidth asks the
// presenter to resize the iframe itself
// (the runtime's resize-viewport message),
// so the promo variant's viewport media
// query really fires; it resolves once the
// document has the new width.
const presenterOrigin =
  document.querySelector(
    'meta[name="presenter-origin"]',
  )?.content;
const embedded =
  window.parent !== window &&
  Boolean(presenterOrigin);

function postViewport(px, ms) {
  window.parent.postMessage(
    {
      v: 2,
      type: "resize-viewport",
      frameId: null,
      inlineSize: `${px}px`,
      ms,
    },
    presenterOrigin,
  );
}

// The presenter keeps the frame at the last
// width a hook asked for, even across
// remounts, so a fresh document first
// restores the width this page is authored
// for (a remount is the engine's reset
// point).
const AUTHORED_WIDTH = 640;
if (embedded)
  postViewport(AUTHORED_WIDTH, 0);

function setViewportWidth(
  px,
  { instant = false } = {},
) {
  const root = document.documentElement;
  root.dataset.viewportWidth = String(px);
  if (!embedded) return undefined;
  const ms = instant ? 0 : 560;
  postViewport(px, ms);
  return new Promise((resolve) => {
    const timer = setTimeout(
      finish,
      ms + 40,
    );
    function finish() {
      clearTimeout(timer);
      window.removeEventListener(
        "resize",
        check,
      );
      syncAllLayouts();
      resolve();
    }
    function check() {
      if (window.innerWidth === px)
        finish();
    }
    window.addEventListener(
      "resize",
      check,
    );
    check();
  });
}

function reset() {}

window.demoHooks = {
  reset,
  setViewportWidth,
};

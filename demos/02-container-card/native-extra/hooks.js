// Instrumentation for the native build (not shown on the code page). The
// frames declare reset, setViewportWidth, setProductName, setTextScale and
// setStock. The engine remounts a fresh document on reset, so reset has
// nothing to clear. Nothing here touches layout: the card's layout is CSS.

const presenterOrigin = document.querySelector('meta[name="presenter-origin"]')?.content;
const embedded = window.parent !== window && Boolean(presenterOrigin);

function card() {
  return document.querySelector(".product-card");
}

// Asks the presenter to resize the iframe itself (the runtime's
// resize-viewport message), so the page width really changes while the
// slot keeps its size; resolves once the document has the new width.
function setViewportWidth(px, { instant = false } = {}) {
  document.documentElement.dataset.viewportWidth = String(px);
  if (!embedded) return undefined;
  const ms = instant ? 0 : 560;
  window.parent.postMessage(
    { v: 1, type: "resize-viewport", frameId: null, inlineSize: `${px}px`, ms },
    presenterOrigin,
  );
  return new Promise((resolve) => {
    const timer = setTimeout(finish, ms + 40);
    function finish() {
      clearTimeout(timer);
      window.removeEventListener("resize", check);
      resolve();
    }
    function check() {
      if (window.innerWidth === px) finish();
    }
    window.addEventListener("resize", check);
    check();
  });
}

function setProductName(text) {
  card().querySelector(".name").textContent = text;
}

// Root font-size as a percentage: 1.5 is the browser's 150% text setting.
function setTextScale(n) {
  document.documentElement.style.fontSize = `${n * 100}%`;
}

// The low-stock message is server-rendered content; removing it is what an
// in-stock response would do. The element is kept so it can be put back.
const stockMessage = card().querySelector(".stock");

function setStock(show) {
  const current = card().querySelector(".stock");
  if (show && !current) card().insertBefore(stockMessage, card().querySelector("form"));
  if (!show && current) current.remove();
}

function reset() {}

window.demoHooks = { reset, setViewportWidth, setProductName, setTextScale, setStock };

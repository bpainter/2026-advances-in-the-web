// The merchandising team's tiered pricing app (unshown; still-in-motion-demos.md 6). Both builds
// run it: inside the iframe on the used-to page, and inside <pricing-app>'s shadow root on the now
// page. It writes <ridge-price-field> markup and lets its container's registry decide which
// version that is. The shown code is only what differs: the bridge, or the registry.

const TIERS = [
  { label: "1 to 9 units", off: 0 },
  { label: "10 to 49 units", off: 5 },
  { label: "50 to 99 units", off: 10 },
  { label: "100 or more units", off: 15 },
  { label: "250 or more units", off: 20 },
];

const CSS = new URL("tiers.css", import.meta.url).href;
const price = (base, off) => (base * (1 - off / 100)).toFixed(2);

export class Tiers {
  constructor(root, base) {
    this.root = root;
    this.base = base;
    this.count = 3;
    root.innerHTML = `<link rel="stylesheet" href="${CSS}"><section class="tiers" aria-label="Tiered pricing"><header class="tiers__head"><h3 class="tiers__title">Tiered pricing</h3><span class="tiers__by">Merchandising app</span></header><p class="tiers__base"></p><ol class="tiers__list"></ol><button type="button" class="add-tier">Add tier</button></section>`;
    this.list = root.querySelector(".tiers__list");
    this.baseEl = root.querySelector(".tiers__base");
    root.querySelector(".add-tier").addEventListener("click", () => this.addTier());
    for (let i = 0; i < this.count; i++) this.row(i);
    this.setBase(base);
  }

  row(i) {
    const t = TIERS[i];
    this.list.insertAdjacentHTML("beforeend", `<li class="tiers__row"><ridge-price-field label="${t.label}" data-off="${t.off}"></ridge-price-field></li>`);
  }

  addTier() {
    if (this.count >= TIERS.length) return;
    this.row(this.count++);
    this.setBase(this.base);
  }

  setBase(base) {
    this.base = Number(base) || 0;
    this.baseEl.textContent = `From base price $${this.base}`;
    for (const f of this.list.querySelectorAll("ridge-price-field")) f.setAttribute("value", price(this.base, Number(f.dataset.off)));
  }
}

/**
 * The fallback for browsers without scoped registries (spec 6, Fallback): the iframe build of the
 * used-to page, with the editor side of its bridge. The app works, at the iframe's fixed height.
 */
export function frameFallback(host) {
  const frame = document.createElement("iframe");
  frame.className = "app-frame";
  frame.title = "Tiered pricing";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
  frame.src = "/demos/14-scoped-registries/today/app.html";
  let base = Number(host.getAttribute("base")) || 0;
  const send = () => frame.contentWindow?.postMessage({ type: "base-price", value: base }, location.origin);
  document.addEventListener("price-change", (e) => {
    base = e.detail.value;
    send();
  });
  window.addEventListener("message", (e) => {
    if (e.origin === location.origin && e.source === frame.contentWindow && e.data?.type === "ready") send();
  });
  host.replaceChildren(frame);
}

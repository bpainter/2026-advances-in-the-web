// The app side of the bridge, inside the
// iframe. Version 3 has its own document,
// so its price field can take the name.
import PriceField from "./ridge-ui-v3.js";
import { Tiers } from "./tiers.js";

customElements.define(
  "ridge-price-field",
  PriceField,
);
const tiers = new Tiers(
  document.querySelector("#app"),
  0,
);

window.addEventListener(
  "message",
  (event) => {
    if (event.origin !== location.origin)
      return;
    if (event.source !== parent) return;
    if (event.data?.type === "base-price") {
      tiers.setBase(event.data.value);
    }
  },
);

parent.postMessage(
  { type: "ready" },
  location.origin,
);

import PriceField from "./ridge-ui-v3.js";
import { Tiers, frameFallback }
  from "./tiers.js";

class PricingApp extends HTMLElement {
  connectedCallback() {
    let registry;
    try {
      // A registry of the app's own.
      registry =
        new CustomElementRegistry();
    } catch {
      // Older browsers: the iframe build.
      return frameFallback(this);
    }
    registry.define(
      "ridge-price-field", PriceField);

    // Its shadow root uses that registry,
    // so its price fields are version 3.
    const root = this.attachShadow({
      mode: "open",
      customElementRegistry: registry,
    });
    const base = this.getAttribute("base");
    const tiers = new Tiers(root, base);

    // The editor's v2 field fires a normal
    // DOM event. The app hears it here.
    document.addEventListener(
      "price-change",
      (e) => tiers.setBase(e.detail.value));
  }
}

customElements.define(
  "pricing-app", PricingApp);

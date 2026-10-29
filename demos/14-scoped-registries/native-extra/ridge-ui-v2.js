// Ridge UI 2: the design system the product editor is built on (unshown; still-in-motion-demos.md
// 6). Its price field renders in light DOM, so the walk's `type` action reaches its input. It
// defines itself in the global registry, the way design systems usually ship.
//
// The field selects its text on focus, like most price fields, so typing replaces the price.

class PriceField extends HTMLElement {
  connectedCallback() {
    if (this.input) return;
    const label = document.createElement("label");
    label.className = "ridge2-field";
    const name = document.createElement("span");
    name.className = "ridge2-field__label";
    name.textContent = this.getAttribute("label") ?? "Price";
    const control = document.createElement("span");
    control.className = "ridge2-field__control";
    const prefix = document.createElement("span");
    prefix.className = "ridge2-field__prefix";
    prefix.setAttribute("aria-hidden", "true");
    prefix.textContent = "$";
    const input = document.createElement("input");
    input.className = "ridge2-field__input";
    input.inputMode = "decimal";
    input.value = this.getAttribute("value") ?? "";
    input.addEventListener("focus", () => input.select());
    input.addEventListener("beforeinput", () => {
      const all = input.value && input.selectionStart === 0 && input.selectionEnd === input.value.length;
      if (all) input.value = "";
    });
    input.addEventListener("input", () => {
      this.dispatchEvent(new CustomEvent("price-change", { bubbles: true, composed: true, detail: { value: this.value } }));
    });
    control.append(prefix, input);
    label.append(name, control);
    this.append(label);
    this.input = input;
  }

  get value() {
    return Number(this.input ? this.input.value : this.getAttribute("value")) || 0;
  }
}

customElements.define("ridge-price-field", PriceField);

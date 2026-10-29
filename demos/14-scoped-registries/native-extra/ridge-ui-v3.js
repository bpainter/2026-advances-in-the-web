// Ridge UI 3 (unshown; still-in-motion-demos.md 6). Its price field has the same tag name as
// version 2, renders in a shadow root and shows a currency chip and a "v3" badge, so the room can
// tell the versions apart. It exports the class and never defines itself: the app picks the
// registry.

const sheet = `
:host { display: block; }
label { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 4px 10px; }
.name { color: var(--glass-ink, #0f1c41); font: 400 15px/20px var(--glass-font, sans-serif); }
.field { display: flex; align-items: center; gap: 6px; padding: 3px 4px 3px 8px; border: 1px solid var(--glass-field-border, #8a93ad); border-radius: 8px; background: var(--white, #fff); }
.chip { padding: 1px 6px; border-radius: 999px; background: var(--navy, #0f1c41); color: var(--white, #fff); font: 700 12px/16px var(--glass-font, sans-serif); }
input { inline-size: 6.5ch; border: 0; padding: 2px 4px; background: transparent; color: var(--glass-ink, #0f1c41); font: 700 15px/20px var(--glass-font, sans-serif); text-align: end; }
input:focus-visible { outline: 2px solid var(--slalom-blue, #0c62fb); border-radius: 4px; }
.badge { padding: 0 6px; border: 1px solid var(--slalom-blue, #0c62fb); border-radius: 999px; color: var(--glass-link, #002faf); font: 700 12px/16px var(--glass-font, sans-serif); }
`;

export class PriceField extends HTMLElement {
  static observedAttributes = ["value", "label"];

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = sheet;
    const label = document.createElement("label");
    this.nameEl = document.createElement("span");
    this.nameEl.className = "name";
    const field = document.createElement("span");
    field.className = "field";
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "CAD";
    this.input = document.createElement("input");
    this.input.readOnly = true;
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "v3";
    field.append(chip, this.input, badge);
    label.append(this.nameEl, field);
    root.append(style, label);
  }

  connectedCallback() {
    this.attributeChangedCallback();
  }

  attributeChangedCallback() {
    this.nameEl.textContent = this.getAttribute("label") ?? "Price";
    this.input.value = this.getAttribute("value") ?? "";
  }
}

export default PriceField;

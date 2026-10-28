// The product editor: one hand-rolled
// combobox for the color, posted with the
// form through its hidden input.

// prettier-ignore
import {
  createCombobox,
} from "./combobox.js";

const form = document.querySelector(
  "#t-variant",
);
const status =
  document.querySelector("#t-status");

const combo = createCombobox(
  document.querySelector("#t-color"),
  document.querySelector("#t-color-list"),
  document.querySelector("#t-color-input"),
  [
    { value: "black", label: "Black" },
    { value: "moss", label: "Moss" },
    { value: "sand", label: "Sand" },
  ],
);

form.addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
    });
    status.textContent = await res.text();
  },
);

window.demoHooks = {
  reset() {
    combo.close();
  },
};

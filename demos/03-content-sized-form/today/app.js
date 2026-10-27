// The support form: wires the sizing scripts to the two fields, replaces the
// browser's validation bubbles with messages under the fields, submits in
// place and resets afterwards.

import { createInputWidth } from "./input-width.js";
import { autosize } from "./autosize.js";

const form = document.querySelector("#t-form");
const subject = document.querySelector("#t-subject");
const details = document.querySelector("#t-details");
const status = document.querySelector("#t-status");
const fields = [subject, details];

createInputWidth(subject, document.querySelector("#t-mirror"));
autosize(details, { minRows: 6, maxRows: 18 });

// Validation messages: shown under the field instead of the browser's bubble.
function setError(field, text) {
  const message = document.getElementById(`${field.id}-error`);
  message.textContent = text;
  message.hidden = !text;
  if (text) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
}

for (const field of fields) {
  field.addEventListener("invalid", (event) => {
    event.preventDefault();
    setError(field, field.validationMessage);
  });
  field.addEventListener("input", () => {
    if (field.validity.valid) setError(field, "");
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) return form.querySelector(":invalid").focus();
  const res = await fetch(form.action, {
    method: "POST",
    body: new FormData(form),
  });
  if (!res.ok) return;
  form.reset();
  status.textContent = "Case opened.";
});

// Reset handler: the messages are not form state, so reset leaves them alone.
form.addEventListener("reset", () => fields.forEach((f) => setError(f, "")));

// The scriptless submit comes back here with a confirmation in the address.
if (new URLSearchParams(location.search).has("submitted")) {
  status.textContent = "Case opened.";
}

// Frame hooks: the engine remounts the document on reset, so `reset` only
// clears the status line; `formReset` resets the form and resolves once the
// deferred measurements have run.
function settled() {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

window.demoHooks = {
  reset() {
    status.textContent = "";
  },
  formReset() {
    form.reset();
    return settled();
  },
};

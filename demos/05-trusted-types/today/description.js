// The product description: the first CMS
// field on the page, written with the
// helper in mind.

import { sanitize } from "./sanitize.js";

const description = document.querySelector(
  "#t-description",
);

export function renderDescription(body) {
  description.innerHTML = sanitize(body);
  description.removeAttribute("aria-busy");
}

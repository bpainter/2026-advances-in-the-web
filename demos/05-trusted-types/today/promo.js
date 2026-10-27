// The promotion slot takes marketing markup straight from the CMS through the
// framework's escape hatch (think dangerouslySetInnerHTML), here spelled
// insertAdjacentHTML.

const promo = document.querySelector("#t-promo");

export function renderPromo(markup) {
  promo.insertAdjacentHTML("beforeend", markup);
}

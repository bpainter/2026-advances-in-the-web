// A single-page store. The router takes
// over links, fetches the product and
// renders it in place.
import { flip } from "./flip.js";

const $ = (s) => document.querySelector(s);
const grid = $("#t-grid-view");
const page = $("#t-product-view");
const hero = $("#t-hero");
const title = $("#t-title");
let current = null;

document.addEventListener("click", (e) => {
  const link = e.target.closest(
    "[data-route]",
  );
  if (!link) return;
  e.preventDefault();
  const url = new URL(link.href);
  const id =
    url.searchParams.get("product");
  history.pushState({ id }, "", url);
  render(id);
});

window.addEventListener("popstate", (e) => {
  render(e.state?.id ?? null);
});

function render(id) {
  return id ? showProduct(id) : showGrid();
}

async function showProduct(id) {
  const photo = $(`#t-card-${id} img`);
  const first =
    photo.getBoundingClientRect();
  const res = await fetch(
    `api/products/${id}`,
  );
  const product = await res.json();
  hero.src = product.photo;
  hero.alt = product.alt;
  title.textContent = product.name;
  $("#t-price").textContent = product.price;
  $("#t-blurb").textContent = product.blurb;
  grid.hidden = true;
  page.hidden = false;
  document.title = product.name;
  title.focus();
  flip(first, hero);
  current = id;
}

function showGrid() {
  const first =
    hero.getBoundingClientRect();
  page.hidden = true;
  grid.hidden = false;
  document.title = "Trail gear";
  const card = $(`#t-card-${current}`);
  if (card) {
    card.focus();
    flip(first, card.querySelector("img"));
  }
  current = null;
}

// Everything startViewTransition and the Navigation
// API now do for us: measure, mutate, invert, play,
// a hand-made detail swap and the router around it.
const shoes = [
  { id: 1, name: "Trail Runner 2", price: 140 },
  { id: 2, name: "Road Racer", price: 190 },
  { id: 3, name: "Ridge Hiker", price: 160 },
  { id: 4, name: "Camp Slide", price: 60 },
];
const view = document.querySelector("#view");
const byPrice = document.querySelector("#sort");
const byName = document.querySelector("#name");
const orders = {
  desc: (a, b) => b.price - a.price,
  asc: (a, b) => a.price - b.price,
  name: (a, b) => a.name.localeCompare(b.name),
};
let order = "desc";
const reduced = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const timing = {
  duration: reduced ? 100 : 350,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

// Each element carries its id so we can find it again.
const card = (s) => `
  <a href="?id=${s.id}" class="product"
    data-id="${s.id}">
    <div class="hero"></div>
    <h2>${s.name}</h2>
    <p>$${s.price}</p>
  </a>`;

const detail = (s) => `
  <article class="detail" data-id="${s.id}">
    <div class="hero"></div>
    <h2>${s.name}</h2>
    <p>$${s.price}</p>
    <button class="btn">Add to bag</button>
  </article>`;

function render(url) {
  const id = new URL(url).searchParams.get("id");
  const shoe = shoes.find((s) => s.id == id);
  view.innerHTML = shoe
    ? detail(shoe)
    : shoes.map(card).join("");
}

// First: measure every box before the change.
function measure() {
  const first = new Map();
  for (const el of view.children) {
    first.set(
      el.dataset.id,
      el.getBoundingClientRect(),
    );
  }
  return first;
}

// Last, Invert, Play: find the new box, start the
// element back where it was, animate it into place.
function play(el, a) {
  const b = el.getBoundingClientRect();
  if (!a) {
    el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      timing,
    );
    return;
  }
  const dx = a.left - b.left;
  const dy = a.top - b.top;
  const sx = a.width / b.width;
  const sy = a.height / b.height;
  if (!dx && !dy && sx === 1 && sy === 1) return;
  el.animate(
    [
      {
        transform:
          `translate(${dx}px, ${dy}px) ` +
          `scale(${sx}, ${sy})`,
      },
      { transform: "none" },
    ],
    timing,
  );
}

function flip(mutate) {
  const first = measure();
  mutate();
  for (const el of view.children) {
    play(el, first.get(el.dataset.id));
  }
}

function setOrder(next) {
  order = next;
  shoes.sort(orders[next]);
  byPrice.textContent =
    next === "asc" ? "Price ↑" : "Price ↓";
}

function sortBy(next) {
  setOrder(next);
  flip(() => render(location.href));
}

byPrice.addEventListener("click", () =>
  sortBy(order === "desc" ? "asc" : "desc"),
);
byName.addEventListener("click", () => sortBy("name"));

// The router: catch every in-page link, push the URL,
// swap the view by hand, and do it again on Back.
function go(url) {
  history.pushState(null, "", url);
  flip(() => render(location.href));
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='?']");
  if (!a) return;
  e.preventDefault();
  go(a.getAttribute("href"));
});

window.addEventListener("popstate", () => {
  flip(() => render(location.href));
});

render(location.href);

// Stage hook: same state names as the native version.
let last = "";
let timer = 0;

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  const again = state === last;
  last = state;
  clearTimeout(timer);
  const open = location.search.includes("id=");
  if (state === "detail") {
    if (!open) go("?id=2");
    return;
  }
  if (state === "double" && again) return;
  const next =
    state === "names"
      ? "name"
      : state === "double"
        ? "desc"
        : "asc";
  if (open) {
    setOrder(next);
    go("?");
  } else if (next !== order) {
    sortBy(next);
  }
  if (state === "double") {
    timer = setTimeout(() => sortBy("asc"), 150);
  }
});

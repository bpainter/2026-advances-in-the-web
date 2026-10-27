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

// Each card keeps one name across both states.
const card = (s) => `
  <a href="?id=${s.id}" class="product"
    style="view-transition-name: shoe-${s.id}">
    <div class="hero"></div>
    <h2>${s.name}</h2>
    <p>$${s.price}</p>
  </a>`;

const detail = (s) => `
  <article class="detail"
    style="view-transition-name: shoe-${s.id}">
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

function setOrder(next) {
  order = next;
  shoes.sort(orders[next]);
  byPrice.textContent =
    next === "asc" ? "Price ↑" : "Price ↓";
}

// Firefox and Safari report a skipped transition's
// ready promise as uncaught, so mute it here.
function transition(update) {
  const t = document.startViewTransition(update);
  t.ready.catch(() => {});
  return t;
}

// One line: wrap the DOM change in a view transition.
function sortBy(next) {
  setOrder(next);
  transition(() => render(location.href));
}

byPrice.addEventListener("click", () =>
  sortBy(order === "desc" ? "asc" : "desc"),
);
byName.addEventListener("click", () => sortBy("name"));

// The router: intercept the link, same transition.
window.navigation?.addEventListener("navigate", (e) => {
  if (!e.canIntercept || e.hashChange) return;
  e.intercept({
    handler: () =>
      transition(() => render(e.destination.url))
        .finished,
  });
});

render(location.href);

// Stage hook: the slide's steps post a state and the
// same sorts and navigations run without a click.
let last = "";
let timer = 0;

function go(url) {
  if (!window.navigation) {
    history.pushState(null, "", url);
    sortBy(order);
    return;
  }
  const nav = navigation.navigate(url);
  nav.committed.catch(() => {});
  nav.finished.catch(() => {});
}

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

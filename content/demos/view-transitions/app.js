const shoes = [
  { id: 1, name: "Trail Runner 2", price: 140 },
  { id: 2, name: "Road Racer", price: 190 },
  { id: 3, name: "Ridge Hiker", price: 160 },
  { id: 4, name: "Camp Slide", price: 60 },
];
const view = document.querySelector("#view");
const sort = document.querySelector("#sort");
let asc = false;

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

// One line: wrap the DOM change in a view transition.
sort.addEventListener("click", () => {
  asc = !asc;
  shoes.sort((a, b) =>
    asc ? a.price - b.price : b.price - a.price,
  );
  sort.textContent = asc ? "Price ↑" : "Price ↓";
  document.startViewTransition(() =>
    render(location.href),
  );
});

// The router: intercept the link, same transition.
window.navigation?.addEventListener("navigate", (e) => {
  if (!e.canIntercept || e.hashChange) return;
  e.intercept({
    handler: () =>
      document.startViewTransition(() =>
        render(e.destination.url),
      ).finished,
  });
});

render(location.href);

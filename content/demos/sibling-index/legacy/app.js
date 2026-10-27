// Everything sibling-index() now does for free.
const grid = document.querySelector(".grid");
const more = document.querySelector("#more");
const sort = document.querySelector("#sort");
const first = document.querySelector(".product");

// The loop: write every card's delay inline, and run it
// again after anything touches the grid.
function stagger() {
  const items = grid.querySelectorAll(".product");
  items.forEach((card, i) => {
    card.style.animationDelay = `${i * 60}ms`;
  });
}
stagger();

// Replaying the entrance: clear, reflow, animate again.
function replay() {
  for (const card of grid.children) {
    card.style.animation = "none";
  }
  void grid.offsetHeight;
  for (const card of grid.children) {
    card.style.animation = "";
  }
  stagger();
}

// A new card copies the first one's delay, so renumber.
more.addEventListener("click", () => {
  const card = first.cloneNode(true);
  card.classList.add("added");
  card.querySelector("h2").textContent =
    "Alpine Gaiter";
  card.querySelector("p").textContent = "$45";
  card.dataset.date = "2026-10-20";
  grid.append(card);
  stagger();
});

const featured = [...grid.children];
const byDate = (a, b) =>
  b.dataset.date.localeCompare(a.dataset.date);
const byRank = (a, b) =>
  featured.indexOf(a) - featured.indexOf(b);

sort.addEventListener("change", () => {
  const items = [...grid.children];
  items.sort(sort.value === "date" ? byDate : byRank);
  grid.append(...items);
  replay();
});

// Someone else changed the grid? Count again.
new MutationObserver(stagger).observe(grid, {
  childList: true,
});

// Stage hook: the slide's steps drive the same states.
let current = "";

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state === current) return;
  current = state;
  if (state === "more") {
    if (!grid.querySelector(".added")) more.click();
    return;
  }
  grid.querySelector(".added")?.remove();
  sort.value = state === "date" ? "date" : "featured";
  sort.dispatchEvent(new Event("change"));
});

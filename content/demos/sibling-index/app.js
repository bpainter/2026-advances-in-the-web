// A new card gets its delay from where it lands.
const grid = document.querySelector(".grid");
const more = document.querySelector("#more");
const sort = document.querySelector("#sort");
const first = document.querySelector(".product");

more.addEventListener("click", () => {
  const card = first.cloneNode(true);
  card.classList.add("added");
  card.querySelector("h2").textContent =
    "Alpine Gaiter";
  card.querySelector("p").textContent = "$45";
  card.dataset.date = "2026-10-20";
  grid.append(card);
});

// Re-sorting re-appends the cards; the index is read
// when each animation starts, so the stagger follows.
const featured = [...grid.children];
const byDate = (a, b) =>
  b.dataset.date.localeCompare(a.dataset.date);
const byRank = (a, b) =>
  featured.indexOf(a) - featured.indexOf(b);

sort.addEventListener("change", () => {
  const items = [...grid.children];
  items.sort(sort.value === "date" ? byDate : byRank);
  grid.append(...items);
});

// Stage hook: the slide's steps replay the entrance,
// sort and load more with no pointer on stage.
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

// A new card gets its delay from where it lands.
const grid = document.querySelector(".grid");
const more = document.querySelector("#more");
const first = document.querySelector(".product");

more.addEventListener("click", () => {
  const card = first.cloneNode(true);
  card.querySelector("h2").textContent =
    "Alpine Gaiter";
  card.querySelector("p").textContent = "$45";
  grid.append(card);
});

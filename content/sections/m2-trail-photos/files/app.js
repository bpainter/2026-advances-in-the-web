// Show more: fetch six photos as HTML and
// add them to the end of the wall.
const wall =
  document.querySelector("#wall");
const more =
  document.querySelector("#more");

more.addEventListener("click", async () => {
  const from = wall.children.length;
  const res = await fetch(
    `photos?from=${from}`,
  );
  wall.insertAdjacentHTML(
    "beforeend",
    await res.text(),
  );
});

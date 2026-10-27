// The only script: the picker sets one custom property.
const root = document.documentElement;
const brand = document.querySelector("#brand");

brand.addEventListener("input", () => {
  root.style.setProperty("--accent", brand.value);
});

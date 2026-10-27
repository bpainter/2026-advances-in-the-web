// Stage hook: the slide's steps type, paste and point
// so the box grows with no keyboard on stage.
const box = document.querySelector("#review");
const size = document.querySelector(".size");
const LINES = [
  "Fits true to size.",
  "Grippy on wet rock.",
  "Laces run long.",
].join("\n");
const REVIEW = [
  "Took them out on a muddy 20 km loop the day",
  "they arrived. The upper drains fast, the lugs",
  "bite on wet roots and the heel never slipped.",
  "The laces are long and the tongue is thin, but",
  "after three runs the fit is dialled in and I",
  "would buy them again.",
].join(" ");
let timer = 0;
let current = "";

function put(value) {
  box.value = value;
  box.dispatchEvent(
    new Event("input", { bubbles: true }),
  );
}

// One character every 30 ms; a new state cancels it.
function type(text) {
  let i = 0;
  put("");
  timer = setInterval(() => {
    put(text.slice(0, ++i));
    if (i >= text.length) clearInterval(timer);
  }, 30);
}

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state === current) return;
  current = state;
  clearInterval(timer);
  size.value = "11 wide";
  if (state === "typed") type(LINES);
  if (state === "pasted" || state === "grip")
    put(REVIEW);
});

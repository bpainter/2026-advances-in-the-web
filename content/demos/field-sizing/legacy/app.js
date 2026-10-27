// Everything field-sizing: content now does for free.
const box = document.querySelector("#review");
const size = document.querySelector(".size");
const measure = document.querySelector(".measure");
const LINE = parseFloat(
  getComputedStyle(box).lineHeight,
);
const PAD = 18; // padding and border, top plus bottom
const MAX = 5 * LINE + PAD;

// Autosize: reset, read scrollHeight, write it back.
function grow() {
  box.style.height = "auto";
  const h = Math.min(box.scrollHeight + 2, MAX);
  box.style.height = `${h}px`;
  box.style.overflowY = h < MAX ? "hidden" : "auto";
}
box.addEventListener("input", grow);
window.addEventListener("resize", grow);
grow();

// The select: measure the chosen option in a span.
function fit() {
  const chosen = size.options[size.selectedIndex];
  measure.textContent = chosen.textContent;
  size.style.width = `${measure.offsetWidth + 22}px`;
}
size.addEventListener("change", fit);
fit();

// Stage hook: the slide's steps type, paste and point.
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
  fit();
  if (state === "typed") type(LINES);
  if (state === "pasted" || state === "grip")
    put(REVIEW);
});

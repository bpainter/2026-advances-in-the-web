// Everything the popover attribute now does for free.
const card = document.querySelector("#card");
const more = document.querySelector(".more");
const menu = document.querySelector("#menu");
const save = document.querySelector(".save");
let open = false;

function position() {
  const b = more.getBoundingClientRect();
  const h = menu.offsetHeight;
  const fits = b.bottom + 6 + h < window.innerHeight;
  menu.style.top = fits
    ? `${b.bottom + 6}px`
    : `${b.top - 6 - h}px`;
  menu.style.left = `${b.right - menu.offsetWidth}px`;
}

function show() {
  open = true;
  menu.hidden = false;
  position();
  menu.classList.add("open");
  more.setAttribute("aria-expanded", "true");
  menu.querySelector("button").focus();
}

function hide(returnFocus) {
  open = false;
  menu.classList.remove("open");
  more.setAttribute("aria-expanded", "false");
  setTimeout(() => (menu.hidden = !open), 140);
  if (returnFocus) more.focus();
}

more.addEventListener("click", () => {
  if (open) hide(true);
  else show();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && open) hide(true);
});

document.addEventListener("pointerdown", (e) => {
  if (!open) return;
  if (menu.contains(e.target)) return;
  if (more.contains(e.target)) return;
  hide(false);
});

window.addEventListener("resize", () => {
  if (open) position();
});

window.addEventListener("scroll", () => {
  if (open) position();
});

save.addEventListener("click", () => {
  card.classList.toggle("saved");
  hide(true);
});

// Stage hook: the slide's steps drive the same states.
document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state === "open" && !open) show();
  if (state !== "open" && open) hide(false);
  card.classList.toggle("saved", state === "saved");
  more.dataset.focus = state === "dismissed";
  if (state === "dismissed") more.focus();
});

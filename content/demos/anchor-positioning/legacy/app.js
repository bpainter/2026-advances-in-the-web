// Everything anchor positioning now does for free.
const ship = document.querySelector(".ship");
const tip = document.querySelector(".tip");
const GAP = 8;
let side = "top";
let open = false;

function place() {
  const a = ship.getBoundingClientRect();
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  const vw = window.innerWidth;
  let top;
  let left;
  if (side === "right") {
    top = a.top;
    left = a.right + GAP;
    // No room on the right? Flip to the left.
    if (left + w > vw) left = a.left - GAP - w;
  } else {
    top = a.top - GAP - h;
    left = a.left + a.width / 2 - w / 2;
    // No room above? Flip below.
    if (top < 0) top = a.bottom + GAP;
  }
  // And keep it inside the viewport either way.
  left = Math.max(8, Math.min(left, vw - w - 8));
  tip.style.top = `${top}px`;
  tip.style.left = `${left}px`;
}

function show() {
  open = true;
  tip.classList.add("open");
  place();
}

function hide() {
  if (document.documentElement.dataset.state) return;
  open = false;
  tip.classList.remove("open");
}

ship.addEventListener("mouseenter", show);
ship.addEventListener("focus", show);
ship.addEventListener("mouseleave", hide);
ship.addEventListener("blur", hide);

// Anything that moves the badge moves the tip.
window.addEventListener("scroll", () => {
  if (open) place();
});
window.addEventListener("resize", () => {
  if (open) place();
});

// Stage hook: the slide's steps drive the same states.
document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  side = state === "right" ? "right" : "top";
  const y =
    state === "edge"
      ? ship.getBoundingClientRect().top +
        window.scrollY -
        20
      : 0;
  window.scrollTo({ top: y, behavior: "smooth" });
  show();
});

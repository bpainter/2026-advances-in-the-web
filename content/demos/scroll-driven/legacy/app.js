// Everything scroll() and view() now do for free.
const bar = document.querySelector(".progress");
const shots = document.querySelectorAll(".shot");
const root = document.scrollingElement;
let max = 0;
let ticking = false;

function measure() {
  max = root.scrollHeight - innerHeight;
}

function paint() {
  ticking = false;
  const p = max > 0 ? root.scrollTop / max : 0;
  bar.style.transform = `scaleX(${Math.min(p, 1)})`;
}

// Throttle to one paint per frame or the bar stutters.
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(paint);
}

addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", () => {
  measure();
  paint();
});
measure();
paint();

// Reveal each image once it is 40% in view, then stop
// watching it: the reveal only ever plays once.
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.intersectionRatio < 0.4) continue;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    }
  },
  { threshold: [0, 0.4] },
);
shots.forEach((shot) => io.observe(shot));

// Stage hook: the slide's steps drive the same states.
const positions = {
  top: () => 0,
  scrolled: () =>
    shots[1].offsetTop - innerHeight + 110,
  end: () => root.scrollHeight,
};

document.addEventListener("demostate", (e) => {
  const at = positions[e.detail.state];
  if (!at) return;
  const reduce = matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  scrollTo({
    top: at(),
    behavior: reduce ? "auto" : "smooth",
  });
});

// Stage hook: the slide's steps post a state and the
// page scrolls itself. The bar and the images still run
// off the scroll position; nothing here touches them.
const shots = document.querySelectorAll(".shot");

const positions = {
  top: () => 0,
  scrolled: () =>
    shots[1].offsetTop - innerHeight + 110,
  end: () => document.scrollingElement.scrollHeight,
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

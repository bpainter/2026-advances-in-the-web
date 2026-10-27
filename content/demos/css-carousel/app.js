// Stage hook: ::scroll-button and ::scroll-marker
// cannot be clicked from script, so each state scrolls
// the scroller itself to the item a press would reach.
// Idempotent: scrolling to where we already are is a
// no-op, and nothing here throws mid-scroll.
const gallery = document.querySelector(".gallery");
const items = gallery.querySelectorAll("li");

function show(index) {
  const li = items[index];
  if (!li) return;
  const reduce = matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const centre = li.offsetLeft + li.offsetWidth / 2;
  gallery.scrollTo({
    left: centre - gallery.clientWidth / 2,
    behavior: reduce ? "auto" : "smooth",
  });
}

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state === "next2") show(2);
  if (state === "dot") show(4);
});

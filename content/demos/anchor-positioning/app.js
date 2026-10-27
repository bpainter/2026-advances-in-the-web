// Stage hook: the slide's steps scroll the page so the
// badge nears the top edge. The flip itself is CSS.
const ship = document.querySelector(".ship");
const html = document.documentElement;
let timer = 0;

function reduced() {
  return (
    html.dataset.reducedMotion === "true" ||
    matchMedia("(prefers-reduced-motion: reduce)")
      .matches
  );
}

// A fallback that fit once is remembered until the box
// is rebuilt, so rebuild the tip once the page is back.
function settle() {
  const tip = document.querySelector(".tip");
  tip.replaceWith(tip.cloneNode(true));
}

document.addEventListener("demostate", (e) => {
  const edge = e.detail.state === "edge";
  const top = edge
    ? ship.getBoundingClientRect().top +
      window.scrollY -
      20
    : 0;
  window.scrollTo({
    top,
    behavior: reduced() ? "auto" : "smooth",
  });
  clearTimeout(timer);
  if (!edge) timer = setTimeout(settle, 600);
});

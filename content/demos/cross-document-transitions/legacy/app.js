// Everything @view-transition now does for free: both
// views in one document, a crossfade and a hero morph
// measured and played by hand.
const views = {
  a: document.querySelector("#list"),
  b: document.querySelector("#detail"),
};
let current = "a";

function heroOf(view) {
  return view.querySelector(".hero");
}

// FLIP: measure the old hero, swap views, measure the
// new hero, then play the difference as a transform.
function go(to) {
  if (!views[to] || to === current) return;
  const from = views[current];
  const next = views[to];
  document.getAnimations().forEach((a) => a.cancel());
  for (const view of Object.values(views)) {
    view.hidden = view !== from;
  }
  const first = heroOf(from).getBoundingClientRect();
  next.hidden = false;
  const hero = heroOf(next);
  const last = hero.getBoundingClientRect();
  const reduce = matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const dur = reduce ? 100 : 500;
  const flip = [
    `translate(${first.left - last.left}px,`,
    `${first.top - last.top}px)`,
    `scale(${first.width / last.width},`,
    `${first.height / last.height})`,
  ].join(" ");
  if (!reduce) {
    hero.animate(
      [{ transform: flip }, { transform: "none" }],
      {
        duration: dur,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
  }
  next.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: dur,
  });
  const fade = from.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    {
      duration: dur / 2,
      easing: "ease-in",
    },
  );
  fade.onfinish = () => (from.hidden = true);
  current = to;
}

// Intercept the links. The URL never changes, so the
// browser's Back button does nothing unless we fake
// history as well.
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-go]");
  if (!link) return;
  e.preventDefault();
  go(link.dataset.go);
});

// Stage hook: the slide's steps drive the same states.
document.addEventListener("demostate", (e) => {
  go(e.detail.state);
});

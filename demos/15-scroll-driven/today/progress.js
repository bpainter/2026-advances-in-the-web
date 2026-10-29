// Reading progress. A passive scroll
// listener asks for one frame, then scales
// the bar to the scroll position.
const article = document.querySelector(
  "#t-article",
);
const bar =
  document.querySelector("#t-bar");
let queued = false;

function update() {
  queued = false;
  const max =
    article.scrollHeight -
    article.clientHeight;
  const progress =
    max > 0 ? article.scrollTop / max : 0;
  bar.style.scale = `${progress} 1`;
}

article.addEventListener(
  "scroll",
  () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  },
  { passive: true },
);
window.addEventListener("resize", update);
update();

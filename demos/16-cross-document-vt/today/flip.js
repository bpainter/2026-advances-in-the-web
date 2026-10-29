// FLIP: measure the first box, render,
// measure the last box, then play the
// difference as a transform.
export function flip(first, el) {
  const last = el.getBoundingClientRect();
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / last.width;
  const sy = first.height / last.height;
  el.classList.remove("is-flipping");
  el.style.transform =
    `translate(${dx}px, ${dy}px) ` +
    `scale(${sx}, ${sy})`;
  // Apply the invert before the play.
  el.getBoundingClientRect();
  el.classList.add("is-flipping");
  el.style.transform = "";
}

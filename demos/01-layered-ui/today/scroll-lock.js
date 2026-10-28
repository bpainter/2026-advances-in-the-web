// Scroll lock for the hand-rolled modal.
// `overflow: hidden` on the body removes
// the scrollbar, and the page behind the
// modal jumps sideways by its width unless
// the body is padded by the same amount
// while locked. Locks are counted so nested
// overlays release the page only when the
// last one closes.

let depth = 0;
let savedScrollY = 0;

export function scrollbarWidth() {
  return (
    window.innerWidth -
    document.documentElement.clientWidth
  );
}

export function isScrollLocked() {
  return depth > 0;
}

export function lockScroll() {
  depth += 1;
  if (depth > 1) return;
  const body = document.body;
  savedScrollY = window.scrollY;
  const gap = scrollbarWidth();
  body.style.setProperty(
    "--scrollbar-width",
    `${gap}px`,
  );
  body.classList.add("is-locked");
}

export function unlockScroll() {
  if (depth === 0) return;
  depth -= 1;
  if (depth > 0) return;
  const body = document.body;
  body.classList.remove("is-locked");
  body.style.removeProperty(
    "--scrollbar-width",
  );
  // Some engines drop the offset when
  // overflow flips; put it back.
  if (window.scrollY !== savedScrollY)
    window.scrollTo(0, savedScrollY);
}

// A small positioning library, modeled on
// Floating UI's computePosition (offset,
// flip, shift) and autoUpdate.
const GAP = 14;
const PAD = 8;

export function computePosition(pin, card) {
  const a = pin.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  const vw =
    document.documentElement.clientWidth;
  const vh =
    document.documentElement.clientHeight;

  // Offset: the right side first.
  let side = "right";
  let x = a.right + GAP;
  // Flip: no room on the right? Try left.
  if (x + c.width > vw - PAD) {
    side = "left";
    x = a.left - GAP - c.width;
  }
  // Shift: keep the card inside the window.
  let y =
    a.top + a.height / 2 - c.height / 2;
  y = Math.min(
    Math.max(y, PAD),
    vh - PAD - c.height,
  );

  return {
    x: x + scrollX,
    y: y + scrollY,
    side,
  };
}

export function autoUpdate(
  pin,
  card,
  update,
) {
  // Anything that moves the pin must call
  // update: scrolls, window resizes and the
  // photo changing size.
  const observer = new ResizeObserver(
    update,
  );
  observer.observe(pin.closest("figure"));
  observer.observe(card);
  addEventListener("scroll", update, true);
  addEventListener("resize", update);
  update();
  return () => {
    observer.disconnect();
    removeEventListener(
      "scroll",
      update,
      true,
    );
    removeEventListener("resize", update);
  };
}

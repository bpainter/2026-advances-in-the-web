// Measures the search-grid card with a
// ResizeObserver and sets size classes on
// it, because the stylesheet cannot ask how
// wide the card's cell is.

const NARROW_PX = 320; // under 20rem
const WIDE_PX = 336; // 21rem and over

export function observeCard(
  card,
  onChange,
) {
  const observer = new ResizeObserver(
    (entries) => {
      for (const entry of entries) {
        const box =
          entry.contentBoxSize?.[0];
        const width = box
          ? box.inlineSize
          : entry.contentRect.width;
        card.classList.toggle(
          "is-narrow",
          width < NARROW_PX,
        );
        card.classList.toggle(
          "is-wide",
          width >= WIDE_PX,
        );
      }
      if (onChange) onChange(card);
    },
  );
  observer.observe(card);
  return () => observer.disconnect();
}

// D2 storefront-merch: names where the shown slot is at its current width (spec 4.2). It reads
// the slot's measured width and sets the label's text; it never touches a shown element and
// never uses a container query. Thresholds are the card's own breakpoints: 15rem and 26rem.
(function () {
  var label = document.querySelector(".wrap-context");
  var slot = document.querySelector(".product-slot");
  if (!label || !slot) return;
  function name(px) {
    if (px <= 240) return "Recommended";
    if (px < 416) return "Search results";
    return "Featured";
  }
  function update() {
    var text = name(slot.getBoundingClientRect().width);
    if (label.textContent !== text) label.textContent = text;
  }
  update();
  if (typeof ResizeObserver === "function") new ResizeObserver(update).observe(slot);
})();

// Product card rendered from props. The
// slot decides how the card looks by
// passing a variant (compact, promo) and a
// state (low stock); the template turns
// those into BEM modifier classes.

const cards = new Set();

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined)
    node.textContent = text;
  return node;
}

export function renderCard(
  product,
  {
    variant = "default",
    lowStock = false,
  } = {},
) {
  const card = el(
    "article",
    "c-product-card",
  );
  if (variant !== "default")
    card.classList.add(
      `c-product-card--${variant}`,
    );
  if (lowStock)
    card.classList.add(
      "c-product-card--low-stock",
    );

  const image = el(
    "img",
    "c-product-card__image",
  );
  image.src = product.image;
  image.width = 640;
  image.height = 480;
  image.alt = product.alt;

  const info = el(
    "div",
    "c-product-card__info",
  );
  info.append(
    el(
      "h3",
      "c-product-card__title",
      product.name,
    ),
    el(
      "p",
      "c-product-card__price",
      product.price,
    ),
  );

  const form = el(
    "form",
    "c-product-card__form",
  );
  form.method = "post";
  form.action = "/order";
  const sku = el(
    "input",
    "c-product-card__sku",
  );
  sku.type = "hidden";
  sku.name = "sku";
  sku.value = product.sku;
  const button = el(
    "button",
    "c-product-card__button",
    "Add to order",
  );
  form.append(sku, button);

  card.append(image, info);
  if (lowStock)
    card.append(
      el(
        "p",
        "c-product-card__stock",
        product.stockMessage,
      ),
    );
  card.append(form);

  cards.add(card);
  return card;
}

// Reads the layout the stylesheet chose and
// writes it back as data, so the page (and
// the rehearsal assert) can tell which
// variant is in effect.
export function syncLayout(card) {
  const tracks = getComputedStyle(card)
    .gridTemplateColumns.trim()
    .split(/\s+/);
  card.dataset.layout =
    tracks.length > 1
      ? "horizontal"
      : "stacked";
}

export function syncAllLayouts() {
  for (const card of cards) {
    if (card.isConnected) syncLayout(card);
  }
}

window.addEventListener(
  "resize",
  syncAllLayouts,
);

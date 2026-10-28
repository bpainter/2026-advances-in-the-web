// Reviews arrived a quarter later from
// another team. The review bodies are rich
// text too, but this file never imports the
// helper.

const section = document.querySelector(
  "#t-reviews",
);

function stars(rating) {
  return (
    "★".repeat(rating) +
    "☆".repeat(5 - rating)
  );
}

function reviewMarkup(review) {
  return `<li class="review">
    <p class="review__meta">
      <strong>${review.author}</strong>
      <span class="review__stars" aria-label="${review.rating} of 5">${stars(review.rating)}</span>
    </p>
    <div class="review__body">${review.body}</div>
  </li>`;
}

function heading(count) {
  return `Reviews <span class="count">(${count})</span>`;
}

export function renderReviews(reviews) {
  section.innerHTML = `<h2>${heading(reviews.length)}</h2><ul class="review-list"></ul>`;
  const list = section.querySelector(
    ".review-list",
  );
  if (reviews.length === 0) {
    list.innerHTML = `<li class="review review--empty">No reviews yet.</li>`;
    return;
  }
  list.innerHTML = reviews
    .map(reviewMarkup)
    .join("");
}

export function addReview(review) {
  const list = section.querySelector(
    ".review-list",
  );
  list
    .querySelector(".review--empty")
    ?.remove();
  list.innerHTML += reviewMarkup(review);
  section.querySelector("h2").innerHTML =
    heading(list.children.length);
}

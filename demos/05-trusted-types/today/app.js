// The product page: one content fetch and three render paths written by three
// people at three different times. The frame exposes `reset` and
// `renderReview(fixtureName)`, which renders a review through the unprotected
// #t-reviews path.

import { renderDescription } from "./description.js";
import { renderReviews, addReview } from "./reviews.js";
import { renderPromo } from "./promo.js";

const content = fetch("fixtures/cms-content.json").then((r) => r.json());

window.demoHooks = {
  reset() {},
  async renderReview(name) {
    const data = await content;
    if (typeof data[name] !== "string") throw new Error(`No fixture named ${name}`);
    addReview({ author: "New review", rating: 5, body: data[name] });
    await settled(document.querySelector("#t-reviews .review:last-child img"));
  },
};

content.then(
  (data) => {
    renderDescription(data.approved);
    renderReviews(data.reviews);
    renderPromo(data.promo);
  },
  () => {
    // A document the engine discards mid-load aborts the fetch; nothing to render.
  },
);

// An injected image loads or fails after a round trip, and its handler runs on
// that event; wait for it so the step is settled before the asserts.
function settled(img) {
  if (!img || img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    setTimeout(done, 300);
  });
}

// Adds is-visible to each step as it
// enters the article pane.
const article = document.querySelector(
  "#t-article",
);
const steps = article.querySelectorAll(
  "[data-reveal]",
);

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add(
        "is-visible",
      );
      observer.unobserve(entry.target);
    }
  },
  { root: article, threshold: 0.3 },
);

steps.forEach((step) =>
  observer.observe(step),
);

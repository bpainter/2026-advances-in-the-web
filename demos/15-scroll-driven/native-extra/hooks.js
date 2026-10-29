// Instrumentation for both M4 builds (still-in-motion-demos.md 7, Hooks). Never shown, and kept
// out of the used-to meter: it lives here, not in the today folder. Scrolling stays a hook so the
// action vocabulary stays fixed (3.5). The engine remounts a fresh document on reset.
//
//   scrollArticle(fraction): smooth-scrolls the article pane to that share of its scroll range.
//   busyScroll(fraction, blockMs): shows a "Busy page" chip just under the bar, at the article's
//     top right, so eyes stay on the bar (review r6 motion H4). Lets it paint, starts the same
//     smooth scroll, then blocks the main thread for blockMs with a busy loop. The chip goes after.
//
// Instant replay (the last argument is { instant: true }) jumps there with no smooth scroll and
// no busy loop.

const pane = document.querySelector("#article, #t-article");

function topFor(fraction) {
  return Math.round((pane.scrollHeight - pane.clientHeight) * fraction);
}

function frames(n) {
  return new Promise((resolve) => {
    const step = (left) => (left ? requestAnimationFrame(() => step(left - 1)) : resolve());
    step(n);
  });
}

function jump(fraction) {
  pane.scrollTo({ top: topFor(fraction), behavior: "instant" });
  return frames(2);
}

window.demoHooks = {
  reset() {},
  scrollArticle(fraction, opts) {
    if (opts && opts.instant) return jump(fraction);
    pane.scrollTo({ top: topFor(fraction), behavior: "smooth" });
  },
  async busyScroll(fraction, blockMs, opts) {
    if (opts && opts.instant) return jump(fraction);
    const chip = document.createElement("p");
    chip.className = "busy-chip";
    chip.textContent = "Busy page";
    chip.setAttribute("aria-hidden", "true");
    const box = pane.getBoundingClientRect();
    const bar = pane.querySelector(".progress");
    const under = bar && bar.offsetParent !== null ? bar.getBoundingClientRect().bottom : box.top;
    chip.style.insetBlockStart = `${Math.round(under + 10)}px`;
    chip.style.insetInlineEnd = `${Math.round(innerWidth - box.right + 12)}px`;
    document.body.append(chip);
    // Two frames, so the chip is on screen before the main thread stops. Then start the scroll
    // and let one more frame commit, so the compositor owns the scroll before the block.
    await frames(2);
    pane.scrollTo({ top: topFor(fraction), behavior: "smooth" });
    await frames(2);
    const end = performance.now() + blockMs;
    while (performance.now() < end) {
      // Busy: a long task, like a chat widget or analytics script loading.
    }
    chip.remove();
  },
  // The pane's scroll position goes into the step digest, so forward and back runs compare it.
  probes() {
    return { "article-scroll": Math.round(pane.scrollTop) };
  },
};

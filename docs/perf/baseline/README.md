# Performance and accessibility baseline

Raw "before" data and the scripts that produced it, from the live-site audits of 30 October 2026
(docs/perf/platform-review.md, frontend-review.md, a11y-review.md). Copied from the audit session's
scratch folder so docs/PRD-perf.md has numbers to compare against. Screenshots and image samples
were left out for size; rerun the scripts to regenerate them.

- `perf/`: front-end measurements (Playwright and Lighthouse runs, focus probes `probe3.mjs` and
  `probe3b.mjs`, raw JSON).
- `a11y/`: accessibility results (axe JSON, keyboard logs, contrast measurements).
- `scripts/`: the a11y audit scripts.

Scripts were written to run from a scratch folder; paths inside them may need adjusting.

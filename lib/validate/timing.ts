/**
 * Minutes per page by section, in page order (docs/PRD-demos-v4.md 7.4, with the core-demo times
 * of docs/design/demo-flow-cx.md section 2 the speaker adopted: D1 0.75 + 2.0, D4 now 2.0, D5 now
 * 1.75). The validator fails when content disagrees. Cut order: F5, F4, D2's last proof step, F1.
 */
export const TIMING_TABLE: Record<string, number[]> = {
  "d1-order-actions": [0.25, 0.75, 2.0],
  "d2-product-card": [0.25, 0.5, 1.75],
  "d3-support-form": [0.25, 0.5, 1.75],
  "d4-dashboard-navigation": [0.25, 0.5, 2.0],
  "d5-rich-content": [0.25, 0.5, 1.75],
  "d6-variant-picker": [0.25, 0.5, 1.5],
  "f1-still-in-motion": [1.0],
  "f2-caching": [0.25, 0.75, 2.25],
  "f3-package-trust": [0.25, 0.5, 2.25],
  "f4-vite-8-locally": [0.5],
  "f5-what-you-can-delete": [0.75],
};

/** The last demo page ends by this time; the rest of the section (to 31.0) is buffer. */
export const LAST_PAGE_BY = 29.5;

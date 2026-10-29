/**
 * Minutes per page by section, in page order (docs/PRD-demos-v4.md 7.4, with the core-demo times
 * of docs/design/demo-flow-cx.md section 2 the speaker adopted: D1 0.75 + 2.0, D4 now 2.0, D5 now
 * 1.75), and the Still in motion group of docs/design/still-in-motion-demos.md (F1 opener 0.5,
 * M1 to M5 at 0.25, 0.5 and 1.25). The validator fails when content disagrees.
 *
 * Cut order (still-in-motion-demos.md 10, with F5 removed on 28 October 2026): F4, M1, M3, M2, M4, then D2's last proof step. M5
 * and the F1 opener stay. A cut demo keeps its tile on the F1 grid.
 */
export const TIMING_TABLE: Record<string, number[]> = {
  "d1-order-actions": [0.25, 0.75, 2.0],
  "d2-product-card": [0.25, 0.5, 1.75],
  "d3-support-form": [0.25, 0.5, 1.75],
  "d4-dashboard-navigation": [0.25, 0.5, 2.0],
  "d5-rich-content": [0.25, 0.5, 1.75],
  "d6-variant-picker": [0.25, 0.5, 1.5],
  "f1-still-in-motion": [0.5],
  "m1-shop-the-look": [0.25, 0.5, 1.25],
  "m2-trail-photos": [0.25, 0.5, 1.25],
  "m3-pricing-app": [0.25, 0.5, 1.25],
  "m4-return-guide": [0.25, 0.5, 1.25],
  "m5-trail-gear-pages": [0.25, 0.5, 1.25],
  "f2-caching": [0.25, 0.75, 2.25],
  "f3-package-trust": [0.25, 0.5, 2.25],
  "f4-vite-8-locally": [0.5],
};

/** The last demo page ends by this time, the section end (still-in-motion-demos.md 10). The pages end at 39.25 (F5 removed). */
export const LAST_PAGE_BY = 39.75;

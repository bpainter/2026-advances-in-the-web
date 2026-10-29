import type { DemoSection } from "@/content/demo-schema";
import { section as s1 } from "./d1-order-actions";
import { section as s2 } from "./d2-product-card";
import { section as s3 } from "./d3-support-form";
import { section as s4 } from "./d4-dashboard-navigation";
import { section as s5 } from "./d5-rich-content";
import { section as s6 } from "./d6-variant-picker";
import { section as m1 } from "./m1-shop-the-look";
import { section as m2 } from "./m2-trail-photos";
import { section as m3 } from "./m3-pricing-app";
import { section as m4 } from "./m4-return-guide";
import { section as m5 } from "./m5-trail-gear-pages";
import { section as s7 } from "./f2-caching";
import { section as s8 } from "./f3-package-trust";
import { section as s9 } from "./f4-vite-8-locally";

/**
 * Every page's `timing.cumulative`, computed from the authored minutes. The demo section starts at 6.5,
 * where the opening slides end (PRD v5, open question 1: the speaker chose 6.5 over trimming the opening).
 */
export const DEMO_SECTION_START = 6.5;
/** The section ends here on the talk clock. The last page ends at 38.75, so 0.5 minutes of buffer remain (PRD r7, 8.1). */
export const DEMO_SECTION_END = 39.25;
function withCumulative(list: DemoSection[]): DemoSection[] {
  let t = DEMO_SECTION_START;
  for (const s of list)
    for (const p of s.pages) {
      t = Math.round((t + p.timing.minutes) * 100) / 100;
      p.timing.cumulative = t;
    }
  return list;
}

/** The demo section in talk order (PRD v4, 2.1 and 7.4). */
export const sections: DemoSection[] = withCumulative([
  s1,
  s2,
  s3,
  s4,
  s5,
  s6,
  m1,
  m2,
  m3,
  m4,
  m5,
  s7,
  s8,
  s9,
]);

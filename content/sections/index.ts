import type { DemoSection } from "@/content/demo-schema";
import { section as s1 } from "./d1-order-actions";
import { section as s2 } from "./d2-product-card";
import { section as s3 } from "./d3-support-form";
import { section as s4 } from "./d4-dashboard-navigation";
import { section as s5 } from "./d5-rich-content";
import { section as s6 } from "./d6-variant-picker";
import { section as s7 } from "./f1-still-in-motion";
import { section as s8 } from "./f2-caching";
import { section as s9 } from "./f3-package-trust";
import { section as s10 } from "./f4-vite-8-locally";
import { section as s11 } from "./f5-what-you-can-delete";

/** Every page's `timing.cumulative`, computed from the authored minutes: the demo section starts at 5.0 (PRD 7.4). */
export const DEMO_SECTION_START = 5.0;
/** The section ends here on the talk clock; the 1.5 minutes after the last page are the section buffer. */
export const DEMO_SECTION_END = 31.0;
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
  s7,
  s8,
  s9,
  s10,
  s11,
]);

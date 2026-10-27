import type { DemoSection } from "@/content/demo-schema";
import { section as s1 } from "./d1-order-actions";
import { section as s2 } from "./d2-product-card";
import { section as s3 } from "./d3-support-form";
import { section as s4 } from "./d4-dashboard-navigation";
import { section as s5 } from "./d5-rich-content";
import { section as s6 } from "./f1-still-in-motion";
import { section as s7 } from "./f2-caching";
import { section as s8 } from "./f3-package-trust";
import { section as s9 } from "./f4-vite-8-locally";
import { section as s10 } from "./f5-what-you-can-delete";

/** The demo section in talk order (PRD Part A, section 1). */
export const sections: DemoSection[] = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10];

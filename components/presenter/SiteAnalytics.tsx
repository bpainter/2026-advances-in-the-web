"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";

const subscribe = () => () => {};

/**
 * Automated windows send nothing: the walks and `pnpm visuals` drive Playwright (navigator.webdriver)
 * and captures add ?capture=1, so their screenshots, network and console stay the same run to run.
 */
function tracked(): boolean {
  return !navigator.webdriver && new URLSearchParams(window.location.search).get("capture") !== "1";
}

/**
 * Vercel Web Analytics for the presenter's pages (docs/deploy.md). The root layout renders it on
 * Vercel builds only; frame documents come from route handlers, which no layout wraps, so they
 * never load the script and their CSP stays as written.
 */
export function SiteAnalytics() {
  const on = useSyncExternalStore(subscribe, tracked, () => false);
  return on ? <Analytics /> : null;
}

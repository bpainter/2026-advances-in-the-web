"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const subscribe = () => () => {};

/**
 * Automated windows send nothing: the walks and `pnpm visuals` drive Playwright (navigator.webdriver)
 * and captures add ?capture=1, so their screenshots, network and console stay the same run to run.
 */
function tracked(): boolean {
  return !navigator.webdriver && new URLSearchParams(window.location.search).get("capture") !== "1";
}

/**
 * Speed Insights measures the public reader pages only (docs/PRD-perf.md, P2-SI): the talk page and
 * `/s/<id>`, where phones on venue and cellular networks open the slides. The stage windows
 * (`/present`, `/speaker`) never load its script, so it costs the talk nothing.
 */
function readerPage(pathname: string | null): boolean {
  return pathname === "/" || Boolean(pathname?.startsWith("/s/"));
}

/**
 * Vercel Web Analytics for the presenter's pages, and Speed Insights for the reader pages
 * (docs/deploy.md). The root layout renders it on Vercel builds only; frame documents come from
 * route handlers, which no layout wraps, so they never load either script and their CSP stays as
 * written.
 */
export function SiteAnalytics() {
  const on = useSyncExternalStore(subscribe, tracked, () => false);
  const pathname = usePathname();
  if (!on) return null;
  return (
    <>
      <Analytics />
      {readerPage(pathname) ? <SpeedInsights /> : null}
    </>
  );
}

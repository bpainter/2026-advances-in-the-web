import type { Metadata } from "next";
import { RequestLog } from "@/components/request-log";
import { PRESENTER_ORIGIN, RUNTIME_SRC } from "@/lib/origins";
import { PortalShell } from "@/components/portal-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ridgeline Trail · Cache Components off",
};

/**
 * Root layout: the product (children) and the request log are presenter chrome around the page.
 * /presenter.js registers `window.demoHooks` (reset, requestPage) before the document finishes
 * parsing and, only with `?presenter=1`, adds the presenter-origin meta and the frame runtime.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-build="today" suppressHydrationWarning>
      <head>
        {/* The shared portal theme (PRD v4, 6.2), copied in by pnpm theme:sync. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/theme/portal-glass.css" />
      </head>
      <body>
        <script
          src="/presenter.js"
          data-app="today"
          data-presenter-origin={PRESENTER_ORIGIN}
          data-runtime={RUNTIME_SRC}
        />
        <PortalShell title="Products">
          <div className="topbar">
            <p className="brand__mode">Next.js 16 · Cache Components off</p>
            <div className="admin" data-presenter-chrome="">
              <button type="button" data-demo-reload="">
                Reload
              </button>
              <button type="button" data-demo-reset="">
                Reset
              </button>
            </div>
          </div>
          <main className="product">{children}</main>
          <RequestLog />
                </PortalShell>
      </body>
    </html>
  );
}

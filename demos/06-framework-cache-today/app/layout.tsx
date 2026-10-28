import type { Metadata } from "next";
import { RequestLog } from "@/components/request-log";
import { PRESENTER_ORIGIN, RUNTIME_SRC } from "@/lib/origins";
import { StorefrontShell } from "@/components/storefront-shell";
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
    <html lang="en" data-build="today" data-section-bg="f2" data-wrapper="storefront-product" data-shown-outside="preview-strip request-log" suppressHydrationWarning>
      <head>
        {/* The shared portal theme (PRD v4, 6.2), copied in by pnpm theme:sync. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/theme/portal-glass.css" />
        {/* The F2 section background (PRD v5, 4.2), also from pnpm theme:sync. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/theme/backgrounds.css" />
        {/* The storefront-product wrapper (PRD v5, 4.4), also from pnpm theme:sync. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/wrappers/base.css" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/wrappers/storefront-product.css" />
      </head>
      <body>
        {/* Synchronous on purpose: the hooks must exist before the frame runtime asks for them. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="/presenter.js"
          data-app="today"
          data-presenter-origin={PRESENTER_ORIGIN}
          data-runtime={RUNTIME_SRC}
        />
        <StorefrontShell
          controls={
            <>
              <div className="admin" data-presenter-chrome="">
                <button type="button" data-demo-reload="">
                  Reload
                </button>
                <button type="button" data-demo-reset="">
                  Reset
                </button>
              </div>
            </>
          }
          log={<RequestLog mode="Cache Components off" />}
        >
          <main className="product">{children}</main>
        </StorefrontShell>
      </body>
    </html>
  );
}

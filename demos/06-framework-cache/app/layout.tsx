import type { Metadata } from "next";
import { AdminBar } from "@/components/admin-bar";
import { RequestLog } from "@/components/request-log";
import { PRESENTER_ORIGIN, RUNTIME_SRC } from "@/lib/origins";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ridgeline Trail · Cache Components on",
};

/**
 * Root layout: the product (children), the admin bar and the request log are presenter chrome
 * around the shown page. /presenter.js registers `window.demoHooks` before the document finishes
 * parsing and, only with `?presenter=1`, adds `<meta name="presenter-origin">` and the frame
 * runtime from the demo origin (PRD Part A, 10.3).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-build="native" suppressHydrationWarning>
      <head>
        {/* The shared portal theme (PRD v4, 6.2), copied in by pnpm theme:sync. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/theme/portal-glass.css" />
      </head>
      <body>
        <script
          src="/presenter.js"
          data-app="now"
          data-presenter-origin={PRESENTER_ORIGIN}
          data-runtime={RUNTIME_SRC}
        />
        <div className="shell">
          <header className="topbar">
            <p className="brand">
              <span className="brand__name">Ridgeline Outfitters</span>
              <span className="brand__mode">Next.js 16 · cacheComponents: true</span>
            </p>
            <AdminBar />
          </header>
          <main className="product">{children}</main>
          <RequestLog />
        </div>
      </body>
    </html>
  );
}

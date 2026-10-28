import type { ReactNode } from "react";

/**
 * The F2 storefront wrapper `storefront-product` (PRD v5, 2.2; docs/design/demo-wrappers-spec.md
 * 4.8), rendered by both apps: a staff preview strip with the demo controls, the storefront header
 * (no count, no greeting, no per-user data, and the layout reads no cookies), the shown product
 * page in the `[data-shown]` slot and the request log docked as a drawer on dark glass. Presenter
 * chrome, never in the code panel. Styles: /wrappers/base.css and /wrappers/storefront-product.css,
 * copied in by pnpm theme:sync.
 */
const SEARCH = "M21 21l-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z";
const CART =
  "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12M9 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm11 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z";

function Icon({ d }: { d: string }) {
  return (
    <svg className="wrap-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function StorefrontShell({ controls, log, children }: { controls: ReactNode; log: ReactNode; children: ReactNode }) {
  return (
    <div className="wrap wrap--store wrap--f2">
      <div className="wrap-preview" id="preview-strip" role="region" aria-label="Staff preview">
        <span className="wrap-preview__label">Preview as</span>
        {controls}
      </div>
      <header className="wrap-site">
        <span className="wrap-brand">
          <span className="wrap-brand__mark" aria-hidden="true">
            R
          </span>
          <span className="wrap-brand__name">Ridgeline Outfitters</span>
        </span>
        <span className="wrap-search" aria-hidden="true">
          <Icon d={SEARCH} />
          <span className="wrap-search__text">Search trail gear</span>
        </span>
        <span className="wrap-site__end" aria-hidden="true">
          <Icon d={CART} />
        </span>
      </header>
      <div className="wrap-store-body">
        <div className="wrap-shown wrap-shown--bare" data-shown="">
          {children}
        </div>
      </div>
      {log}
    </div>
  );
}

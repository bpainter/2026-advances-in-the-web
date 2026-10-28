import type { ReactNode } from "react";

/**
 * The Ridgeline portal shell (docs/design/demo-glass-spec.md, section 8), the same markup the
 * presenter's composer wraps around the other demos' frames, so F2 reads as the same product
 * (design review H2). Presenter chrome, never in the code panel.
 */
const NAV: { id: string; label: string; current?: boolean; paths: string }[] = [
  { id: "orders", label: "Orders", paths: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12m-8.7-5 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7M7.5 4.27l9 5.15" },
  { id: "products", label: "Products", current: true, paths: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" },
  { id: "support", label: "Support", paths: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4.93 4.93l4.24 4.24m5.66 0 4.24-4.24m-4.24 9.9 4.24 4.24m-9.9-4.24-4.24 4.24" },
  { id: "content", label: "Content", paths: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4M10 9H8m8 4H8m8 4H8" },
  { id: "reports", label: "Reports", paths: "M3 3v16a2 2 0 0 0 2 2h16M18 17V9m-5 8V5M8 17v-3" },
];

export function PortalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="portal">
      <nav className="portal__nav" aria-label="Portal">
        <p className="portal__brand">
          <span className="portal__brand-mark" aria-hidden="true">
            R
          </span>
          <span className="portal__brand-name">Ridgeline</span>
        </p>
        <p className="portal__nav-heading">Operations</p>
        {NAV.map((n) => (
          <a key={n.id} className="portal__nav-link" href={`#${n.id}`} aria-current={n.current ? "page" : undefined} tabIndex={-1}>
            <svg className="portal__nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={n.paths} />
            </svg>
            <span className="portal__nav-label">{n.label}</span>
          </a>
        ))}
      </nav>
      <header className="portal__top">
        <p className="portal__title">{title}</p>
        <div className="portal__actions">
          <span className="portal__avatar" aria-hidden="true">
            BP
          </span>
        </div>
      </header>
      <div className="portal__main">{children}</div>
    </div>
  );
}

import type { SupportTile } from "@/lib/support-data";

/**
 * The intro slide's support row (PRD v4, 1.1): Chrome, Edge, Firefox and Safari (or the tools),
 * each with its logo, first supporting version and name. A browser without support shows its logo
 * in grayscale with "Not yet", so color is never the only signal. Tiles fade in 80 ms apart.
 */
export function SupportRow({ tiles, kind }: { tiles: SupportTile[]; kind: "web-features" | "tooling" }) {
  return (
    <ul className="support-row" data-kind={kind} aria-label={kind === "tooling" ? "Tool versions" : "Browser support"}>
      {tiles.map((t, i) => (
        <li className="support-row__tile" key={t.id} data-supported={t.version !== null} style={{ "--tile-index": i } as React.CSSProperties}>
          {/* Local SVG logos (public/logos); next/image adds nothing for a fixed 72 px vector. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="support-row__logo" src={t.logo} alt="" width={72} height={72} />
          <span className="support-row__version" aria-hidden="true">
            {t.version ?? "Not yet"}
          </span>
          <span className="support-row__name">
            {t.name}
            <span className="visually-hidden">{t.version ? `, from version ${t.version}` : ", not supported yet"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

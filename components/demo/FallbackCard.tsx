interface Props {
  title: string;
  url: string;
  reason: "external" | "failed" | "requested";
}

/** Shown in place of a live frame for external demos, failures, or the `x` key (PRD 7.8). */
export function FallbackCard({ title, url, reason }: Props) {
  const eyebrow = reason === "external" ? "External demo" : reason === "failed" ? "Live demo unavailable" : "Fallback";
  const isHttp = /^https?:\/\//.test(url);
  return (
    <div className="fallback-card">
      <p className="fallback-card__eyebrow">{eyebrow}</p>
      <p className="fallback-card__title">{title}</p>
      {isHttp ? (
        <a className="fallback-card__link" href={url} target="_blank" rel="noreferrer noopener">
          {url}
        </a>
      ) : (
        <p className="fallback-card__hint">Fallback asset: {url}</p>
      )}
      <p className="fallback-card__hint">Press r to reload the live demo.</p>
    </div>
  );
}

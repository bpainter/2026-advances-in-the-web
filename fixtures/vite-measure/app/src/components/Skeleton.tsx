import "./Skeleton.css";

export function Skeleton({ label = "Skeleton" }: { label?: string }) {
  const items = Array.from({ length: 6 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="skeleton">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

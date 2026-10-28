import "./Filter.css";

export function Filter({ label = "Filter" }: { label?: string }) {
  const items = Array.from({ length: 3 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="filter">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

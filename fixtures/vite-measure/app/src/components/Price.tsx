import "./Price.css";

export function Price({ label = "Price" }: { label?: string }) {
  const items = Array.from({ length: 5 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="price">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

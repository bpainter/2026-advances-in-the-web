import "./Legend.css";

export function Legend({ label = "Legend" }: { label?: string }) {
  const items = Array.from({ length: 4 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="legend">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

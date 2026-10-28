import "./Select.css";

export function Select({ label = "Select" }: { label?: string }) {
  const items = Array.from({ length: 7 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="select">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

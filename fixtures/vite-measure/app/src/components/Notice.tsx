import "./Notice.css";

export function Notice({ label = "Notice" }: { label?: string }) {
  const items = Array.from({ length: 7 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="notice">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

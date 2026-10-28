import "./Tabs.css";

export function Tabs({ label = "Tabs" }: { label?: string }) {
  const items = Array.from({ length: 6 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="tabs">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

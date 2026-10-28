import "./TableRow.css";

export function TableRow({ label = "TableRow" }: { label?: string }) {
  const items = Array.from({ length: 5 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="tablerow">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

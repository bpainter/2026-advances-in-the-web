import "./Pagination.css";

export function Pagination({ label = "Pagination" }: { label?: string }) {
  const items = Array.from({ length: 4 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="pagination">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

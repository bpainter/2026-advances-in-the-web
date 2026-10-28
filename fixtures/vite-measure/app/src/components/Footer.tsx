import "./Footer.css";

export function Footer({ label = "Footer" }: { label?: string }) {
  const items = Array.from({ length: 5 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="footer">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

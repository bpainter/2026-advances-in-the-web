import "./Avatar.css";

export function Avatar({ label = "Avatar" }: { label?: string }) {
  const items = Array.from({ length: 6 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="avatar">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      
    </section>
  );
}

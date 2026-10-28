import { Nav } from "./Nav";
import "./Header.css";

export function Header({ label = "Header" }: { label?: string }) {
  const items = Array.from({ length: 3 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="header">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Nav />
    </section>
  );
}

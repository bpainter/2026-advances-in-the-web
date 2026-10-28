import { Dialog } from "./Dialog";
import "./Menu.css";

export function Menu({ label = "Menu" }: { label?: string }) {
  const items = Array.from({ length: 4 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="menu">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Dialog />
    </section>
  );
}

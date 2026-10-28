import { Avatar } from "./Avatar";
import "./Toast.css";

export function Toast({ label = "Toast" }: { label?: string }) {
  const items = Array.from({ length: 5 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="toast">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Avatar />
    </section>
  );
}

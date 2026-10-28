import { Skeleton } from "./Skeleton";
import "./Empty.css";

export function Empty({ label = "Empty" }: { label?: string }) {
  const items = Array.from({ length: 5 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="empty">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Skeleton />
    </section>
  );
}

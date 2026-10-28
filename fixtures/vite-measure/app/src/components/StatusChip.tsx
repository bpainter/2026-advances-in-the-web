import { Price } from "./Price";
import "./StatusChip.css";

export function StatusChip({ label = "StatusChip" }: { label?: string }) {
  const items = Array.from({ length: 4 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="statuschip">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Price />
    </section>
  );
}

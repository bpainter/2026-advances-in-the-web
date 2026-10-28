import { Chart } from "./Chart";
import "./Stat.css";

export function Stat({ label = "Stat" }: { label?: string }) {
  const items = Array.from({ length: 7 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="stat">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Chart />
    </section>
  );
}

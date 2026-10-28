import { Table } from "./Table";
import "./Card.css";

export function Card({ label = "Card" }: { label?: string }) {
  const items = Array.from({ length: 3 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="card">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Table />
    </section>
  );
}

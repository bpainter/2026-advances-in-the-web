import { Filter } from "./Filter";
import "./Search.css";

export function Search({ label = "Search" }: { label?: string }) {
  const items = Array.from({ length: 7 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="search">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Filter />
    </section>
  );
}

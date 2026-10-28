import { Select } from "./Select";
import "./Field.css";

export function Field({ label = "Field" }: { label?: string }) {
  const items = Array.from({ length: 6 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="field">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <Select />
    </section>
  );
}

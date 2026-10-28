import { OrderList } from "./OrderList";
import "./OrderRow.css";

export function OrderRow({ label = "OrderRow" }: { label?: string }) {
  const items = Array.from({ length: 6 }, (_, k) => `${label} ${k + 1}`);
  return (
    <section className="orderrow">
      <h2>{label}</h2>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
      <OrderList />
    </section>
  );
}

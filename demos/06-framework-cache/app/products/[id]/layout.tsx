import { getPrice } from "@/lib/price";

/** Wraps the shown page with the cached price (lib/price.ts), which stays out of the code panel. */
export default async function ProductLayout({ children, params }: LayoutProps<"/products/[id]">) {
  const { id } = await params;
  const price = await getPrice(id);
  return (
    <section className="product-card">
      {children}
      <p className="price">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: price.currency,
          maximumFractionDigits: 0,
        }).format(price.amount)}
        <span className="price__note">price on a business schedule</span>
      </p>
    </section>
  );
}

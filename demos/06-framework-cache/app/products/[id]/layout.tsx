import { ProductPhoto } from "@/components/product-photo";
import { getPrice } from "@/lib/price";

/**
 * Wraps the shown page with the product photo and the cached price (lib/price.ts), which stay out
 * of the code panel. app/globals.css places the photo, the page's parts and the price on one grid,
 * the same grid the Cache Components off app uses.
 */
export default async function ProductLayout({ children, params }: LayoutProps<"/products/[id]">) {
  const { id } = await params;
  const price = await getPrice(id);
  return (
    <section className="product-card">
      <ProductPhoto />
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

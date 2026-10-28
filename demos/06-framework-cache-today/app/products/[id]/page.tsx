// prettier-ignore
import {
  getCatalogProduct,
} from "@/lib/catalog";
// prettier-ignore
import {
  getInventory,
} from "@/lib/inventory";
import { getPrice } from "@/lib/price";

// Freshness settings 1 and 2 of 5: the
// route says "regenerate hourly" and
// "work it out".
export const revalidate = 3600;
export const dynamic = "auto";

export default async function Page({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product =
    await getCatalogProduct(id);
  const price = await getPrice(id);
  const stock = await getInventory(id);
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.copy}</p>
      <p className="stock">{stock.label}</p>
      <p className="price">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: price.currency,
          maximumFractionDigits: 0,
        }).format(price.amount)}
        <span className="price__note">
          price on a business schedule
        </span>
      </p>
    </article>
  );
}

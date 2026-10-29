import { ProductPhoto } from "@/components/product-photo";

// Freshness setting 3 of 5: every fetch below this layout caches unless it says otherwise.
export const fetchCache = "default-cache";

/** The product photo sits beside the shown page, on the same grid as the Cache Components on app. */
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="product-card">
      <ProductPhoto />
      {children}
    </section>
  );
}

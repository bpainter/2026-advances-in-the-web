// Freshness setting 3 of 5: every fetch below this layout caches unless it says otherwise.
export const fetchCache = "default-cache";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <section className="product-card">{children}</section>;
}

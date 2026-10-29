import Image from "next/image";
import seed from "@/fixtures/products.json";
import { PRODUCT_ID } from "@/lib/origins";

/**
 * The product photo beside the shown page (presenter chrome, never in the code panel). It reads
 * the fixture directly, not the database, so it adds no query to the request log. Both apps render
 * this same file, so the two pages look the same.
 */
export function ProductPhoto() {
  const product = seed.products.find((p) => p.id === PRODUCT_ID);
  if (!product) return null;
  return (
    <Image
      className="product-photo"
      src={product.image}
      alt={product.imageAlt}
      // Shown at 200 by 150 in a frame the presenter scales by 1.375: a 400 hint serves 640 at
      // 1x and 828 at 2x, so the photo stays sharp on the projector.
      width={400}
      height={300}
      preload
    />
  );
}

import { db } from "./db";
import { log } from "./log";

/** A database query: no fetch, so no fetch cache. The route decides whether it repeats. */
export async function getCatalogProduct(id: string) {
  log("catalog query", id);
  return db.products.find(id);
}

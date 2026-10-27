import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

/**
 * The price follows the catalog pattern with its own lifetime profile (a business schedule).
 * It stays out of the code panel to keep the walkthrough to the plan's files.
 */
export async function getPrice(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`price:${id}`);
  return db.prices.find(id);
}

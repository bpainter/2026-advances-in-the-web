import { cookies, headers } from "next/headers";
import { apiUrl } from "./api-url";
import { log } from "./log";
import type { Stock } from "./db";

/**
 * Freshness setting 5 of 5: the stock fetch opts out of the cache, and the cookie read makes the
 * whole route dynamic, which is why the catalog query above it repeats too.
 */
export async function getInventory(id: string): Promise<Stock> {
  const jar = await cookies();
  const region = jar.get("region")?.value;
  const user = jar.get("user")?.value;
  log("inventory query", id, region);
  const delay = (await headers()).get("x-inventory-delay") ?? "";
  const query = new URLSearchParams();
  if (region) query.set("region", region);
  if (user) query.set("user", user);
  if (delay) query.set("delay", delay);
  const stockUrl = await apiUrl(`/api/stock/${id}?${query}`);
  const res = await fetch(stockUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`stock ${res.status}`);
  return res.json();
}

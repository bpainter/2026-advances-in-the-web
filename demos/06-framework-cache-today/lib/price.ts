import { apiUrl } from "./api-url";

/** Freshness setting 4 of 5: the price fetch caches by its own option. */
export async function getPrice(
  id: string,
): Promise<{ id: string; amount: number; currency: string }> {
  const priceUrl = await apiUrl(`/api/price/${id}`);
  const res = await fetch(priceUrl, { cache: "force-cache" });
  if (!res.ok) throw new Error(`price ${res.status}`);
  return res.json();
}

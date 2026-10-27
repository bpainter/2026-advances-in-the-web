import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { resetLog } from "@/lib/log";
import { PRODUCT_ID } from "@/lib/origins";

/**
 * The `reset` hook posts here before its reload: clear the log, reseed the data, clear the user
 * and region cookies and drop the route's fetch cache (the price fetch), so the first request
 * after reset shows every query. The session (x-demo-session) is the one the frame will use from now on.
 */
export async function POST() {
  resetLog((await headers()).get("x-demo-session") ?? "");
  db.reset();
  const jar = await cookies();
  jar.delete("user");
  jar.delete("region");
  revalidatePath(`/products/${PRODUCT_ID}`);
  const product = await db.products.find(PRODUCT_ID);
  return Response.json({ ok: true, product }, { headers: { "Cache-Control": "no-store" } });
}

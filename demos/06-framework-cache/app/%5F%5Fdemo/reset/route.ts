import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { resetLog } from "@/lib/log";
import { PRODUCT_ID } from "@/lib/origins";

/**
 * The `reset` hook posts here before its reload (PRD Part A, 10.3): clear the log, reseed the
 * data, clear the user and region cookies and expire the product and price tags, so the first
 * request after reset is a catalog miss. An immediate-expiry profile is used because `updateTag`
 * is limited to Server Actions and `revalidateTag(tag, "max")` would serve stale content once.
 * The session (x-demo-session) is the one the frame will use from now on.
 */
export async function POST() {
  resetLog((await headers()).get("x-demo-session") ?? "");
  db.reset();
  const jar = await cookies();
  jar.delete("user");
  jar.delete("region");
  revalidateTag(`product:${PRODUCT_ID}`, { expire: 0 });
  revalidateTag(`price:${PRODUCT_ID}`, { expire: 0 });
  const product = await db.products.find(PRODUCT_ID);
  return Response.json({ ok: true, product }, { headers: { "Cache-Control": "no-store" } });
}

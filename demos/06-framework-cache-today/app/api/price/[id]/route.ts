import { db } from "@/lib/db";
import { log } from "@/lib/log";

/** The price service. It logs only when the page's `force-cache` fetch actually reaches it. */
export async function GET(_request: Request, { params }: RouteContext<"/api/price/[id]">) {
  const { id } = await params;
  log("price query", id);
  return Response.json(await db.prices.find(id), { headers: { "Cache-Control": "no-store" } });
}

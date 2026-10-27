import { db } from "@/lib/db";

/** The inventory service: per region and user, read at request time (`no-store` on the page). */
export async function GET(request: Request, { params }: RouteContext<"/api/stock/[id]">) {
  const { id } = await params;
  const query = new URL(request.url).searchParams;
  const stock = await db.inventory.find(id, {
    region: query.get("region") ?? undefined,
    user: query.get("user") ?? undefined,
    delayMs: Number(query.get("delay") ?? 0) || 0,
  });
  return Response.json(stock, { headers: { "Cache-Control": "no-store" } });
}

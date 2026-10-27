import { headers } from "next/headers";

/**
 * The app's own origin, so the price and stock fetches stay local (no network beyond this app).
 * The frame session (`x-demo-session`, from `?s=`) travels along as `?s=` so the services' log
 * lines land in the same session as the page's.
 */
export async function apiUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? `localhost:${process.env.PORT ?? 3107}`;
  const url = new URL(path, `http://${host}`);
  const session = h.get("x-demo-session");
  if (session) url.searchParams.set("s", session);
  return url.href;
}

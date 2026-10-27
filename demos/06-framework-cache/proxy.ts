import { NextResponse, type NextRequest } from "next/server";
import { DEMO_ORIGIN, PRESENTER_ORIGIN, RESET_SUFFIX } from "@/lib/origins";

/**
 * Presenter plumbing that keeps next.config.ts to the one shown line:
 * - the presenter requests `<route>/index.html`; that is redirected to the page with `?presenter=1`
 *   (which loads the frame runtime, app/layout.tsx) and `&mount=1` (the frame's first request,
 *   which belongs to no session);
 * - `?reset=1` is rewritten to the `--reset` id (lib/origins.ts) so the reset reload shows seeded
 *   data without touching the real cache entry;
 * - `?inventoryDelayMs=` becomes the `x-inventory-delay` request header that lib/db.ts honours;
 * - the frame session (the `f2s` cookie public/presenter.js stamps before each of the frame's
 *   requests, or `?s=` for the app's own service calls) becomes the `x-demo-session` header
 *   that lib/log.ts scopes lines by;
 * - every response carries frame-ancestors for the presenter and a script-src that allows the
 *   runtime served from the demo origin (PRD Part A, 14.1).
 */
const PRODUCT_PATH = /^\/products\/([^/]+)$/;
const INDEX_HTML = /^\/products\/([^/]+)\/index\.html$/;
const SESSION = /^[\w-]{1,64}$/;

const csp = [
  `frame-ancestors ${PRESENTER_ORIGIN}`,
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} ${DEMO_ORIGIN}`,
].join("; ");

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  const index = INDEX_HTML.exec(url.pathname);
  if (index) {
    const to = url.clone();
    to.pathname = `/products/${index[1]}`;
    to.search = "";
    to.searchParams.set("presenter", "1");
    to.searchParams.set("mount", "1");
    return NextResponse.redirect(to, 307);
  }

  const requestHeaders = new Headers(request.headers);
  const delay = url.searchParams.get("inventoryDelayMs");
  if (delay && /^\d+$/.test(delay)) requestHeaders.set("x-inventory-delay", delay);
  else requestHeaders.delete("x-inventory-delay");
  const session =
    url.searchParams.get("mount") === "1"
      ? ""
      : (url.searchParams.get("s") ?? request.cookies.get("f2s")?.value ?? "");
  if (SESSION.test(session)) requestHeaders.set("x-demo-session", session);
  else requestHeaders.delete("x-demo-session");

  const product = PRODUCT_PATH.exec(url.pathname);
  let response: NextResponse;
  if (product && url.searchParams.get("reset") === "1" && !product[1].endsWith(RESET_SUFFIX)) {
    const to = url.clone();
    to.pathname = `/products/${product[1]}${RESET_SUFFIX}`;
    response = NextResponse.rewrite(to, { request: { headers: requestHeaders } });
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon\\.ico).*)"],
};

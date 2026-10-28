import { Suspense } from "react";
import { headers } from "next/headers";
import { requestEnds, snapshot, waitForRequestEnd } from "@/lib/log";
import { RequestLogRows } from "./request-log-live";

/**
 * The request log panel (presenter chrome, never in the code panel): a header row and one row per
 * server query of this frame's session. The rows are server-rendered once this document's own
 * inventory line exists, so they are in the HTML before the frame runtime reports ready; the
 * client keeps them live over SSE.
 */
export function RequestLog() {
  return (
    <aside id="request-log" aria-label="Request log">
      <div className="log-head" role="row">
        <span>Request</span>
        <span>Query</span>
        <span>Cached</span>
      </div>
      <Suspense fallback={null}>
        <Rows />
      </Suspense>
    </aside>
  );
}

async function Rows() {
  const session = (await headers()).get("x-demo-session") ?? "";
  const ends = requestEnds(session);
  await waitForRequestEnd(session, ends, 4000);
  return <RequestLogRows session={session} initial={snapshot(session)} />;
}

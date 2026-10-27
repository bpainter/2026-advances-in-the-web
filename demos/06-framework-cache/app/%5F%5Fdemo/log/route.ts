import { snapshot, subscribe, type LogEvent } from "@/lib/log";

/**
 * Server-sent events for the request log panel: on connect, every line of `?session=` after
 * `?after=<seq>`, then live lines and reset events (resets of other sessions are sent too; the
 * client ignores them).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const after = Number(url.searchParams.get("after") ?? 0) || 0;
  const session = url.searchParams.get("session") ?? "";
  const encoder = new TextEncoder();
  let unsubscribe = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: LogEvent) => {
        if (event.type === "line" && event.line.session !== session) return;
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event.type}\ndata: ${JSON.stringify(event.type === "line" ? event.line : { session: event.session })}\n\n`,
            ),
          );
        } catch {
          unsubscribe();
        }
      };
      controller.enqueue(encoder.encode(`retry: 500\n\n`));
      for (const line of snapshot(session)) if (line.seq > after) send({ type: "line", line });
      unsubscribe = subscribe(send);
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { headers } from "next/headers";
import { RESET_SUFFIX } from "./origins";

/**
 * Presenter chrome: an in-memory request log. `log()` is what the shown catalog.ts and
 * inventory.ts call; the buffer is read by the log panel (server render plus `/__demo/log` SSE).
 * State lives on globalThis so route handlers, pages and HMR reloads share one buffer.
 *
 * Lines carry the frame's session (the `f2s` cookie, forwarded by proxy.ts as the
 * `x-demo-session` header): the presenter mounts a hidden second frame beside the shown one on
 * some moves and replays it, and the shown panel must not pick up that frame's lines or reset.
 * A catalog line is logged inside `use cache`, where request headers are unavailable, so it is
 * held until the same request's inventory line arrives and takes that line's session.
 */
export type LogKind = "catalog" | "inventory" | "price" | "invalidate";

export interface LogLine {
  seq: number;
  session: string;
  /** Document request this line belongs to; null for cache events outside a request. */
  request: number | null;
  kind: LogKind;
  text: string;
  cached: string;
  at: number;
}

export type LogEvent = { type: "line"; line: LogLine } | { type: "reset"; session: string };

interface Pending {
  kind: LogKind;
  text: string;
  at: number;
}

interface Store {
  lines: LogLine[];
  seq: number;
  /** Every document request ends with one inventory query, which is how requests are counted, per session. */
  inventoryCount: Record<string, number>;
  /** Inventory calls per session, dropped ones included: the request-end signal the log panel waits for. */
  requestEnds: Record<string, number>;
  pending: Pending[];
  listeners: Set<(event: LogEvent) => void>;
  enders: Set<() => void>;
}

const KINDS: Record<string, LogKind> = {
  "catalog query": "catalog",
  "inventory query": "inventory",
  "price query": "price",
  updateTag: "invalidate",
};

const CACHED: Record<LogKind, string> = {
  catalog: "unknown",
  inventory: "unknown",
  price: "unknown",
  invalidate: "unknown",
};

/** How long a held catalog line waits for its request's inventory line. */
const PENDING_MS = 10_000;

const g = globalThis as typeof globalThis & { __f2Log?: Store };
const store: Store = (g.__f2Log ??= {
  lines: [],
  seq: 0,
  inventoryCount: {},
  requestEnds: {},
  pending: [],
  listeners: new Set(),
  enders: new Set(),
});
// A store created by an earlier module version (HMR) may lack newer fields.
if (typeof store.inventoryCount !== "object") store.inventoryCount = {};
if (typeof store.requestEnds !== "object") store.requestEnds = {};
store.pending ??= [];
store.enders ??= new Set();

function emit(event: LogEvent) {
  for (const listener of store.listeners) {
    try {
      listener(event);
    } catch {
      /* a closed stream */
    }
  }
}

function push(session: string, kind: LogKind, text: string, at: number) {
  const count = store.inventoryCount[session] ?? 0;
  const request = kind === "invalidate" ? null : count + 1;
  if (kind === "inventory") store.inventoryCount[session] = count + 1;
  const line: LogLine = {
    seq: ++store.seq,
    session,
    request,
    kind,
    text,
    cached: CACHED[kind],
    at,
  };
  store.lines.push(line);
  emit({ type: "line", line });
}

function endRequest(session: string) {
  store.requestEnds[session] = (store.requestEnds[session] ?? 0) + 1;
  for (const ender of store.enders) ender();
}

/** The frame session of the current request, or "" outside a request (inside `use cache`). */
async function currentSession(): Promise<string> {
  try {
    return (await headers()).get("x-demo-session") ?? "";
  } catch {
    return "";
  }
}

/**
 * Appends one structured line. Lines about the `--reset` id (the reset reload) are dropped but
 * still count as a request end for the log panel.
 */
export function log(event: string, ...args: unknown[]): void {
  const kind = KINDS[event];
  if (!kind) return;
  const parts = args.filter((a) => a !== undefined && a !== null && a !== "").map(String);
  const text = [event, ...parts].join(" ");
  const at = Date.now();
  const dropped = parts.some((p) => p.endsWith(RESET_SUFFIX));
  if (kind === "catalog") {
    if (!dropped) store.pending.push({ kind, text, at });
    return;
  }
  if (kind === "inventory") {
    void currentSession().then((session) => {
      if (!dropped) {
        // A session's request has at most one catalog miss: hand the oldest held line to it.
        // The presenter's own mount request (no session) and dropped renders claim none.
        const held = session ? store.pending.filter((p) => at - p.at < PENDING_MS).slice(0, 1) : [];
        store.pending = store.pending.filter((p) => !held.includes(p) && at - p.at < PENDING_MS);
        for (const p of held) push(session, p.kind, p.text, p.at);
        push(session, kind, text, at);
      }
      endRequest(session);
    });
    return;
  }
  if (dropped) return;
  void currentSession().then((session) => push(session, kind, text, at));
}

export function snapshot(session: string): LogLine[] {
  return store.lines.filter((l) => l.session === session);
}

/** The session's request-end count to pass to `waitForRequestEnd`. */
export function requestEnds(session: string): number {
  return store.requestEnds[session] ?? 0;
}

export function subscribe(listener: (event: LogEvent) => void): () => void {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

export function resetLog(session: string): void {
  store.lines = [];
  store.pending = [];
  store.inventoryCount = {};
  emit({ type: "reset", session });
}

/**
 * Resolves once an inventory query of `session` has run since `ends` (`requestEnds(session)`
 * captured when the document's render started), or after `timeoutMs`. The log panel awaits this
 * so a document's own lines are in its HTML before the frame runtime reports ready.
 */
export function waitForRequestEnd(session: string, ends: number, timeoutMs: number): Promise<void> {
  if (requestEnds(session) > ends) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(done, timeoutMs);
    const ender = () => {
      if (requestEnds(session) > ends) done();
    };
    store.enders.add(ender);
    function done() {
      clearTimeout(timer);
      store.enders.delete(ender);
      resolve();
    }
  });
}

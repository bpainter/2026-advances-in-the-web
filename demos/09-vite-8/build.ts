import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "09-vite-8";
const FIXTURE = path.join(process.cwd(), "fixtures", "vite-measurements.json");

/**
 * The measurements `pnpm measure:vite` writes at rehearsal (PRD Part A, 10.5), read on every
 * request so a fresh run shows without a restart. Without the file, or with one that does not
 * parse, the frame keeps every cell at "Not measured".
 */
function measurements(): Response {
  let body = '{"measured":false}';
  if (existsSync(FIXTURE)) {
    const text = readFileSync(FIXTURE, "utf8");
    try {
      JSON.parse(text);
      body = text;
    } catch {
      body = '{"measured":false,"error":"fixtures/vite-measurements.json does not parse"}';
    }
  }
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

/** F4 Vite 8 locally: one static table, filled from fixtures/vite-measurements.json. */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    static: folderBuild(DEMO, "static", "Vite 8 locally", manifestDefaults({ sideEffects: [] })),
  },
  routes: [
    {
      method: "GET",
      path: `/demos/${DEMO}/static/measurements.json`,
      handler: () => measurements(),
    },
  ],
};

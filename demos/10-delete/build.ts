import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "10-delete";
const FIXTURE = path.join(process.cwd(), "fixtures", "npm-pull.json");

/**
 * The one npm pull `pnpm pull:npm` writes the week of the talk (PRD Part A, 10.5), read on every
 * request. Without the file, or with one that does not parse, the Weekly column stays empty.
 */
function npmPull(): Response {
  let body = '{"pulled":false}';
  if (existsSync(FIXTURE)) {
    const text = readFileSync(FIXTURE, "utf8");
    try {
      JSON.parse(text);
      body = text;
    } catch {
      body = '{"pulled":false,"error":"fixtures/npm-pull.json does not parse"}';
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

/** F5 What you can delete: one static table, its Weekly column filled from fixtures/npm-pull.json. */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    static: folderBuild(
      DEMO,
      "static",
      "What you can delete",
      manifestDefaults({ sideEffects: [], wrapper: { id: "dependency-review" } }),
    ),
  },
  routes: [
    { method: "GET", path: `/demos/${DEMO}/static/npm-pull.json`, handler: () => npmPull() },
  ],
};

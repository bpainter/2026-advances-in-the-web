import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "00-fixtures";

/**
 * Engine fixtures, dev only (PRD v5, 3.4): the spotlight fixture behind /fixtures/spotlight. The
 * registry leaves this folder out of production builds.
 */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    static: {
      manifest: { ...manifestDefaults({ sideEffects: [] }), demo: DEMO, build: "static" },
      dir: path.join(process.cwd(), "demos", DEMO, "spotlight"),
      title: "Spotlight fixture",
    },
  },
};

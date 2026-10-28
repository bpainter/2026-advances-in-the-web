import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "08-fast-follows";

/** F1 Still in motion: five tiles revealed one or two at a time (PRD v4, 2.3). */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    static: folderBuild(
      DEMO,
      "static",
      "Still in motion",
      manifestDefaults({
        sideEffects: [],
      }),
    ),
  },
};

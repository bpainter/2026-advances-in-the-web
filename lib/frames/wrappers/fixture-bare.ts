import type { WrapperDef } from "./types";

/** The spotlight fixture's wrapper (dev only): no context, the shown block alone. */
export const fixtureBare: WrapperDef = {
  id: "fixture-bare",
  banned: [],
  render: () => ({ before: "", after: "", shownClass: "wrap-shown--bare", styles: [], scripts: [] }),
};

import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";

// The same app and the same plugins for both setups; only the Vite version differs.
export default defineConfig({
  root: fileURLToPath(new URL("../app", import.meta.url)),
  plugins: [react(), svgr(), visualizer({ filename: "dist/stats.html", emitFile: false })],
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
  },
});

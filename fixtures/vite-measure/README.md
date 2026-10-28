# Vite measurement fixture

A small React app (`app/`, 30 components with CSS and an SVG imported through svgr) built by two
setups that differ only in the Vite version: `vite7/` (Vite 7.3.7) and `vite8/` (Vite 8.3.5), each
with @vitejs/plugin-react 5.2.0, vite-plugin-svgr 4.5.0 and rollup-plugin-visualizer 6.0.11, the
plugin versions a Vite 7 project has when it upgrades. `pnpm measure:vite` installs both, runs each
build five times cold and five times warm, and writes the medians, output size, warnings and
failing plugins to `fixtures/vite-measurements.json`.

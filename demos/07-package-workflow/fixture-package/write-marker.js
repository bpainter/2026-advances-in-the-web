// The whole install script: one line of text into .marker at the workspace
// root. INIT_CWD is the directory the install command ran in; pnpm and npm
// both set it. Nothing is read, fetched or executed.
const { writeFileSync } = require("node:fs");
const path = require("node:path");

const root = process.env.INIT_CWD || process.cwd();
writeFileSync(path.join(root, ".marker"), "written by report-exporter postinstall\n");
console.log("report-exporter postinstall: wrote .marker");

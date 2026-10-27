// A stand-in library surface so the fixture is a plausible dependency.
module.exports = {
  exportReport(rows) {
    return rows.map((row) => Object.values(row).join(",")).join("\n");
  },
};

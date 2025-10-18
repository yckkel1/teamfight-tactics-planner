const { join } = require("path");

const CONFIG = {
  SET_NAME: process.env.SET_NAME || "K.O. Coliseum",
  DATA_DIR: join(__dirname, "data"),
  OUTPUT_DIR: join(__dirname, ".data"),
  
  paths: {
    units: join(__dirname, "data", "units.set15.json"),
    tiers: join(__dirname, "data", "traitTiers.set15.json"),
    items: {
      components: join(__dirname, "data", "items", "components.set15.json"),
      completed: join(__dirname, "data", "items", "items.set15.json"),
      artifacts: join(__dirname, "data", "items", "artifacts.set15.json"),
      radiant: join(__dirname, "data", "items", "radiant.set15.json"),
      emblems: join(__dirname, "data", "items", "emblems.set15.json"),
    }
  },
  
  flags: {
    dryRun: !!process.env.DRY_RUN,
    strict: process.env.STRICT !== "0",
    verbose: !!process.env.VERBOSE,
  }
};

module.exports = CONFIG;
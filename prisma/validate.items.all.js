(async () => {
  try {
    const { validateComponents } = require("./validate.items.components");
    const { validateCompleted } = require("./validate.items.completed");
    const { validateArtifacts } = require("./validate.items.artifacts");
    const { validateRadiant } = require("./validate.items.radiant");
    const { validateEmblems } = require("./validate.items.emblems");

    await validateComponents();
    await validateCompleted();
    await validateArtifacts();
    await validateRadiant();
    await validateEmblems();
    console.log("\nOK: all item datasets validated.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
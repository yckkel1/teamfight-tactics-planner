const { validateComponents } = require("./components");
const { validateCompleted } = require("./completed");
const { validateArtifacts } = require("./artifacts");
const { validateRadiant } = require("./radiant");
const { validateEmblems } = require("./emblems");

async function validateItems() {
  console.log("Validating all item datasets...\n");

  await validateComponents();
  await validateCompleted();
  await validateArtifacts();
  await validateRadiant();
  await validateEmblems();

  console.log("\nOK: all item datasets validated.");
}

if (require.main === module) {
  validateItems().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { validateItems };
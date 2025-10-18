const { validateUnits } = require("./validators/units");
const { validateTiers } = require("./validators/tiers");
const { validateItems } = require("./validators/items");

async function validateAll() {
  console.log("Running all validations...\n");

  try {
    await validateUnits();
    await validateTiers();
    await validateItems();

    console.log("\n✅ All validations passed successfully!");
  } catch (error) {
    console.error("\n❌ Validation failed");
    throw error;
  }
}

if (require.main === module) {
  validateAll().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { validateAll };
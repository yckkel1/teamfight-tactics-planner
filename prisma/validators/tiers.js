const CONFIG = require("../config");
const DatabaseHelper = require("../utils/db");
const FileHelper = require("../utils/file");
const Logger = require("../utils/logger");

function uniq(arr) {
  return [...new Set(arr)];
}

async function validateTiers() {
  const logger = new Logger("validate.tiers");
  const db = new DatabaseHelper();

  try {
    const tiersData = FileHelper.readJSON(CONFIG.paths.tiers);

    const set = await db.getSet(CONFIG.SET_NAME, {
      traits: { include: { tiers: true } },
      units: { include: { traits: true } },
    });

    const dbTraitNames = new Set(set.traits.map((t) => t.name));

    // Check units have traits
    const unitsNoTraits = set.units.filter((u) => u.traits.length === 0).map((u) => u.name);
    if (unitsNoTraits.length) {
      logger.error(`Units missing traits: ${unitsNoTraits.join(", ")}`);
    }

    const dsTraitNames = new Set(Object.keys(tiersData));

    // Dataset traits exist in DB
    const missingInDB = [...dsTraitNames].filter((n) => !dbTraitNames.has(n));
    if (missingInDB.length) {
      logger.error(`Dataset traits missing in DB: ${missingInDB.join(", ")}`);
    }

    // DB traits missing in dataset
    const extraInDB = [...dbTraitNames].filter((n) => !dsTraitNames.has(n));
    if (extraInDB.length) {
      logger.warn(`DB traits not in dataset (tiers not seeded): ${extraInDB.join(", ")}`);
    }

    // Per-trait validation
    for (const name of Object.keys(tiersData)) {
      const tiers = tiersData[name];
      if (!Array.isArray(tiers)) {
        logger.error(`Trait '${name}' tiers value must be an array`);
        continue;
      }

      // minUnits strictly increasing
      const mins = tiers.map((t) => t.minUnits);
      const increasing = mins.every((v, i, a) => (i === 0 ? true : v > a[i - 1]));
      if (!increasing) {
        logger.error(`Trait '${name}' minUnits must be strictly increasing (got ${mins.join(" → ")})`);
      }

      // DB vs dataset minUnits match
      const dbTrait = set.traits.find((t) => t.name === name);
      if (dbTrait) {
        const dbMins = uniq(dbTrait.tiers.map((t) => t.minUnits)).sort((a, b) => a - b);
        const dsMins = uniq(mins).sort((a, b) => a - b);
        const dbStr = dbMins.join(",");
        const dsStr = dsMins.join(",");
        if (dbStr !== dsStr) {
          logger.error(`Tier breakpoints mismatch for '${name}': DB[${dbStr}] vs DS[${dsStr}]`);
        }
      }

      // Effects presence
      const missingEffects = tiers
        .map((t, idx) => ({ idx, ok: t.effects && typeof t.effects === "object" }))
        .filter((x) => !x.ok)
        .map((x) => mins[x.idx]);
      if (missingEffects.length) {
        logger.warn(`Trait '${name}' missing effects for minUnits: ${missingEffects.join(", ")}`);
      }
    }

    logger.info(`Set: ${set.name}`);
    logger.info(`Units: ${set.units.length}`);
    logger.info(`Traits: ${set.traits.length}`);

    if (!logger.summary()) {
      throw new Error("Validation failed for tiers");
    }

    console.log("\nOK: integrity checks passed (no errors).");
  } catch (error) {
    logger.error(error.message);
    throw error;
  } finally {
    await db.disconnect();
  }
}

if (require.main === module) {
  validateTiers().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { validateTiers };
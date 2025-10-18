const CONFIG = require("../config");
const DatabaseHelper = require("../utils/db");
const FileHelper = require("../utils/file");
const Logger = require("../utils/logger");

async function seedUnits() {
  const logger = new Logger("seed.units");
  const db = new DatabaseHelper();

  try {
    const units = FileHelper.readJSON(CONFIG.paths.units);
    const set = await db.getSet(CONFIG.SET_NAME);
    const unitMap = await db.getUnitMap(CONFIG.SET_NAME);

    let updated = 0;
    let skipped = 0;

    for (const unit of units) {
      if (!unit.baseStats || !unit.ability) {
        skipped++;
        continue;
      }

      const existing = unitMap.get(unit.name);
      if (!existing) {
        logger.warn(`Unit not in DB, skipping: ${unit.name}`);
        continue;
      }

      await db.prisma.unit.update({
        where: { id: existing.id },
        data: {
          baseStats: unit.baseStats,
          ability: unit.ability,
        },
      });

      updated++;
      logger.success(`${unit.name}`);
    }

    logger.info(`\nUpdated: ${updated}, Skipped: ${skipped}`);
  } catch (error) {
    logger.error(error.message);
    throw error;
  } finally {
    await db.disconnect();
  }
}

if (require.main === module) {
  seedUnits().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { seedUnits };
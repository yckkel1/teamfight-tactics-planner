const CONFIG = require("../config");
const DatabaseHelper = require("../utils/db");
const FileHelper = require("../utils/file");
const Logger = require("../utils/logger");

async function seedTiers() {
  const logger = new Logger("seed.tiers");
  const db = new DatabaseHelper();

  try {
    const set = await db.getSet(CONFIG.SET_NAME);
    const data = FileHelper.readJSON(CONFIG.paths.tiers);

    for (const [traitName, tiers] of Object.entries(data)) {
      const trait = await db.prisma.trait.findUnique({
        where: { setId_name: { setId: set.id, name: traitName } },
      });

      if (!trait) {
        logger.warn(`Missing trait in DB: ${traitName}`);
        continue;
      }

      await db.prisma.traitTier.deleteMany({ where: { traitId: trait.id } });

      const rows = (tiers || []).map((t) => ({
        traitId: trait.id,
        minUnits: t.minUnits,
        note: t.note ?? null,
        effects: t.effects ?? {},
      }));

      if (rows.length) {
        await db.prisma.traitTier.createMany({ data: rows });
      }
      
      logger.success(`${traitName}: ${rows.length} tier(s)`);
    }

    logger.info(`\nTrait tiers seeded successfully.`);
  } catch (error) {
    logger.error(error.message);
    throw error;
  } finally {
    await db.disconnect();
  }
}

if (require.main === module) {
  seedTiers().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { seedTiers };
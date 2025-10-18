const { z } = require("zod");
const CONFIG = require("../config");
const FileHelper = require("../utils/file");
const DatabaseHelper = require("../utils/db");
const Logger = require("../utils/logger");
const { validateAbilityStats } = require("../utils/validation");

const ManaSchema = z.object({
  start: z.number().nullable(),
  max: z.number().nullable()
});

const BaseStatsSchema = z.object({
  hp: z.array(z.number()).length(3),
  ad: z.array(z.number()).length(3),
  as: z.number(),
  armor: z.number(),
  mr: z.number(),
  range: z.number(),
  mana: ManaSchema,
});

const AbilitySchema = z.object({
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  stats: z.unknown(),
  text: z.string().optional(),
});

const UnitSchema = z.object({
  name: z.string().min(1),
  baseStats: BaseStatsSchema,
  ability: AbilitySchema,
});

async function validateUnits() {
  const logger = new Logger("validate.units");
  
  const data = FileHelper.readJSON(CONFIG.paths.units);
  FileHelper.validateArray(data, CONFIG.paths.units);

  const db = new DatabaseHelper();
  let dbUnitNames;
  
  try {
    const set = await db.getSet(CONFIG.SET_NAME, { units: true });
    dbUnitNames = new Set(set.units.map(u => u.name));
  } finally {
    await db.disconnect();
  }

  const seenNames = new Set();
  let okCount = 0;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const location = `#${i}(${entry && entry.name ? entry.name : "?"})`;

    const parsed = UnitSchema.safeParse(entry);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(x => `${x.path.join(".")}: ${x.message}`).join("; ");
      logger.error(`${location}: ${errors}`);
      continue;
    }

    if (seenNames.has(entry.name)) {
      logger.error(`${location}: duplicate unit name`);
    }
    seenNames.add(entry.name);

    if (!dbUnitNames.has(entry.name)) {
      logger.warn(`${location}: unit not in DB roster (name mismatch?)`);
    }

    validateAbilityStats(entry.ability.stats, `${location}.ability.stats`, logger);

    if (!logger.hasErrors()) {
      okCount++;
    }
  }

  const missingInJson = [...dbUnitNames].filter(n => !seenNames.has(n));
  if (missingInJson.length) {
    logger.warn(`Units in DB but missing from JSON (${missingInJson.length}): ${missingInJson.join(", ")}`);
  }

  logger.info(`Validated ${okCount}/${data.length} JSON unit entries against schema.`);
  
  if (!logger.summary()) {
    throw new Error("Validation failed for units");
  }
  
  console.log("\nOK: units JSON is valid.");
}

if (require.main === module) {
  validateUnits().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateUnits };
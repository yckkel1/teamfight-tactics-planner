// Usage:
//  - Default: node prisma/import.units.js
//  - Options:
//      IMPORT_SET="K.O. Coliseum"   # override set name
//      IMPORT_PATH=prisma/data/units.set15.json
//      IMPORT_DRY=1                  # dry-run (no writes)
//      IMPORT_STRICT=0               # warn on unknown units instead of failing
// Why: takes units.set15.json (validated separately) and writes baseStats/ability into DB.

const { readFileSync } = require("fs");
const { join, resolve } = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SET_NAME = process.env.IMPORT_SET || "K.O. Coliseum";
const DATA_PATH = resolve(process.env.IMPORT_PATH || join(__dirname, "data", "units.set15.json"));
const DRY = !!process.env.IMPORT_DRY;
const STRICT = process.env.IMPORT_STRICT !== "0";

async function main() {
  const set = await prisma.gameSet.findUnique({
    where: { name: SET_NAME },
    include: { units: true },
  });
  if (!set) {
    throw new Error(`GameSet not found: ${SET_NAME}. Run prisma/seed.js first.`);
  }

  const dbByName = new Map(set.units.map((u) => [u.name, u]));
  const raw = JSON.parse(readFileSync(DATA_PATH, "utf8"));

  let updated = 0;
  let skipped = 0;
  const unknown = [];
  const incomplete = [];

  for (const entry of raw) {
    const found = dbByName.get(entry.name);
    if (!found) {
      if (STRICT) unknown.push(entry.name);
      else console.warn(`[warn] unknown unit (skipping): ${entry.name}`);
      continue;
    }

    const hasBase = entry.baseStats && typeof entry.baseStats === "object";
    const hasAbility = entry.ability && typeof entry.ability === "object";
    if (!hasBase && !hasAbility) {
      skipped += 1;
      continue;
    }

    const data = {};
    if (hasBase) data.baseStats = entry.baseStats;
    if (hasAbility) data.ability = entry.ability;

    if (DRY) {
      console.log(`[dry] would update ${entry.name}: ${Object.keys(data).join("+")}`);
      continue;
    }

    try {
      await prisma.unit.update({ where: { id: found.id }, data });
      updated += 1;
      console.log(`[ok] ${entry.name}`);
    } catch (e) {
      incomplete.push(`${entry.name}: ${e.message}`);
    }
  }

  if (STRICT && unknown.length) {
    throw new Error(`Unknown unit names (${unknown.length}): ${unknown.join(", ")}`);
  }

  if (incomplete.length) {
    console.error("\nErrors while updating:");
    for (const m of incomplete) console.error(" - " + m);
    process.exitCode = 1;
  }

  console.log(
    `\nSummary → updated: ${updated}, skipped(no data): ${skipped}, unknown: ${unknown.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

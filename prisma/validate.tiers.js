// Verifies DB ←→ dataset integrity for Set 15 (units/traits + tiers/effects)
// Run: pnpm run db:check

const { readFileSync } = require("fs");
const { join } = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SET_NAME = "K.O. Coliseum";
const TIERS_PATH = join(__dirname, "data", "traitTiers.set15.json");

function uniq(arr) {
  return [...new Set(arr)];
}

async function main() {
  const issues = [];
  const warns = [];

  // 1) Load dataset JSON
  let tiersData;
  try {
    tiersData = JSON.parse(readFileSync(TIERS_PATH, "utf8"));
  } catch (e) {
    issues.push(`Cannot read dataset: ${TIERS_PATH} → ${e.message}`);
  }

  // 2) Load DB set with traits, tiers, units and unit-trait links
  const set = await prisma.gameSet.findUnique({
    where: { name: SET_NAME },
    include: {
      traits: { include: { tiers: true } },
      units: { include: { traits: true } },
    },
  });

  if (!set) {
    issues.push(`GameSet not found: ${SET_NAME}. Run prisma/seed.js first.`);
  } else {
    // 3) Basic coverage checks
    const dbTraitNames = new Set(set.traits.map((t) => t.name));
    const dbUnitNames = set.units.map((u) => u.name);

    // 3a) Every unit has ≥ 1 trait
    const unitsNoTraits = set.units.filter((u) => u.traits.length === 0).map((u) => u.name);
    if (unitsNoTraits.length) {
      issues.push(`Units missing traits: ${unitsNoTraits.join(", ")}`);
    }

    if (tiersData) {
      const dsTraitNames = new Set(Object.keys(tiersData));

      // 3b) Dataset trait names exist in DB
      const missingInDB = [...dsTraitNames].filter((n) => !dbTraitNames.has(n));
      if (missingInDB.length) {
        issues.push(`Dataset traits missing in DB: ${missingInDB.join(", ")}`);
      }

      // 3c) DB has traits that dataset lacks (warn)
      const extraInDB = [...dbTraitNames].filter((n) => !dsTraitNames.has(n));
      if (extraInDB.length) {
        warns.push(`DB traits not present in dataset (tiers not seeded): ${extraInDB.join(", ")}`);
      }

      // 4) Per-trait tier checks
      for (const name of Object.keys(tiersData)) {
        const tiers = tiersData[name];
        if (!Array.isArray(tiers)) {
          issues.push(`Trait '${name}' tiers value must be an array.`);
          continue;
        }

        // 4a) minUnits strictly increasing
        const mins = tiers.map((t) => t.minUnits);
        const increasing = mins.every((v, i, a) => (i === 0 ? true : v > a[i - 1]));
        if (!increasing) {
          issues.push(
            `Trait '${name}' minUnits must be strictly increasing (got ${mins.join(" → ")}).`,
          );
        }

        // 4b) DB vs dataset minUnits match (if trait exists in DB)
        const dbTrait = set.traits.find((t) => t.name === name);
        if (dbTrait) {
          const dbMins = uniq(dbTrait.tiers.map((t) => t.minUnits)).sort((a, b) => a - b);
          const dsMins = uniq(mins).sort((a, b) => a - b);
          const dbStr = dbMins.join(",");
          const dsStr = dsMins.join(",");
          if (dbStr !== dsStr) {
            issues.push(`Tier breakpoints mismatch for '${name}': DB[${dbStr}] vs DS[${dsStr}]`);
          }
        }

        // 4c) Effects presence (warn if missing)
        const missingEffects = tiers
          .map((t, idx) => ({ idx, ok: t.effects && typeof t.effects === "object" }))
          .filter((x) => !x.ok)
          .map((x) => mins[x.idx]);
        if (missingEffects.length) {
          warns.push(`Trait '${name}' missing effects for minUnits: ${missingEffects.join(", ")}`);
        }
      }
    }
  }

  // 5) Report
  console.log("— Integrity Check —");
  if (set) {
    console.log(`Set: ${set.name}`);
    console.log(`Units: ${set.units.length}`);
    console.log(`Traits: ${set.traits.length}`);
  }
  if (issues.length) {
    console.error(`\nERRORS (${issues.length}):`);
    for (const m of issues) console.error(" - " + m);
  }
  if (warns.length) {
    console.warn(`\nWARNINGS (${warns.length}):`);
    for (const m of warns) console.warn(" - " + m);
  }

  if (issues.length) process.exit(1);
  console.log("\nOK: integrity checks passed (no errors).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

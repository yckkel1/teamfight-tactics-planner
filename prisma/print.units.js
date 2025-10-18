const CONFIG = require("./config");
const DatabaseHelper = require("./utils/db");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const full = args.includes("--full");
const onlyFilled = args.includes("--only-filled");
const setIdx = args.indexOf("--set");
const SET_NAME = setIdx !== -1 ? args[setIdx + 1] : CONFIG.SET_NAME;

function pad(s, n) {
  return String(s).padEnd(n, " ");
}

function fmtVal(v) {
  if (v == null) return "null";
  if (Array.isArray(v)) return v.join("/");
  if (typeof v === "object") return "{…}";
  return String(v);
}

function flattenStats(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([k, v]) => `${k}: ${fmtVal(v)}`);
}

async function printUnits() {
  const db = new DatabaseHelper();

  try {
    const set = await db.prisma.gameSet.findUnique({
      where: { name: SET_NAME },
      include: {
        units: {
          include: {
            traits: { include: { trait: true } },
          },
        },
      },
    });

    if (!set) {
      console.error(`Set not found: ${SET_NAME}`);
      process.exit(1);
    }

    let units = [...set.units].sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

    if (asJson) {
      const payload = units.map((u) => ({
        name: u.name,
        cost: u.cost,
        traits: u.traits.map((ut) => ut.trait.name).sort(),
        ability: u.ability || null,
      }));
      console.log(
        JSON.stringify({ set: set.name, count: payload.length, units: payload }, null, 2)
      );
      return;
    }

    const nameW = Math.max(4, ...units.map((u) => u.name.length));

    console.log(`Set: ${set.name}`);
    console.log(`\n=== UNITS & ABILITIES (${units.length}) ===`);
    console.log(`${pad("Cost", 4)}  ${pad("Unit", nameW)}  Ability / Summary`);

    if (onlyFilled) {
      units = units.filter((u) => u.ability && Object.keys(u.ability || {}).length > 0);
    }

    for (const u of units) {
      const ability = u.ability || null;
      const header = `${pad(u.cost, 4)}  ${pad(u.name, nameW)}`;
      
      if (!ability) {
        console.log(`${header}  (no ability)`);
        continue;
      }
      
      if (full) {
        console.log(`${header}  ${ability.name}`);
        console.log(`  tags: ${(ability.tags || []).join(", ")}`);
        const statsJson = JSON.stringify(ability.stats || {}, null, 2);
        console.log(`  stats: ${statsJson.split("\n").map((l) => "  " + l).join("\n")}`);
        if (ability.text) console.log(`  text: ${ability.text}`);
      } else {
        const tags = (ability.tags || []).join(", ");
        const statsList = flattenStats(ability.stats).slice(0, 6).join(" | ");
        console.log(`${header}  ${ability.name}${tags ? `  [${tags}]` : ""}`);
        if (statsList) console.log(`  · ${statsList}`);
      }
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

if (require.main === module) {
  printUnits();
}

module.exports = { printUnits };
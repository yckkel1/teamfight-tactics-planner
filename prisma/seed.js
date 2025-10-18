const { PrismaClient } = require("@prisma/client");
const CONFIG = require("./config");
const Logger = require("./utils/logger");

const prisma = new PrismaClient();

const CLASS_TRAITS = new Set([
  "Bastion",
  "Duelist",
  "Edgelord",
  "Executioner",
  "Heavyweight",
  "Juggernaut",
  "Prodigy",
  "Protector",
  "Sniper",
  "Sorcerer",
  "Strategist",
]);

const RAW_UNITS = [
  { name: "Aatrox", cost: 1, traits: ["Mighty Mech", "Heavyweight", "Juggernaut"] },
  { name: "Ahri", cost: 3, traits: ["Star Guardian", "Sorcerer"] },
  { name: "Akali", cost: 4, traits: ["Supreme Cells", "Executioner"] },
  { name: "Ashe", cost: 4, traits: ["Crystal Gambit", "Duelist"] },
  { name: "Braum", cost: 5, traits: ["The Champ", "Luchador", "Bastion"] },
  { name: "Caitlyn", cost: 3, traits: ["Battle Academia", "Sniper"] },
  { name: "Darius", cost: 3, traits: ["Supreme Cells", "Heavyweight"] },
  { name: "Dr. Mundo", cost: 2, traits: ["Luchador", "Juggernaut"] },
  { name: "Ekko", cost: 5, traits: ["Prodigy", "Sorcerer", "Strategist"] },
  { name: "Ezreal", cost: 1, traits: ["Battle Academia", "Prodigy"] },
  { name: "Gangplank", cost: 2, traits: ["Mighty Mech", "Duelist"] },
  { name: "Garen", cost: 1, traits: ["Battle Academia", "Bastion"] },
  { name: "Gnar", cost: 1, traits: ["Luchador", "Sniper"] },
  { name: "Gwen", cost: 5, traits: ["Soul Fighter", "Sorcerer"] },
  { name: "Janna", cost: 2, traits: ["Crystal Gambit", "Protector", "Strategist"] },
  { name: "Jarvan IV", cost: 4, traits: ["Mighty Mech", "Strategist"] },
  { name: "Jayce", cost: 3, traits: ["Battle Academia", "Heavyweight"] },
  { name: "Jhin", cost: 2, traits: ["Wraith", "Sniper"] },
  { name: "Jinx", cost: 4, traits: ["Star Guardian", "Sniper"] },
  { name: "Kai'Sa", cost: 2, traits: ["Supreme Cells", "Duelist"] },
  { name: "Kalista", cost: 1, traits: ["Soul Fighter", "Executioner"] },
  { name: "Karma", cost: 4, traits: ["Mighty Mech", "Sorcerer"] },
  { name: "Katarina", cost: 2, traits: ["Battle Academia", "Executioner"] },
  { name: "Kayle", cost: 1, traits: ["Wraith", "Duelist"] },
  { name: "Kennen", cost: 1, traits: ["Supreme Cells", "Protector", "Sorcerer"] },
  { name: "Kobuko", cost: 2, traits: ["Mentor", "Heavyweight"] },
  { name: "Kog'Maw", cost: 3, traits: ["Monster Trainer"] },
  { name: "K'Sante", cost: 4, traits: ["Wraith", "Protector"] },
  { name: "Lee Sin", cost: 5, traits: ["Stance Master", "Duelist", "Juggernaut", "Executioner"] },
  { name: "Leona", cost: 4, traits: ["Battle Academia", "Bastion"] },
  { name: "Lucian", cost: 1, traits: ["Mighty Mech", "Sorcerer"] },
  { name: "Lulu", cost: 3, traits: ["Monster Trainer"] },
  { name: "Lux", cost: 2, traits: ["Soul Fighter", "Sorcerer"] },
  { name: "Malphite", cost: 1, traits: ["The Crew", "Protector"] },
  { name: "Malzahar", cost: 3, traits: ["Wraith", "Prodigy"] },
  { name: "Naafiri", cost: 1, traits: ["Soul Fighter", "Juggernaut"] },
  { name: "Neeko", cost: 3, traits: ["Star Guardian", "Protector"] },
  { name: "Poppy", cost: 4, traits: ["Star Guardian", "Heavyweight"] },
  { name: "Rakan", cost: 2, traits: ["Battle Academia", "Protector"] },
  { name: "Rammus", cost: 3, traits: ["Monster Trainer"] },
  { name: "Rell", cost: 1, traits: ["Star Guardian", "Bastion"] },
  { name: "Ryze", cost: 4, traits: ["Mentor", "Executioner", "Strategist"] },
  { name: "Samira", cost: 4, traits: ["Soul Fighter", "Edgelord"] },
  { name: "Senna", cost: 3, traits: ["Mighty Mech", "Executioner"] },
  { name: "Seraphine", cost: 5, traits: ["Star Guardian", "Prodigy"] },
  { name: "Sett", cost: 4, traits: ["Soul Fighter", "Juggernaut"] },
  { name: "Shen", cost: 2, traits: ["The Crew", "Bastion", "Edgelord"] },
  { name: "Sivir", cost: 1, traits: ["The Crew", "Sniper"] },
  { name: "Smolder", cost: 3, traits: ["Monster Trainer"] },
  { name: "Swain", cost: 3, traits: ["Crystal Gambit", "Bastion", "Sorcerer"] },
  { name: "Syndra", cost: 1, traits: ["Crystal Gambit", "Star Guardian", "Prodigy"] },
  { name: "Twisted Fate", cost: 5, traits: ["Rogue Captain", "The Crew"] },
  { name: "Udyr", cost: 3, traits: ["Mentor", "Juggernaut", "Duelist"] },
  { name: "Varus", cost: 5, traits: ["Wraith", "Sniper"] },
  { name: "Vi", cost: 2, traits: ["Crystal Gambit", "Juggernaut"] },
  { name: "Viego", cost: 3, traits: ["Soul Fighter", "Duelist"] },
  { name: "Volibear", cost: 4, traits: ["Luchador", "Edgelord"] },
  { name: "Xayah", cost: 2, traits: ["Star Guardian", "Edgelord"] },
  { name: "Xin Zhao", cost: 2, traits: ["Soul Fighter", "Bastion"] },
  { name: "Yasuo", cost: 3, traits: ["Mentor", "Edgelord"] },
  { name: "Yone", cost: 5, traits: ["Mighty Mech", "Edgelord"] },
  { name: "Yuumi", cost: 4, traits: ["Battle Academia", "Prodigy"] },
  { name: "Zac", cost: 1, traits: ["Wraith", "Heavyweight"] },
  { name: "Ziggs", cost: 3, traits: ["The Crew", "Strategist"] },
  { name: "Zyra", cost: 5, traits: ["Crystal Gambit", "Rosemother"] },
];

async function upsertSet() {
  return prisma.gameSet.upsert({
    where: { name: CONFIG.SET_NAME },
    update: {},
    create: { id: "set15", name: CONFIG.SET_NAME, startPatch: "15.0" },
  });
}

async function upsertTrait(setId, name) {
  const category = CLASS_TRAITS.has(name) ? "Class" : "Origin";
  return prisma.trait.upsert({
    where: { setId_name: { setId, name } },
    update: { category },
    create: { setId, name, category },
  });
}

async function upsertUnit(setId, unit) {
  return prisma.unit.upsert({
    where: { setId_name: { setId, name: unit.name } },
    update: { cost: unit.cost, role: unit.role ?? null },
    create: {
      setId,
      name: unit.name,
      cost: unit.cost,
      role: unit.role ?? null,
      baseStats: {},
      ability: null,
    },
  });
}

async function linkUnitTraits(unitId, traitIds) {
  await prisma.unitTrait.deleteMany({ where: { unitId } });
  if (traitIds.length) {
    await prisma.unitTrait.createMany({ data: traitIds.map((traitId) => ({ unitId, traitId })) });
  }
}

async function main() {
  const logger = new Logger("seed");

  const set = await upsertSet();
  logger.success(`Set upserted: ${set.name}`);

  const traitNames = Array.from(new Set(RAW_UNITS.flatMap((u) => u.traits)));
  const traitIdByName = new Map();
  
  for (const name of traitNames) {
    const t = await upsertTrait(set.id, name);
    traitIdByName.set(name, t.id);
  }
  logger.success(`Traits seeded: ${traitNames.length}`);

  for (const u of RAW_UNITS) {
    const unit = await upsertUnit(set.id, u);
    const traitIds = u.traits.map((n) => traitIdByName.get(n)).filter(Boolean);
    await linkUnitTraits(unit.id, traitIds);
  }
  logger.success(`Units seeded: ${RAW_UNITS.length}`);

  logger.info(`\nSeeded Set 15 roster: ${RAW_UNITS.length} units, ${traitNames.length} traits.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
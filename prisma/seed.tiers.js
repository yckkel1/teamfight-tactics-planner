// Applies trait tiers/effects from JSON dataset for Set 15.
// Run: pnpm run db:seed:tiers
// =============================

const { readFileSync } = require("fs");
const { join } = require("path");
const { PrismaClient: Prisma2 } = require("@prisma/client");
const prisma2 = new Prisma2();

async function seedTiers() {
  const set = await prisma2.gameSet.findUnique({ where: { name: "K.O. Coliseum" } });
  if (!set) throw new Error("GameSet not found. Run prisma/seed.js first.");

  const jsonPath = join(__dirname, "data", "traitTiers.set15.json");
  const data = JSON.parse(readFileSync(jsonPath, "utf8"));

  for (const [traitName, tiers] of Object.entries(data)) {
    const trait = await prisma2.trait.findUnique({
      where: { setId_name: { setId: set.id, name: traitName } },
    });
    if (!trait) {
      console.warn(`[warn] missing trait in DB: ${traitName}`);
      continue;
    }

    await prisma2.traitTier.deleteMany({ where: { traitId: trait.id } });

    const rows = (tiers || []).map((t) => ({
      traitId: trait.id,
      minUnits: t.minUnits,
      note: t.note ?? null,
      effects: t.effects ?? {},
    }));

    if (rows.length) await prisma2.traitTier.createMany({ data: rows });
    console.log(`[ok] ${traitName}: ${rows.length} tier(s)`);
  }
}

seedTiers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma2.$disconnect();
  });

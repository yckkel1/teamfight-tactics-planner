// Purpose: update Unit.baseStats and Unit.ability for Set 15 from JSON dataset.
// Run: pnpm run db:seed:units
// =============================

const { readFileSync } = require('fs');
const { join } = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SET_NAME = 'K.O. Coliseum';
const DATA_PATH = join(__dirname, 'data', 'units.set15.json');

async function main() {
  // load dataset
  const raw = readFileSync(DATA_PATH, 'utf8');
  const units = JSON.parse(raw);

  const set = await prisma.gameSet.findUnique({ where: { name: SET_NAME } });
  if (!set) throw new Error(`GameSet not found: ${SET_NAME}. Run prisma/seed.js first.`);

  let updated = 0;
  for (const u of units) {
    if (!u.baseStats || !u.ability) {
      // skip entries without complete data
      continue;
    }
    const found = await prisma.unit.findUnique({
      where: { setId_name: { setId: set.id, name: u.name } },
      select: { id: true },
    });
    if (!found) {
      console.warn(`[warn] unit not in DB, skipping: ${u.name}`);
      continue;
    }

    await prisma.unit.update({
      where: { id: found.id },
      data: {
        baseStats: u.baseStats,
        ability: u.ability,
      },
    });
    updated += 1;
    console.log(`[ok] ${u.name}`);
  }

  console.log(`\nUpdated ${updated} unit(s) with base stats & abilities.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// Seed a minimal Set 15 example: Jinx + (Star Guardian, Sniper)
// Run: pnpm exec prisma db seed

/* WHY CommonJS? Avoids ESM config churn. */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertSet() {
  // Deterministic ID so other rows can reference easily
  return prisma.gameSet.upsert({
    where: { name: 'K.O. Coliseum' },
    update: {},
    create: { id: 'set15', name: 'K.O. Coliseum', startPatch: '15.0' },
  });
}

async function upsertTrait(setId, name, category, description, tiers) {
  // Upsert trait by composite (setId, name)
  const trait = await prisma.trait.upsert({
    where: { setId_name: { setId, name } },
    update: {},
    create: { setId, name, category, description },
  });

  // Replace tiers idempotently for clarity
  await prisma.traitTier.deleteMany({ where: { traitId: trait.id } });
  if (tiers?.length) {
    await prisma.traitTier.createMany({
      data: tiers.map((t) => ({ traitId: trait.id, ...t })),
    });
  }
  return trait;
}

async function upsertUnit(setId, unit) {
  const created = await prisma.unit.upsert({
    where: { setId_name: { setId, name: unit.name } },
    update: {},
    create: {
      setId,
      name: unit.name,
      cost: unit.cost,
      role: unit.role,
      baseStats: unit.baseStats,
      ability: unit.ability,
    },
  });
  return created;
}

async function linkUnitTraits(unitId, traitIds) {
  if (!traitIds.length) return;
  // Clear then insert (idempotent seed)
  await prisma.unitTrait.deleteMany({ where: { unitId } });
  await prisma.unitTrait.createMany({
    data: traitIds.map((traitId) => ({ unitId, traitId })),
  });
}

async function main() {
  const set = await upsertSet();

  // --- Traits ---
  const starGuardian = await upsertTrait(set.id, 'Star Guardian', 'Origin',
    'Teamwork bonus scales with number of Star Guardians.', [
      { minUnits: 2, note: '100%', effects: { teamwork_bonus_multiplier_pct: 100 } },
      { minUnits: 3, note: '110%', effects: { teamwork_bonus_multiplier_pct: 110 } },
      { minUnits: 4, note: '120%', effects: { teamwork_bonus_multiplier_pct: 120 } },
      { minUnits: 5, note: '130%', effects: { teamwork_bonus_multiplier_pct: 130 } },
      { minUnits: 6, note: '140%', effects: { teamwork_bonus_multiplier_pct: 140 } },
      { minUnits: 7, note: '150%', effects: { teamwork_bonus_multiplier_pct: 150 } },
      { minUnits: 8, note: '160%', effects: { teamwork_bonus_multiplier_pct: 160 } },
      { minUnits: 9, note: '180%', effects: { teamwork_bonus_multiplier_pct: 180 } },
      { minUnits: 10, note: '200%', effects: { teamwork_bonus_multiplier_pct: 200 } },
    ]);

  const sniper = await upsertTrait(set.id, 'Sniper', 'Class',
    'Gain Damage Amp; extra per hex to target.', [
      { minUnits: 2, note: '2 units', effects: { damage_amp_pct: 13, per_hex_pct: 3 } },
      { minUnits: 3, note: '3 units', effects: { damage_amp_pct: 16, per_hex_pct: 5 } },
      { minUnits: 4, note: '4 units', effects: { damage_amp_pct: 22, per_hex_pct: 7 } },
      { minUnits: 5, note: '5 units', effects: { damage_amp_pct: 25, per_hex_pct: 10 } },
    ]);

  // --- Unit: Jinx ---
  const jinx = await upsertUnit(set.id, {
    name: 'Jinx',
    cost: 4,
    role: 'Marksman',
    baseStats: {
      hp: 850, ad: 70, as: 0.75, armor: 35, mr: 35, range: 4,
      mana: { start: 10, max: 80 },
    },
    ability: {
      name: 'Star Rocket Blast Off!',
      passive: 'Attacks grant stacking AS; crits grant more.',
      numbers: {
        attack_speed_per_attack_pct: [6, 6, 30],
        damage: [280, 420, 1260],
        split_damage: [575, 875, 4000],
      },
      scaling: { damage: 'AD' },
    },
  });

  await linkUnitTraits(jinx.id, [starGuardian.id, sniper.id]);

  console.log('Seeded: Set', set.name, '| Unit:', jinx.name, '| Traits:', 'Star Guardian, Sniper');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

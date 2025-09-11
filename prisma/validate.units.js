// Run: pnpm add -D zod && node prisma/validate.units.js
// Optional script: package.json → { "scripts": { "validate:units": "node prisma/validate.units.js" } }

const { readFileSync } = require("fs");
const { join } = require("path");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SET_NAME = "K.O. Coliseum";
const DATA_PATH = join(__dirname, "data", "units.set15.json");

// -------- helpers --------
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isNumArr3 = (v) => Array.isArray(v) && v.length === 3 && v.every(isNum);
const isSnake = (k) => /^[a-z][a-z0-9_]*$/.test(k);
const isDamageKeyOK = (k) =>
  /^(dmg_(ad|ap|magic|true|mixed)_(flat|ratio_pct|hp_pct)|dmg_hp_pct|dmg_target_hp_pct)$/.test(k);

const allowedNumericKeys = new Set([
  "as_bonus_pct",
  "as_bonus_duration_sec",
  "ad_per_potential_flat",
  "ap_per_potential_flat",
  "on_hit_magic_flat",
  "active_duration_sec",
  "self_ad_bonus_pct",
  "ally_ad_bonus_pct",
  "ally_targets",
  "stacks_on_cast",
  "stack_max_hp_flat",
  "stack_max_hp_per_potential_flat",
  "wave_every_attacks",
  "wave_damage_magic_flat",
  "wave_shred_mr_pct",
  "wave_shred_duration_sec",
]);

const allowedTextKeys = new Set([
  "ally_targeting",
  "damage_type",
  "stack_duration",
  "targeting",
  "amp_curve",
]);
const allowedBooleanKeys = new Set(["pierce_on_kill"]);
const allowedStringListKeys = new Set(["amp_applies"]);

function validateStatsObject(stats, path = "ability.stats") {
  const errors = [];
  if (stats == null || typeof stats !== "object" || Array.isArray(stats)) {
    errors.push(`${path} must be an object`);
    return errors;
  }

  for (const [k, v] of Object.entries(stats)) {
    if (!isSnake(k)) errors.push(`${path}.${k}: key must be snake_case`);

    // Damage keys pattern
    if (k.startsWith("dmg_")) {
      if (!isDamageKeyOK(k))
        errors.push(
          `${path}.${k}: invalid damage key; use dmg_{ad|ap|magic|true|mixed}_{flat|ratio_pct|hp_pct}`,
        );
      if (!(isNum(v) || isNumArr3(v)))
        errors.push(`${path}.${k}: value must be number or [n1,n2,n3]`);
      continue;
    }

    // Heal keys pattern
    if (k.startsWith("heal_")) {
      if (!(isNum(v) || isNumArr3(v)))
        errors.push(`${path}.${k}: value must be number or [n1,n2,n3]`);
      continue;
    }

    // Duration/range fields
    if (k.endsWith("_sec") || k.endsWith("_pct") || k.endsWith("_flat")) {
      if (!(isNum(v) || isNumArr3(v)))
        errors.push(`${path}.${k}: value must be number or [n1,n2,n3]`);
      continue;
    }

    // Known keys by type
    if (allowedNumericKeys.has(k)) {
      if (!(isNum(v) || isNumArr3(v)))
        errors.push(`${path}.${k}: value must be number or [n1,n2,n3]`);
      continue;
    }
    if (allowedTextKeys.has(k)) {
      if (typeof v !== "string") errors.push(`${path}.${k}: value must be a string`);
      continue;
    }
    if (allowedBooleanKeys.has(k)) {
      if (typeof v !== "boolean") errors.push(`${path}.${k}: value must be boolean`);
      continue;
    }
    if (allowedStringListKeys.has(k)) {
      if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
        errors.push(`${path}.${k}: value must be an array of strings`);
      }
      continue;
    }

    // Complex/nested structures
    if (k === "tactician_power") {
      if (!Array.isArray(v)) {
        errors.push(`${path}.${k}: must be an array`);
        continue;
      }
      v.forEach((entry, i) => {
        if (typeof entry !== "object" || entry == null) {
          errors.push(`${path}.${k}[${i}]: must be an object`);
          return;
        }
        if (!isNum(entry.min_level)) errors.push(`${path}.${k}[${i}].min_level must be a number`);
        if (entry.effects == null || typeof entry.effects !== "object") {
          errors.push(`${path}.${k}[${i}].effects must be an object`);
          return;
        }
        // recursively validate nested effect keys
        errors.push(...validateStatsObject(entry.effects, `${path}.${k}[${i}].effects`));
      });
      continue;
    }

    // Fallback: allow booleans/strings for feature flags
    if (!(isNum(v) || isNumArr3(v) || typeof v === "boolean" || typeof v === "string")) {
      errors.push(`${path}.${k}: unsupported value type`);
    }
  }

  return errors;
}

// -------- Zod schemas --------
const ManaSchema = z.object({ start: z.number().nullable(), max: z.number().nullable() });
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
  stats: z.unknown(), // custom-validated later
  text: z.string().optional(),
});

const UnitSchema = z.object({
  name: z.string().min(1),
  baseStats: BaseStatsSchema,
  ability: AbilitySchema,
});

// -------- main --------
(async () => {
  const issues = [];
  const warns = [];

  // Load DB units
  const set = await prisma.gameSet.findUnique({
    where: { name: SET_NAME },
    include: { units: true },
  });
  if (!set) {
    console.error(`Set not found: ${SET_NAME}. Run prisma/seed.js first.`);
    process.exit(1);
  }
  const dbUnitNames = new Set(set.units.map((u) => u.name));

  // Load JSON
  let raw;
  try {
    raw = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    console.error(`Cannot read ${DATA_PATH}: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(raw)) {
    console.error("units.set15.json must be an array");
    process.exit(1);
  }

  const seenNames = new Set();
  let okCount = 0;

  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    const where = `#${i}(${entry && entry.name ? entry.name : "?"})`;

    // Shape
    const parsed = UnitSchema.safeParse(entry);
    if (!parsed.success) {
      issues.push(
        `${where}: ${parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`,
      );
      continue;
    }

    // Name dupes
    if (seenNames.has(entry.name)) issues.push(`${where}: duplicate unit name`);
    seenNames.add(entry.name);

    // Name exists in DB (warn if not)
    if (!dbUnitNames.has(entry.name))
      warns.push(`${where}: unit not in DB roster (name mismatch?)`);

    // Ability.stats custom validation
    const statErrs = validateStatsObject(entry.ability.stats);
    if (statErrs.length) {
      statErrs.forEach((e) => issues.push(`${where}: ${e}`));
      continue;
    }

    okCount++;
  }

  // Coverage warn: DB units missing from JSON
  const missingInJson = [...dbUnitNames].filter((n) => !seenNames.has(n));
  if (missingInJson.length)
    warns.push(
      `Units in DB but missing from JSON (${missingInJson.length}): ${missingInJson.join(", ")}`,
    );

  // Report
  console.log(`Validated ${okCount}/${raw.length} JSON unit entries against schema.`);
  if (issues.length) {
    console.error(`\nERRORS (${issues.length}):`);
    issues.slice(0, 50).forEach((m) => console.error(" - " + m));
    if (issues.length > 50) console.error(` ... and ${issues.length - 50} more`);
    process.exit(1);
  }
  if (warns.length) {
    console.warn(`\nWARNINGS (${warns.length}):`);
    warns.slice(0, 50).forEach((m) => console.warn(" - " + m));
    if (warns.length > 50) console.warn(` ... and ${warns.length - 50} more`);
  }
  console.log("\nOK: units JSON is valid.");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

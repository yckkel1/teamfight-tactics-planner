const { readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join, dirname } = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SET_NAME = "K.O. Coliseum";
const DATA_DIR = join(__dirname, "data", "items");
const OUT_DIR = join(__dirname, ".data", "items");

async function runValidators() {
  const { validateComponents } = require("./validate.items.components");
  const { validateCompleted } = require("./validate.items.completed");
  const { validateArtifacts } = require("./validate.items.artifacts");
  const { validateRadiant } = require("./validate.items.radiant");
  const { validateEmblems } = require("./validate.items.emblems");
  await validateComponents();
  await validateCompleted();
  await validateArtifacts();
  await validateRadiant();
  await validateEmblems();
}

(async () => {
  await runValidators();

  const components = JSON.parse(readFileSync(join(DATA_DIR, "components.set15.json"), "utf8"));
  const items = JSON.parse(readFileSync(join(DATA_DIR, "items.set15.json"), "utf8"));
  const artifacts = JSON.parse(readFileSync(join(DATA_DIR, "artifacts.set15.json"), "utf8"));
  const radiant = JSON.parse(readFileSync(join(DATA_DIR, "radiant.set15.json"), "utf8"));
  const emblems = JSON.parse(readFileSync(join(DATA_DIR, "emblems.set15.json"), "utf8"));

  // Combo map: "a+b" (sorted) -> item slug
  const comboMap = {};
  for (const it of items) {
    const [a, b] = it.components;
    const key = [a, b].sort().join("+");
    if (comboMap[key] && comboMap[key] !== it.slug) {
      throw new Error(`Component pair collision for ${key}: ${comboMap[key]} vs ${it.slug}`);
    }
    comboMap[key] = it.slug;
  }

  // Enrich emblems with traitId
  const set = await prisma.gameSet.findUnique({ where: { name: SET_NAME }, include: { traits: true } });
  if (!set) throw new Error(`Set not found: ${SET_NAME}. Seed traits first.`);
  const traitIdByName = new Map(set.traits.map((t) => [t.name, t.id]));
  const emblemsEnriched = emblems.map((e) => ({ ...e, traitId: traitIdByName.get(e.grants_trait) || null }));

  // Write caches
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "components.json"), JSON.stringify(components, null, 2));
  writeFileSync(join(OUT_DIR, "items.json"), JSON.stringify(items, null, 2));
  writeFileSync(join(OUT_DIR, "artifacts.json"), JSON.stringify(artifacts, null, 2));
  writeFileSync(join(OUT_DIR, "radiant.json"), JSON.stringify(radiant, null, 2));
  writeFileSync(join(OUT_DIR, "emblems.json"), JSON.stringify(emblemsEnriched, null, 2));
  writeFileSync(join(OUT_DIR, "combos.map.json"), JSON.stringify(comboMap, null, 2));

  // Optional consolidated catalog
  const catalog = [
    ...components.map((x) => ({ kind: "component", ...x })),
    ...items.map((x) => ({ kind: "item", ...x })),
    ...artifacts.map((x) => ({ kind: "artifact", ...x })),
    ...radiant.map((x) => ({ kind: "radiant", ...x })),
    ...emblemsEnriched.map((x) => ({ kind: "emblem", ...x }))
  ];
  writeFileSync(join(OUT_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));

  console.log(`Wrote caches → ${OUT_DIR}`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
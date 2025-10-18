const { join } = require("path");
const CONFIG = require("../config");
const DatabaseHelper = require("../utils/db");
const FileHelper = require("../utils/file");
const Logger = require("../utils/logger");

async function runItemValidators() {
  const { validateItems } = require("../validators/items")

  await validateItems();
}

async function seedItems() {
  const logger = new Logger("seed.items");
  const db = new DatabaseHelper();

  try {
    await runItemValidators();

    const components = FileHelper.readJSON(CONFIG.paths.items.components);
    const items = FileHelper.readJSON(CONFIG.paths.items.completed);
    const artifacts = FileHelper.readJSON(CONFIG.paths.items.artifacts);
    const radiant = FileHelper.readJSON(CONFIG.paths.items.radiant);
    const emblems = FileHelper.readJSON(CONFIG.paths.items.emblems);

    // Build combo map
    const comboMap = {};
    for (const it of items) {
      const [a, b] = it.components;
      const key = [a, b].sort().join("+");
      if (comboMap[key] && comboMap[key] !== it.slug) {
        throw new Error(`Component pair collision for ${key}: ${comboMap[key]} vs ${it.slug}`);
      }
      comboMap[key] = it.slug;
    }

    // Get set and enrich emblems with traitId
    const set = await db.getSet(CONFIG.SET_NAME, { traits: true });
    const traitIdByName = new Map(set.traits.map((t) => [t.name, t.id]));
    const emblemsEnriched = emblems.map((e) => ({
      ...e,
      traitId: traitIdByName.get(e.grants_trait) || null,
    }));

    // Write cache files
    const OUT_DIR = CONFIG.OUTPUT_DIR;
    FileHelper.ensureDir(join(OUT_DIR, "items"));

    FileHelper.writeJSON(join(OUT_DIR, "items", "components.json"), components);
    FileHelper.writeJSON(join(OUT_DIR, "items", "items.json"), items);
    FileHelper.writeJSON(join(OUT_DIR, "items", "artifacts.json"), artifacts);
    FileHelper.writeJSON(join(OUT_DIR, "items", "radiant.json"), radiant);
    FileHelper.writeJSON(join(OUT_DIR, "items", "emblems.json"), emblemsEnriched);
    FileHelper.writeJSON(join(OUT_DIR, "items", "combos.map.json"), comboMap);

    // Consolidated catalog
    const catalog = [
      ...components.map((x) => ({ kind: "component", ...x })),
      ...items.map((x) => ({ kind: "item", ...x })),
      ...artifacts.map((x) => ({ kind: "artifact", ...x })),
      ...radiant.map((x) => ({ kind: "radiant", ...x })),
      ...emblemsEnriched.map((x) => ({ kind: "emblem", ...x })),
    ];
    FileHelper.writeJSON(join(OUT_DIR, "items", "catalog.json"), catalog);

    logger.success(`Cache files written to ${OUT_DIR}/items`);

    // Prepare database records
    const allItems = [
      ...components.map((c) => ({
        setId: set.id,
        kind: "COMPONENT",
        slug: c.slug,
        name: c.name,
        tags: c.tags || [],
        stats: c.stats || {},
        text: c.text || null,
        isUnique: c.unique || false,
      })),
      ...items.map((i) => ({
        setId: set.id,
        kind: "COMPLETED",
        slug: i.slug,
        name: i.name,
        tags: i.tags || [],
        stats: i.stats || {},
        text: i.text || null,
        isUnique: i.unique || false,
      })),
      ...artifacts.map((a) => ({
        setId: set.id,
        kind: "ARTIFACT",
        slug: a.slug,
        name: a.name,
        tags: a.tags || [],
        stats: a.stats || {},
        text: a.text || null,
        isUnique: a.unique || false,
      })),
      ...radiant.map((r) => ({
        setId: set.id,
        kind: "RADIANT",
        slug: r.slug,
        name: r.name,
        tags: r.tags || [],
        stats: r.stats_overrides || {},
        text: r.text_overrides || null,
        isUnique: true,
      })),
      ...emblemsEnriched.map((e) => ({
        setId: set.id,
        kind: "EMBLEM",
        slug: e.slug,
        name: e.name,
        tags: e.tags || [],
        stats: {},
        text: e.text || null,
        isUnique: true,
      })),
    ];

    // Clear and insert
    await db.prisma.item.deleteMany({ where: { setId: set.id } });
    await db.prisma.item.createMany({ data: allItems });

    logger.success(`Items seeded to database: ${allItems.length}`);
  } catch (error) {
    logger.error(error.message);
    throw error;
  } finally {
    await db.disconnect();
  }
}

if (require.main === module) {
  seedItems().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { seedItems };
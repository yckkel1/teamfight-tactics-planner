const { readFileSync: rf } = require("fs");
const { join: jn } = require("path");
const { z: zz } = require("zod");
const { isKebab, validateStatsShape } = require("./validate.items.shared");

const DATA_DIR = jn(__dirname, "data", "items");
const ITEMS_PATH = jn(DATA_DIR, "items.set15.json");
const COMPS_PATH = jn(DATA_DIR, "components.set15.json");

const ItemSchema = zz.object({
  slug: zz.string().min(1),
  name: zz.string().min(1),
  components: zz.array(zz.string().min(1)).length(2),
  tags: zz.array(zz.string()).default([]),
  stats: zz.record(zz.union([zz.number(), zz.boolean(), zz.string()])).default({}),
  unique: zz.boolean().optional(),
  text: zz.string().optional()
});

async function validateCompleted() {
  const issues = []; const warns = [];
  const comps = JSON.parse(rf(COMPS_PATH, "utf8"));
  const compSlugs = new Set(comps.map((c) => c.slug));
  const itemsRaw = JSON.parse(rf(ITEMS_PATH, "utf8"));
  if (!Array.isArray(itemsRaw)) { console.error("items.set15.json must be an array"); process.exit(1); }

  const seen = new Set();
  const pairKey = (a,b) => [a,b].sort().join("+");
  const pairMap = new Map();

  itemsRaw.forEach((x, i) => {
    const where = `items[#${i}]`;
    const p = ItemSchema.safeParse(x);
    if (!p.success) { issues.push(`${where}: ${p.error.issues.map(t=>t.message).join("; ")}`); return; }
    const it = p.data;

    if (!isKebab(it.slug)) issues.push(`${where}: slug must be kebab-case`);
    if (seen.has(it.slug)) issues.push(`${where}: duplicate slug '${it.slug}'`); seen.add(it.slug);

    // components must exist and be components
    const [a,b] = it.components;
    if (!compSlugs.has(a)) issues.push(`${where}: component not found '${a}'`);
    if (!compSlugs.has(b)) issues.push(`${where}: component not found '${b}'`);

    // pair uniqueness
    const key = pairKey(a,b);
    const prev = pairMap.get(key);
    if (prev && prev !== it.slug) issues.push(`${where}: component pair ${key} already used by '${prev}'`);
    pairMap.set(key, it.slug);

    it.tags.forEach((t,j)=>{ if(!isKebab(t)) warns.push(`${where}: tags[${j}] not kebab-case: '${t}'`); });
    validateStatsShape(it.stats, `${where}.stats`, issues, warns);
  });

  console.log(`Completed items checked: ${seen.size}`);
  if (issues.length) { console.error(`\nERRORS (${issues.length}):`); issues.forEach(m=>console.error(' - '+m)); process.exit(1); }
  if (warns.length) { console.warn(`\nWARNINGS (${warns.length}):`); warns.forEach(m=>console.warn(' - '+m)); }
  console.log("\nOK: completed items JSON is valid.");
}

if (require.main === module) validateCompleted();
module.exports = { validateCompleted };
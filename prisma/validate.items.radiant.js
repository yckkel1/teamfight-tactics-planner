const { readFileSync: rfr } = require("fs");
const { join: jnr } = require("path");
const { z: zzr } = require("zod");
const { isKebab, validateStatsShape } = require("./validate.items.shared");

const DATA_DIR_R = jnr(__dirname, "data", "items");
const RADIANT_PATH = jnr(DATA_DIR_R, "radiant.set15.json");
const ITEMS_PATH_R = jnr(DATA_DIR_R, "items.set15.json");

const RadiantSchema = zzr.object({
  slug: zzr.string().min(1),
  name: zzr.string().min(1),
  base_slug: zzr.string().min(1),
  tags: zzr.array(zzr.string()).default([]),
  stats_overrides: zzr.record(zzr.union([zzr.number(), zzr.boolean(), zzr.string()])).default({}),
  text_overrides: zzr.string().optional()
});

async function validateRadiant() {
  const issues = []; const warns = [];
  const base = JSON.parse(rfr(ITEMS_PATH_R, "utf8"));
  const baseSlugs = new Set(base.map((x) => x.slug));
  const raws = JSON.parse(rfr(RADIANT_PATH, "utf8"));
  if (!Array.isArray(raws)) { console.error("radiant.set15.json must be an array"); process.exit(1); }
  const seen = new Set();
  raws.forEach((x,i)=>{
    const where = `radiant[#${i}]`;
    const p = RadiantSchema.safeParse(x);
    if (!p.success) { issues.push(`${where}: ${p.error.issues.map(t=>t.message).join("; ")}`); return; }
    const it = p.data;
    if (!isKebab(it.slug)) issues.push(`${where}: slug must be kebab-case`);
    if (seen.has(it.slug)) issues.push(`${where}: duplicate slug '${it.slug}'`); seen.add(it.slug);
    if (!baseSlugs.has(it.base_slug)) issues.push(`${where}: base_slug '${it.base_slug}' not found in items`);
    it.tags.forEach((t,j)=>{ if(!isKebab(t)) warns.push(`${where}: tags[${j}] not kebab-case: '${t}'`); });
    validateStatsShape(it.stats_overrides, `${where}.stats_overrides`, issues, warns);
  });
  console.log(`Radiant items checked: ${seen.size}`);
  if (issues.length) { console.error(`\nERRORS (${issues.length}):`); issues.forEach(m=>console.error(' - '+m)); process.exit(1); }
  if (warns.length) { console.warn(`\nWARNINGS (${warns.length}):`); warns.forEach(m=>console.warn(' - '+m)); }
  console.log("\nOK: radiant JSON is valid.");
}

if (require.main === module) validateRadiant();
module.exports = { validateRadiant };
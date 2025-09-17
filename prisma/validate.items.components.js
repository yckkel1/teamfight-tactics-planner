const { readFileSync } = require("fs");
const { join } = require("path");
const { z } = require("zod");
const { isKebab, validateStatsShape } = require("./validate.items.shared");

const DATA_PATH = join(__dirname, "data", "items", "components.set15.json");

const ComponentSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  stats: z.record(z.union([z.number(), z.boolean(), z.string()])).default({}),
  text: z.string().optional()
});

async function validateComponents() {
  const issues = []; const warns = [];
  let raw; try { raw = JSON.parse(readFileSync(DATA_PATH, "utf8")); } catch (e) {
    console.error(`Cannot read ${DATA_PATH}: ${e.message}`); process.exit(1);
  }
  if (!Array.isArray(raw)) { console.error("components.set15.json must be an array"); process.exit(1); }

  const slugs = new Set();
  raw.forEach((x, i) => {
    const where = `components[#${i}]`;
    const p = ComponentSchema.safeParse(x);
    if (!p.success) { issues.push(`${where}: ${p.error.issues.map(t=>t.message).join("; ")}`); return; }
    const it = p.data;
    if (!isKebab(it.slug)) issues.push(`${where}: slug must be kebab-case`);
    if (slugs.has(it.slug)) issues.push(`${where}: duplicate slug '${it.slug}'`); slugs.add(it.slug);
    it.tags.forEach((t,j)=>{ if(!isKebab(t)) warns.push(`${where}: tags[${j}] not kebab-case: '${t}'`); });
    validateStatsShape(it.stats, `${where}.stats`, issues, warns);
  });

  console.log(`Components checked: ${slugs.size}`);
  if (issues.length) { console.error(`\nERRORS (${issues.length}):`); issues.forEach(m=>console.error(' - '+m)); process.exit(1); }
  if (warns.length) { console.warn(`\nWARNINGS (${warns.length}):`); warns.forEach(m=>console.warn(' - '+m)); }
  console.log("\nOK: components JSON is valid.");
}

if (require.main === module) validateComponents();
module.exports = { validateComponents };
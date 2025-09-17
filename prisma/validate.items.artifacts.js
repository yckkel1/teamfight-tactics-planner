const { readFileSync: rfa } = require("fs");
const { join: jna } = require("path");
const { z: zza } = require("zod");
const { isKebab, validateStatsShape } = require("./validate.items.shared");

const DATA_PATH_A = jna(__dirname, "data", "items", "artifacts.set15.json");

const ArtifactSchema = zza.object({
  slug: zza.string().min(1),
  name: zza.string().min(1),
  tags: zza.array(zza.string()).default([]),
  stats: zza.record(zza.union([zza.number(), zza.boolean(), zza.string()])).default({}),
  unique: zza.boolean().optional(),
  text: zza.string().optional()
});

async function validateArtifacts() {
  const issues = []; const warns = [];
  const raw = JSON.parse(rfa(DATA_PATH_A, "utf8"));
  if (!Array.isArray(raw)) { console.error("artifacts.set15.json must be an array"); process.exit(1); }
  const seen = new Set();
  raw.forEach((x,i)=>{
    const where = `artifacts[#${i}]`;
    const p = ArtifactSchema.safeParse(x);
    if (!p.success) { issues.push(`${where}: ${p.error.issues.map(t=>t.message).join("; ")}`); return; }
    const it = p.data;
    if (!isKebab(it.slug)) issues.push(`${where}: slug must be kebab-case`);
    if (seen.has(it.slug)) issues.push(`${where}: duplicate slug '${it.slug}'`); seen.add(it.slug);
    it.tags.forEach((t,j)=>{ if(!isKebab(t)) warns.push(`${where}: tags[${j}] not kebab-case: '${t}'`); });
    validateStatsShape(it.stats, `${where}.stats`, issues, warns);
  });
  console.log(`Artifacts checked: ${seen.size}`);
  if (issues.length) { console.error(`\nERRORS (${issues.length}):`); issues.forEach(m=>console.error(' - '+m)); process.exit(1); }
  if (warns.length) { console.warn(`\nWARNINGS (${warns.length}):`); warns.forEach(m=>console.warn(' - '+m)); }
  console.log("\nOK: artifacts JSON is valid.");
}

if (require.main === module) validateArtifacts();
module.exports = { validateArtifacts };
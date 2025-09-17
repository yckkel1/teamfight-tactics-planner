const { readFileSync: rfe } = require("fs");
const { join: jne } = require("path");
const { z: zz } = require("zod");
const { PrismaClient } = require("@prisma/client");
const { isKebab } = require("./validate.items.shared");

const prisma = new PrismaClient();
const SET_NAME = "K.O. Coliseum";
const DATA_DIR_E = jne(__dirname, "data", "items");
const EMBLEMS_PATH = jne(DATA_DIR_E, "emblems.set15.json");
const COMPS_PATH_E = jne(DATA_DIR_E, "components.set15.json");

const EmblemSchema = zz.object({
  slug: zz.string().min(1),
  name: zz.string().min(1),
  components: zz.array(zz.string().min(1)).length(2),
  grants_trait: zz.string().min(1),
  tags: zz.array(zz.string()).default([]),
  text: zz.string().optional()
});

async function validateEmblems() {
  const issues = []; const warns = [];
  const comps = JSON.parse(rfe(COMPS_PATH_E, "utf8"));
  const compSlugs = new Set(comps.map((c) => c.slug));
  const raw = JSON.parse(rfe(EMBLEMS_PATH, "utf8"));
  if (!Array.isArray(raw)) { console.error("emblems.set15.json must be an array"); process.exit(1); }
  const seen = new Set();

  // map traits from DB
  const set = await prisma.gameSet.findUnique({ where: { name: SET_NAME }, include: { traits: true } });
  if (!set) { console.error(`Set not found: ${SET_NAME}. Seed traits first.`); process.exit(1); }
  const traitNames = new Set(set.traits.map((t) => t.name));

  raw.forEach((x,i)=>{
    const where = `emblems[#${i}]`;
    const p = EmblemSchema.safeParse(x);
    if (!p.success) { issues.push(`${where}: ${p.error.issues.map(t=>t.message).join("; ")}`); return; }
    const it = p.data;
    if (!isKebab(it.slug)) issues.push(`${where}: slug must be kebab-case`);
    if (seen.has(it.slug)) issues.push(`${where}: duplicate slug '${it.slug}'`); seen.add(it.slug);
    if (!traitNames.has(it.grants_trait)) issues.push(`${where}: grants_trait '${it.grants_trait}' not found in DB`);
    it.tags.forEach((t,j)=>{ if(!isKebab(t)) warns.push(`${where}: tags[${j}] not kebab-case: '${t}'`); });

    const [a,b] = it.components;
    if (!compSlugs.has(a)) issues.push(`${where}: component not found '${a}'`);
    if (!compSlugs.has(b)) issues.push(`${where}: component not found '${b}'`);
  });

  console.log(`Emblems checked: ${seen.size}`);
  if (issues.length) { console.error(`\nERRORS (${issues.length}):`); issues.forEach(m=>console.error(' - '+m)); process.exit(1); }
  if (warns.length) { console.warn(`\nWARNINGS (${warns.length}):`); warns.forEach(m=>console.warn(' - '+m)); }
  console.log("\nOK: emblems JSON is valid.");
  await prisma.$disconnect();
}

if (require.main === module) validateEmblems();
module.exports = { validateEmblems };
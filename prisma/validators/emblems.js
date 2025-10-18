const { z } = require("zod");
const BaseValidator = require("./base");
const CONFIG = require("../config");
const FileHelper = require("../utils/file");
const DatabaseHelper = require("../utils/db");

const EmblemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  components: z.array(z.string().min(1)).length(2),
  grants_trait: z.string().min(1),
  tags: z.array(z.string()).default([]),
  text: z.string().optional()
});

class EmblemValidator extends BaseValidator {
  constructor() {
    super("emblems", EmblemSchema, CONFIG.paths.items.emblems);
    this.componentSlugs = null;
    this.traitNames = null;
  }

  async validate() {
    const components = FileHelper.readJSON(CONFIG.paths.items.components);
    this.componentSlugs = new Set(components.map(c => c.slug));

    const db = new DatabaseHelper();
    try {
      const set = await db.getSet(CONFIG.SET_NAME, { traits: true });
      this.traitNames = new Set(set.traits.map(t => t.name));
    } finally {
      await db.disconnect();
    }

    await super.validate();
  }

  async validateItem(item, location, seen) {
    await super.validateItem(item, location, seen);

    if (!this.traitNames.has(item.grants_trait)) {
      this.logger.error(`${location}: grants_trait '${item.grants_trait}' not found in DB`);
    }

    const [a, b] = item.components;
    if (!this.componentSlugs.has(a)) {
      this.logger.error(`${location}: component not found '${a}'`);
    }
    if (!this.componentSlugs.has(b)) {
      this.logger.error(`${location}: component not found '${b}'`);
    }
  }
}

async function validateEmblems() {
  const validator = new EmblemValidator();
  await validator.validate();
}

if (require.main === module) {
  validateEmblems().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateEmblems, EmblemValidator };
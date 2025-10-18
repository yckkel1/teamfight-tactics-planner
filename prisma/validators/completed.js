const { z } = require("zod");
const BaseValidator = require("./base");
const CONFIG = require("../config");
const FileHelper = require("../utils/file");
const { validateStatsShape } = require("../utils/validation");

const ItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  components: z.array(z.string().min(1)).length(2),
  tags: z.array(z.string()).default([]),
  stats: z.record(z.union([z.number(), z.boolean(), z.string()])).default({}),
  unique: z.boolean().optional(),
  text: z.string().optional()
});

class CompletedItemValidator extends BaseValidator {
  constructor() {
    super("completed items", ItemSchema, CONFIG.paths.items.completed);
    this.componentSlugs = null;
    this.pairMap = new Map();
  }

  async validate() {
    const components = FileHelper.readJSON(CONFIG.paths.items.components);
    this.componentSlugs = new Set(components.map(c => c.slug));
    await super.validate();
  }

  pairKey(a, b) {
    return [a, b].sort().join("+");
  }

  async validateItem(item, location, seen) {
    await super.validateItem(item, location, seen);
    validateStatsShape(item.stats, `${location}.stats`, this.logger);

    const [a, b] = item.components;
    if (!this.componentSlugs.has(a)) {
      this.logger.error(`${location}: component not found '${a}'`);
    }
    if (!this.componentSlugs.has(b)) {
      this.logger.error(`${location}: component not found '${b}'`);
    }

    const key = this.pairKey(a, b);
    const prev = this.pairMap.get(key);
    if (prev && prev !== item.slug) {
      this.logger.error(`${location}: component pair ${key} already used by '${prev}'`);
    }
    this.pairMap.set(key, item.slug);
  }
}

async function validateCompleted() {
  const validator = new CompletedItemValidator();
  await validator.validate();
}

if (require.main === module) {
  validateCompleted().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateCompleted, CompletedItemValidator };
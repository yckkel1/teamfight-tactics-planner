const { z } = require("zod");
const BaseValidator = require("./base");
const CONFIG = require("../config");
const FileHelper = require("../utils/file");
const { validateStatsShape } = require("../utils/validation");

const RadiantSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  base_slug: z.string().min(1),
  tags: z.array(z.string()).default([]),
  stats_overrides: z.record(z.union([z.number(), z.boolean(), z.string()])).default({}),
  text_overrides: z.string().optional()
});

class RadiantValidator extends BaseValidator {
  constructor() {
    super("radiant", RadiantSchema, CONFIG.paths.items.radiant);
    this.baseSlugs = null;
  }

  async validate() {
    const items = FileHelper.readJSON(CONFIG.paths.items.completed);
    this.baseSlugs = new Set(items.map(x => x.slug));
    await super.validate();
  }

  async validateItem(item, location, seen) {
    await super.validateItem(item, location, seen);
    validateStatsShape(item.stats_overrides, `${location}.stats_overrides`, this.logger);

    if (!this.baseSlugs.has(item.base_slug)) {
      this.logger.error(`${location}: base_slug '${item.base_slug}' not found in items`);
    }
  }
}

async function validateRadiant() {
  const validator = new RadiantValidator();
  await validator.validate();
}

if (require.main === module) {
  validateRadiant().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateRadiant, RadiantValidator };
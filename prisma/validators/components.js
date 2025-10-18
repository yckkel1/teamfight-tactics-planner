const { z } = require("zod");
const BaseValidator = require("./base");
const CONFIG = require("../config");
const { validateStatsShape } = require("../utils/validation");

const ComponentSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  stats: z.record(z.union([z.number(), z.boolean(), z.string()])).default({}),
  text: z.string().optional()
});

class ComponentValidator extends BaseValidator {
  constructor() {
    super("components", ComponentSchema, CONFIG.paths.items.components);
  }

  async validateItem(item, location, seen) {
    await super.validateItem(item, location, seen);
    validateStatsShape(item.stats, `${location}.stats`, this.logger);
  }
}

async function validateComponents() {
  const validator = new ComponentValidator();
  await validator.validate();
}

if (require.main === module) {
  validateComponents().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateComponents, ComponentValidator };
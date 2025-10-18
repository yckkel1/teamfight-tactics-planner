const { z } = require("zod");
const BaseValidator = require("./base");
const CONFIG = require("../config");
const { validateStatsShape } = require("../utils/validation");

const ArtifactSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  stats: z.record(z.union([z.number(), z.boolean(), z.string()])).default({}),
  unique: z.boolean().optional(),
  text: z.string().optional()
});

class ArtifactValidator extends BaseValidator {
  constructor() {
    super("artifacts", ArtifactSchema, CONFIG.paths.items.artifacts);
  }

  async validateItem(item, location, seen) {
    await super.validateItem(item, location, seen);
    validateStatsShape(item.stats, `${location}.stats`, this.logger);
  }
}

async function validateArtifacts() {
  const validator = new ArtifactValidator();
  await validator.validate();
}

if (require.main === module) {
  validateArtifacts().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateArtifacts, ArtifactValidator };
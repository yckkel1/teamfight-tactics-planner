const FileHelper = require("../utils/file");
const Logger = require("../utils/logger");
const { isKebab } = require("../utils/validation");

class BaseValidator {
  constructor(name, schema, dataPath) {
    this.name = name;
    this.schema = schema;
    this.dataPath = dataPath;
    this.logger = new Logger(`validate.${name}`);
  }

  async validate() {
    const data = FileHelper.readJSON(this.dataPath);
    FileHelper.validateArray(data, this.dataPath);
    
    const seen = new Set();
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const location = `${this.name}[#${i}]`;
      
      const result = this.schema.safeParse(item);
      if (!result.success) {
        this.logger.error(`${location}: ${this.formatZodError(result.error)}`);
        continue;
      }
      
      await this.validateItem(result.data, location, seen);
    }
    
    this.logger.info(`${this.name} checked: ${seen.size}`);
    
    if (!this.logger.summary()) {
      throw new Error(`Validation failed for ${this.name}`);
    }
    
    console.log(`\nOK: ${this.name} JSON is valid.`);
  }

  formatZodError(error) {
    return error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
  }

  async validateItem(item, location, seen) {
    if (item.slug) {
      if (!isKebab(item.slug)) {
        this.logger.error(`${location}: slug must be kebab-case`);
      }
      if (seen.has(item.slug)) {
        this.logger.error(`${location}: duplicate slug '${item.slug}'`);
      }
      seen.add(item.slug);
    }

    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag, j) => {
        if (!isKebab(tag)) {
          this.logger.warn(`${location}: tags[${j}] not kebab-case: '${tag}'`);
        }
      });
    }
  }
}

module.exports = BaseValidator;
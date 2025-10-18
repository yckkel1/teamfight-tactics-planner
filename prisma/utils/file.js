const { readFileSync, writeFileSync, mkdirSync } = require("fs");

class FileHelper {
  static readJSON(path) {
    try {
      const content = readFileSync(path, "utf8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read ${path}: ${error.message}`);
    }
  }

  static writeJSON(path, data, pretty = true) {
    try {
      const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      writeFileSync(path, content, "utf8");
    } catch (error) {
      throw new Error(`Failed to write ${path}: ${error.message}`);
    }
  }

  static ensureDir(path) {
    mkdirSync(path, { recursive: true });
  }

  static validateArray(data, filePath) {
    if (!Array.isArray(data)) {
      throw new Error(`${filePath} must be an array`);
    }
    return data;
  }
}

module.exports = FileHelper;
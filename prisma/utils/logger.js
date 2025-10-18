class Logger {
  constructor(context = '') {
    this.context = context;
    this.errors = [];
    this.warnings = [];
  }

  error(message) {
    const msg = this.context ? `[${this.context}] ${message}` : message;
    this.errors.push(msg);
    console.error(` - ${msg}`);
  }

  warn(message) {
    const msg = this.context ? `[${this.context}] ${message}` : message;
    this.warnings.push(msg);
    console.warn(` - ${msg}`);
  }

  info(message) {
    const msg = this.context ? `[${this.context}] ${message}` : message;
    console.log(msg);
  }

  success(message) {
    const msg = this.context ? `[ok] ${message}` : message;
    console.log(msg);
  }

  summary() {
    if (this.errors.length > 0) {
      console.error(`\nERRORS (${this.errors.length}):`);
      this.errors.forEach(e => console.error(` - ${e}`));
    }
    if (this.warnings.length > 0) {
      console.warn(`\nWARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(w => console.warn(` - ${w}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\nOK: All checks passed.');
    } else if (this.errors.length === 0) {
      console.log('\nOK: No errors found.');
    }
    
    return this.errors.length === 0;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }
}

module.exports = Logger;
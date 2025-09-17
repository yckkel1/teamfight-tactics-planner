const isKebab = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const isSnake = (k) => /^[a-z][a-z0-9_]*$/.test(k);

function validateStatsShape(stats, where, issues, warns) {
  if (stats == null || typeof stats !== "object" || Array.isArray(stats)) {
    issues.push(`${where}: stats must be an object`);
    return;
  }
  for (const [k, v] of Object.entries(stats)) {
    if (!isSnake(k)) issues.push(`${where}: stats.${k} must be snake_case`);
    const hasSuffix = /(_pct|_flat|_sec)$/.test(k);
    if (hasSuffix && typeof v !== "number") warns.push(`${where}: stats.${k} should be a number`);
    if (!(typeof v === "number" || typeof v === "boolean" || typeof v === "string")) {
      issues.push(`${where}: stats.${k} must be number|string|boolean`);
    }
  }
}

module.exports = { isKebab, isSnake, validateStatsShape };
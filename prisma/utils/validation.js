const isKebab = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const isSnake = (k) => /^[a-z][a-z0-9_]*$/.test(k);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isNumArr3 = (v) => Array.isArray(v) && v.length === 3 && v.every(isNum);

const isDamageKeyOK = (k) =>
  /^(dmg_(ad|ap|magic|true|mixed)_(flat|ratio_pct|hp_pct)|dmg_hp_pct|dmg_target_hp_pct|dmg_falloff_per_hit_pct)$/.test(k);

function validateStatsShape(stats, where, logger) {
  if (stats == null || typeof stats !== "object" || Array.isArray(stats)) {
    logger.error(`${where}: stats must be an object`);
    return;
  }
  
  for (const [k, v] of Object.entries(stats)) {
    if (!isSnake(k)) {
      logger.error(`${where}: stats.${k} must be snake_case`);
    }
    
    const hasSuffix = /(_pct|_flat|_sec)$/.test(k);
    if (hasSuffix && typeof v !== "number") {
      logger.warn(`${where}: stats.${k} should be a number`);
    }
    
    if (!(typeof v === "number" || typeof v === "boolean" || typeof v === "string")) {
      logger.error(`${where}: stats.${k} must be number|string|boolean`);
    }
  }
}

const ALLOWED_NUMERIC_KEYS = new Set([
  "as_bonus_pct",
  "as_bonus_duration_sec",
  "ad_per_potential_flat",
  "ap_per_potential_flat",
  "on_hit_magic_flat",
  "active_duration_sec",
  "self_ad_bonus_pct",
  "ally_ad_bonus_pct",
  "ally_targets",
  "stacks_on_cast",
  "stack_max_hp_flat",
  "stack_max_hp_per_potential_flat",
  "wave_every_attacks",
  "wave_damage_magic_flat",
  "wave_shred_mr_pct",
  "wave_shred_duration_sec",
]);

const ALLOWED_TEXT_KEYS = new Set([
  "ally_targeting",
  "damage_type",
  "stack_duration",
  "targeting",
  "amp_curve",
]);

const ALLOWED_BOOLEAN_KEYS = new Set(["pierce_on_kill"]);
const ALLOWED_STRING_LIST_KEYS = new Set(["amp_applies"]);

function validateAbilityStats(stats, path, logger) {
  if (stats == null || typeof stats !== "object" || Array.isArray(stats)) {
    logger.error(`${path} must be an object`);
    return;
  }

  for (const [k, v] of Object.entries(stats)) {
    if (!isSnake(k)) {
      logger.error(`${path}.${k}: key must be snake_case`);
    }

    if (k.startsWith("dmg_")) {
      if (!isDamageKeyOK(k)) {
        logger.error(`${path}.${k}: invalid damage key pattern`);
      }
      if (!(isNum(v) || isNumArr3(v))) {
        logger.error(`${path}.${k}: value must be number or [n1,n2,n3]`);
      }
      continue;
    }

    if (k.startsWith("heal_")) {
      if (!(isNum(v) || isNumArr3(v))) {
        logger.error(`${path}.${k}: value must be number or [n1,n2,n3]`);
      }
      continue;
    }

    if (k.endsWith("_sec") || k.endsWith("_pct") || k.endsWith("_flat")) {
      if (!(isNum(v) || isNumArr3(v))) {
        logger.error(`${path}.${k}: value must be number or [n1,n2,n3]`);
      }
      continue;
    }

    if (ALLOWED_NUMERIC_KEYS.has(k)) {
      if (!(isNum(v) || isNumArr3(v))) {
        logger.error(`${path}.${k}: value must be number or [n1,n2,n3]`);
      }
      continue;
    }

    if (ALLOWED_TEXT_KEYS.has(k)) {
      if (typeof v !== "string") {
        logger.error(`${path}.${k}: value must be a string`);
      }
      continue;
    }

    if (ALLOWED_BOOLEAN_KEYS.has(k)) {
      if (typeof v !== "boolean") {
        logger.error(`${path}.${k}: value must be boolean`);
      }
      continue;
    }

    if (ALLOWED_STRING_LIST_KEYS.has(k)) {
      if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
        logger.error(`${path}.${k}: value must be an array of strings`);
      }
      continue;
    }

    if (k === "tactician_power") {
      if (!Array.isArray(v)) {
        logger.error(`${path}.${k}: must be an array`);
        continue;
      }
      v.forEach((entry, i) => {
        if (typeof entry !== "object" || entry == null) {
          logger.error(`${path}.${k}[${i}]: must be an object`);
          return;
        }
        if (!isNum(entry.min_level)) {
          logger.error(`${path}.${k}[${i}].min_level must be a number`);
        }
        if (entry.effects == null || typeof entry.effects !== "object") {
          logger.error(`${path}.${k}[${i}].effects must be an object`);
          return;
        }
        validateAbilityStats(entry.effects, `${path}.${k}[${i}].effects`, logger);
      });
      continue;
    }

    if (!(isNum(v) || isNumArr3(v) || typeof v === "boolean" || typeof v === "string")) {
      logger.error(`${path}.${k}: unsupported value type`);
    }
  }
}

module.exports = {
  isKebab,
  isSnake,
  isNum,
  isNumArr3,
  isDamageKeyOK,
  validateStatsShape,
  validateAbilityStats,
};
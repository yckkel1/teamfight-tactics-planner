const { PrismaClient } = require("@prisma/client");
const CONFIG = require("../config");

class DatabaseHelper {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getSet(name = CONFIG.SET_NAME, include = {}) {
    const set = await this.prisma.gameSet.findUnique({
      where: { name },
      include,
    });
    
    if (!set) {
      throw new Error(`GameSet not found: ${name}. Run seed.js first.`);
    }
    
    return set;
  }

  async getSetOrNull(name = CONFIG.SET_NAME, include = {}) {
    return await this.prisma.gameSet.findUnique({
      where: { name },
      include,
    });
  }

  async getTraitMap(setName = CONFIG.SET_NAME) {
    const set = await this.getSet(setName, { traits: true });
    return new Map(set.traits.map(t => [t.name, t]));
  }

  async getUnitMap(setName = CONFIG.SET_NAME) {
    const set = await this.getSet(setName, { units: true });
    return new Map(set.units.map(u => [u.name, u]));
  }

  async upsertSet(name, data = {}) {
    return this.prisma.gameSet.upsert({
      where: { name },
      update: {},
      create: { name, ...data },
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  static async withConnection(callback) {
    const db = new DatabaseHelper();
    try {
      return await callback(db);
    } finally {
      await db.disconnect();
    }
  }
}

module.exports = DatabaseHelper;
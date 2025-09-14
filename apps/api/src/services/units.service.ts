import { prisma } from "../utils/prisma";
import type { Prisma } from "@prisma/client";
import { UnitsQuery, RawUnitWithTraits, Unit, UnitsListResponse, PageInfo } from "@data/models";

const SET_NAME = "K.O. Coliseum";

async function getSetId(): Promise<string> {
  const set = await prisma.gameSet.findUnique({ where: { name: SET_NAME }, select: { id: true } });
  if (!set) throw new Error(`GameSet not found: ${SET_NAME}. Seed the DB first.`);
  return set.id;
}

function mapRawToUnit(row: RawUnitWithTraits): Unit {
  const traits =
    row.traits?.map((ut) => ({
      name: ut.trait.name,
      category: ut.trait.category,
    })) || [];

  return new Unit(row.id, row.name, row.cost, traits, row.baseStats, row.ability, row.role);
}

export class UnitsService {
  async list(query: UnitsQuery): Promise<UnitsListResponse> {
    const { search, cost, trait, sort, order, limit, offset } = query;
    const setId = await getSetId();

    const where: Prisma.UnitWhereInput = { setId };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (cost !== undefined) {
      where.cost = cost;
    }

    if (trait) {
      where.traits = {
        some: {
          trait: {
            name: { equals: trait, mode: "insensitive" },
          },
        },
      };
    }

    const include: Prisma.UnitInclude = {
      traits: {
        include: {
          trait: {
            select: { name: true, category: true },
          },
        },
      },
    };

    const orderBy: Prisma.UnitOrderByWithRelationInput[] = [];
    if (sort === "name") orderBy.push({ name: order });
    else if (sort === "cost") orderBy.push({ cost: order });
    orderBy.push({ id: "asc" });

    const rows = (await prisma.unit.findMany({
      where,
      include,
      orderBy,
      skip: offset,
      take: limit,
    })) as unknown as RawUnitWithTraits[];

    const items = rows.map(mapRawToUnit);
    const nextOffset = rows.length === limit ? offset + limit : undefined;
    const pageInfo = new PageInfo(nextOffset, nextOffset !== undefined);

    return new UnitsListResponse(items, pageInfo, { set: "set15" });
  }

  async getById(id: string): Promise<Unit | null> {
    const setId = await getSetId();

    const row = (await prisma.unit.findFirst({
      where: { id, setId },
      include: {
        traits: {
          include: {
            trait: {
              select: { name: true, category: true },
            },
          },
        },
      },
    })) as unknown as RawUnitWithTraits | null;

    return row ? mapRawToUnit(row) : null;
  }
}

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

    // SQLite case-insensitive search - we'll filter after the query
    // or use a different approach
    if (search) {
      // For SQLite, we'll use contains without mode
      where.name = { contains: search };
    }

    if (cost !== undefined) {
      where.cost = cost;
    }

    if (trait) {
      where.traits = {
        some: {
          trait: {
            // Remove mode for SQLite compatibility
            name: { contains: trait },
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

    let rows = (await prisma.unit.findMany({
      where,
      include,
      orderBy,
      skip: offset,
      take: limit,
    })) as unknown as RawUnitWithTraits[];

    // Manual case-insensitive filtering for SQLite
    if (search) {
      const searchLower = search.toLowerCase();
      rows = rows.filter((unit) => unit.name.toLowerCase().includes(searchLower));
    }

    if (trait) {
      const traitLower = trait.toLowerCase();
      rows = rows.filter((unit) =>
        unit.traits?.some((ut) => ut.trait.name.toLowerCase().includes(traitLower)),
      );
    }

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

import { prisma } from "../utils/prisma";
import type { Prisma } from "@prisma/client";
import type { TraitsQuery, RawTraitWithCounts } from "@data/models";
import { Tier, Trait, TraitsListResponse, PageInfo } from "@data/models";

const SET_NAME = "K.O. Coliseum";

async function getSetId(): Promise<string> {
  const set = await prisma.gameSet.findUnique({ where: { name: SET_NAME }, select: { id: true } });
  if (!set) throw new Error(`GameSet not found: ${SET_NAME}. Seed the DB first.`);
  return set.id;
}

function mapRawToTrait(row: RawTraitWithCounts): Trait {
  const tiers = (row.tiers ?? [])
    .slice()
    .sort((a, b) => a.minUnits - b.minUnits)
    .map((t) => new Tier(t.minUnits, t.note, t.effects));
  return new Trait(row.name, row.category, row._count.unitTraits, tiers);
}

export class TraitsService {
  /** why: clean boundary; services own DB queries + mapping */
  async list(query: TraitsQuery): Promise<TraitsListResponse> {
    const { search, sort, order, limit, offset } = query;
    const setId = await getSetId();

    const where: Prisma.TraitWhereInput = { setId };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const include: Prisma.TraitInclude = {
      _count: { select: { unitTraits: true } },
      tiers: { select: { minUnits: true, note: true, effects: true } },
    };

    const orderBy: Prisma.TraitOrderByWithRelationInput[] = [];
    if (sort === "name") orderBy.push({ name: order });
    else if (sort === "unitCount") orderBy.push({ unitTraits: { _count: order } });
    orderBy.push({ id: "asc" });

    const rows = (await prisma.trait.findMany({
      where,
      include,
      orderBy,
      skip: offset,
      take: limit,
    })) as unknown as RawTraitWithCounts[];

    const items = rows.map(mapRawToTrait);
    const nextOffset = rows.length === limit ? offset + limit : undefined;
    const pageInfo = new PageInfo(nextOffset, nextOffset !== undefined);
    return new TraitsListResponse(items, pageInfo, { set: "set15" });
  }
}

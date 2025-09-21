import { prisma } from "../utils/prisma";
import type { Prisma } from "@prisma/client";
import { ItemsQuery, RawItem, Item, ItemsListResponse, PageInfo } from "@data/models";

const SET_NAME = "K.O. Coliseum";

async function getSetId(): Promise<string> {
  const set = await prisma.gameSet.findUnique({ where: { name: SET_NAME }, select: { id: true } });
  if (!set) throw new Error(`GameSet not found: ${SET_NAME}. Seed the DB first.`);
  return set.id;
}

function mapRawToItem(row: RawItem): Item {
  return new Item(
    row.slug,
    row.name,
    row.kind.toLowerCase() as any,
    Array.isArray(row.tags) ? row.tags : [],
    row.stats || {},
    row.text || undefined,
    undefined,
    undefined,
    undefined,
    row.isUnique
  );
}

export class ItemsService {
  async list(query: ItemsQuery): Promise<ItemsListResponse> {
    const { search, category, tag, sort, order, limit, offset } = query;
    const setId = await getSetId();

    const where: Prisma.ItemWhereInput = { setId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } }
      ];
    }

    if (category) {
      const kindMap: Record<string, any> = {
        component: "COMPONENT",
        item: "COMPLETED", 
        artifact: "ARTIFACT",
        radiant: "RADIANT",
        emblem: "EMBLEM"
      };
      where.kind = kindMap[category];
    }

    const orderBy: Prisma.ItemOrderByWithRelationInput[] = [];
    if (sort === "name") orderBy.push({ name: order });
    else if (sort === "kind") orderBy.push({ kind: order });
    orderBy.push({ id: "asc" });

    let rows = (await prisma.item.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    })) as unknown as RawItem[];

    if (search) {
      const searchLower = search.toLowerCase();
      rows = rows.filter((item) => item.name.toLowerCase().includes(searchLower));
    }

    if (tag) {
      const tagLower = tag.toLowerCase();
      rows = rows.filter((item) => {
        const tags = Array.isArray(item.tags) ? item.tags : [];
        return tags.some((t: string) => t.toLowerCase().includes(tagLower));
      });
    }

    const items = rows.map(mapRawToItem);
    const nextOffset = rows.length === limit ? offset + limit : undefined;
    const pageInfo = new PageInfo(nextOffset, nextOffset !== undefined);
    return new ItemsListResponse(items, pageInfo, { set: "set15" });
  }

  async getBySlug(slug: string): Promise<Item | null> {
    const setId = await getSetId();

    const row = (await prisma.item.findFirst({
      where: { slug, setId },
    })) as unknown as RawItem | null;

    return row ? mapRawToItem(row) : null;
  }
}
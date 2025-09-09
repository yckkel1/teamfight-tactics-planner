import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import type { RawTraitWithCounts } from '@data/models';
import { TraitsQuerySchema, IncludeTiersEnum, TraitsListResponseSchema, CURRENT_SET_META } from '@data/models';


const prisma = new PrismaClient();
const app = Fastify({ logger: true });
await app.register(sensible);
await app.register(cors, { origin: [/^http:\/\/localhost:\d+$/] });


async function getSetId(): Promise<string> {
const set = await prisma.gameSet.findUnique({ where: { name: CURRENT_SET_META.setName }, select: { id: true } });
if (!set) throw new Error(`GameSet not found: ${CURRENT_SET_META.setName}. Seed first.`);
return set.id;
}


function mapTraitDTO(t: RawTraitWithCounts, includeTiers: 'none' | 'breakpoints' | 'full') {
const base: any = { name: t.name, category: t.category, unitCount: t._count.unitTraits };
if (includeTiers === 'breakpoints' && t.tiers) base.tiers = t.tiers.map((x) => ({ minUnits: x.minUnits }));
else if (includeTiers === 'full' && t.tiers) base.tiers = t.tiers.map((x) => ({ minUnits: x.minUnits, note: x.note ?? null, effects: x.effects ?? {} }));
return base;
}


const traitsHandler = async (req: any, reply: any) => {
const parsed = TraitsQuerySchema.safeParse(req.query);
if (!parsed.success) return reply.badRequest(parsed.error.flatten());
const { includeTiers, search, sort, order, limit, offset } = parsed.data;


const setId = await getSetId();
const where: any = { setId };
if (search) where.name = { contains: search, mode: 'insensitive' };


const include: any = { _count: { select: { unitTraits: true } } };
if (includeTiers !== IncludeTiersEnum.Enum.none) {
include.tiers = { select: { minUnits: true, note: true, effects: true }, orderBy: { minUnits: 'asc' } };
}


const orderBy: any[] = [];
if (sort === 'name') orderBy.push({ name: order });
else if (sort === 'unitCount') orderBy.push({ unitTraits: { _count: order } });
orderBy.push({ id: 'asc' });


const rows = (await prisma.trait.findMany({ where, include, orderBy, skip: offset, take: limit })) as unknown as RawTraitWithCounts[];
const items = rows.map((t) => mapTraitDTO(t, includeTiers));
const nextOffset = rows.length === limit ? offset + limit : undefined;
const pageInfo = { nextOffset, hasMore: nextOffset !== undefined };
const response = { items, pageInfo, meta: { set: CURRENT_SET_META.set } };


const ok = TraitsListResponseSchema.safeParse(response);
if (!ok.success) return reply.internalServerError(ok.error.flatten());
return reply.send(response);
};


app.get('/api/v1/traits', traitsHandler);
app.get('/list/traits', traitsHandler);
app.get('/health', async () => ({ ok: true }));


const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
app
.listen({ port: PORT, host: HOST })
.then((addr) => app.log.info(`API listening at ${addr}`))
.catch(async (err) => { app.log.error(err); await prisma.$disconnect(); process.exit(1); });
import type { FastifyReply, FastifyRequest } from 'fastify';
import { TraitsQuerySchema } from '@data/models';
import { TraitsService } from '../services/traits.service';

export class TraitsController {
    constructor(private readonly svc: TraitsService) {}

    list = async (req: FastifyRequest, reply: FastifyReply) => {
        const parsed = TraitsQuerySchema.safeParse((req as any).query);
        if (!parsed.success) return reply.badRequest(parsed.error.flatten());
        const payload = await this.svc.list(parsed.data);
        return reply.send(payload);
    };
}
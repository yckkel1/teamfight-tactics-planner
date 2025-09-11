import type { FastifyReply, FastifyRequest } from "fastify";
import { TraitsQuerySchema, TraitsQuery } from "@data/models";
import { TraitsService } from "../services/traits.service";

export class TraitsController {
  constructor(private readonly svc: TraitsService) {}

  list = async (req: FastifyRequest<{ Querystring: TraitsQuery }>, reply: FastifyReply) => {
    const parsed = TraitsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const details = parsed.error.flatten();
      return reply
        .code(400)
        .send({ error: { code: "BadRequest", message: "Invalid query", details } });
    }
    const payload = await this.svc.list(parsed.data);
    return reply.send(payload);
  };
}

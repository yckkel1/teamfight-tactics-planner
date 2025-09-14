import type { FastifyReply, FastifyRequest } from "fastify";
import { UnitsQuerySchema, UnitsQuery } from "@data/models";
import { UnitsService } from "../services/units.service";

export class UnitsController {
  constructor(private readonly svc: UnitsService) {}

  list = async (req: FastifyRequest<{ Querystring: UnitsQuery }>, reply: FastifyReply) => {
    const parsed = UnitsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const details = parsed.error.flatten();
      return reply
        .code(400)
        .send({ error: { code: "BadRequest", message: "Invalid query", details } });
    }
    const payload = await this.svc.list(parsed.data);
    return reply.send(payload);
  };

  getById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const unit = await this.svc.getById(req.params.id);
    if (!unit) {
      return reply.code(404).send({
        error: { code: "NotFound", message: "Unit not found" },
      });
    }
    return reply.send(unit);
  };
}

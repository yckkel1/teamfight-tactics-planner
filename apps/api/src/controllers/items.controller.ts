// apps/api/src/controllers/items.controller.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { ItemsQuerySchema, ItemsQuery } from "@data/models";
import { ItemsService } from "../services/items.service";

export class ItemsController {
  constructor(private readonly svc: ItemsService) {}

  list = async (req: FastifyRequest<{ Querystring: ItemsQuery }>, reply: FastifyReply) => {
    const parsed = ItemsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const details = parsed.error.flatten();
      return reply
        .code(400)
        .send({ error: { code: "BadRequest", message: "Invalid query", details } });
    }
    
    try {
      const payload = await this.svc.list(parsed.data);
      return reply.send(payload);
    } catch (error) {
      req.log.error(error, "Failed to list items");
      return reply
        .code(500)
        .send({ error: { code: "InternalError", message: "Failed to load items" } });
    }
  };

  getBySlug = async (req: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
    try {
      const item = await this.svc.getBySlug(req.params.slug);
      if (!item) {
        return reply.code(404).send({
          error: { code: "NotFound", message: "Item not found" },
        });
      }
      return reply.send(item);
    } catch (error) {
      req.log.error(error, "Failed to get item by slug");
      return reply
        .code(500)
        .send({ error: { code: "InternalError", message: "Failed to load item" } });
    }
  };
}
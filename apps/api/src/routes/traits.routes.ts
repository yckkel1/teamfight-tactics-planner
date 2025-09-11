import type { FastifyInstance } from "fastify";
import { TraitsController } from "../controllers/traits.controller";
import { TraitsService } from "../services/traits.service";

export async function traitsRoutes(fastify: FastifyInstance) {
  const controller = new TraitsController(new TraitsService());
  fastify.get("/traits", controller.list);
}

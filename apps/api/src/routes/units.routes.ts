import type { FastifyInstance } from "fastify";
import { UnitsController } from "../controllers/units.controller";
import { UnitsService } from "../services/units.service";

export async function unitsRoutes(fastify: FastifyInstance) {
  const controller = new UnitsController(new UnitsService());

  fastify.get("/units", controller.list);
  fastify.get("/units/:id", controller.getById);
}

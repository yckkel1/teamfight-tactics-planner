// apps/api/src/routes/items.routes.ts
import type { FastifyInstance } from "fastify";
import { ItemsController } from "../controllers/items.controller";
import { ItemsService } from "../services/items.service";

export async function itemsRoutes(fastify: FastifyInstance) {
  const controller = new ItemsController(new ItemsService());

  fastify.get("/items", controller.list);
  fastify.get("/items/:slug", controller.getBySlug);
}
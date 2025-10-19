// apps/api/src/server.ts - Updated version
import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { traitsRoutes } from "./routes/traits.routes.js";
import { unitsRoutes } from "./routes/units.routes.js";
import { itemsRoutes } from "./routes/items.routes.js";

const app = Fastify({ logger: true });
await app.register(sensible);
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  "http://localhost:3000",
  "https://teamfight-tactics-planner.online",
  "https://www.teamfight-tactics-planner.online",
  /\.vercel\.app$/,
];

console.log('CORS allowed origins:', allowedOrigins);

await app.register(cors, {
  origin: allowedOrigins,
});

// health
app.get("/health", async () => ({ ok: true }));

// register routes under both prefixes
await app.register(
  async (instance) => {
    instance.register(traitsRoutes);
    instance.register(unitsRoutes);
    instance.register(itemsRoutes);
  },
  { prefix: "/api/v1" },
);

await app.register(
  async (instance) => {
    instance.register(traitsRoutes);
    instance.register(unitsRoutes);
    instance.register(itemsRoutes);
  },
  { prefix: "/list" },
);

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";
app
  .listen({ port: PORT, host: HOST })
  .then((addr) => app.log.info(`API listening at ${addr}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
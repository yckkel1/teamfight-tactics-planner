import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import { traitsRoutes } from './routes/traits.routes.js';

const app = Fastify({ logger: true });
await app.register(sensible);
await app.register(cors, { origin: [/^http:\/\/localhost:\d+$/] });

// health
app.get('/health', async () => ({ ok: true }));

// register routes under both prefixes
await app.register(async (instance) => instance.register(traitsRoutes), { prefix: '/api/v1' });
await app.register(async (instance) => instance.register(traitsRoutes), { prefix: '/list' });

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
app
    .listen({ port: PORT, host: HOST })
    .then((addr) => app.log.info(`API listening at ${addr}`))
    .catch((err) => {
    app.log.error(err);
    process.exit(1);
});
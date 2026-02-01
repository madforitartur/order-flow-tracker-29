import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { registerHealthRoutes } from './routes/health';
import { registerImportRoutes } from './routes/imports';
import { registerOrderRoutes } from './routes/orders';
import { registerDashboardRoutes } from './routes/dashboard';
import { registerReportsRoutes } from './routes/reports';
import { registerStatisticsRoutes } from './routes/statistics';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info'
  }
});

await app.register(cors, { origin: true });
await app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});
await app.register(rateLimit, {
  max: 20,
  timeWindow: '1 minute'
});

registerHealthRoutes(app);
registerImportRoutes(app);
registerOrderRoutes(app);
registerDashboardRoutes(app);
registerReportsRoutes(app);
registerStatisticsRoutes(app);

app.listen({ port: config.port, host: config.host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/order_flow',
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  useQueue: process.env.USE_QUEUE === 'true',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379'
};

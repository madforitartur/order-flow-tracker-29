import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/order_flow'
  }
} satisfies Config;

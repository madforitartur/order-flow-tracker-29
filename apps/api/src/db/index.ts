import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/order_flow';

const pool = new Pool({ connectionString });

export const db = drizzle(pool);
export { pool };

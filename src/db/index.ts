import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Credentials live in .env.local locally; on Vercel they come from the
// project's environment variables. Loading .env.local is a no-op in production.
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Reuse a single Pool across hot-reloads in development to avoid exhausting
// connections.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

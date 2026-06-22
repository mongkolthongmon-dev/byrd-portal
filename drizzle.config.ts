import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Credentials live in .env.local, so load that explicitly (same as neon-dev).
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

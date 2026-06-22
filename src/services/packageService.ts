import { asc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { packages } from '../db/schema';

// Data-access for packages. Keeping queries here (instead of in pages) mirrors
// neon-dev's service pattern and keeps the schema decoupled from the UI.
export const packageService = {
  list() {
    return db.select().from(packages).orderBy(asc(packages.name));
  },

  async getById(id: number) {
    const rows = await db.select().from(packages).where(eq(packages.id, id));
    return rows[0] ?? null;
  },

  async create(data: { name: string; description?: string | null }) {
    await db
      .insert(packages)
      .values({ name: data.name, description: data.description ?? null })
      .onConflictDoNothing();
  },

  async remove(id: number) {
    await db.delete(packages).where(eq(packages.id, id));
  },

  async count() {
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(packages);
    return rows[0]?.n ?? 0;
  },
};

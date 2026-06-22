import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { todos } from '../db/schema';

// All mutations take ownerId and scope by it, so a user can only ever touch
// their own rows — the per-user data guarantee lives here, not in the UI.
export const todoService = {
  listByOwner(ownerId: number) {
    return db
      .select()
      .from(todos)
      .where(eq(todos.ownerId, ownerId))
      .orderBy(desc(todos.createdAt));
  },

  async create(ownerId: number, title: string) {
    await db.insert(todos).values({ ownerId, title });
  },

  async updateTitle(id: number, ownerId: number, title: string) {
    await db
      .update(todos)
      .set({ title })
      .where(and(eq(todos.id, id), eq(todos.ownerId, ownerId)));
  },

  async setDone(id: number, ownerId: number, done: boolean) {
    await db
      .update(todos)
      .set({ done })
      .where(and(eq(todos.id, id), eq(todos.ownerId, ownerId)));
  },

  async remove(id: number, ownerId: number) {
    await db.delete(todos).where(and(eq(todos.id, id), eq(todos.ownerId, ownerId)));
  },

  countByOwner(ownerId: number) {
    return db
      .select({ n: sql<number>`count(*)::int` })
      .from(todos)
      .where(eq(todos.ownerId, ownerId))
      .then((r) => r[0]?.n ?? 0);
  },

  async count() {
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(todos);
    return rows[0]?.n ?? 0;
  },
};

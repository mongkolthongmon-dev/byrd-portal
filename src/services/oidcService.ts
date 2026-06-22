import { asc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { oidcProviders } from '../db/schema';

export const oidcService = {
  listAll() {
    return db.select().from(oidcProviders).orderBy(asc(oidcProviders.name));
  },

  // Enabled providers drive both the login buttons and the Auth.js provider list.
  async listEnabled() {
    try {
      return await db
        .select()
        .from(oidcProviders)
        .where(eq(oidcProviders.enabled, true));
    } catch {
      // Table may not exist before migrations run; degrade gracefully.
      return [];
    }
  },

  // Returns the inserted row, or null if a provider with that id already exists.
  async create(data: {
    id: string;
    name: string;
    issuer: string;
    clientId: string;
    clientSecret: string;
    scopes?: string;
  }) {
    const rows = await db
      .insert(oidcProviders)
      .values({
        id: data.id,
        name: data.name,
        issuer: data.issuer,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        scopes: data.scopes || 'openid email profile',
      })
      .onConflictDoNothing()
      .returning();
    return rows[0] ?? null;
  },

  async update(
    id: string,
    data: {
      name: string;
      issuer: string;
      clientId: string;
      scopes?: string;
      // Optional: only updated when a new secret is supplied, so editing other
      // fields doesn't wipe the stored secret.
      clientSecret?: string;
    },
  ) {
    const values: {
      name: string;
      issuer: string;
      clientId: string;
      scopes: string;
      clientSecret?: string;
    } = {
      name: data.name,
      issuer: data.issuer,
      clientId: data.clientId,
      scopes: data.scopes || 'openid email profile',
    };
    if (data.clientSecret) values.clientSecret = data.clientSecret;
    await db.update(oidcProviders).set(values).where(eq(oidcProviders.id, id));
  },

  async setEnabled(id: string, enabled: boolean) {
    await db.update(oidcProviders).set({ enabled }).where(eq(oidcProviders.id, id));
  },

  async remove(id: string) {
    await db.delete(oidcProviders).where(eq(oidcProviders.id, id));
  },

  async count() {
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(oidcProviders);
    return rows[0]?.n ?? 0;
  },
};

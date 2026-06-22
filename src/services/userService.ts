import { asc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { accounts, users } from '../db/schema';
import { generateCredentials, verifyPassword } from '../lib/password';

export const userService = {
  list() {
    return db.select().from(users).orderBy(asc(users.email));
  },

  // Filter by name or email (case-insensitive). Empty query returns everyone.
  search(query?: string) {
    const q = query?.trim();
    if (!q) return this.list();
    const term = `%${q}%`;
    return db
      .select()
      .from(users)
      .where(or(ilike(users.name, term), ilike(users.email, term)))
      .orderBy(asc(users.email));
  },

  async getByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return rows[0] ?? null;
  },

  async getById(id: number) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ?? null;
  },

  async create(data: {
    email: string;
    name: string;
    password?: string;
    role?: 'admin' | 'user';
    packageId?: number | null;
    image?: string | null;
  }) {
    const creds = data.password
      ? generateCredentials(data.password)
      : { passwordHash: null, passwordSalt: null };
    const rows = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role ?? 'user',
        packageId: data.packageId ?? null,
        image: data.image ?? null,
        loginAt: new Date(),
        ...creds,
      })
      .returning();
    return rows[0];
  },

  async setRoleAndPackage(id: number, role: 'admin' | 'user', packageId: number | null) {
    await db.update(users).set({ role, packageId }).where(eq(users.id, id));
  },

  async touchLogin(id: number) {
    await db.update(users).set({ loginAt: new Date() }).where(eq(users.id, id));
  },

  // Verify email + password for the credentials login. Returns the user (and
  // stamps loginAt) on success, otherwise null.
  async verifyCredentials(email: string, password: string) {
    const user = await this.getByEmail(email);
    if (!user || !verifyPassword(user, password)) return null;
    await this.touchLogin(user.id);
    return user;
  },

  // Find or create the local user for an OIDC sign-in and link the external
  // identity (idempotent via the unique constraint on accounts).
  async upsertOidcUser(opts: {
    email: string;
    name: string;
    image?: string | null;
    provider: string;
    providerAccountId: string;
  }) {
    let user = await this.getByEmail(opts.email);
    if (!user) {
      user = await this.create({
        email: opts.email,
        name: opts.name,
        role: 'user',
        image: opts.image ?? null,
      });
    } else {
      await this.touchLogin(user.id);
    }
    await db
      .insert(accounts)
      .values({
        userId: user.id,
        provider: opts.provider,
        providerAccountId: opts.providerAccountId,
      })
      .onConflictDoNothing();
    return user;
  },

  async count() {
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(users);
    return rows[0]?.n ?? 0;
  },
};

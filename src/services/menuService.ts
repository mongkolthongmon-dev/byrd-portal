import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { menus } from '../db/schema';

export const menuService = {
  listAll() {
    return db.select().from(menus).orderBy(asc(menus.sortOrder), asc(menus.label));
  },

  listForPackage(packageId: number, enabledOnly = false) {
    const where = enabledOnly
      ? and(eq(menus.packageId, packageId), eq(menus.enabled, true))
      : eq(menus.packageId, packageId);
    return db
      .select()
      .from(menus)
      .where(where)
      .orderBy(asc(menus.sortOrder), asc(menus.label));
  },

  async create(data: {
    packageId: number;
    label: string;
    href: string;
    icon?: string | null;
    sortOrder?: number;
    external?: boolean;
  }) {
    await db.insert(menus).values({
      packageId: data.packageId,
      label: data.label,
      href: data.href,
      icon: data.icon ?? null,
      sortOrder: data.sortOrder ?? 0,
      external: data.external ?? false,
    });
  },

  async createMany(
    items: {
      packageId: number;
      label: string;
      href: string;
      icon?: string | null;
      sortOrder?: number;
      external?: boolean;
    }[],
  ) {
    if (items.length === 0) return;
    await db.insert(menus).values(
      items.map((m) => ({
        packageId: m.packageId,
        label: m.label,
        href: m.href,
        icon: m.icon ?? null,
        sortOrder: m.sortOrder ?? 0,
        external: m.external ?? false,
      })),
    );
  },

  async update(
    id: number,
    data: {
      label: string;
      href: string;
      icon?: string | null;
      sortOrder?: number;
      external?: boolean;
    },
  ) {
    await db
      .update(menus)
      .set({
        label: data.label,
        href: data.href,
        icon: data.icon ?? null,
        sortOrder: data.sortOrder ?? 0,
        external: data.external ?? false,
      })
      .where(eq(menus.id, id));
  },

  async setEnabled(id: number, enabled: boolean) {
    await db.update(menus).set({ enabled }).where(eq(menus.id, id));
  },

  async remove(id: number) {
    await db.delete(menus).where(eq(menus.id, id));
  },

  async count() {
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(menus);
    return rows[0]?.n ?? 0;
  },
};

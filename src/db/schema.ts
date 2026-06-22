import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

// A "package" is a bundle of features. Each user is assigned one package and
// only sees the menus that belong to it.
export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Application users. Password fields are nullable because users who sign in via
// OIDC may never set a local password.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  // 'admin' can edit app config; 'user' is a regular member.
  role: text('role').notNull().default('user'),
  packageId: integer('package_id').references(() => packages.id, {
    onDelete: 'set null',
  }),
  passwordHash: text('password_hash'),
  passwordSalt: text('password_salt'),
  image: text('image'),
  loginAt: timestamp('login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Links an external OIDC identity (provider + subject) to a local user.
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique('accounts_provider_account_unique').on(t.provider, t.providerAccountId)],
);

// Menu items belong to a package. The dashboard renders only the menus for the
// signed-in user's package.
export const menus = pgTable('menus', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id')
    .notNull()
    .references(() => packages.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  href: text('href').notNull(),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  // When true the href is an external URL opened in a new tab; otherwise it's
  // an in-app route.
  external: boolean('external').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// A tiny per-user todo list. Each user only sees rows they own.
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  done: boolean('done').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin-managed OIDC provider configs. Each enabled row becomes a login button
// and an Auth.js provider at runtime. The `id` is the provider slug used in
// callback URLs (e.g. /api/auth/callback/<id>).
export const oidcProviders = pgTable('oidc_providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  clientId: text('client_id').notNull(),
  clientSecret: text('client_secret').notNull(),
  scopes: text('scopes').default('openid email profile').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Menu = typeof menus.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type OidcProvider = typeof oidcProviders.$inferSelect;

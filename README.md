# byrd-portal

A package-aware portal built for **Assignment 3**. It adds a shared Tailwind UI
layout, authentication, and a managed database workflow (Drizzle migrations +
seed) on top of the Assignment-2 Neon Postgres stack.

On top of the assignment requirements it implements four product features:

1. **Admin role** that edits app config — **dynamic menus organized by package**.
2. **Package-scoped access** — a user assigned a package sees only that package's menus.
3. **Per-user mini todos** — every user has a todo list, but each only sees their own.
4. **Admin-configurable OIDC** — admins store OIDC providers in the DB; users pick how to log in.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 (all layout/styling — no plain CSS or inline styles) |
| Database | Neon Postgres |
| ORM / driver | Drizzle ORM + `pg` (node-postgres) — mirrors the `neon-dev` data layer |
| Migrations | `drizzle-kit` (`generate` + `migrate`) |
| Auth | Auth.js v5 (NextAuth) — Credentials + dynamic OIDC, JWT sessions |
| Password hashing | scrypt + HMAC-SHA256 with an `ENCODE_KEY` pepper (from `neon-dev`) |

---

## Authentication — approach & why

**Auth.js v5 (NextAuth)** with two provider types:

- **Credentials** (email + password). Passwords are hashed with `scrypt` + a
  per-user salt + an `HMAC-SHA256` pepper (`ENCODE_KEY`), the same scheme as the
  `neon-dev` reference. This bootstraps the first admin before any OIDC exists.
- **Dynamic OIDC** providers built **at request time** from the `oidc_providers`
  table. An admin adds a provider in the UI (issuer, client id/secret, scopes);
  each enabled row becomes both a login button and an Auth.js generic OIDC
  provider — no redeploy needed.

Sessions use the **JWT strategy**, so the user's `id`, `role`, and `packageId`
travel in a signed cookie (no session table required). Auth.js was chosen over a
fully custom OIDC implementation because it handles the OAuth/OIDC handshake,
CSRF, and cookie signing securely, while still allowing the per-request dynamic
provider list the "admin-configured login" feature needs.

> **Authentication vs authorization:** this app needs both. *Authentication* =
> proving who you are (login). *Authorization* = what you may do (the `role` and
> `packageId` checks). Auth checks run on the **server** (middleware + server
> components + server actions) because the client can never be trusted.

### What's protected vs public

| Area | Access |
| --- | --- |
| `/` landing (package catalog) | **Public** (read-only) |
| `/login` | Public |
| `/dashboard` | Signed-in users |
| `/todos` (+ all writes) | Signed-in users — scoped to the owner |
| `/admin/**` (+ all writes) | Signed-in **admins** only |

Enforcement happens in three server-side layers: `middleware.ts` (redirects),
the `requireUser` / `requireAdmin` guards in `src/lib/guards.ts` used by every
protected page/layout, and a re-check inside every write **server action**.

---

## Database

Schema (`src/db/schema.ts`): `packages`, `users`, `accounts` (OIDC links),
`menus`, `todos`, `oidc_providers`.

### Migrations & seed — tooling and commands

Tooling: **drizzle-kit** for migrations, **tsx** to run the seed (same as
`neon-dev`).

```bash
# 1. install
npm install

# 2. generate SQL migration files from src/db/schema.ts
npm run db:generate

# 3. apply migrations to the database in DATABASE_URL
npm run db:migrate

# 4. insert sample data (idempotent — safe to run repeatedly)
npm run db:seed
```

The seed is **idempotent**: packages use `onConflictDoNothing` on their unique
name, users are inserted only if the email doesn't already exist, and menus/todos
are inserted only when none exist yet — so re-running never duplicates data.

A hand-written **down migration** lives at `drizzle/down.sql` (drops all tables)
to demonstrate a clean rollback.

---

## Local setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev                        # http://localhost:3000
```

### Environment variables

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Signs the session JWT (`npx auth secret`) |
| `AUTH_URL` | Base URL for OIDC callbacks (auto on Vercel) |
| `AUTH_TRUST_HOST` | `true` so Auth.js trusts the host locally/behind proxies |
| `ENCODE_KEY` | Password-hash pepper |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed bootstrap credentials |
| `NEXT_PUBLIC_AUTHOR_URL` | Author/profile link shown in the footer (public) |

Secrets are never committed — `.env.local` is gitignored; use
`.env.local.example` as the template.

### Test credentials (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@byrd.local` | `ChangeMe123!` |
| User | `user@byrd.local` | `ChangeMe123!` |

---

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Set env vars in the Vercel project: `DATABASE_URL`, `AUTH_SECRET`,
   `ENCODE_KEY` (and optionally `ADMIN_EMAIL`/`ADMIN_PASSWORD`). `AUTH_URL` is
   set automatically.
3. **Migrations run automatically on deploy** via the `vercel-build` script
   (`drizzle-kit migrate && next build`) — Vercel runs `vercel-build` instead of
   `build` when present, so the prod schema is always applied. (`db:generate` is
   never run on deploy — migration SQL is committed to the repo.) Run
   `npm run db:seed` once against the prod `DATABASE_URL` to insert sample data.
4. For each OIDC provider, add the callback URL
   `https://<your-app>.vercel.app/api/auth/callback/<provider-id>` in the
   provider's OAuth app.

---

## Adding an OIDC provider (admin)

1. Sign in as an admin → **Admin → Login (OIDC)**.
2. Enter a slug (e.g. `google`), display name, issuer URL, client id/secret, scopes.
3. Register the callback URL shown on that page with your provider.
4. Enable it — it now appears as a button on `/login`.

---

## Submission checklist

- [x] Shared header / footer / container layout (Tailwind, responsive)
- [x] Login / logout (credentials + OIDC)
- [x] Server-enforced protected pages and write actions
- [x] Drizzle migration files + idempotent seed
- [x] Bonus: role-based access, per-user data, down migration, loading/empty states

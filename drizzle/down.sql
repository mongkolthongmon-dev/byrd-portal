-- Down migration (bonus): cleanly reverses the schema created by the generated
-- up migration. Run manually against your database to roll everything back:
--   psql "$DATABASE_URL" -f drizzle/down.sql
-- Order matters: drop dependents (FKs) before their parents.

DROP TABLE IF EXISTS "todos" CASCADE;
DROP TABLE IF EXISTS "menus" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "oidc_providers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "packages" CASCADE;

-- Also remove drizzle's migration bookkeeping so a fresh `db:migrate` re-applies
-- everything from scratch.
DROP SCHEMA IF EXISTS "drizzle" CASCADE;

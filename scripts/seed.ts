import { config } from 'dotenv';

config({ path: '.env.local' });

import { menuService } from '../src/services/menuService';
import { packageService } from '../src/services/packageService';
import { todoService } from '../src/services/todoService';
import { userService } from '../src/services/userService';

// Idempotent seed: safe to run multiple times. Existing rows are left in place
// (services use onConflictDoNothing / we check before inserting).

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@byrd.local').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
const USER_EMAIL = 'user@byrd.local';
const USER_PASSWORD = 'ChangeMe123!';

const PACKAGE_DATA = [
  { name: 'Core', description: 'Baseline tools available to everyone.' },
  { name: 'Sales', description: 'CRM, leads and pipeline tools.' },
  { name: 'HR', description: 'People, leave and onboarding tools.' },
];

const MENU_DATA: Record<string, { label: string; href: string; icon: string; sortOrder: number }[]> = {
  Core: [
    { label: 'Overview', href: '/dashboard', icon: '🏠', sortOrder: 0 },
    { label: 'My Todos', href: '/todos', icon: '✅', sortOrder: 1 },
  ],
  Sales: [
    { label: 'Leads', href: '/sales/leads', icon: '🎯', sortOrder: 0 },
    { label: 'Pipeline', href: '/sales/pipeline', icon: '📈', sortOrder: 1 },
    { label: 'My Todos', href: '/todos', icon: '✅', sortOrder: 2 },
  ],
  HR: [
    { label: 'People', href: '/hr/people', icon: '👥', sortOrder: 0 },
    { label: 'Leave', href: '/hr/leave', icon: '🌴', sortOrder: 1 },
    { label: 'My Todos', href: '/todos', icon: '✅', sortOrder: 2 },
  ],
};

async function ensureUser(opts: {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  packageId: number | null;
}) {
  const existing = await userService.getByEmail(opts.email);
  if (existing) {
    console.log(`  • user ${opts.email} already exists (id ${existing.id})`);
    return existing;
  }
  const created = await userService.create(opts);
  console.log(`  • created user ${opts.email} (id ${created.id})`);
  return created;
}

async function main() {
  console.log('Seeding byrd-portal…');

  // Packages (unique name → create is a no-op on conflict).
  for (const p of PACKAGE_DATA) await packageService.create(p);
  const pkgRows = await packageService.list();
  const pkgByName = new Map(pkgRows.map((p) => [p.name, p]));
  console.log(`  • packages: ${pkgRows.map((p) => p.name).join(', ')}`);

  // Menus per package (only if that package has none yet).
  for (const [name, items] of Object.entries(MENU_DATA)) {
    const pkg = pkgByName.get(name);
    if (!pkg) continue;
    const existing = await menuService.listForPackage(pkg.id);
    if (existing.length > 0) {
      console.log(`  • menus for ${name} already exist (${existing.length})`);
      continue;
    }
    await menuService.createMany(items.map((m) => ({ ...m, packageId: pkg.id })));
    console.log(`  • created ${items.length} menus for ${name}`);
  }

  // Admin + a sample regular user (assigned to Sales).
  const admin = await ensureUser({
    email: ADMIN_EMAIL,
    name: 'Portal Admin',
    password: ADMIN_PASSWORD,
    role: 'admin',
    packageId: pkgByName.get('Core')?.id ?? null,
  });

  await ensureUser({
    email: USER_EMAIL,
    name: 'Sample User',
    password: USER_PASSWORD,
    role: 'user',
    packageId: pkgByName.get('Sales')?.id ?? null,
  });

  // A couple of sample todos for the admin (only if they have none).
  const adminTodos = await todoService.listByOwner(admin.id);
  if (adminTodos.length === 0) {
    await todoService.create(admin.id, 'Configure an OIDC provider');
    await todoService.create(admin.id, 'Create menus for each package');
    console.log('  • created sample todos for admin');
  }

  console.log('Seed complete.');
  console.log(`\nAdmin login:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`User login:   ${USER_EMAIL} / ${USER_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

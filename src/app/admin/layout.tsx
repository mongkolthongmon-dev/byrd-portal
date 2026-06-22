import Link from 'next/link';
import { requireAdmin } from '@/lib/guards';

export const runtime = 'nodejs';

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/packages', label: 'Packages' },
  { href: '/admin/menus', label: 'Menus' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/oidc', label: 'Login (OIDC)' },
];

// Admin-only section: the guard enforces the role on the server for every page
// nested under /admin.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-t-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}

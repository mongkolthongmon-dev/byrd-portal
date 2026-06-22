import Link from 'next/link';
import { menuService } from '@/services/menuService';
import { oidcService } from '@/services/oidcService';
import { packageService } from '@/services/packageService';
import { todoService } from '@/services/todoService';
import { userService } from '@/services/userService';

export const runtime = 'nodejs';

export default async function AdminOverviewPage() {
  const [pkgs, menuCount, userCount, providerCount, todoCount] = await Promise.all([
    packageService.count(),
    menuService.count(),
    userService.count(),
    oidcService.count(),
    todoService.count(),
  ]);

  const stats = [
    { label: 'Packages', value: pkgs, href: '/admin/packages' },
    { label: 'Menus', value: menuCount, href: '/admin/menus' },
    { label: 'Users', value: userCount, href: '/admin/users' },
    { label: 'OIDC providers', value: providerCount, href: '/admin/oidc' },
    { label: 'Todos (all users)', value: todoCount, href: '/admin' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Manage packages, the dynamic menus shown to each package, user
        assignments, and how users log in.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-400"
          >
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

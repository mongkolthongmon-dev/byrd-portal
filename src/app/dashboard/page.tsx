import { requireUser } from '@/lib/guards';
import { menuService } from '@/services/menuService';
import { packageService } from '@/services/packageService';
import { userService } from '@/services/userService';

export const runtime = 'nodejs';

// External links need an absolute URL with a scheme, otherwise the browser
// resolves them relative to the current site. Prepend https:// when the admin
// omitted the scheme (e.g. "app.example.com").
function resolveHref(href: string, external: boolean) {
  if (!external) return href;
  return /^[a-zA-Z][\w+.-]*:/.test(href) ? href : `https://${href}`;
}

// Protected page. Renders only the menus that belong to the signed-in user's
// package — the core "package-scoped access" feature.
export default async function DashboardPage() {
  const sessionUser = await requireUser();

  // Read the package fresh from the DB (not the session token) so an admin's
  // change to this user's package is reflected immediately, without re-login.
  const dbUser = await userService.getById(Number(sessionUser.id));
  const packageId = dbUser?.packageId ?? null;

  const pkg = packageId ? await packageService.getById(packageId) : null;
  const items = packageId ? await menuService.listForPackage(packageId, true) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {pkg ? (
            <>
              Your package: <span className="font-medium text-slate-700">{pkg.name}</span>
            </>
          ) : (
            'You have not been assigned a package yet.'
          )}
        </p>
      </div>

      {!pkg ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No package assigned. Ask an admin to assign you one under Admin → Users.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Your package has no menu items yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <a
              key={m.id}
              href={resolveHref(m.href, m.external)}
              target={m.external ? '_blank' : undefined}
              rel={m.external ? 'noreferrer' : undefined}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-lg">
                  {m.icon ?? '📁'}
                </span>
                <span className="font-semibold text-slate-900 group-hover:text-indigo-700">
                  {m.label}
                  {m.external && <span className="ml-1 text-slate-400">↗</span>}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-slate-400">{m.href}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

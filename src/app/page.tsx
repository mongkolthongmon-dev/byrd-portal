import Link from 'next/link';
import { auth } from '@/auth';
import { packageService } from '@/services/packageService';

export const runtime = 'nodejs';

// Public landing page. Reading the package catalog is open to everyone; this is
// the public "read" surface (documented in the README).
export default async function HomePage() {
  const session = await auth();
  const allPackages = await packageService.list();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white sm:p-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome to byrd-portal</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">
          A package-aware portal. Admins manage dynamic menus per package and
          configure how users sign in. Each member sees only the menus in their
          package and keeps a private todo list.
        </p>
        <div className="mt-6">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Sign in to get started
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Available packages</h2>
        {allPackages.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No packages yet. An admin can create them under Admin → Packages.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allPackages.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {p.description ?? 'No description.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

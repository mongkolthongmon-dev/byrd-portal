import Link from 'next/link';
import { auth, signOut } from '@/auth';
import Container from './Container';

type NavLink = { href: string; label: string };

function navLinks(role: string | undefined, signedIn: boolean): NavLink[] {
  const links: NavLink[] = [{ href: '/', label: 'Home' }];
  if (signedIn) {
    links.push({ href: '/dashboard', label: 'Dashboard' });
    links.push({ href: '/todos', label: 'Todos' });
  }
  if (role === 'admin') {
    links.push({ href: '/admin', label: 'Admin' });
  }
  return links;
}

export default async function Header() {
  const session = await auth();
  const user = session?.user;
  const links = navLinks(user?.role, Boolean(user));

  return (
    <header className="border-b border-slate-200 bg-white">
      <Container>
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              B
            </span>
            byrd-portal
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth control */}
          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <span className="text-sm text-slate-600">
                  {user.name}
                  {user.role === 'admin' && (
                    <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                      admin
                    </span>
                  )}
                </span>
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/' });
                  }}
                >
                  <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu (pure HTML disclosure, no client JS) */}
          <details className="relative sm:hidden">
            <summary className="cursor-pointer list-none rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
              Menu
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-slate-200" />
              {user ? (
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/' });
                  }}
                >
                  <button className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
                    Logout ({user.name})
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Login
                </Link>
              )}
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}

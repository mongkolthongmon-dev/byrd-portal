import type { NextAuthConfig } from 'next-auth';

// Routes that require any signed-in user, and those that additionally require an
// admin role.
const PROTECTED_PREFIXES = ['/dashboard', '/todos', '/admin'];
const ADMIN_PREFIX = '/admin';

// Edge-safe config: NO database access and NO providers here. This is the slice
// the middleware loads, so it must run on the edge runtime. The full provider
// list lives in auth.ts (Node runtime).
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    // Runs in middleware for every matched request. Returning false (or a
    // Response) blocks access; Auth.js redirects to the signIn page.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      );
      if (!isProtected) return true;

      if (!auth?.user) return false;

      if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
        return auth.user.role === 'admin';
      }
      return true;
    },
    // Expose our custom fields from the token onto the session object.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? 'user';
        session.user.packageId = (token.packageId as number | null) ?? null;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts
} satisfies NextAuthConfig;

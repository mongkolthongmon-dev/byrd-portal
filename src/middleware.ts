import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Middleware uses ONLY the edge-safe config (no DB, no providers). The
// `authorized` callback in authConfig decides redirects for protected routes.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run on everything except static assets and the auth API itself.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

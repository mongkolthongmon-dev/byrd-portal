import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { oidcService } from './services/oidcService';
import { userService } from './services/userService';

// Load the admin-managed OIDC providers from the database and map each enabled
// row into an Auth.js generic OIDC provider. This runs per-request (Node
// runtime), so providers reflect the latest admin config without a redeploy.
async function loadOidcProviders() {
  const rows = await oidcService.listEnabled();
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    type: 'oidc' as const,
    issuer: p.issuer,
    clientId: p.clientId,
    clientSecret: p.clientSecret,
    authorization: { params: { scope: p.scopes } },
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const oidc = await loadOidcProviders();

  return {
    ...authConfig,
    providers: [
      Credentials({
        name: 'Email and password',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(creds) {
          const email = String(creds?.email ?? '').toLowerCase().trim();
          const password = String(creds?.password ?? '');
          if (!email || !password) return null;

          const user = await userService.verifyCredentials(email, password);
          if (!user) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            packageId: user.packageId,
          };
        },
      }),
      ...oidc,
    ],
    callbacks: {
      ...authConfig.callbacks,
      // For OIDC sign-ins, ensure a local user exists and link the external
      // identity. Credentials sign-ins are already validated in authorize().
      async signIn({ user, account, profile }) {
        if (!account || account.provider === 'credentials') return true;

        const email = (user.email ?? (profile?.email as string) ?? '').toLowerCase();
        if (!email) return false;

        await userService.upsertOidcUser({
          email,
          name: user.name ?? (profile?.name as string) ?? email,
          image: user.image ?? null,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        });
        return true;
      },
      // Embed our custom fields into the JWT. On sign-in we look up the local
      // user by email; we also refresh on the explicit `update` trigger.
      async jwt({ token, user, trigger }) {
        const email = (user?.email ?? token.email) as string | undefined;
        if ((user || trigger === 'update') && email) {
          const dbUser = await userService.getByEmail(email);
          if (dbUser) {
            token.id = String(dbUser.id);
            token.role = dbUser.role;
            token.packageId = dbUser.packageId;
            token.email = dbUser.email;
            token.name = dbUser.name;
          }
        }
        return token;
      },
    },
  } satisfies NextAuthConfig;
});

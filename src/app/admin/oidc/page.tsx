import { oidcService } from '@/services/oidcService';
import OidcRow from '@/components/OidcRow';
import { createOidc } from '../actions';

export const runtime = 'nodejs';

// AUTH_URL (or the Vercel URL) drives the callback the provider must allow.
const baseUrl = process.env.AUTH_URL ?? 'http://localhost:3000';

export default async function AdminOidcPage() {
  const rows = await oidcService.listAll();

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Add the redirect/callback URL <code className="font-mono">{baseUrl}/api/auth/callback/&lt;id&gt;</code> in
        your provider&apos;s OAuth app settings. Enabled providers appear as login buttons.
      </div>

      <form
        action={createOidc}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ID (slug)</label>
          <input name="id" required placeholder="google" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Display name</label>
          <input name="name" required placeholder="Google" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Issuer URL</label>
          <input name="issuer" required placeholder="https://accounts.google.com" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Client ID</label>
          <input name="clientId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Client secret</label>
          <input name="clientSecret" type="password" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Scopes</label>
          <input name="scopes" defaultValue="openid email profile" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 sm:col-span-2">
          Add provider
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No OIDC providers configured. Users can still sign in with email and password.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {rows.map((p) => (
            <OidcRow
              key={p.id}
              provider={{
                id: p.id,
                name: p.name,
                issuer: p.issuer,
                clientId: p.clientId,
                scopes: p.scopes,
                enabled: p.enabled,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

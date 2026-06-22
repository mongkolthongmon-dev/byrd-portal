import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { oidcService } from '@/services/oidcService';
import LoginForm from '@/components/LoginForm';
import { oauthSignIn } from './actions';

export const runtime = 'nodejs';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  const providers = await oidcService.listEnabled();

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use your email and password, or a configured provider.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>

        {providers.length > 0 && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or continue with
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-2">
              {providers.map((p) => (
                <form key={p.id} action={oauthSignIn}>
                  <input type="hidden" name="provider" value={p.id} />
                  <button
                    type="submit"
                    className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Continue with {p.name}
                  </button>
                </form>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

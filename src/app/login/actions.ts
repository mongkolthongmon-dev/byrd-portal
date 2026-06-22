'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

// Credentials login. Returns an error string on failure; on success signIn
// throws a redirect that must propagate.
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Invalid email or password.';
    }
    throw error;
  }
}

// Start an OIDC login flow for the chosen provider.
export async function oauthSignIn(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider'));
  await signIn(provider, { redirectTo: '/dashboard' });
}

import { redirect } from 'next/navigation';
import { auth } from '@/auth';

// Server-side guards. These enforce access on the server (not just in the UI),
// which is the security boundary required by the assignment.

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

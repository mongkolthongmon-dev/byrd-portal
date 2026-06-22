import type { DefaultSession } from 'next-auth';

// Augment Auth.js types with our custom user fields (role + package).
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      packageId: number | null;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    packageId?: number | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    packageId?: number | null;
  }
}

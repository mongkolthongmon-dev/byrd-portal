import type { ReactNode } from 'react';

// Centered, max-width wrapper so content isn't stretched edge-to-edge on large
// screens.
export default function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

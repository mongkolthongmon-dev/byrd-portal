import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'byrd-portal',
  description:
    'Package-aware portal with admin-managed dynamic menus, OIDC login, and per-user todos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Toaster richColors position="top-right" />
        <Header />
        <main className="flex-1 py-8">
          <Container>{children}</Container>
        </main>
        <Footer />
      </body>
    </html>
  );
}

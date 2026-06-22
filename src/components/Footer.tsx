import Container from './Container';

const AUTHOR_URL = process.env.NEXT_PUBLIC_AUTHOR_URL ?? 'https://my-profile-byrd.vercel.app';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <Container>
        <div className="flex flex-col items-center justify-between gap-2 py-6 text-sm text-slate-500 sm:flex-row">
          <p>
            © {year} byrd-portal — built by{' '}
            <a
              href={AUTHOR_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              mthongmo
            </a>
          </p>
          <nav className="flex gap-4">
            <a href="/" className="hover:text-slate-900">
              Home
            </a>
            <a
              href="https://nextjs.org/docs"
              className="hover:text-slate-900"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

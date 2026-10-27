import { BookOpen, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EbdHeader() {
  return (
    <header className="border-b ebd-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/ebd" className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ebd-soft ebd-accent"
          >
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-base font-bold leading-tight">EBD Digital</span>
            <span className="block text-[0.68rem] uppercase tracking-[0.16em] ebd-muted">
              Igreja Batista Olaria
            </span>
          </span>
        </Link>

        <Link to="/" className="ebd-btn">
          <Home className="h-4 w-4" aria-hidden="true" />
          Portal
        </Link>
      </div>
    </header>
  );
}

export function EbdFooter() {
  return (
    <footer className="mt-12 border-t ebd-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs leading-relaxed ebd-muted sm:px-6">
        <p>
          Material de uso interno e não comercial da Igreja Batista Olaria. Esta área não é indexada por
          buscadores. Em caso de divergência, prevalece o PDF original da editora.
        </p>
        <p className="mt-2">
          <Link className="ebd-link" to="/">
            Voltar ao portal da Igreja Batista Olaria
          </Link>
        </p>
      </div>
    </footer>
  );
}

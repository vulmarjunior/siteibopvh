import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Download, FileText, Lock, RefreshCw } from 'lucide-react';
import { EbdFooter, EbdHeader } from '../../components/ebd/EbdChrome';
import '../../components/ebd/ebd-reader.css';
import { useEbdReaderSettings } from '../../lib/ebd/useEbdReaderSettings.js';
import { formatPageRange, quarterLabel } from '../../lib/ebd/content.js';
import type { EbdQuarterSummary, EbdQuartersResponse } from '../../types/ebd.js';

const PAGE_TITLE = 'EBD Digital — Revista de Jovens e Adultos | Igreja Batista Olaria';

export default function EbdHomePage() {
  const { resolvedTheme } = useEbdReaderSettings();
  const [quarters, setQuarters] = useState<EbdQuarterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ebd/quarters', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Não foi possível carregar os trimestres publicados.');
        }
        const data = (await response.json()) as EbdQuartersResponse;
        if (active) setQuarters(Array.isArray(data.quarters) ? data.quarters : []);
      } catch (loadError) {
        if (!active || controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a EBD Digital.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  return (
    <div className="ebd-reader flex min-h-screen flex-col font-sans" data-theme={resolvedTheme}>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Leitura digital das lições da Escola Bíblica Dominical, para uso interno da Igreja Batista Olaria." />
      </Helmet>

      <EbdHeader />

      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="ebd-card p-5 sm:p-8">
          <p className="flex flex-wrap items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] ebd-accent">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            EBD Digital
            <span className="inline-flex items-center gap-1 rounded-full border ebd-border px-2 py-0.5 text-[0.68rem] tracking-wider ebd-muted">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Uso interno
            </span>
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">
            Revista da Escola Bíblica Dominical
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed ebd-muted sm:text-base">
            Leia as lições em texto adaptável ao celular e ao tablet, com ajuste de fonte e tema claro ou
            escuro. O PDF original da revista continua disponível para consulta e impressão.
          </p>
        </header>

        {loading ? (
          <div className="mt-6 space-y-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Carregando trimestres publicados…</span>
            <div className="h-28 animate-pulse rounded-2xl ebd-soft" />
            <div className="h-20 animate-pulse rounded-2xl ebd-soft" />
            <div className="h-20 animate-pulse rounded-2xl ebd-soft" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="ebd-card mt-6 p-6" role="alert">
            <h2 className="font-serif text-xl font-bold">Conteúdo indisponível</h2>
            <p className="mt-2 text-sm ebd-muted">{error}</p>
            <button type="button" className="ebd-btn mt-4" onClick={() => setReloadKey((key) => key + 1)}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        ) : null}

        {!loading && !error && quarters.length === 0 ? (
          <div className="ebd-card mt-6 p-6">
            <h2 className="font-serif text-xl font-bold">Nenhum trimestre publicado ainda</h2>
            <p className="mt-2 text-sm leading-relaxed ebd-muted">
              As lições aparecem aqui depois da revisão do conteúdo e da publicação do trimestre. O PDF
              original também será disponibilizado nesta área.
            </p>
          </div>
        ) : null}

        {!loading && !error
          ? quarters.map((quarter) => {
              const headingId = `trimestre-${quarter.id}`;
              return (
                <section key={quarter.id} aria-labelledby={headingId} className="mt-8">
                  <header className="ebd-card p-5 sm:p-6">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] ebd-accent">
                      {quarterLabel(quarter.year, quarter.quarter)} • {quarter.className}
                    </p>
                    <h2 id={headingId} className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">
                      {quarter.title}
                    </h2>
                    <p className="mt-2 text-sm ebd-muted">
                      {quarter.publisher}
                      {quarter.issue ? ` • Edição ${quarter.issue}` : ''}
                      {quarter.volume ? ` • Volume ${quarter.volume}` : ''} • {quarter.lessonCount}{' '}
                      {quarter.lessonCount === 1 ? 'lição' : 'lições'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a className="ebd-primary-link" href={`/api/ebd/quarters/${quarter.id}/pdf`} download>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Baixar PDF da revista
                      </a>
                      <span className="inline-flex items-center gap-1.5 text-xs ebd-muted">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        O PDF contém a revista completa do trimestre.
                      </span>
                    </div>
                  </header>

                  <ol className="mt-4 space-y-3">
                    {quarter.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link className="ebd-lesson-link" to={`/ebd/licao/${lesson.slug}`}>
                          <span
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ebd-soft font-serif text-lg font-bold ebd-accent"
                          >
                            {lesson.number}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-serif text-lg font-bold leading-snug">
                              Lição {lesson.number} — {lesson.title}
                            </span>
                            <span className="mt-1 block text-sm ebd-muted">
                              Texto base: {lesson.baseText} • {formatPageRange(lesson.startPage, lesson.endPage)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })
          : null}
      </main>

      <EbdFooter />
    </div>
  );
}

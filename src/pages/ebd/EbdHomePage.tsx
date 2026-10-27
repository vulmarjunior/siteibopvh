import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { EbdFooter, EbdHeader } from '../../components/ebd/EbdChrome';
import '../../components/ebd/ebd-reader.css';
import { useEbdReaderSettings } from '../../lib/ebd/useEbdReaderSettings.js';
import { useEbdProgress } from '../../lib/ebd/useEbdProgress.js';
import { editionLabel, formatPageRange } from '../../lib/ebd/content.js';
import { formatCivilDateWithWeekday, weekdayLabel } from '../../lib/ebd/schedule.js';
import type {
  EbdCycleSummary,
  EbdCyclesResponse,
  EbdSearchResponse,
} from '../../types/ebd.js';

const PAGE_TITLE = 'EBD Digital — Revista de Jovens e Adultos | Igreja Batista Olaria';

export default function EbdHomePage() {
  const { resolvedTheme } = useEbdReaderSettings();
  const { progress, hasProgress, clearAll } = useEbdProgress();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cycles, setCycles] = useState<EbdCycleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeQuery = (searchParams.get('q') ?? '').trim();
  const [searchInput, setSearchInput] = useState(activeQuery);
  const [searchData, setSearchData] = useState<EbdSearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ebd/cycles', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Não foi possível carregar os ciclos publicados.');
        }
        const data = (await response.json()) as EbdCyclesResponse;
        if (active) setCycles(Array.isArray(data.cycles) ? data.cycles : []);
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

  useEffect(() => {
    if (activeQuery.length < 2 || cycles.length === 0) {
      setSearchData(null);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setSearchLoading(true);
    setSearchError(null);
    setSearchData(null);

    async function search() {
      try {
        const response = await fetch(`/api/ebd/search?q=${encodeURIComponent(activeQuery)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? 'Não foi possível buscar no ciclo.');
        }
        const data = (await response.json()) as EbdSearchResponse;
        if (active) setSearchData(data);
      } catch (loadError) {
        if (!active || controller.signal.aborted) return;
        setSearchError(loadError instanceof Error ? loadError.message : 'Não foi possível buscar no ciclo.');
      } finally {
        if (active) setSearchLoading(false);
      }
    }

    search();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeQuery, cycles.length]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchInput.trim();
    if (query.length < 2) {
      setSearchError('Digite pelo menos 2 caracteres para buscar.');
      return;
    }
    setSearchParams({ q: query });
  }

  function clearSearch() {
    setSearchInput('');
    setSearchData(null);
    setSearchError(null);
    setSearchParams({});
  }

  const resultCount = searchData?.results.length ?? 0;
  const resultLabel = searchData
    ? `${resultCount} ${resultCount === 1 ? 'lição encontrada' : 'lições encontradas'} em ${searchData.cycle.periodLabel}`
    : '';

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
          {hasProgress ? (
            <button
              type="button"
              className="ebd-btn mt-4"
              onClick={clearAll}
              title="Remove as marcações de lidas e as posições salvas neste navegador."
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpar progresso de leitura
            </button>
          ) : null}
        </header>

        {loading ? (
          <div className="mt-6 space-y-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Carregando ciclos publicados…</span>
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

        {!loading && !error && cycles.length === 0 ? (
          <div className="ebd-card mt-6 p-6">
            <h2 className="font-serif text-xl font-bold">Nenhum ciclo publicado ainda</h2>
            <p className="mt-2 text-sm leading-relaxed ebd-muted">
              As lições aparecem aqui depois da revisão do conteúdo e da publicação do ciclo de estudo. O PDF
              original também será disponibilizado nesta área.
            </p>
          </div>
        ) : null}

        {!loading && !error && cycles.length > 0 ? (
          <>
            <section aria-labelledby="busca-titulo" className="ebd-card mt-6 p-5 sm:p-6">
              <h2 id="busca-titulo" className="font-serif text-xl font-bold">
                Buscar no ciclo
              </h2>
              <p id="busca-dica" className="mt-1 text-sm leading-relaxed ebd-muted">
                Digite uma palavra ou expressão. A busca ignora acentos e diferenças entre maiúsculas e
                minúsculas. Ela considera o ciclo publicado mais recente.
              </p>
              <form role="search" aria-labelledby="busca-titulo" onSubmit={submitSearch} noValidate className="mt-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="ebd-search" className="sr-only">
                    Buscar no ciclo
                  </label>
                  <input
                    id="ebd-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    placeholder="Ex.: Pentateuco, criação, Romanos"
                    aria-describedby="busca-dica"
                    className="ebd-input"
                  />
                  <button type="submit" className="ebd-btn shrink-0" disabled={searchLoading}>
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Search className="h-4 w-4" aria-hidden="true" />
                    )}
                    Buscar
                  </button>
                  {activeQuery ? (
                    <button type="button" className="ebd-btn shrink-0" onClick={clearSearch}>
                      <X className="h-4 w-4" aria-hidden="true" />
                      Limpar
                    </button>
                  ) : null}
                </div>
              </form>
            </section>

            {activeQuery.length >= 2 ? (
              <section aria-labelledby="resultados-titulo" className="ebd-card mt-4 p-5 sm:p-6">
                <h2 id="resultados-titulo" className="font-serif text-xl font-bold">
                  Resultados da busca
                </h2>
                <p role="status" aria-live="polite" className="mt-1 text-sm ebd-muted">
                  {searchLoading
                    ? `Buscando por “${activeQuery}”…`
                    : searchData
                      ? resultLabel
                      : ''}
                </p>

                {searchError ? (
                  <p role="alert" className="ebd-error mt-3 text-sm">
                    {searchError}
                  </p>
                ) : null}

                {searchLoading ? (
                  <div className="mt-3 space-y-2" aria-hidden="true">
                    <div className="h-16 animate-pulse rounded-xl ebd-soft" />
                    <div className="h-16 animate-pulse rounded-xl ebd-soft" />
                  </div>
                ) : null}

                {!searchLoading && !searchError && searchData && searchData.results.length === 0 ? (
                  <p className="mt-3 text-sm leading-relaxed ebd-muted">
                    Nenhum trecho encontrado para “{searchData.query}”. Tente outra palavra ou expressão.
                  </p>
                ) : null}

                {!searchLoading && !searchError && searchData && searchData.results.length > 0 ? (
                  <ol className="mt-3 space-y-3">
                    {searchData.results.map((result) => (
                      <li key={result.lesson.slug} className="rounded-xl border ebd-border p-3 sm:p-4">
                        <Link className="ebd-link font-serif text-lg font-bold leading-snug" to={`/ebd/licao/${result.lesson.slug}`}>
                          Lição {result.lesson.number} — {result.lesson.title}
                        </Link>
                        <p className="mt-1 text-xs ebd-muted">
                          {result.matches} {result.matches === 1 ? 'ocorrência' : 'ocorrências'} •{' '}
                          {formatPageRange(result.lesson.startPage, result.lesson.endPage)} • Texto base:{' '}
                          {result.lesson.baseText}
                        </p>
                        <div className="mt-2 space-y-2 text-sm leading-relaxed">
                          {result.snippets.map((snippet, index) => (
                            <p key={`${result.lesson.slug}-trecho-${index}`} className="rounded-lg ebd-soft px-3 py-2">
                              {snippet.before}
                              <mark className="ebd-mark">{snippet.match}</mark>
                              {snippet.after}
                            </p>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}

        {!loading && !error
          ? cycles.map((cycle) => {
              const headingId = `ciclo-${cycle.id}`;
              return (
                <section key={cycle.id} aria-labelledby={headingId} className="mt-8">
                  <header className="ebd-card p-5 sm:p-6">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] ebd-accent">
                      Ciclo de estudo • {cycle.className}
                    </p>
                    <h2 id={headingId} className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">
                      {cycle.periodLabel}
                    </h2>
                    <p className="mt-2 text-sm ebd-muted">
                      {cycle.lessons.length} {cycle.lessons.length === 1 ? 'lição' : 'lições'} • encontros de{' '}
                      {weekdayLabel(cycle.weekday).toLowerCase()}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a className="ebd-primary-link" href={`/api/ebd/editions/${cycle.edition.id}/pdf`} download>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Baixar PDF da revista
                      </a>
                      <span className="inline-flex items-center gap-1.5 text-xs ebd-muted">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        O PDF contém a revista completa.
                      </span>
                    </div>
                    <p className="mt-4 border-t ebd-border pt-3 text-xs leading-relaxed ebd-muted">
                      Conteúdo editorial: {cycle.edition.title} • {cycle.edition.publisher} •{' '}
                      {editionLabel(cycle.edition.year, cycle.edition.quarter)}
                      {cycle.edition.issue ? ` • Edição ${cycle.edition.issue}` : ''}
                      {cycle.edition.volume ? ` • Volume ${cycle.edition.volume}` : ''}
                    </p>
                  </header>

                  <ol className="mt-4 space-y-3">
                    {cycle.lessons.map((lesson) => {
                      const entry = progress[lesson.slug];
                      return (
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
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-sm ebd-muted">
                                <span>
                                  {lesson.scheduledOn
                                    ? `${formatCivilDateWithWeekday(lesson.scheduledOn)} • `
                                    : ''}
                                  Texto base: {lesson.baseText} •{' '}
                                  {formatPageRange(lesson.startPage, lesson.endPage)}
                                </span>
                                {entry?.read ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border ebd-border px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ebd-accent">
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Lida
                                  </span>
                                ) : entry && entry.scrollPercent > 0.02 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border ebd-border px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ebd-muted">
                                    <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                                    Em andamento
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
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

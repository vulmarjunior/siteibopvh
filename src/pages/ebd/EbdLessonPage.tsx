import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  List,
  Lock,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { EbdFooter, EbdHeader } from '../../components/ebd/EbdChrome';
import { EbdReaderControls } from '../../components/ebd/EbdReaderControls';
import '../../components/ebd/ebd-reader.css';
import { useEbdReaderSettings } from '../../lib/ebd/useEbdReaderSettings.js';
import { useEbdLessonProgress } from '../../lib/ebd/useEbdLessonProgress.js';
import {
  formatFileSize,
  formatPageRange,
  quarterLabel,
} from '../../lib/ebd/content.js';
import type { EbdLessonDetail, EbdLessonResponse } from '../../types/ebd.js';

const FALLBACK_TITLE = 'EBD Digital | Igreja Batista Olaria';

export default function EbdLessonPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const {
    themePreference,
    setThemePreference,
    resolvedTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    resetFont,
    canIncrease,
    canDecrease,
  } = useEbdReaderSettings();

  const [lesson, setLesson] = useState<EbdLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const {
    isRead,
    hasEntry,
    resumePercent,
    canResume,
    resumeReading,
    toggleRead,
    clearProgress,
  } = useEbdLessonProgress(slug, Boolean(lesson));

  useEffect(() => {
    if (!slug) {
      setError('Lição não informada.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ebd/lessons/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Lição não encontrada ou ainda não publicada.');
          }
          throw new Error('Não foi possível carregar a lição.');
        }
        const data = (await response.json()) as EbdLessonResponse;
        if (active) setLesson(data.lesson);
      } catch (loadError) {
        if (!active || controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a lição.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, reloadKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  const pageTitle = lesson
    ? `Lição ${lesson.number}: ${lesson.title} — EBD Digital`
    : FALLBACK_TITLE;

  return (
    <div className="ebd-reader flex min-h-screen flex-col font-sans" data-theme={resolvedTheme}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Leitura digital da lição da Escola Bíblica Dominical, para uso interno da Igreja Batista Olaria."
        />
      </Helmet>

      <a className="ebd-skip-link" href="#artigo">
        Ir para o texto da lição
      </a>

      <EbdHeader />

      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Você está aqui" className="mb-4 text-xs ebd-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link className="ebd-link" to="/">Início</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link className="ebd-link" to="/ebd">EBD Digital</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-bold">
              {lesson ? `Lição ${lesson.number}` : 'Lição'}
            </li>
          </ol>
        </nav>

        {loading ? (
          <div className="space-y-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Carregando lição…</span>
            <div className="h-44 animate-pulse rounded-2xl ebd-soft" />
            <div className="h-16 animate-pulse rounded-2xl ebd-soft" />
            <div className="h-96 animate-pulse rounded-2xl ebd-soft" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="ebd-card p-6" role="alert">
            <h1 className="font-serif text-2xl font-bold">Lição indisponível</h1>
            <p className="mt-2 text-sm ebd-muted">{error}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="ebd-btn" onClick={() => setReloadKey((key) => key + 1)}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Tentar novamente
              </button>
              <Link className="ebd-btn" to="/ebd">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar à EBD Digital
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && !error && lesson ? (
          <>
            <header className="ebd-card p-5 sm:p-8">
              <p className="flex flex-wrap items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] ebd-accent">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Lição {lesson.number} • {quarterLabel(lesson.quarter.year, lesson.quarter.quarter)} •{' '}
                {lesson.quarter.className}
                <span className="inline-flex items-center gap-1 rounded-full border ebd-border px-2 py-0.5 text-[0.68rem] tracking-wider ebd-muted">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Uso interno
                </span>
              </p>
              <h1 id="titulo-licao" className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-3 text-base font-semibold">
                <span className="ebd-accent">Texto base:</span> {lesson.baseText}
              </p>
              <p className="mt-1 text-sm ebd-muted">
                {lesson.quarter.publisher} • {lesson.quarter.title} •{' '}
                {formatPageRange(lesson.startPage, lesson.endPage)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {lesson.pdf ? (
                  <a
                    className="ebd-primary-link"
                    href={`${lesson.pdf.downloadUrl}#page=${lesson.pdf.page}`}
                    download
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Baixar PDF da revista ({formatFileSize(lesson.pdf.sizeBytes)})
                  </a>
                ) : null}
                <Link className="ebd-btn" to="/ebd">
                  <List className="h-4 w-4" aria-hidden="true" />
                  Índice do trimestre
                </Link>
              </div>
              {lesson.pdf ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed ebd-muted">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  O PDF contém a revista completa do trimestre; a lição começa na página {lesson.startPage}.
                </p>
              ) : null}
            </header>

            <EbdReaderControls
              themePreference={themePreference}
              onThemeChange={setThemePreference}
              fontScale={fontScale}
              onIncreaseFont={increaseFont}
              onDecreaseFont={decreaseFont}
              onResetFont={resetFont}
              canIncrease={canIncrease}
              canDecrease={canDecrease}
            />

            <section aria-label="Seu progresso nesta lição" className="ebd-card ebd-no-print mt-4 p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  className="ebd-btn"
                  aria-pressed={isRead}
                  onClick={toggleRead}
                >
                  {isRead ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isRead ? (
                    <>
                      Lida
                      <span className="sr-only"> — clique para desmarcar</span>
                    </>
                  ) : (
                    'Marcar como lida'
                  )}
                </button>

                {canResume ? (
                  <button type="button" className="ebd-btn" onClick={resumeReading}>
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                    Retomar de {resumePercent}%
                  </button>
                ) : null}

                {hasEntry ? (
                  <button type="button" className="ebd-btn" onClick={clearProgress}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Limpar progresso desta lição
                  </button>
                ) : null}

                <p className="text-xs leading-relaxed ebd-muted">
                  O progresso fica salvo apenas neste navegador.
                </p>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
              <article
                id="artigo"
                aria-labelledby="titulo-licao"
                tabIndex={-1}
                className="ebd-card ebd-article min-w-0 p-5 sm:p-8"
                style={{ fontSize: `${fontScale}rem` }}
              >
                <div className="ebd-intro ebd-prose-width">
                  {lesson.introduction.map((paragraph, index) => (
                    <p key={`intro-${index}`}>{paragraph}</p>
                  ))}
                </div>

                {lesson.sections.map((section) => {
                  const sectionId = `secao-${section.number}`;
                  return (
                    <section key={section.number} aria-labelledby={sectionId}>
                      <h2 id={sectionId}>
                        {section.number}. {section.title}
                      </h2>
                      <div className="ebd-prose-width">
                        {section.paragraphs.map((paragraph, index) => (
                          <p key={`${section.number}-${index}`}>{paragraph}</p>
                        ))}
                        {section.references && section.references.length > 0 ? (
                          <p className="text-sm ebd-muted">
                            <strong>Referências:</strong> {section.references.join('; ')}
                          </p>
                        ) : null}
                      </div>
                    </section>
                  );
                })}

                {lesson.questions.length > 0 ? (
                  <section aria-labelledby="para-pensar">
                    <h2 id="para-pensar">Para pensar e agir</h2>
                    <ol className="ebd-questions ebd-prose-width">
                      {lesson.questions.map((question) => (
                        <li key={question.number}>{question.text}</li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {lesson.dailyReadings.length > 0 ? (
                  <section aria-labelledby="leitura-diaria">
                    <h2 id="leitura-diaria">Leitura diária</h2>
                    <ul className="ebd-readings ebd-prose-width">
                      {lesson.dailyReadings.map((reading) => (
                        <li key={`${reading.day}-${reading.reference}`}>
                          <span className="ebd-day">{reading.day}</span>
                          <span>{reading.reference}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </article>

              <aside aria-labelledby="indice-trimestre" className="ebd-card p-4 lg:sticky lg:top-6">
                <h2 id="indice-trimestre" className="font-serif text-lg font-bold">
                  Índice do trimestre
                </h2>
                <p className="mt-1 text-xs ebd-muted">
                  {quarterLabel(lesson.quarter.year, lesson.quarter.quarter)} • {lesson.index.length}{' '}
                  {lesson.index.length === 1 ? 'lição publicada' : 'lições publicadas'}
                </p>
                <ol className="mt-3 space-y-1.5">
                  {lesson.index.map((item) => {
                    const current = item.slug === lesson.slug;
                    return (
                      <li key={item.slug}>
                        <Link
                          to={`/ebd/licao/${item.slug}`}
                          aria-current={current ? 'page' : undefined}
                          className={`ebd-lesson-link !gap-2.5 !p-2.5 text-sm ${current ? '' : '!bg-transparent'}`}
                        >
                          <span aria-hidden="true" className="w-5 shrink-0 text-center font-bold ebd-accent">
                            {item.number}
                          </span>
                          <span className="min-w-0">{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </aside>
            </div>

            <nav aria-label="Navegação entre lições" className="ebd-no-print mt-6 grid gap-3 sm:grid-cols-2">
              {lesson.navigation.previous ? (
                <Link className="ebd-card flex min-h-[5rem] flex-col justify-center p-4" to={`/ebd/licao/${lesson.navigation.previous.slug}`}>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ebd-muted">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Lição anterior
                  </span>
                  <span className="mt-1 font-serif font-bold leading-snug">
                    {lesson.navigation.previous.number}. {lesson.navigation.previous.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" className="hidden sm:block" />
              )}

              {lesson.navigation.next ? (
                <Link
                  className="ebd-card flex min-h-[5rem] flex-col justify-center p-4 text-right sm:items-end"
                  to={`/ebd/licao/${lesson.navigation.next.slug}`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ebd-muted">
                    Próxima lição
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="mt-1 font-serif font-bold leading-snug">
                    {lesson.navigation.next.number}. {lesson.navigation.next.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" className="hidden sm:block" />
              )}
            </nav>
          </>
        ) : null}
      </main>

      <EbdFooter />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, FileText, Flame, Users, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { RecommendationBlock } from '../../components/veredas/RecommendationBlock';

export const VeredasConferenceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/veredas/items/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setItem)
      .finally(() => setLoading(false));
  }, [slug]);

  const aulas = item?.curso?.aulas || [];
  const requested = Number(params.get('sessao') || params.get('aula') || 1) - 1;
  const currentIndex = Math.max(0, Math.min(Number.isFinite(requested) ? requested : 0, Math.max(aulas.length - 1, 0)));
  const aula = aulas[currentIndex];

  const selectSession = (index: number) => {
    setParams(index ? { sessao: String(index + 1) } : {}, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <VeredasNavbar />
        <main className="flex-1 max-w-6xl mx-auto p-8 w-full">
          <div className="aspect-video bg-stone-900 rounded-xl animate-pulse" />
        </main>
        <VeredasFooter />
      </div>
    );
  }

  if (!item?.curso || !aula) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <VeredasNavbar />
        <main className="flex-1 m-auto text-center p-8">
          <AlertCircle className="mx-auto text-indigo-400 w-10 h-10 mb-3" />
          <p className="font-serif text-lg text-stone-200">Conferência indisponível ou não localizada.</p>
          <Link to="/veredas/conferencias" className="mt-3 inline-block text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
            ← Voltar às conferências
          </Link>
        </main>
        <VeredasFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Helmet>
        <title>{item.titulo} — Conferência Veredas IBO</title>
        <meta name="description" content={item.resumo || item.porqueIndicamos} />
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/veredas/conferencias"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-indigo-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar às conferências
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
            <Flame className="w-3.5 h-3.5 text-indigo-400" /> CONFERÊNCIA
          </span>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-8 items-start">
          {/* Main Video Player & Session Details */}
          <section className="space-y-6">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-indigo-950 shadow-2xl">
              <iframe
                key={aula.youtubeId}
                src={`https://www.youtube.com/embed/${aula.youtubeId}?rel=0`}
                title={aula.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Session Info */}
            <div className="py-2 border-b border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                <span>PLENÁRIA {currentIndex + 1} DE {aulas.length}</span>
                {item.curso.canal ? <span className="text-stone-400 font-normal">{item.curso.canal}</span> : null}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 leading-tight">
                {aula.titulo}
              </h1>

              <p className="text-sm text-stone-400 font-medium">
                {item.titulo}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => selectSession(currentIndex - 1)}
                className="px-4 py-2.5 rounded-lg border border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-300 disabled:opacity-30 disabled:hover:bg-stone-900/60 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Plenária anterior
              </button>

              <button
                disabled={currentIndex === aulas.length - 1}
                onClick={() => selectSession(currentIndex + 1)}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 flex items-center gap-1.5 text-xs font-bold shadow transition-colors"
              >
                Próxima plenária <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pastoral Recommendation Block */}
            <RecommendationBlock content={item.porqueIndicamos} contentLabel="esta conferência" />

            {/* Complementary Materials */}
            {item.curso.materiais?.length ? (
              <section className="border-t border-stone-800 pt-6">
                <h2 className="font-serif text-lg font-bold text-indigo-200 flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-indigo-400" /> Materiais da Conferência
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {item.curso.materiais.map((material: any) => (
                    <a
                      key={material.id || material.url}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-900/80 p-4 text-sm text-stone-200 hover:border-indigo-700 hover:text-indigo-300 transition-all"
                    >
                      <span className="font-medium">{material.titulo}</span>
                      <ExternalLink className="w-4 h-4 shrink-0 text-indigo-400" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </section>

          {/* Sidebar Playlist */}
          <aside className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-xl lg:sticky lg:top-24">
            <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-stone-900 border-b border-stone-800">
              <h2 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Plenárias & Sessões
              </h2>
              <p className="text-[11px] text-stone-400 mt-1">
                {aulas.length} {aulas.length === 1 ? 'sessão disponível' : 'sessões na ordem do evento'}
              </p>
            </div>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-stone-800/60">
              {aulas.map((lesson: any, index: number) => {
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={lesson.id || lesson.youtubeId}
                    onClick={() => selectSession(index)}
                    className={`w-full text-left p-4 flex gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-indigo-950/50 text-indigo-200 border-l-4 border-indigo-500'
                        : 'hover:bg-stone-800/60 text-stone-300'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium leading-relaxed self-center">
                      {lesson.titulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      <VeredasFooter />
    </div>
  );
};

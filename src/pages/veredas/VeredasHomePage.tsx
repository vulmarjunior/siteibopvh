import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Film, Flame, Sparkles, ArrowRight, ShieldCheck, Search, Compass } from 'lucide-react';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { BookCard } from '../../components/veredas/BookCard';
import { VideoCard } from '../../components/veredas/VideoCard';
import { CourseCard } from '../../components/veredas/CourseCard';
import { ConferenceCard } from '../../components/veredas/ConferenceCard';
import { Helmet } from 'react-helmet-async';

export const VeredasHomePage: React.FC = () => {
  const [destaques, setDestaques] = useState<any[]>([]);
  const [recentes, setRecentes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [destRes, recRes, catRes] = await Promise.all([
          fetch('/api/veredas/destaques').then((r) => r.json()),
          fetch('/api/veredas/recentes').then((r) => r.json()),
          fetch('/api/veredas/categorias').then((r) => r.json()),
        ]);

        if (Array.isArray(destRes)) setDestaques(destRes);
        if (Array.isArray(recRes)) setRecentes(recRes);
        if (Array.isArray(catRes)) setCategorias(catRes);
      } catch (err) {
        console.error('Error loading Veredas Home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const destaquePrincipal = destaques.length > 0 ? destaques[0] : null;
  const outrosDestaques = destaques.length > 1 ? destaques.slice(1, 5) : [];

  const getDestaqueLink = (item: any) => {
    if (!item) return '/veredas';
    if (item.tipo === 'LIVRO') return `/veredas/livro/${item.slug}`;
    if (item.tipo === 'VIDEO') return `/veredas/video/${item.slug}`;
    if (item.tipo === 'CONFERENCIA') return `/veredas/conferencia/${item.slug}`;
    return `/veredas/curso/${item.slug}`;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      <Helmet>
        <title>Veredas IBO — Curadoria Teológica e Pastoral</title>
        <meta
          name="description"
          content="Ambiente de curadoria pastoral com indicações de livros, vídeos, cursos e conferências da Igreja Batista Olaria em Porto Velho."
        />
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1">
        {/* HERO EDITORIAL */}
        <section className="relative isolate min-h-[34rem] sm:min-h-[38rem] lg:min-h-[42rem] border-b border-amber-900/30 overflow-hidden flex items-center">
          <img
            src="/images/veredas/caminho-dourado-fe-sabedoria.jpg"
            alt="Caminho de pedras em direção a uma cruz, com Bíblia e livros à luz dourada"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[67%_center] sm:object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fff4dc] via-[#fff0d2]/95 to-[#f6d99d]/20 sm:via-[#fff0d2]/85 sm:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-stone-950/45 to-transparent" />
          
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
            <div className="max-w-xl text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/55 border border-amber-800/25 text-amber-950 text-xs font-semibold uppercase tracking-widest shadow-sm backdrop-blur-sm">
              <Compass className="w-4 h-4 text-amber-700" />
              Igreja Batista Olaria • Porto Velho
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[0.95] drop-shadow-sm">
              Veredas <span className="text-amber-700 font-light">IBO</span>
            </h1>

            <p className="font-serif text-xl sm:text-2xl text-stone-800 max-w-lg font-medium leading-relaxed">
              Livros, vídeos, cursos e conferências para o amadurecimento e a formação cristã bíblica.
            </p>

            <p className="text-sm sm:text-base text-stone-700 max-w-lg leading-relaxed">
              Não agregamos apenas links: explicamos <span className="text-amber-900 font-bold">por que cada obra é recomendada</span>, para quem é indicada e quais as ressalvas pastorais.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-start gap-3 text-sm font-semibold">
              <Link
                to="/veredas/livros"
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-full font-bold transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-xs sm:text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Livros
              </Link>
              <Link
                to="/veredas/videos"
                className="px-5 py-2.5 bg-white/65 hover:bg-white/85 text-stone-900 border border-amber-900/25 rounded-full transition-all shadow-sm backdrop-blur-sm flex items-center gap-2 text-xs sm:text-sm"
              >
                <Film className="w-4 h-4 text-amber-700" />
                Vídeos
              </Link>
              <Link
                to="/veredas/conferencias"
                className="px-5 py-2.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-100 rounded-full transition-all shadow-sm flex items-center gap-2 text-xs sm:text-sm"
              >
                <Flame className="w-4 h-4 text-indigo-400" />
                Conferências
              </Link>
              <Link
                to="/veredas/biblioteca-gratuita"
                className="px-5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-100 rounded-full transition-all shadow-sm flex items-center gap-2 text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Biblioteca Gratuita
              </Link>
            </div>
            </div>
          </div>
        </section>

        {/* MAIN FEATURED ITEM (Destaque Principal) */}
        {destaquePrincipal && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Destaque da Curadoria
            </div>

            <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-850 border border-amber-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-4 flex justify-center">
                {destaquePrincipal.tipo === 'LIVRO' ? (
                  <img
                    src={destaquePrincipal.livro?.capaUrl || '/placeholder-book.png'}
                    alt={destaquePrincipal.titulo}
                    className="max-h-72 object-contain rounded-lg shadow-2xl border border-stone-800"
                  />
                ) : (
                  <img
                    src={
                      (destaquePrincipal.tipo === 'CURSO' || destaquePrincipal.tipo === 'CONFERENCIA'
                        ? destaquePrincipal.curso?.thumbnailUrl
                        : destaquePrincipal.video?.thumbnailUrl) || '/placeholder-video.png'
                    }
                    alt={destaquePrincipal.titulo}
                    className="w-full aspect-video object-cover rounded-lg shadow-2xl border border-stone-800"
                  />
                )}
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`px-2.5 py-0.5 rounded uppercase border ${
                      destaquePrincipal.tipo === 'CONFERENCIA'
                        ? 'bg-indigo-950 border-indigo-800 text-indigo-300'
                        : 'bg-amber-950 border-amber-800 text-amber-300'
                    }`}
                  >
                    {destaquePrincipal.tipo}
                  </span>
                  <span className="text-stone-400 font-mono">
                    Nível {destaquePrincipal.nivel}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 leading-tight">
                  {destaquePrincipal.titulo}
                </h2>

                <p className="text-sm text-stone-300 leading-relaxed italic border-l-2 border-amber-500 pl-4 py-1 bg-amber-950/20">
                  " {destaquePrincipal.porqueIndicamos} "
                </p>

                <p className="text-xs sm:text-sm text-stone-400 line-clamp-3">
                  {destaquePrincipal.resumo}
                </p>

                <div className="pt-2">
                  <Link
                    to={getDestaqueLink(destaquePrincipal)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm rounded-lg transition-colors shadow"
                  >
                    Acessar indicação completa <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* CATEGORIES CHIPS */}
        {categorias.length > 0 && (
          <section className="bg-stone-900/60 border-y border-stone-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h3 className="font-serif text-lg font-bold text-stone-200 mb-4 tracking-wide">
                Navegar por Temas de Formação
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/veredas/livros?categoria=${cat.slug}`}
                    className="px-4 py-2 bg-stone-800/80 hover:bg-amber-950/80 border border-stone-700/60 hover:border-amber-800 text-xs text-stone-300 hover:text-amber-300 font-medium rounded-full transition-all"
                  >
                    {cat.nome}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RECENT ADDITIONS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                Adicionados Recentemente
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Últimas curadorias publicadas pela equipe pastoral da IBO
              </p>
            </div>
            <Link
              to="/veredas/livros"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Ver catálogo completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-stone-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentes.map((item) => (
                item.tipo === 'LIVRO' ? (
                  <BookCard key={item.id} item={item} />
                ) : item.tipo === 'VIDEO' ? (
                  <VideoCard key={item.id} item={item} />
                ) : item.tipo === 'CONFERENCIA' ? (
                  <ConferenceCard key={item.id} item={item} />
                ) : (
                  <CourseCard key={item.id} item={item} />
                )
              ))}
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center text-stone-400 text-sm">
              Nenhum conteúdo publicado ainda. O catálogo está sendo cadastrado pela equipe da IBO.
            </div>
          )}
        </section>

      </main>

      <VeredasFooter />
    </div>
  );
};


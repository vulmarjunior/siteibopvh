import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, AlertCircle, ShieldCheck, ArrowLeft, Calendar, FileText, Globe } from 'lucide-react';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { AccessLinksList } from '../../components/veredas/AccessLinksList';
import { SharePageButton } from '../../components/veredas/SharePageButton';
import { RecommendationBlock } from '../../components/veredas/RecommendationBlock';
import { CrossReferenceSection } from '../../components/veredas/CrossReferenceSection';
import { Helmet } from 'react-helmet-async';

export const VeredasBookDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/veredas/items/${slug}`);
        if (!res.ok) {
          throw new Error('Livro não encontrado ou desativado');
        }
        const data = await res.json();
        setItem(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <VeredasNavbar />
        <main className="flex-1 max-w-5xl mx-auto p-8 w-full">
          <div className="h-96 bg-stone-900 rounded-2xl animate-pulse" />
        </main>
        <VeredasFooter />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <VeredasNavbar />
        <main className="flex-1 max-w-3xl mx-auto p-8 text-center my-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="font-serif text-2xl font-bold">Conteúdo Indisponível</h1>
          <p className="text-stone-400 text-sm">{error || 'Livro não localizado no catálogo.'}</p>
          <Link to="/veredas/livros" className="inline-block px-4 py-2 bg-amber-600 text-stone-950 font-bold rounded-lg text-xs">
            ← Voltar ao Catálogo de Livros
          </Link>
        </main>
        <VeredasFooter />
      </div>
    );
  }

  const livro = item.livro || {};
  const autores = livro.autores || [];
  const acessos = livro.acessos || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      <Helmet>
        <title>{item.titulo} — Indicação Veredas IBO</title>
        <meta name="description" content={item.resumo} />
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        <div className="flex items-center justify-between gap-4">
          <Link to="/veredas/livros" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo de Livros
          </Link>
          <SharePageButton title={item.titulo} contentType="Livro" imageUrl={livro.capaUrl} />
        </div>

        {/* Header Block: Cover + Bibliographic Meta */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Cover */}
          <div className="md:col-span-4 flex justify-center bg-stone-950 p-6 rounded-xl border border-stone-800/80">
            {livro.capaUrl ? (
              <img
                src={livro.capaUrl}
                alt={item.titulo}
                className="max-h-80 object-contain rounded shadow-2xl"
              />
            ) : (
              <div className="w-36 h-52 bg-stone-850 border border-stone-700 rounded flex flex-col items-center justify-center text-stone-500 text-center p-3">
                <BookOpen className="w-12 h-12 text-amber-600/50 mb-2" />
                <span className="text-xs font-serif">{item.titulo}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 uppercase">
                Livro
              </span>
              <span className="px-2.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono">
                Nível {item.nivel}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 leading-tight">
              {item.titulo}
            </h1>

            {livro.subtitulo && (
              <h2 className="font-serif text-lg text-stone-300 font-light">
                {livro.subtitulo}
              </h2>
            )}

            {autores.length > 0 && (
              <p className="text-sm font-semibold text-amber-400">
                Por: {autores.map((a: any) => a.pessoa.nome).join(', ')}
              </p>
            )}

            {/* Metadata Pills */}
            <div className="flex flex-wrap gap-4 text-xs text-stone-400 pt-2 border-t border-stone-800/80">
              {livro.editora && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-stone-500" />
                  <span>Editora: <strong>{livro.editora}</strong></span>
                </div>
              )}
              {livro.anoPublicacao && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span>Ano: <strong>{livro.anoPublicacao}</strong></span>
                </div>
              )}
              {livro.numeroPaginas && (
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-stone-500" />
                  <span>Páginas: <strong>{livro.numeroPaginas}</strong></span>
                </div>
              )}
            </div>

            {/* Categories */}
            {item.categorias && item.categorias.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {item.categorias.map((c: any) => (
                  <span key={c.categoria.id} className="text-[11px] bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded border border-stone-700">
                    {c.categoria.nome}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {item.descricao && (
          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-6 space-y-2">
            <h3 className="font-serif font-bold text-stone-200 text-lg">Sobre o livro</h3>
            <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
              {item.descricao}
            </p>
          </section>
        )}

        <RecommendationBlock content={item.porqueIndicamos} contentLabel="este livro" audience={item.publicoIndicado} />

        {/* PASTORAL CAVEATS (RESSALVAS) IF PRESENT */}
        {item.ressalvas && (
          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-6 space-y-2">
            <h3 className="font-serif font-bold text-stone-200 text-sm flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-4 h-4" /> Ressalvas e Observações Pastorais
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed whitespace-pre-line">
              {item.ressalvas}
            </p>
          </section>
        )}

        {/* ACCESS LINKS & ACQUISITION OPTIONS */}
        <section className="space-y-4">
          <h3 className="font-serif font-bold text-stone-100 text-xl">
            Como Acessar ou Adquirir
          </h3>
          <AccessLinksList acessos={acessos} />
        </section>

        <CrossReferenceSection itemSlug={slug!} currentTipo="LIVRO" currentTitle={item.titulo} />
      </main>

      <VeredasFooter />
    </div>
  );
};

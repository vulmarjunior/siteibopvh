import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, AlertCircle, ShieldCheck, ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { SharePageButton } from '../../components/veredas/SharePageButton';
import { Helmet } from 'react-helmet-async';

export const VeredasVideoDetailPage: React.FC = () => {
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
          throw new Error('Vídeo não encontrado ou desativado');
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
          <div className="aspect-video bg-stone-900 rounded-2xl animate-pulse" />
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
          <p className="text-stone-400 text-sm">{error || 'Vídeo não localizado no catálogo.'}</p>
          <Link to="/veredas/videos" className="inline-block px-4 py-2 bg-amber-600 text-stone-950 font-bold rounded-lg text-xs">
            ← Voltar ao Catálogo de Vídeos
          </Link>
        </main>
        <VeredasFooter />
      </div>
    );
  }

  const video = item.video || {};
  const urlOriginal = video.urlOriginal;
  const canal = video.canal;
  const participantes = video.participantes || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      <Helmet>
        <title>{item.titulo} — Vídeo Indicação Veredas IBO</title>
        <meta name="description" content={item.resumo} />
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        <div className="flex items-center justify-between gap-4">
          <Link to="/veredas/videos" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo de Vídeos
          </Link>
          <SharePageButton title={item.titulo} />
        </div>

        {/* Video Player or Fallback Container */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={item.titulo}
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
            ) : null}
            <div className="relative z-10 space-y-3">
              <Play className="w-16 h-16 text-amber-500 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-200">
                Assistir diretamente no YouTube
              </h3>
              <p className="text-xs text-stone-400 max-w-md">
                O vídeo será aberto no YouTube. Para compartilhar esta indicação, use o botão acima e envie a página do Veredas IBO.
              </p>
              <a
                href={urlOriginal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-full transition-colors shadow-lg"
              >
                Assistir no YouTube <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="p-6 space-y-3 border-t border-stone-800">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 uppercase">
                Vídeo
              </span>
              <span className="px-2.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono">
                Nível {item.nivel}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              {item.titulo}
            </h1>

            {(participantes.length > 0 || canal) && (
              <p className="text-xs sm:text-sm text-amber-400 font-medium">
                {participantes.length > 0 ? `Expositor: ${participantes.map((p: any) => p.pessoa.nome).join(', ')}` : `Canal: ${canal}`}
              </p>
            )}
          </div>
        </div>

        {/* PASTORAL RECOMMENDATION BLOCK */}
        <section className="bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-800/50 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            Por que indicamos este vídeo?
          </div>
          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-serif whitespace-pre-line">
            {item.porqueIndicamos}
          </p>
        </section>

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

      </main>

      <VeredasFooter />
    </div>
  );
};

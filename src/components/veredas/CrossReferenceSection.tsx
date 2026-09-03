import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Film, GraduationCap, Flame, ArrowRight, Bookmark, Sparkles } from 'lucide-react';

interface RelatedItemResult {
  item: {
    id: number;
    slug: string;
    titulo: string;
    tipo: 'LIVRO' | 'VIDEO' | 'CURSO' | 'CONFERENCIA';
    resumo?: string;
    nivel?: string;
    imagemUrl?: string | null;
    livro?: {
      capaUrl?: string | null;
      editora?: string | null;
      autores?: Array<{ pessoa: { nome: string } }>;
      acessos?: Array<{ gratuito: boolean }>;
    };
    video?: {
      thumbnailUrl?: string | null;
      canal?: string | null;
      participantes?: Array<{ pessoa: { nome: string } }>;
    };
    curso?: {
      thumbnailUrl?: string | null;
      canal?: string | null;
      participantes?: Array<{ pessoa: { nome: string } }>;
      aulas?: any[];
    };
  };
  rotulo: string | null;
  isManual: boolean;
  score?: number;
}

export interface CrossReferenceSectionProps {
  itemSlug: string;
  currentTipo: 'LIVRO' | 'VIDEO' | 'CURSO' | 'CONFERENCIA';
  currentTitle?: string;
}

const SECTION_HEADERS: Record<string, { title: string; subtitle: string }> = {
  CONFERENCIA: {
    title: 'Aprofunde este tema — Livros e Leituras Recomendadas',
    subtitle: 'Obras selecionadas para fundamentar e expandir os ensinamentos desta conferência.',
  },
  LIVRO: {
    title: 'Mensagens e Conferências sobre esta temática',
    subtitle: 'Exposições e plenárias que dialogam com os tópicos abordados nesta obra.',
  },
  VIDEO: {
    title: 'Materiais e Livros para Aprofundamento',
    subtitle: 'Indicações de leitura para continuar seu estudo deste tema.',
  },
  CURSO: {
    title: 'Bibliografia e Conteúdos Relacionados',
    subtitle: 'Livros-texto e mensagens correlatas para apoiar suas aulas.',
  },
};

function getItemRoute(tipo: string, slug: string): string {
  switch (tipo) {
    case 'LIVRO':
      return `/veredas/livros/${slug}`;
    case 'CONFERENCIA':
      return `/veredas/conferencias/${slug}`;
    case 'CURSO':
      return `/veredas/cursos/${slug}`;
    case 'VIDEO':
      return `/veredas/videos/${slug}`;
    default:
      return `/veredas/${slug}`;
  }
}

function getItemPeople(item: any): string | null {
  if (item.livro?.autores?.length) {
    return item.livro.autores.map((a: any) => a.pessoa?.nome).filter(Boolean).join(', ');
  }
  if (item.curso?.participantes?.length) {
    return item.curso.participantes.map((p: any) => p.pessoa?.nome).filter(Boolean).join(', ');
  }
  if (item.video?.participantes?.length) {
    return item.video.participantes.map((p: any) => p.pessoa?.nome).filter(Boolean).join(', ');
  }
  if (item.curso?.canal) return item.curso.canal;
  if (item.video?.canal) return item.video.canal;
  return null;
}

function getItemThumbnail(item: any): string | null {
  if (item.livro?.capaUrl) return item.livro.capaUrl;
  if (item.video?.thumbnailUrl) return item.video.thumbnailUrl;
  if (item.curso?.thumbnailUrl) return item.curso.thumbnailUrl;
  if (item.imagemUrl) return item.imagemUrl;
  return null;
}

function getItemTypeDetails(tipo: string) {
  switch (tipo) {
    case 'LIVRO':
      return {
        label: 'Livro',
        icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" />,
        badgeClass: 'bg-amber-950/80 border-amber-800 text-amber-300',
        cta: 'Ver detalhes do livro',
      };
    case 'CONFERENCIA':
      return {
        label: 'Conferência',
        icon: <Flame className="w-3.5 h-3.5 text-indigo-400" />,
        badgeClass: 'bg-indigo-950/80 border-indigo-800 text-indigo-300',
        cta: 'Assistir conferência',
      };
    case 'CURSO':
      return {
        label: 'Curso',
        icon: <GraduationCap className="w-3.5 h-3.5 text-blue-400" />,
        badgeClass: 'bg-blue-950/80 border-blue-800 text-blue-300',
        cta: 'Acessar curso',
      };
    default:
      return {
        label: 'Vídeo',
        icon: <Film className="w-3.5 h-3.5 text-red-400" />,
        badgeClass: 'bg-red-950/80 border-red-800 text-red-300',
        cta: 'Assistir vídeo',
      };
  }
}

export const CrossReferenceSection: React.FC<CrossReferenceSectionProps> = ({
  itemSlug,
  currentTipo,
}) => {
  const [related, setRelated] = useState<RelatedItemResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/veredas/items/${itemSlug}/relacionados?limit=4`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setRelated(data);
        }
      })
      .catch(() => {
        if (isMounted) setRelated([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [itemSlug]);

  if (loading) {
    return (
      <section className="border-t border-stone-800 pt-8 mt-8 space-y-4">
        <div className="h-6 w-64 bg-stone-900 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 bg-stone-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!related || related.length === 0) {
    return null;
  }

  const header = SECTION_HEADERS[currentTipo] || SECTION_HEADERS.CONFERENCIA;

  return (
    <section className="border-t border-stone-800 pt-10 mt-10 space-y-6">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          {header.title}
        </h2>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          {header.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {related.map(({ item, rotulo, isManual }) => {
          const typeDetails = getItemTypeDetails(item.tipo);
          const people = getItemPeople(item);
          const thumb = getItemThumbnail(item);
          const route = getItemRoute(item.tipo, item.slug);
          const hasDigitalFree = item.livro?.acessos?.some((a) => a.gratuito);

          return (
            <Link
              key={item.id}
              to={route}
              className="group flex flex-col bg-stone-900/90 hover:bg-stone-900 border border-stone-800 hover:border-amber-700/60 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:-translate-y-0.5"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-[16/10] bg-stone-950 overflow-hidden flex items-center justify-center">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-stone-600 flex flex-col items-center">
                    {typeDetails.icon}
                    <span className="text-[10px] mt-1 font-serif">{typeDetails.label}</span>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-sm ${typeDetails.badgeClass}`}
                  >
                    {typeDetails.icon}
                    {typeDetails.label}
                  </span>
                </div>

                {/* Digital Free Library Badge */}
                {hasDigitalFree && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/90 border border-emerald-700 text-emerald-300 backdrop-blur-sm">
                      Biblioteca Digital
                    </span>
                  </div>
                )}
              </div>

              {/* Pastoral Label Pill (if manually assigned) */}
              {isManual && rotulo && (
                <div className="px-3 pt-2.5 pb-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                    <Bookmark className="w-2.5 h-2.5" />
                    {rotulo}
                  </span>
                </div>
              )}

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-stone-100 group-hover:text-amber-200 line-clamp-2 leading-snug transition-colors">
                    {item.titulo}
                  </h3>
                  {people && (
                    <p className="text-xs text-stone-400 font-medium truncate">
                      {people}
                    </p>
                  )}
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-semibold text-amber-400 group-hover:text-amber-300">
                  <span>{typeDetails.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

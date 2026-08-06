import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';

export interface BookCardProps {
  item: {
    id: number;
    titulo: string;
    slug: string;
    resumo: string;
    nivel: 'INTRODUTORIO' | 'INTERMEDIARIO' | 'APROFUNDAMENTO';
    livro?: {
      capaUrl?: string | null;
      editora?: string | null;
      disponibilidade?: string | null;
      autores?: Array<{
        pessoa: {
          nome: string;
          slug: string;
        };
      }>;
      acessos?: Array<{
        gratuito: boolean;
      }>;
    } | null;
    categorias?: Array<{
      categoria: {
        nome: string;
        slug: string;
      };
    }>;
  };
}

const levelLabels: Record<string, string> = {
  INTRODUTORIO: 'Introdutório',
  INTERMEDIARIO: 'Intermediário',
  APROFUNDAMENTO: 'Aprofundamento',
};

const levelBadgeColor: Record<string, string> = {
  INTRODUTORIO: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  INTERMEDIARIO: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  APROFUNDAMENTO: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
};

export const BookCard: React.FC<BookCardProps> = ({ item }) => {
  const capaUrl = item.livro?.capaUrl;
  const autores = item.livro?.autores || [];
  const temAcessoGratuito = item.livro?.acessos?.some((a) => a.gratuito);

  return (
    <div className="group bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg hover:border-amber-700/60 hover:shadow-2xl transition-all flex flex-col h-full">
      
      {/* Cover Image Container */}
      <Link to={`/veredas/livro/${item.slug}`} className="relative bg-stone-950 h-56 sm:h-64 flex items-center justify-center p-4 overflow-hidden border-b border-stone-800/80">
        {capaUrl ? (
          <img
            src={capaUrl}
            alt={item.titulo}
            loading="lazy"
            className="max-h-full max-w-full object-contain rounded shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-28 h-40 bg-stone-800 border border-stone-700 rounded flex flex-col items-center justify-center text-stone-500 p-2 text-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-10 h-10 text-amber-600/60 mb-2" />
            <span className="text-[10px] font-serif line-clamp-3 text-stone-400">{item.titulo}</span>
          </div>
        )}

        {/* Free Badge */}
        {temAcessoGratuito && (
          <span className="absolute top-3 right-3 bg-emerald-600 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
            <Sparkles className="w-3 h-3" /> Gratuito
          </span>
        )}

        {/* Level Badge */}
        <span className={`absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded border ${levelBadgeColor[item.nivel] || 'bg-stone-800 text-stone-300 border-stone-700'}`}>
          {levelLabels[item.nivel] || item.nivel}
        </span>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Categories */}
          {item.categorias && item.categorias.length > 0 && (
            <div className="text-[11px] font-medium text-amber-500 mb-1 line-clamp-1">
              {item.categorias.map((c) => c.categoria.nome).join(' • ')}
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            <Link to={`/veredas/livro/${item.slug}`}>{item.titulo}</Link>
          </h3>

          {/* Author */}
          {autores.length > 0 && (
            <p className="text-xs text-stone-400 mt-1 line-clamp-1">
              {autores.map((a) => a.pessoa.nome).join(', ')}
            </p>
          )}
        </div>

        {/* Summary Snippet & Action Link */}
        <div>
          <p className="text-xs text-stone-400/90 line-clamp-2 leading-relaxed mb-3">
            {item.resumo}
          </p>

          <Link
            to={`/veredas/livro/${item.slug}`}
            className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Ver indicação pastoral →
          </Link>
        </div>
      </div>

    </div>
  );
};

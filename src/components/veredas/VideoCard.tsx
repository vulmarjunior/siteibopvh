import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export interface VideoCardProps {
  item: {
    id: number;
    titulo: string;
    slug: string;
    resumo: string;
    nivel: 'INTRODUTORIO' | 'INTERMEDIARIO' | 'APROFUNDAMENTO';
    video?: {
      thumbnailUrl?: string | null;
      canal?: string | null;
      duracaoSegundos?: number | null;
      participantes?: Array<{
        pessoa: {
          nome: string;
        };
      }>;
    } | null;
    categorias?: Array<{
      categoria: {
        nome: string;
      };
    }>;
  };
}

const levelLabels: Record<string, string> = {
  INTRODUTORIO: 'Introdutório',
  INTERMEDIARIO: 'Intermediário',
  APROFUNDAMENTO: 'Aprofundamento',
};

function formatDuration(seconds?: number | null): string | null {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
}

export const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const thumbnailUrl = item.video?.thumbnailUrl;
  const canal = item.video?.canal;
  const participantes = item.video?.participantes || [];
  const duracaoFormatted = formatDuration(item.video?.duracaoSegundos);

  return (
    <div className="group bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg hover:border-amber-700/60 hover:shadow-2xl transition-all flex flex-col h-full">
      
      {/* 16:9 Thumbnail Container */}
      <Link to={`/veredas/video/${item.slug}`} className="relative aspect-video bg-stone-950 block overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.titulo}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-stone-850 flex items-center justify-center text-stone-600">
            <Play className="w-12 h-12 text-amber-600/40" />
          </div>
        )}

        {/* Overlay Play Icon */}
        <div className="absolute inset-0 bg-stone-950/30 group-hover:bg-stone-950/10 flex items-center justify-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-amber-500/90 text-stone-950 flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Duration badge */}
        {duracaoFormatted && (
          <span className="absolute bottom-2 right-2 bg-stone-950/90 text-stone-200 text-[10px] font-mono font-medium px-2 py-0.5 rounded shadow">
            {duracaoFormatted}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Categories & Level */}
          <div className="flex items-center justify-between text-[11px] font-medium mb-1">
            <span className="text-amber-500 line-clamp-1">
              {item.categorias && item.categorias.length > 0
                ? item.categorias.map((c) => c.categoria.nome).join(' • ')
                : 'Vídeo'}
            </span>
            <span className="text-stone-400 font-mono text-[10px]">
              {levelLabels[item.nivel] || item.nivel}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            <Link to={`/veredas/video/${item.slug}`}>{item.titulo}</Link>
          </h3>

          {/* Channel or Speaker */}
          {(participantes.length > 0 || canal) && (
            <p className="text-xs text-stone-400 mt-1 line-clamp-1">
              {participantes.length > 0 ? participantes.map((p) => p.pessoa.nome).join(', ') : canal}
            </p>
          )}
        </div>

        {/* Summary Snippet */}
        <div>
          <p className="text-xs text-stone-400/90 line-clamp-2 leading-relaxed mb-3">
            {item.resumo}
          </p>

          <Link
            to={`/veredas/video/${item.slug}`}
            className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Assistir e ver indicação →
          </Link>
        </div>
      </div>

    </div>
  );
};

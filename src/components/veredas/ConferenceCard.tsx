import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Play, Users } from 'lucide-react';

export const ConferenceCard: React.FC<{ item: any }> = ({ item }) => {
  const conference = item.curso || {};
  const aulas = conference.aulas || [];
  const thumbnailUrl =
    conference.thumbnailUrl ||
    aulas[0]?.thumbnailUrl ||
    (aulas[0]?.youtubeId ? `https://img.youtube.com/vi/${aulas[0].youtubeId}/hqdefault.jpg` : null);

  return (
    <article className="group bg-gradient-to-b from-stone-900 via-stone-900 to-indigo-950/20 border border-stone-800 rounded-xl overflow-hidden hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-950/30 transition-all flex flex-col h-full">
      <Link to={`/veredas/conferencia/${item.slug}`} className="relative aspect-video bg-stone-950 block overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-stone-950">
            <Flame className="w-12 h-12 text-indigo-400/50" />
          </div>
        )}
        
        {/* Dark overlay with Play button */}
        <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 flex items-center justify-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Sessions badge on thumbnail */}
        <span className="absolute bottom-2 right-2 bg-stone-950/90 backdrop-blur-sm border border-indigo-900/50 text-indigo-200 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
          <Users className="w-3 h-3 text-indigo-400" />
          {aulas.length} {aulas.length === 1 ? 'plenária' : 'plenárias'}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 uppercase">
            <Flame className="w-3 h-3 text-indigo-400" /> CONFERÊNCIA
          </span>
          {item.nivel ? (
            <span className="text-[10px] text-stone-400 font-mono">
              {item.nivel === 'INTRODUTORIO' ? 'Introdução' : item.nivel === 'INTERMEDIARIO' ? 'Intermediário' : 'Aprofundamento'}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 font-serif text-base font-bold text-stone-100 group-hover:text-indigo-200 transition-colors line-clamp-2">
          <Link to={`/veredas/conferencia/${item.slug}`}>{item.titulo}</Link>
        </h3>

        {conference.canal ? (
          <p className="mt-1 text-xs text-stone-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            {conference.canal}
          </p>
        ) : null}

        <p className="mt-3 text-xs text-stone-400 line-clamp-2 leading-relaxed">
          {item.resumo || item.porqueIndicamos}
        </p>

        <Link
          to={`/veredas/conferencia/${item.slug}`}
          className="mt-auto pt-4 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          Assistir conferência →
        </Link>
      </div>
    </article>
  );
};

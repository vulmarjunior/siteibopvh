import React, { useState } from 'react';
import { TimelineMilestone } from '../../types/history';
import { MapPin, Quote, Sparkles, ChevronDown, ChevronUp, BookmarkCheck, ShieldCheck } from 'lucide-react';

interface HistoryTimelineCardProps {
  milestone: TimelineMilestone;
  index: number;
}

export const HistoryTimelineCard: React.FC<HistoryTimelineCardProps> = ({ milestone, index }) => {
  const [isCuriosityOpen, setIsCuriosityOpen] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <div
      id={milestone.id}
      className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 my-8 md:my-14 scroll-mt-28 ${
        isEven ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Marcador Central / Bolinha no trilho */}
      <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-stone-900 border-4 border-amber-500 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20 z-20 group">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
      </div>

      {/* Conteudo do Card */}
      <div
        className={`w-full md:w-[calc(50%-2.5rem)] pl-12 md:pl-0 ${
          isEven ? 'md:text-left' : 'md:text-left'
        }`}
      >
        <div className="bg-stone-900/90 hover:bg-stone-900 rounded-2xl p-6 md:p-8 border border-stone-800 hover:border-amber-500/40 shadow-xl transition-all duration-300 relative group overflow-hidden">
          {/* Luz sutil no fundo */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

          {/* Cabecalho do Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {milestone.exactDate || milestone.year}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-stone-800 text-stone-300">
                {milestone.badge}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{milestone.location}</span>
            </div>
          </div>

          {/* Titulo e Subtitulo */}
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white group-hover:text-amber-300 transition-colors mb-2">
            {milestone.title}
          </h3>
          <p className="text-xs md:text-sm font-medium text-amber-200/90 mb-4 italic">
            {milestone.subtitle}
          </p>

          {/* Narrativa */}
          <p className="text-sm md:text-base text-stone-300 leading-relaxed text-justify mb-5 font-sans font-light">
            {milestone.narrative}
          </p>

          {/* Destaques */}
          {milestone.highlights && milestone.highlights.length > 0 && (
            <div className="mb-5 space-y-2">
              {milestone.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs md:text-sm text-stone-300">
                  <BookmarkCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Citacao Historica */}
          {milestone.quote && (
            <div className="my-5 p-4 rounded-xl bg-stone-950/80 border-l-4 border-amber-500 border-stone-800 text-stone-300 relative">
              <Quote className="w-5 h-5 text-amber-400/40 absolute right-3 top-3" />
              <p className="italic text-xs md:text-sm text-amber-100 font-serif leading-relaxed mb-2">
                &ldquo;{milestone.quote.text}&rdquo;
              </p>
              <div className="text-[11px] text-stone-400 font-sans">
                <strong className="text-amber-400">{milestone.quote.author}</strong> — {milestone.quote.role}
                {milestone.quote.source && (
                  <span className="block text-stone-400 italic">Fonte: {milestone.quote.source}</span>
                )}
              </div>
            </div>
          )}

          {/* Pilar Teologico */}
          {milestone.theologicalPillar && (
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 flex items-start gap-2.5 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">Legado Teológico:</strong>
                <span className="text-stone-300">{milestone.theologicalPillar}</span>
              </div>
            </div>
          )}

          {/* Curiosidade Interativa (Voce Sabia?) */}
          {milestone.curiosity && (
            <div className="border-t border-stone-800 pt-3 mt-4">
              <button
                onClick={() => setIsCuriosityOpen(!isCuriosityOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors py-1"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Você sabia? (Curiosidade Histórica)</span>
                </div>
                {isCuriosityOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isCuriosityOpen && (
                <div className="mt-2.5 p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-stone-300 leading-relaxed animate-fade-in">
                  {milestone.curiosity}
                </div>
              )}
            </div>
          )}

          {/* Personagens-chave */}
          {milestone.keyFigures && milestone.keyFigures.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-800/60 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-stone-400 font-medium">Figuras históricas:</span>
              {milestone.keyFigures.map((fig, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-medium"
                >
                  {fig}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

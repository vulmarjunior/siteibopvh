import React from 'react';
import { Scroll, Compass, BookOpen, ChevronDown } from 'lucide-react';
import { HISTORICAL_ERAS } from '../../data/baptistHistoryData';

interface HistoryHeroProps {
  onSelectEra: (eraId: string) => void;
  onOpenDocuments: () => void;
}

export const HistoryHero: React.FC<HistoryHeroProps> = ({ onSelectEra, onOpenDocuments }) => {
  return (
    <div className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-stone-100">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-stone-950/60 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs md:text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
          <Compass className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Memorial da Fé & Patrimônio Reformado</span>
        </div>

        {/* Titulo Principal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-white mb-6">
          A Jornada dos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">Batistas</span>
        </h1>

        {/* Subtitulo */}
        <p className="text-lg sm:text-xl md:text-2xl text-stone-300 font-light max-w-3xl mx-auto leading-relaxed mb-4">
          Do nascedouro na Europa de 1609 à fundação da <strong className="font-semibold text-amber-400">Igreja Batista Olaria</strong> em 1º de Junho de 1959.
        </p>

        {/* Versiculo tematico */}
        <div className="max-w-2xl mx-auto p-4 md:p-5 rounded-xl bg-stone-900/80 border border-amber-500/20 my-8 shadow-inner">
          <p className="text-sm md:text-base italic text-amber-200/90 font-serif">
            &ldquo;Não os encobriremos aos seus filhos, cantando à geração futura os louvores do Senhor, assim como a sua força e as maravilhas que fez.&rdquo;
          </p>
          <span className="block text-xs uppercase tracking-widest text-stone-400 font-sans mt-2 font-semibold">
            Salmos 78:4
          </span>
        </div>

        {/* Botoes de Acao */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <a
            href="#linha-do-tempo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 text-sm md:text-base"
          >
            <Scroll className="w-5 h-5 text-amber-200" />
            Explorar a Linha do Tempo
          </a>

          <button
            onClick={onOpenDocuments}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-stone-800/90 hover:bg-stone-700/90 text-stone-200 hover:text-white border border-stone-700 transition-all text-sm md:text-base"
          >
            <BookOpen className="w-5 h-5 text-amber-400" />
            Baú do Historiador (Fontes)
          </button>
        </div>

        {/* Saltos rapidos por Eras */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4">
            Navegue pelas Eras Históricas:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {HISTORICAL_ERAS.map((era, index) => (
              <button
                key={era.id}
                onClick={() => onSelectEra(era.id)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-stone-900/90 hover:bg-amber-600/20 text-stone-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/40 transition-all flex items-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span>{era.name}</span>
                <span className="text-stone-400 font-mono text-[10px]">({era.period})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <a
          href="#mapa-rota"
          className="text-stone-400 hover:text-amber-400 transition-colors animate-bounce p-2"
          aria-label="Rolar para baixo"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

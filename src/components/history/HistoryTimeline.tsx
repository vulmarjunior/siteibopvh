import React, { useState } from 'react';
import { HISTORICAL_ERAS, TIMELINE_MILESTONES } from '../../data/baptistHistoryData';
import { HistoryTimelineCard } from './HistoryTimelineCard';
import { BookOpen } from 'lucide-react';

interface HistoryTimelineProps {
  selectedEraId?: string | null;
  onClearEraFilter?: () => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ selectedEraId, onClearEraFilter }) => {
  const [activeEraFilter, setActiveEraFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentFilter = selectedEraId || activeEraFilter;

  const filteredMilestones = TIMELINE_MILESTONES.filter((m) => {
    const matchesEra = currentFilter === 'all' || m.eraId === currentFilter;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.narrative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.keyFigures.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEra && matchesSearch;
  });

  return (
    <section id="linha-do-tempo" className="py-20 bg-stone-950 text-stone-100 relative">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Cabecalho da Linha do Tempo */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase inline-block mb-3">
            Cronologia Histórica (1609 – 1959)
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-bold tracking-tight">
            A Trilha da Fé Batista
          </h2>
          <p className="text-stone-400 text-sm md:text-base mt-3 leading-relaxed">
            Navegue pelos séculos e descubra como a obediência às Escrituras moldou gerações de cristãos até o testemunho pioneiro em Porto Velho.
          </p>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 mb-16 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filtros de Era */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => {
                  setActiveEraFilter('all');
                  if (onClearEraFilter) onClearEraFilter();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                Todas as Eras ({TIMELINE_MILESTONES.length})
              </button>

              {HISTORICAL_ERAS.map((era) => (
                <button
                  key={era.id}
                  onClick={() => {
                    setActiveEraFilter(era.id);
                    if (onClearEraFilter) onClearEraFilter();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentFilter === era.id
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {era.name}
                </button>
              ))}
            </div>

            {/* Input de Busca */}
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar pioneiro, local ou ano..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Linha Vertical e Cards */}
        <div className="relative">
          {/* O Trilho Central (Linha Vertical) */}
          <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/20 via-amber-500 to-clay-600/30" />

          {/* Renderizacao dos Marcos */}
          {filteredMilestones.length > 0 ? (
            filteredMilestones.map((milestone, index) => (
              <HistoryTimelineCard
                key={milestone.id}
                milestone={milestone}
                index={index}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-stone-900/50 rounded-2xl border border-stone-800 my-8">
              <BookOpen className="w-10 h-10 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-300 font-semibold text-base">
                Nenhum marco encontrado com os filtros atuais.
              </p>
              <button
                onClick={() => {
                  setActiveEraFilter('all');
                  setSearchQuery('');
                  if (onClearEraFilter) onClearEraFilter();
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

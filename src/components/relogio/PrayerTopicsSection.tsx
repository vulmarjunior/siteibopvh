import React, { useState } from 'react';
import { BookOpen, Check, Users, Sparkles } from 'lucide-react';

export interface PrayerTopicItem {
  id: number;
  title: string;
  description: string | null;
  category: string;
  prayedCount: number;
}

interface PrayerTopicsSectionProps {
  topics: PrayerTopicItem[];
  onTopicPrayed: (topicId: number, newCount: number) => void;
}

export const PrayerTopicsSection: React.FC<PrayerTopicsSectionProps> = ({
  topics,
  onTopicPrayed,
}) => {
  const [prayedIds, setPrayedIds] = useState<Record<number, boolean>>({});
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(topics.map((t) => t.category)))];

  const filteredTopics =
    selectedCategory === 'Todos'
      ? topics
      : topics.filter((t) => t.category === selectedCategory);

  const handlePray = async (id: number) => {
    if (prayedIds[id]) return;

    setPrayedIds((prev) => ({ ...prev, [id]: true }));
    setAnimatingId(id);

    try {
      const res = await fetch(`/api/relogio/sentinelas/motivos/${id}/orar`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        onTopicPrayed(id, data.prayedCount);
      }
    } catch (error) {
      console.error('Erro ao registrar oração:', error);
    } finally {
      setTimeout(() => {
        setAnimatingId(null);
      }, 1000);
    }
  };

  return (
    <section className="py-12 border-t border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Guia Pastoral de Oração
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Motivos de Oração da Semana
          </h2>
          <p className="text-stone-300 text-sm mt-1">
            "Com toda oração e súplica, orando em todo tempo no Espírito e para isto vigiando com toda perseverança." (Efésios 6:18)
          </p>
        </div>

        {/* Filtros de Categoria */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                  ${selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-750 border border-white/5'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Motivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const hasPrayed = prayedIds[topic.id];
          const isAnimating = animatingId === topic.id;

          return (
            <div
              key={topic.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-stone-850/60 border border-white/10 hover:border-amber-500/30 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {topic.category}
                  </span>
                  <span className="text-xs text-stone-400 font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    {topic.prayedCount} intercessões
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {topic.title}
                </h3>

                {topic.description && (
                  <p className="text-stone-300 text-sm mt-2 leading-relaxed">
                    {topic.description}
                  </p>
                )}
              </div>

              {/* Botão Interativo "Intercedi por este motivo" */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-stone-400 italic">
                  {hasPrayed ? 'Sua intercessão foi registrada' : 'Una-se em súplica por esta causa'}
                </span>

                <button
                  onClick={() => handlePray(topic.id)}
                  disabled={hasPrayed}
                  className={`
                    relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                    ${hasPrayed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-500/20 shadow-sm active:scale-95'
                    }
                    ${isAnimating ? 'animate-bounce' : ''}
                  `}
                >
                  {hasPrayed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Intercedi por este motivo</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Intercedi por este pedido</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PrayerTopicsSection;

import React from 'react';
import { Sparkles, HeartHandshake, Quote, Calendar } from 'lucide-react';

export interface PrayerPraiseItem {
  id: number;
  title: string;
  testimony: string;
  authorName: string | null;
  date: string | null;
}

interface PrayerPraisesSectionProps {
  praises: PrayerPraiseItem[];
}

export const PrayerPraisesSection: React.FC<PrayerPraisesSectionProps> = ({ praises }) => {
  if (!praises || praises.length === 0) return null;

  return (
    <section className="py-12 border-t border-white/5">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Mural de Gratidão
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
          Orações Respondidas & Testemunhos
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          "Celebrai com júbilo ao Senhor... porque o Senhor é bom, a sua misericórdia dura para sempre."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {praises.map((praise) => (
          <div
            key={praise.id}
            className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-stone-850 to-stone-900 border border-amber-500/10 hover:border-amber-500/30 transition-all shadow-lg"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Quote className="w-4 h-4" />
              </div>

              <h3 className="text-base font-serif font-bold text-amber-300 mb-2 leading-snug">
                {praise.title}
              </h3>

              <p className="text-stone-300 text-sm leading-relaxed italic">
                "{praise.testimony}"
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold text-stone-400">
                {praise.authorName || 'Membro da Congregação'}
              </span>
              {praise.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {praise.date}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PrayerPraisesSection;

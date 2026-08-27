import React from 'react';
import { Shield, Flame, Plus, Users, CheckCircle, Sparkles } from 'lucide-react';

interface DayData {
  sentinels: { id: number; name: string }[];
  count: number;
  isFull: boolean;
}

interface SentinelMonthGridProps {
  days: Record<number, DayData>;
  capacity: number;
  currentDayOfMonth: number;
  onSelectDayToSubscribe: (day: number) => void;
}

export const SentinelMonthGrid: React.FC<SentinelMonthGridProps> = ({
  days,
  capacity,
  currentDayOfMonth,
  onSelectDayToSubscribe,
}) => {
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5" />
            Escala Mensal Contínua
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Escala dos 31 Dias do Mês
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Escolha um dia fixo no mês para ser o seu posto de intercessão com sua família ou ministério.
          </p>
        </div>

        {/* Legenda de Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            Vigília Hoje
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Vagas Preenchidas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
            Vagas Disponíveis
          </span>
        </div>
      </div>

      {/* Grid 1 a 31 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {daysArray.map((day) => {
          const dayInfo = days[day] || { sentinels: [], count: 0, isFull: false };
          const isToday = day === currentDayOfMonth;
          const isFull = dayInfo.count >= capacity;
          const openSlots = Math.max(0, capacity - dayInfo.count);

          return (
            <div
              key={day}
              className={`
                relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300
                ${isToday
                  ? 'bg-gradient-to-b from-stone-800 to-stone-850 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : isFull
                  ? 'bg-stone-900/60 border-white/5 hover:border-white/10'
                  : 'bg-stone-800/40 border-white/10 hover:border-amber-500/40 hover:bg-stone-800/80 shadow-md'
                }
              `}
            >
              {/* Topo do Card: Número do Dia e Badges */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl md:text-3xl font-serif font-bold ${isToday ? 'text-amber-400' : 'text-white'}`}>
                      Dia {day < 10 ? `0${day}` : day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Indicador de Capacidade / Vagas */}
                  <div className="flex items-center gap-1.5">
                    {isFull ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Completo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full border border-white/5">
                        {openSlots} {openSlots === 1 ? 'vaga' : 'vagas'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sentinelas deste dia */}
                <div className="min-h-[52px] mb-4">
                  {dayInfo.sentinels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {dayInfo.sentinels.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] font-semibold text-stone-300 bg-stone-900/80 border border-white/5 px-2 py-0.5 rounded-lg"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500 italic block pt-1">
                      Nenhum sentinela assumiu este dia ainda.
                    </span>
                  )}
                </div>
              </div>

              {/* Rodapé do Card: Ação ou Barra de Cobertura */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <Users className="w-3 h-3" />
                  <span>
                    {dayInfo.count}/{capacity}
                  </span>
                </div>

                {!isFull ? (
                  <button
                    onClick={() => onSelectDayToSubscribe(day)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 hover:translate-x-0.5 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assumir Dia</span>
                  </button>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                    Vigília Fechada
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentinelMonthGrid;

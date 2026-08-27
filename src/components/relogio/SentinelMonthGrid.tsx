import React from 'react';
import { Shield, Plus, Users, CheckCircle, CalendarDays, UserPlus, Sparkles } from 'lucide-react';

interface DayData {
  sentinels: { id: number; name: string }[];
  count: number;
  isFull: boolean;
}

interface SentinelMonthGridProps {
  days: Record<number, DayData>;
  capacity: number;
  currentDayOfMonth: number;
  onSelectDayToSubscribe: (day?: number) => void;
}

export const SentinelMonthGrid: React.FC<SentinelMonthGridProps> = ({
  days,
  capacity,
  currentDayOfMonth,
  onSelectDayToSubscribe,
}) => {
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div id="escala-mensal" className="space-y-8 scroll-mt-28">
      {/* Banner / Card Chamada de Inscrição em Destaque */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-stone-850 to-stone-900 border border-amber-500/30 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Faça Parte da Intercessão
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mt-0.5">
              Assuma um Dia Fixo na Escala Mensal
            </h3>
            <p className="text-stone-300 text-sm mt-1 max-w-xl leading-relaxed">
              Você pode participar individualmente, em casal ou como família. Escolha um dos 31 dias com vagas disponíveis e sustente nossa igreja em oração.
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectDayToSubscribe()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 w-full md:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar meu Dia de Oração</span>
        </button>
      </div>

      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Visão Geral do Mês
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Grade dos 31 Dias do Mês
          </h2>
          <p className="text-stone-300 text-sm mt-1">
            Clique em qualquer dia com vagas abertas para se cadastrar ou ver os intercessores.
          </p>
        </div>

        {/* Legenda de Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            Escala de Hoje
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Escala Preenchida
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
            Vagas Abertas
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

                {/* Intercessores deste dia */}
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
                      Nenhum intercessor cadastrado neste dia.
                    </span>
                  )}
                </div>
              </div>

              {/* Rodapé do Card: Ação ou Quantidade */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                  <Users className="w-3 h-3" />
                  <span>
                    {dayInfo.count}/{capacity}
                  </span>
                </div>

                {!isFull ? (
                  <button
                    onClick={() => onSelectDayToSubscribe(day)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 hover:translate-x-0.5 transition-all bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assumir Dia</span>
                  </button>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                    Escala Completa
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

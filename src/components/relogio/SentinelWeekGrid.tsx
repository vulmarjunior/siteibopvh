import React from 'react';
import { Shield, Plus, Users, CheckCircle, CalendarDays, UserPlus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export interface WeekDayItem {
  dayOfWeek: number; // 0 a 6
  dayName: string;
  shortDayName: string;
  dateStr: string;
  formattedDate: string;
  dayNumber: number;
  sentinels: { id: number; name: string }[];
  count: number;
  isFull: boolean;
  openSlots: number;
  isToday: boolean;
  isPast: boolean;
  isCompleted: boolean;
}

interface SentinelWeekGridProps {
  days: WeekDayItem[];
  capacity: number;
  formattedRange: string;
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onSelectDayToSubscribe: (dayOfWeek?: number) => void;
}

export const SentinelWeekGrid: React.FC<SentinelWeekGridProps> = ({
  days,
  capacity,
  formattedRange,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onSelectDayToSubscribe,
}) => {
  return (
    <div id="escala-semanal" className="space-y-8 scroll-mt-28">
      {/* Banner de Chamada para Cadastro Recorrente */}
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
              Assuma um Dia Fixo na Escala Semanal
            </h3>
            <p className="text-stone-300 text-sm mt-1 max-w-xl leading-relaxed">
              Você pode participar individualmente, em casal, família ou ministério. Escolha um dia da semana (ex: toda terça-feira) e sustente nossa igreja em oração.
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

      {/* Cabeçalho da Seção & Navegador de Semanas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 mb-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Escala Semanal Recorrente
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Semana: {formattedRange}
          </h2>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onPrevWeek}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-800 border border-white/5 hover:border-amber-500/30 text-stone-300 hover:text-white text-xs font-bold transition-colors"
            title="Semana Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {!isCurrentWeek && (
            <button
              onClick={onCurrentWeek}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Semana Atual</span>
            </button>
          )}

          <button
            onClick={onNextWeek}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-800 border border-white/5 hover:border-amber-500/30 text-stone-300 hover:text-white text-xs font-bold transition-colors"
            title="Próxima Semana"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grade dos 7 Dias da Semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {days.map((day) => {
          return (
            <div
              key={day.dateStr}
              className={`
                relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 min-h-[260px]
                ${day.isToday
                  ? 'bg-gradient-to-b from-stone-800 to-stone-850 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : day.isCompleted
                  ? 'bg-stone-850/60 border-emerald-500/20'
                  : day.isFull
                  ? 'bg-stone-900/60 border-white/5'
                  : 'bg-stone-800/40 border-white/10 hover:border-amber-500/40 hover:bg-stone-800/80 shadow-md'
                }
              `}
            >
              {/* Topo do Card: Nome do Dia e Data */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-base font-serif font-bold block ${day.isToday ? 'text-amber-400' : 'text-white'}`}>
                      {day.dayName}
                    </span>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      {day.formattedDate}
                    </span>
                  </div>

                  {/* Badges de Estado */}
                  <div className="flex flex-col items-end gap-1">
                    {day.isToday && (
                      <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                        Hoje
                      </span>
                    )}
                    {day.isCompleted && !day.isToday && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Orou
                      </span>
                    )}
                    {day.isFull && !day.isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Completo
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista dos Intercessores Recorrentes */}
                <div className="my-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1">
                    Intercessores:
                  </span>
                  {day.sentinels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {day.sentinels.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] font-semibold text-stone-300 bg-stone-900/90 border border-white/5 px-2.5 py-1 rounded-lg"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500 italic block py-1">
                      Nenhum intercessor escalado.
                    </span>
                  )}
                </div>
              </div>

              {/* Rodapé do Card: Capacidade & Ação */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                  <Users className="w-3 h-3" />
                  <span>
                    {day.count}/{capacity}
                  </span>
                </div>

                {!day.isFull ? (
                  <button
                    onClick={() => onSelectDayToSubscribe(day.dayOfWeek)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assumir Dia</span>
                  </button>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                    Escala Cheia
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

export default SentinelWeekGrid;

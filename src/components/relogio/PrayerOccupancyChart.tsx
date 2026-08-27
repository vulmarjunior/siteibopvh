import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { WeekDayItem } from './SentinelWeekGrid';

interface PrayerOccupancyChartProps {
  days: WeekDayItem[];
  capacity: number;
  onSelectDayToSubscribe?: (dayOfWeek: number) => void;
  title?: string;
  isCompact?: boolean;
}

export const PrayerOccupancyChart: React.FC<PrayerOccupancyChartProps> = ({
  days,
  capacity = 4,
  onSelectDayToSubscribe,
  title = 'Taxa de Ocupação da Escala Semanal',
  isCompact = false,
}) => {
  const totalSlots = 7 * capacity;
  const filledSlots = days.reduce((acc, d) => acc + Math.min(d.count, capacity), 0);
  const percentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  // Encontrar dias com vagas abertas
  const daysWithOpenSlots = days.filter((d) => d.count < capacity);
  const mostNeededDay = daysWithOpenSlots.sort((a, b) => a.count - b.count)[0];

  return (
    <div className="rounded-3xl border border-white/10 bg-stone-850/80 p-6 md:p-8 shadow-xl backdrop-blur-sm space-y-6">
      {/* Topo: Título e Percentual Geral */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            Engajamento do Rebanho
          </span>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
            {title}
          </h3>
        </div>

        <div className="flex items-baseline gap-2 self-start sm:self-auto bg-stone-900/80 border border-white/5 px-4 py-2 rounded-2xl">
          <span className="text-3xl font-serif font-bold text-amber-400">
            {percentage}%
          </span>
          <span className="text-xs text-stone-400">
            ({filledSlots} de {totalSlots} vagas)
          </span>
        </div>
      </div>

      {/* Barra de Progresso Global (Termômetro) */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded-full bg-stone-900 border border-white/5 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(percentage, 4)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-stone-400">
          <span>0% (Início)</span>
          <span>Meta: 100% de Cobertura Diária</span>
        </div>
      </div>

      {/* Gráfico de Barras Verticais (7 Dias da Semana) */}
      <div className="pt-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pb-2 border-b border-white/5">
          {days.map((day) => {
            const dayPercentage = Math.min(100, Math.round((day.count / capacity) * 100));
            const isFull = day.count >= capacity;
            const isSelectedDay = day.isToday;

            return (
              <div
                key={day.dayOfWeek}
                onClick={() => onSelectDayToSubscribe && !isFull && onSelectDayToSubscribe(day.dayOfWeek)}
                className={`
                  group flex flex-col items-center justify-end h-full relative cursor-pointer
                  ${isFull ? 'cursor-default' : 'hover:opacity-90'}
                `}
                title={`${day.dayName}: ${day.count} de ${capacity} vagas ocupadas (${dayPercentage}%)`}
              >
                {/* Tooltip / Badge no topo da coluna */}
                <div className="text-[10px] font-bold text-stone-400 mb-1.5 transition-transform group-hover:-translate-y-0.5">
                  {day.count}/{capacity}
                </div>

                {/* Coluna da Barra */}
                <div className="w-full max-w-[48px] bg-stone-900/90 rounded-xl h-28 p-1 flex items-end border border-white/5">
                  <div
                    className={`
                      w-full rounded-lg transition-all duration-500 flex items-center justify-center
                      ${isFull
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/20'
                        : day.count > 0
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm shadow-amber-500/20'
                        : 'bg-stone-800'
                      }
                    `}
                    style={{ height: `${Math.max(dayPercentage, 10)}%` }}
                  >
                    {isFull && <CheckCircle className="w-3 h-3 text-stone-950" />}
                  </div>
                </div>

                {/* Rótulo do Dia */}
                <div className="mt-2 text-center">
                  <span
                    className={`
                      block text-xs font-serif font-bold transition-colors
                      ${isSelectedDay ? 'text-amber-400' : 'text-stone-300 group-hover:text-white'}
                    `}
                  >
                    {day.shortDayName}
                  </span>
                  <span className="block text-[10px] text-stone-500">
                    {day.dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé: Chamada de Necessidade Pastoral */}
      {mostNeededDay && mostNeededDay.count < capacity && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Precisamos de intercessores especialmente em: <strong>{mostNeededDay.dayName}</strong> ({mostNeededDay.openSlots} {mostNeededDay.openSlots === 1 ? 'vaga restante' : 'vagas restantes'}).
            </span>
          </div>

          {onSelectDayToSubscribe && (
            <button
              onClick={() => onSelectDayToSubscribe(mostNeededDay.dayOfWeek)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shrink-0 transition-colors"
            >
              Assumir {mostNeededDay.shortDayName}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PrayerOccupancyChart;

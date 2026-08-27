import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthCalendarPickerProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  daysData?: Record<number, { count: number; isFull: boolean }>;
  capacity?: number;
}

export const MonthCalendarPicker: React.FC<MonthCalendarPickerProps> = ({
  selectedDay,
  onSelectDay,
  daysData = {},
  capacity = 4,
}) => {
  // Obter mês atual e ano no fuso local/igreja
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 a 11

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Cálculos do calendário
  const { totalDaysInMonth, startDayOfWeek, currentDayOfMonth } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo, 1 = Segunda...
    return {
      totalDaysInMonth: daysInMonth,
      startDayOfWeek: firstDay,
      currentDayOfMonth: now.getDate(),
    };
  }, [year, month, now]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="rounded-2xl bg-stone-850 border border-white/10 p-4 shadow-inner">
      {/* Cabeçalho do Mês */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
          {formattedMonth} {year}
        </span>
        <span className="text-[11px] text-stone-400">
          Selecione seu dia fixo
        </span>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-stone-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grade de Dias do Mês */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espaços vazios antes do dia 1 */}
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="h-9" />
        ))}

        {/* Dias 1 ao total de dias */}
        {Array.from({ length: totalDaysInMonth }, (_, index) => {
          const day = index + 1;
          const isSelected = selectedDay === day;
          const isToday = currentDayOfMonth === day;
          const dayInfo = daysData[day];
          const count = dayInfo ? dayInfo.count : 0;
          const isFull = count >= capacity;
          const openSlots = Math.max(0, capacity - count);

          return (
            <button
              key={day}
              type="button"
              disabled={isFull}
              onClick={() => onSelectDay(day)}
              className={`
                relative h-10 w-full rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all
                ${isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/30 scale-105 z-10'
                  : isFull
                  ? 'bg-stone-900/40 text-stone-600 cursor-not-allowed border border-transparent'
                  : isToday
                  ? 'bg-stone-800 text-amber-300 border border-amber-500/50 hover:bg-stone-750'
                  : 'bg-stone-800/80 text-stone-200 hover:bg-amber-500/20 hover:text-amber-300 border border-white/5'
                }
              `}
            >
              <span>{day}</span>
              {/* Indicador de Vagas */}
              <span
                className={`text-[8px] font-bold -mt-0.5 ${
                  isSelected
                    ? 'text-stone-900'
                    : isFull
                    ? 'text-stone-700'
                    : openSlots === 1
                    ? 'text-amber-400'
                    : 'text-stone-400'
                }`}
              >
                {isFull ? 'Lotado' : `${openSlots}v`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resumo da Seleção */}
      <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-stone-400">
          Dia selecionado: <strong className="text-amber-300">Dia {selectedDay} de cada mês</strong>
        </span>
        <span className="text-[11px] text-stone-400">
          {daysData[selectedDay]
            ? `${Math.max(0, capacity - daysData[selectedDay].count)} vagas restantes`
            : `${capacity} vagas disponíveis`}
        </span>
      </div>
    </div>
  );
};

export default MonthCalendarPicker;

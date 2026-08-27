import React from 'react';
import { CalendarDays, CheckCircle2 } from 'lucide-react';

interface WeekDayPickerProps {
  selectedDayOfWeek: number;
  onSelectDayOfWeek: (dayOfWeek: number) => void;
  weekDaysData?: { dayOfWeek: number; dayName: string; count: number; openSlots: number; isFull: boolean }[];
  capacity?: number;
}

const DEFAULT_DAYS = [
  { dayOfWeek: 1, dayName: 'Segunda-feira', short: 'Seg' },
  { dayOfWeek: 2, dayName: 'Terça-feira', short: 'Ter' },
  { dayOfWeek: 3, dayName: 'Quarta-feira', short: 'Qua' },
  { dayOfWeek: 4, dayName: 'Quinta-feira', short: 'Qui' },
  { dayOfWeek: 5, dayName: 'Sexta-feira', short: 'Sex' },
  { dayOfWeek: 6, dayName: 'Sábado', short: 'Sáb' },
  { dayOfWeek: 0, dayName: 'Domingo', short: 'Dom' },
];

export const WeekDayPicker: React.FC<WeekDayPickerProps> = ({
  selectedDayOfWeek,
  onSelectDayOfWeek,
  weekDaysData = [],
  capacity = 4,
}) => {
  const selectedInfo = DEFAULT_DAYS.find((d) => d.dayOfWeek === selectedDayOfWeek) || DEFAULT_DAYS[0];

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
        Escolha seu Dia da Semana Recorrente *
      </label>

      {/* Grid com os 7 Dias */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DEFAULT_DAYS.map((item) => {
          const isSelected = selectedDayOfWeek === item.dayOfWeek;
          const dayData = weekDaysData.find((d) => d.dayOfWeek === item.dayOfWeek);
          const count = dayData ? dayData.count : 0;
          const isFull = dayData ? dayData.isFull : count >= capacity;
          const openSlots = dayData ? dayData.openSlots : Math.max(0, capacity - count);

          return (
            <button
              key={item.dayOfWeek}
              type="button"
              disabled={isFull}
              onClick={() => onSelectDayOfWeek(item.dayOfWeek)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all
                ${isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] z-10'
                  : isFull
                  ? 'bg-stone-900/40 text-stone-600 border-transparent cursor-not-allowed opacity-50'
                  : 'bg-stone-800/90 text-stone-200 border-white/10 hover:border-amber-500/40 hover:bg-stone-800'
                }
              `}
            >
              <span className="text-xs font-serif font-bold block leading-tight">
                {item.dayName.split('-')[0]}
              </span>
              <span
                className={`text-[10px] mt-1 font-sans ${
                  isSelected
                    ? 'text-stone-900 font-semibold'
                    : isFull
                    ? 'text-stone-600'
                    : 'text-stone-400'
                }`}
              >
                {isFull ? 'Lotado' : `${openSlots} ${openSlots === 1 ? 'vaga' : 'vagas'}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resumo do Compromisso */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Compromisso: <strong>Toda(o) {selectedInfo.dayName}</strong> nos seus momentos devocionais.
        </span>
      </div>
    </div>
  );
};

export default WeekDayPicker;

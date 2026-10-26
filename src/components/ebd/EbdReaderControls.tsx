import { Minus, Monitor, Moon, Plus, RotateCcw, Sun } from 'lucide-react';
import type { EbdThemePreference } from '../../lib/ebd/preferences.js';

interface EbdReaderControlsProps {
  themePreference: EbdThemePreference;
  onThemeChange: (theme: EbdThemePreference) => void;
  fontScale: number;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onResetFont: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const THEME_OPTIONS: Array<{
  value: EbdThemePreference;
  label: string;
  icon: typeof Sun;
}> = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
];

export function EbdReaderControls({
  themePreference,
  onThemeChange,
  fontScale,
  onIncreaseFont,
  onDecreaseFont,
  onResetFont,
  canIncrease,
  canDecrease,
}: EbdReaderControlsProps) {
  return (
    <section aria-label="Ajustes de leitura" className="ebd-card ebd-no-print mt-5 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-widest ebd-muted">Tema</span>
          <div role="group" aria-label="Tema de leitura" className="flex gap-1">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className="ebd-btn"
                aria-pressed={themePreference === value}
                aria-label={`Tema ${label.toLowerCase()}`}
                title={`Tema ${label.toLowerCase()}`}
                onClick={() => onThemeChange(value)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-widest ebd-muted">Fonte</span>
          <div role="group" aria-label="Tamanho da fonte" className="flex items-center gap-1">
            <button
              type="button"
              className="ebd-btn"
              aria-label="Diminuir tamanho da fonte"
              title="Diminuir fonte"
              onClick={onDecreaseFont}
              disabled={!canDecrease}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <output
              aria-live="polite"
              aria-atomic="true"
              className="min-w-[3.4rem] text-center text-sm font-bold"
            >
              {Math.round(fontScale * 100)}%
            </output>
            <button
              type="button"
              className="ebd-btn"
              aria-label="Aumentar tamanho da fonte"
              title="Aumentar fonte"
              onClick={onIncreaseFont}
              disabled={!canIncrease}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ebd-btn"
              aria-label="Restaurar tamanho padrão da fonte"
              title="Tamanho padrão"
              onClick={onResetFont}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

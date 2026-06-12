import React, { useState, useRef, useEffect } from 'react';
import { getLiturgicalYearProgress, formatSeasonTooltip } from '../../lib/liturgical-calendar';

const LiturgicalTimeline: React.FC = () => {
  const { progress, currentSeason, segments } = getLiturgicalYearProgress();
  const tooltip = formatSeasonTooltip(currentSeason);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = showTooltip || isFocused;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-1 md:pb-2"
      role="region"
      aria-label="Jornada do ano litúrgico"
    >
      <div className="relative max-w-7xl mx-auto">
        {/* Marco labels (desktop only) */}
        <div className="hidden md:flex justify-between items-end mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {segments.map((seg) => (
            <span
              key={`label-${seg.id}-${seg.startFraction}`}
              style={{
                color: seg.id === currentSeason.id ? seg.color : undefined,
              }}
            >
              {seg.shortLabel}
            </span>
          ))}
        </div>

        {/* Bar */}
        <div className="relative h-1 bg-stone-700/40 rounded-full overflow-hidden">
          {/* Segments (background) */}
          {segments.map((seg) => (
            <div
              key={`seg-${seg.id}-${seg.startFraction}`}
              className="absolute top-0 h-full"
              style={{
                left: `${seg.startFraction * 100}%`,
                width: `${(seg.endFraction - seg.startFraction) * 100}%`,
                backgroundColor: seg.id === currentSeason.id ? seg.color : 'rgba(120, 113, 108, 0.3)',
                opacity: seg.id === currentSeason.id ? 0.25 : 1,
              }}
            />
          ))}

          {/* Filled progress (up to current position) */}
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: currentSeason.color,
            }}
          />

          {/* Pulsing indicator */}
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-white"
            style={{
              left: `${progress * 100}%`,
              backgroundColor: currentSeason.color,
              boxShadow: `0 0 0 4px rgba(0, 0, 0, 0.2), 0 0 8px ${currentSeason.color}`,
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip((prev) => !prev)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label={tooltip}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="sr-only">{tooltip}</span>
          </button>
        </div>

        {/* Current season label (always visible) */}
        <div className="mt-1 md:mt-1.5 text-center">
          <div
            className="text-xs md:text-sm font-bold"
            style={{ color: currentSeason.color }}
          >
            {currentSeason.label} · {currentSeason.week}ª sem
          </div>
          {currentSeason.label !== currentSeason.technical && (
            <div className="text-[10px] md:text-[11px] text-stone-400 italic">
              ({currentSeason.technical})
            </div>
          )}
        </div>

        {/* Tooltip with countdown */}
        {isOpen && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none"
            role="tooltip"
          >
            {tooltip}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #1c1917',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiturgicalTimeline;

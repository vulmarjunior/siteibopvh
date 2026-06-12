import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { getLiturgicalState } from '../../lib/liturgical';

const LiturgicalBookmark: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const state = getLiturgicalState(new Date());

  const ariaLabel = state.phaseLabel
    ? `Período litúrgico: ${state.label}, ${state.phaseLabel}`
    : `Período litúrgico: ${state.label}`;

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-white rounded-md px-2 py-1"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={ariaLabel}
      >
        <Bookmark
          className="w-5 h-5 md:w-6 md:h-6 transition-colors duration-400"
          style={{ color: state.color }}
          fill="currentColor"
        />
        <span
          className="text-sm md:text-base font-semibold transition-colors duration-400"
          style={{ color: state.color }}
        >
          {state.label}
        </span>
      </button>

      {showTooltip && state.phaseLabel && state.phaseLabel !== state.label && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-stone-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none"
          role="tooltip"
        >
          {state.phaseLabel}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid #1c1917',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LiturgicalBookmark;

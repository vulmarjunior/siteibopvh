import React from 'react';
import { SermonStatus } from '../../lib/parousia-utils';

interface StatusBadgeProps {
  status: SermonStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'em_breve') {
    return (
      <span className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded-full border border-gray-700">
        Em breve
      </span>
    );
  }

  if (status === 'pregado_materiais_em_breve') {
    return (
      <span className="inline-block px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-medium rounded-full border border-[#d4af37]/20">
        Pregado — materiais em breve
      </span>
    );
  }

  if (status === 'disponivel') {
    return (
      <span className="inline-block px-3 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded-full border border-green-800/50">
        Disponível
      </span>
    );
  }

  // Fallback for custom manual status
  return (
    <span className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-medium rounded-full border border-blue-800/50">
      {status}
    </span>
  );
};

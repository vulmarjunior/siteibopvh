import React from 'react';
import sermoesData from '../../data/sermoes.json';
import { parseSermoes, getSermonStatus } from '../../lib/parousia-utils';

const etapas = [
  { num: '1', titulo: 'Ascensão', movimentos: ['Ascensão'] },
  { num: '2', titulo: 'Pentecostes', movimentos: ['Pentecostes'] },
  { num: '3', titulo: 'Peregrinação', movimentos: ['Peregrinação'] },
  { num: '4', titulo: 'Deserto', movimentos: ['Deserto'] },
  { num: '5', titulo: 'Missão', movimentos: ['Missão'] },
  { num: '6', titulo: 'Perseverança', movimentos: ['Perseverança'] },
  { num: '7', titulo: 'Parousia', movimentos: ['Parousia'] },
  { num: '8', titulo: 'Nova Jerusalém', movimentos: ['Nova Jerusalém'] },
];

function getEtapaAtual(): number {
  const sermoes = parseSermoes(sermoesData);
  let etapaIdx = 0;

  for (const s of sermoes) {
    const status = getSermonStatus(s);
    if (status === 'disponivel' || status === 'pregado_materiais_em_breve') {
      const idx = etapas.findIndex(e => e.movimentos.includes(s.movimento));
      if (idx > etapaIdx) etapaIdx = idx;
    }
  }

  return etapaIdx;
}

export const MapaPeregrinacao: React.FC = () => {
  const etapaAtual = getEtapaAtual();

  return (
    <section className="bg-[#15181d] py-20 px-6 border-y border-gray-800">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-[#d4af37] text-center text-sm font-semibold tracking-widest uppercase mb-12">
          O Arco da História
        </h3>

        {/* Desktop timeline */}
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute left-0 right-0 h-px bg-gray-800 top-1/2 -translate-y-1/2 z-0"></div>
          {etapas.map((etapa, idx) => {
            const isPast = idx < etapaAtual;
            const isCurrent = idx === etapaAtual;
            const isFuture = idx > etapaAtual;

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-4 transition-all ${
                  isCurrent
                    ? 'bg-[#d4af37] text-[#0f1115] border-2 border-[#d4af37] scale-110 shadow-lg shadow-[#d4af37]/30'
                    : isPast
                      ? 'bg-[#d4af37]/20 text-[#d4af37] border-2 border-[#d4af37]/50'
                      : 'bg-[#15181d] text-gray-600 border-2 border-gray-700'
                }`}>
                  {etapa.num}
                </div>
                <span className={`text-sm whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-[#d4af37] font-semibold' : isPast ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {etapa.titulo}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile timeline */}
        <div className="md:hidden flex flex-col space-y-6 relative ml-4">
          <div className="absolute top-0 bottom-0 left-[15px] w-px bg-gray-800 z-0"></div>
          {etapas.map((etapa, idx) => {
            const isPast = idx < etapaAtual;
            const isCurrent = idx === etapaAtual;

            return (
              <div key={idx} className="relative z-10 flex items-center gap-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-[#d4af37] text-[#0f1115] border-2 border-[#d4af37] shadow-lg shadow-[#d4af37]/30'
                    : isPast
                      ? 'bg-[#d4af37]/20 text-[#d4af37] border-2 border-[#d4af37]/50'
                      : 'bg-[#15181d] text-gray-600 border-2 border-gray-700'
                }`}>
                  {etapa.num}
                </div>
                <span className={`transition-colors ${
                  isCurrent ? 'text-[#d4af37] font-semibold' : isPast ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {etapa.titulo}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

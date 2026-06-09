import React from 'react';

const etapas = [
  { num: '1', titulo: 'Ascensão' },
  { num: '2', titulo: 'Pentecostes' },
  { num: '3', titulo: 'Peregrinação' },
  { num: '4', titulo: 'Deserto' },
  { num: '5', titulo: 'Missão' },
  { num: '6', titulo: 'Perseverança' },
  { num: '7', titulo: 'Parousia' },
  { num: '8', titulo: 'Nova Jerusalém' },
];

export const MapaPeregrinacao: React.FC = () => {
  return (
    <section className="bg-[#15181d] py-20 px-6 border-y border-gray-800">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-[#d4af37] text-center text-sm font-semibold tracking-widest uppercase mb-12">
          O Arco da História
        </h3>
        
        {/* Desktop timeline */}
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute left-0 right-0 h-px bg-gray-800 top-1/2 -translate-y-1/2 z-0"></div>
          {etapas.map((etapa, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#15181d] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] text-xs font-bold mb-4">
                {etapa.num}
              </div>
              <span className="text-gray-400 text-sm whitespace-nowrap">{etapa.titulo}</span>
            </div>
          ))}
        </div>

        {/* Mobile timeline */}
        <div className="md:hidden flex flex-col space-y-6 relative ml-4">
          <div className="absolute top-0 bottom-0 left-[15px] w-px bg-gray-800 z-0"></div>
          {etapas.map((etapa, idx) => (
            <div key={idx} className="relative z-10 flex items-center gap-6">
              <div className="w-8 h-8 rounded-full bg-[#15181d] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] text-xs font-bold shrink-0">
                {etapa.num}
              </div>
              <span className="text-gray-300">{etapa.titulo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

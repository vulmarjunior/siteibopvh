import React from 'react';

export const SobreSerie: React.FC = () => {
  return (
    <section id="sobre" className="bg-[#0f1115] py-24 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-8">
          Esperar é caminhar
        </h2>
        
        <div className="w-16 h-px bg-[#d4af37] mx-auto mb-8"></div>
        
        <div className="flex flex-col gap-6">
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
            “Esta série acompanha a caminhada da Igreja desde a ascensão de Cristo até a esperança final da Nova Jerusalém.
          </p>
          <p className="text-lg md:text-xl text-[#d4af37] leading-relaxed">
            Atos narra a caminhada do povo de Deus no mundo; as Epístolas interpretam essa caminhada à luz do evangelho; e o Apocalipse revela o destino glorioso da peregrinação.
          </p>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
            Não esperamos parados. Esperamos caminhando, servindo, sofrendo, testemunhando e aguardando o Rei que voltará.”
          </p>
        </div>
      </div>
    </section>
  );
};

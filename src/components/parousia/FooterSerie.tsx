import React from 'react';
import { ArrowUp } from 'lucide-react';

export const FooterSerie: React.FC = () => {
  const handleScrollToMensagens = () => {
    document.getElementById('mensagens')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-24 px-6 bg-[#0f1115] border-t border-gray-900 text-center relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#d4af37] opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-6">
          A estrada ainda não terminou. A Cidade vem.
        </h2>
        
        <p className="text-gray-400 mb-12">
          “Enquanto aguardamos a volta do Rei, caminhamos em fé, missão e esperança. 
          Junte-se a nós nessa peregrinação.”
        </p>

        <button
          onClick={handleScrollToMensagens}
          className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-[#d4af37] border border-[#d4af37] rounded hover:bg-[#d4af37]/10 transition-colors font-medium mb-16"
        >
          <ArrowUp className="w-4 h-4" />
          Ver mensagens disponíveis
        </button>
      </div>
    </footer>
  );
};

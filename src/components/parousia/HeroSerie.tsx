import React from 'react';
import { ArrowDown, Mail, Play } from 'lucide-react';

export const HeroSerie: React.FC = () => {
  const handleScrollToProgramacao = () => {
    document.getElementById('programacao')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToMensagens = () => {
    document.getElementById('mensagens')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToLeituras = () => {
    document.getElementById('convite')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/serie-da-ascensao-a-parousia/arte-principal.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-[#0f1115] via-transparent to-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
        <h2 className="text-[#ebd074] text-sm md:text-base font-semibold tracking-widest uppercase mb-4 drop-shadow-md">
          A Igreja entre o Reino inaugurado e a Cidade que vem.
        </h2>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-4 tracking-wide drop-shadow-xl">
          Da Ascensão <br className="hidden md:block"/> à Parousia
        </h1>
        
        <p className="text-xl md:text-2xl text-white font-light italic mb-8 max-w-3xl drop-shadow-md">
          O Livro da Longa Peregrinação
        </p>

        <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-medium drop-shadow-md">
          Entre a ascensão de Cristo e sua volta gloriosa, a Igreja atravessa a história como povo peregrino: 
          anunciando o Reino, perseverando no deserto e caminhando rumo à Cidade que vem.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button 
            onClick={handleScrollToProgramacao}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#d4af37] text-[#0f1115] font-semibold rounded hover:bg-[#ebd074] transition-colors w-full sm:w-auto"
          >
            <ArrowDown className="w-5 h-5" />
            Ver programação
          </button>
          
          <button 
            onClick={handleScrollToMensagens}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-[#d4af37] text-[#d4af37] font-semibold rounded hover:bg-[#d4af37]/10 transition-colors w-full sm:w-auto"
          >
            <Play className="w-5 h-5" />
            Assistir mensagens
          </button>
          
          <button
            onClick={handleScrollToLeituras}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-gray-300 hover:text-white transition-colors w-full sm:w-auto"
          >
            <Mail className="w-5 h-5" />
            Receber leituras
          </button>
        </div>
      </div>
    </section>
  );
};

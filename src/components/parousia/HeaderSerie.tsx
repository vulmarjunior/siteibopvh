import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeaderSerie: React.FC = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1115]/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors" title="Voltar ao Portal">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center">
            <img src="/images/logo.png" alt="Igreja Batista Olaria" className="h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('sobre')} className="text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors">Sobre a Série</button>
          <button onClick={() => scrollTo('programacao')} className="text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors">Programação</button>
          <button onClick={() => scrollTo('mensagens')} className="text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors">Mensagens</button>
          <button onClick={() => scrollTo('materiais')} className="text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors">Materiais</button>
          <button onClick={() => scrollTo('convite')} className="text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors">Compartilhar</button>
        </nav>
      </div>
    </header>
  );
};

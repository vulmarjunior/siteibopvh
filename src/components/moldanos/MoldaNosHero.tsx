import React from 'react';
import { ChevronRight } from 'lucide-react';

const MoldaNosHero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #FDBF59 0%, transparent 50%), radial-gradient(circle at 70% 30%, #CB8B05 0%, transparent 40%)`
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center pt-32 pb-20">
        <span className="inline-block text-amber-400 font-bold tracking-[0.3em] uppercase text-sm md:text-base mb-6">
          57 anos • Conferência de Aniversário
        </span>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white leading-none mb-4 tracking-tight">
          Molda-nos
        </h1>

        <p className="text-xl md:text-2xl text-amber-400/90 font-serif italic mb-4">
          para servir no Reino
        </p>

        <p className="text-stone-500 text-sm md:text-base mb-8 max-w-md mx-auto font-medium">
          57 anos moldando discípulos para o Reino
        </p>

        <div className="flex items-center justify-center gap-4 text-stone-400 text-sm md:text-base mb-10">
          <span className="bg-stone-800/60 px-4 py-2 rounded-full border border-stone-700/50">
            05, 06 e 07 de junho
          </span>
          <span className="bg-stone-800/60 px-4 py-2 rounded-full border border-stone-700/50">
            19:00
          </span>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="border-t border-stone-800 pt-6">
            <p className="text-stone-400 text-base md:text-lg leading-relaxed italic">
              "Porque o Filho do Homem também não veio para ser servido, mas para servir"
            </p>
            <p className="text-amber-500 font-bold mt-2 text-sm tracking-widest uppercase">
              — Marcos 10:45
            </p>
          </div>
        </div>

        <a
          href="#programacao"
          className="group inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/20"
        >
          Ver Programação
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default MoldaNosHero;

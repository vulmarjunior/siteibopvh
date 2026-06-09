import React from 'react';
import sermoesData from '../../data/sermoes.json';
import { Sermon } from '../../types/parousia';
import { SermonCard } from './SermonCard';

export const ProgramacaoSermoes: React.FC = () => {
  const sermoes: Sermon[] = sermoesData as Sermon[];

  return (
    <section id="programacao" className="py-24 px-6 bg-[#0f1115]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Programação da Série</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Acompanhe a caminhada da Igreja semana a semana, estudando Atos, as Epístolas e o Apocalipse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sermoes.map((sermon) => (
            <SermonCard key={sermon.numero} sermon={sermon} />
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Heart, Cross, Flame } from 'lucide-react';

const MoldaNosSobre: React.FC = () => {
  const topics = [
    {
      icon: <Heart className="w-6 h-6 text-amber-500" />,
      title: "Propósito",
      text: "Ser moldado por Deus é permitir que o Oleiro divino nos transforme em instrumentos úteis para a Sua obra. Cada martelada, cada giro no torno, cada correção é amor moldando caráter."
    },
    {
      icon: <Cross className="w-6 h-6 text-amber-500" />,
      title: "Fundamento",
      text: "Assim como o vaso é formado nas mãos do oleiro, somos chamados a nos entregar nas mãos de Deus para sermos moldados conforme a Sua vontade — não para nossa glória, mas para o serviço no Reino."
    },
    {
      icon: <Flame className="w-6 h-6 text-amber-500" />,
      title: "Chamado",
      text: "O serviço cristão não é opcional — é a expressão natural de um coração transformado. Ser moldado por Deus resulta inevitavelmente em servir ao próximo com excelência e amor."
    }
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">
            Sobre a Conferência
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
            Moldados para Servir
          </h2>
          <p className="text-stone-600 max-w-3xl mx-auto text-lg leading-relaxed">
            A Igreja Batista Olaria convida você para três noites de reflexão sobre o propósito 
            do serviço cristão. Seremos desafiados a permitir que Deus nos molde — como o oleiro 
            molda o vaso — para cumprirmos nossa vocação no Reino de Deus.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="bg-olaria-50/50 border border-olaria-100 rounded-xl p-8 text-center hover:border-amber-300 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                {topic.icon}
              </div>
              <h3 className="font-serif font-bold text-xl text-stone-800 mb-3">
                {topic.title}
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm">
                {topic.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoldaNosSobre;
